import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useConversationContext } from '../../contexts/ConversationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function ChatInterface() {
    const { history, processMessage, isTyping, agentState } = useConversationContext();
    const { currentUser } = useAuth();
    const { t } = useTranslation();

    const handleSendMessage = async (text) => {
        await processMessage(text);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white-pure border border-grey-light rounded-xl shadow-sm overflow-hidden">
            <div className="bg-brand-navy px-4 py-3 flex items-center justify-between">
                <h2 className="text-white-pure font-medium">{t('chat.title')}</h2>
                <span className="text-xs text-brand-gold bg-brand-navy/50 px-2 py-1 rounded-full border border-brand-gold/30">
                    {t('chat.beta')}
                </span>
                {agentState === 'processing' && (
                    <span className="ml-2 text-xs text-white-pure/70 animate-pulse">
                        {t('chat.thinking', 'John está pensando...')}
                    </span>
                )}
            </div>
            <MessageList messages={history} isTyping={isTyping} userAvatar={currentUser?.photoURL} />
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
    );
}
