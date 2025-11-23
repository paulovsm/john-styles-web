import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import Loading from '../common/Loading';
import Avatar from '../common/Avatar';
import { useTranslation } from 'react-i18next';

export default function MessageList({ messages, isTyping, userAvatar }) {
    const messagesEndRef = useRef(null);
    const { t } = useTranslation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="flex items-start space-x-3">
                    <Avatar size="md" src="/JohnStyles.jpg" alt="John Styles" className="bg-fleek-gold text-fleek-navy" />
                    <div className="flex-1 bg-white-off rounded-lg p-4">
                        <p className="text-grey-dark">{t('chat.greeting')}</p>
                    </div>
                </div>
            )}

            {messages.map((message, index) => (
                <MessageItem key={index} message={message} userAvatar={userAvatar} />
            ))}

            {isTyping && (
                <div className="flex items-start space-x-3">
                    <Avatar size="md" src="/JohnStyles.jpg" alt="John Styles" className="bg-fleek-gold text-fleek-navy" />
                    <div className="flex-1 bg-white-off rounded-lg p-4">
                        <Loading type="spinner" size={20} />
                        <span className="ml-2 text-sm text-grey-medium">{t('chat.typing')}</span>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
