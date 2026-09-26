import React, { createContext, useContext, useState } from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import { n8nService } from '../services/api/n8nService';
import { useUserProfileContext } from './UserProfileContext';
import { useWardrobeContext } from './WardrobeContext';
import { parseAgentActions } from '../utils/agentActions';
import i18n from '../i18n/config';
import { geminiService } from '../services/api/geminiService';
import { firestoreService } from '../services/storage/firestoreService';
import { compressImage, toCompressedDataUrl } from '../utils/imageUtils';
import { buildLookSwapPrompt, formatLookEvaluation } from '../utils/lookEvaluation';

const ConversationContext = createContext();

export function useConversationContext() {
    return useContext(ConversationContext);
}

export function ConversationProvider({ children }) {
    const { history, addMessage, clearHistory } = useChatHistory();
    const [isTyping, setIsTyping] = useState(false);
    const [agentState, setAgentState] = useState('idle'); // idle | processing

    // Single source of truth: read profile/wardrobe from their owning contexts
    // instead of keeping (and re-persisting) duplicate copies here.
    const { profile } = useUserProfileContext();
    const { allItems } = useWardrobeContext();

    const processMessage = async (text) => {
        setIsTyping(true);
        setAgentState('processing');

        try {
            addMessage({ role: 'user', content: text });

            const responseText = await n8nService.sendMessage(text, {
                userProfile: profile,
                wardrobeItems: allItems,
                chatHistory: history,
            });

            // The agent may append a <actions> block for one-click follow-ups.
            const { text: content, actions } = parseAgentActions(responseText);
            addMessage({ role: 'model', content, actions });
        } catch (error) {
            console.error('Error processing message:', error);
            // A slow agent and an unreachable one are different problems for the
            // user: one is worth retrying with a simpler question, the other is not.
            const timedOut = error?.code === 'CHAT_TIMEOUT' || error?.status === 504;
            addMessage({
                role: 'model',
                content: timedOut
                    ? i18n.t('chat.timeoutError', 'Demorei demais para responder e a conexão expirou. Tente de novo, se puder com uma pergunta mais direta.')
                    : i18n.t('chat.connectionError', 'Desculpe, estou com dificuldades para conectar agora. Tente novamente.'),
            });
        } finally {
            setIsTyping(false);
            setAgentState('idle');
        }
    };

    const processLookEvaluation = async (photo, requestText = '') => {
        if (!photo || isTyping) return;
        setIsTyping(true);
        setAgentState('processing');

        try {
            const compressed = await compressImage(photo);
            const sourcePhotoUrl = await firestoreService.uploadLookHistoryImage(compressed, 'source');
            const userText = requestText.trim() || i18n.t(
                'lookEvaluation.defaultRequest',
                'John, avalie este look que estou vestindo.',
            );
            addMessage({ role: 'user', content: userText, imageUrl: sourcePhotoUrl, kind: 'look-evaluation' });

            const evaluation = await geminiService.evaluateLook(compressed, {
                language: i18n.language,
                request: userText,
                userProfile: profile,
                wardrobeItems: allItems,
            });
            const actions = (evaluation.suggestions || []).map((suggestion) => ({
                type: 'lookSwap',
                ...suggestion,
                sourcePhotoUrl,
                label: i18n.t('lookEvaluation.seeSwap', {
                    item: suggestion.itemName,
                    defaultValue: `Ver troca com ${suggestion.itemName}`,
                }),
            }));

            addMessage({
                role: 'model',
                content: formatLookEvaluation(evaluation, i18n.t.bind(i18n)),
                actions,
                kind: 'look-evaluation',
            });
        } catch (error) {
            console.error('Error evaluating look:', error);
            const errorMessages = {
                LIMIT_REACHED: i18n.t('lookEvaluation.limitError', 'Você atingiu o limite de avaliações de hoje. Tente novamente amanhã.'),
                QUOTA_EXCEEDED: i18n.t('lookEvaluation.quotaError', 'O serviço de análise está temporariamente no limite. Tente novamente em alguns minutos.'),
                INVALID_MODEL_RESPONSE: i18n.t('lookEvaluation.responseError', 'Consegui ler a foto, mas a análise veio incompleta. Tente enviar novamente.'),
            };
            addMessage({
                role: 'model',
                content: errorMessages[error?.code]
                    || i18n.t('lookEvaluation.error', 'Não consegui avaliar esta foto agora. Tente novamente com uma imagem nítida do look completo.'),
            });
        } finally {
            setIsTyping(false);
            setAgentState('idle');
        }
    };

    const processLookSwap = async (action) => {
        if (isTyping || !action?.sourcePhotoUrl) return;
        const item = allItems.find((candidate) => candidate.id === action.itemId);
        if (!item?.image) {
            addMessage({
                role: 'model',
                content: i18n.t('lookEvaluation.itemUnavailable', 'Essa peça não está mais disponível no seu guarda-roupa.'),
            });
            return;
        }

        setIsTyping(true);
        setAgentState('processing');
        addMessage({
            role: 'user',
            content: i18n.t('lookEvaluation.swapRequest', {
                item: action.itemName,
                defaultValue: `Quero ver o look com ${action.itemName}.`,
            }),
        });

        try {
            const [sourceImage, itemImage] = await Promise.all([
                toCompressedDataUrl(action.sourcePhotoUrl),
                toCompressedDataUrl(item.image),
            ]);
            const generated = await geminiService.generateImage(
                buildLookSwapPrompt(action),
                sourceImage,
                [itemImage],
            );
            const generatedBlob = await fetch(generated).then((response) => response.blob());
            const generatedUrl = await firestoreService.uploadLookHistoryImage(generatedBlob, 'generated');

            addMessage({
                role: 'model',
                content: i18n.t('lookEvaluation.swapResult', {
                    item: action.itemName,
                    defaultValue: `Aqui está o look com ${action.itemName}. Mantive o restante da composição para você comparar.`,
                }),
                imageUrl: generatedUrl,
                kind: 'look-swap-result',
            });
        } catch (error) {
            console.error('Error generating look swap:', error);
            addMessage({
                role: 'model',
                content: error?.code === 'LIMIT_REACHED'
                    ? i18n.t('lookEvaluation.generationLimitError', 'Você atingiu o limite de imagens de hoje.')
                    : i18n.t('lookEvaluation.generationError', 'Não consegui gerar essa troca agora. Tente novamente em alguns instantes.'),
            });
        } finally {
            setIsTyping(false);
            setAgentState('idle');
        }
    };

    const value = {
        history,
        addMessage,
        processMessage,
        processLookEvaluation,
        processLookSwap,
        clearHistory,
        isTyping,
        agentState,
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
