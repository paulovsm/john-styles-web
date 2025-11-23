import React, { useState } from 'react';
import { Send } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-grey-light p-4">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    disabled={disabled}
                    className="flex-1 px-4 py-2 border border-grey-light rounded-lg focus:outline-none focus:ring-2 focus:ring-fleek-navy focus:border-transparent disabled:bg-grey-light disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    className="px-4 py-2 bg-fleek-navy text-white-pure rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send />
                </button>
            </div>
        </form>
    );
}
