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
        <form onSubmit={handleSubmit} className="border-t border-grey-light p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    disabled={disabled}
                    aria-label={t('chat.inputLabel', 'Mensagem para o John Styles')}
                    enterKeyHint="send"
                    autoCapitalize="sentences"
                    autoComplete="off"
                    className="flex-1 min-w-0 px-4 py-2 border border-grey-light rounded-lg bg-white-pure text-grey-dark placeholder:text-grey-medium focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent disabled:bg-grey-light disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    aria-label={t('chat.send', 'Enviar')}
                    className="shrink-0 grid place-items-center min-h-[44px] min-w-[44px] px-4 bg-brand-navy text-white-pure rounded-lg hover:bg-opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send />
                </button>
            </div>
        </form>
    );
}
