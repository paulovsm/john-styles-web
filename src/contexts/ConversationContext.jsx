import React, { createContext, useContext, useState } from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import { n8nService } from '../services/api/n8nService';
import { useUserProfileContext } from './UserProfileContext';
import { useWardrobeContext } from './WardrobeContext';
import { parseAgentActions } from '../utils/agentActions';
import i18n from '../i18n/config';

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
            addMessage({
                role: 'model',
                content: i18n.t('chat.connectionError', 'Desculpe, estou com dificuldades para conectar agora. Tente novamente.'),
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
