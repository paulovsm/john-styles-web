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

    // dvh (not vh) so the box tracks the visible area when the mobile URL bar /
    // keyboard appears — with vh the composer ends up offscreen.
    return (
        <div className="flex flex-col h-[calc(100dvh-10rem)] sm:h-[calc(100vh-8rem)] bg-white-pure border border-grey-light rounded-xl shadow-sm overflow-hidden">
            <div className="bg-brand-navy px-4 py-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="text-white-pure font-medium min-w-0 truncate mr-auto">{t('chat.title')}</h2>
                <span className="shrink-0 text-xs text-white-pure bg-white-pure/15 px-2 py-1 rounded-full border border-white-pure/30">
                    {t('chat.beta')}
                </span>
                {agentState === 'processing' && (
                    <span className="shrink-0 text-xs text-white-pure/70 animate-pulse">
                        {t('chat.thinking', 'John está pensando...')}
                    </span>
                )}
            </div>
            <MessageList messages={history} isTyping={isTyping} userAvatar={currentUser?.photoURL} />
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
    );
}
