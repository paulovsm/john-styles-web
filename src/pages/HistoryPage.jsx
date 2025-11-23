import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useConversationContext } from '../contexts/ConversationContext';
import Card from '../components/common/Card';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

export default function HistoryPage() {
    const { history } = useConversationContext();
    const { t } = useTranslation();

    // Reverse history to show newest first
    const reversedHistory = [...history].reverse();

    return (
        <MainLayout>
            <h1 className="text-2xl font-serif font-bold text-fleek-navy mb-6">{t('history.title')}</h1>

            {reversedHistory.length === 0 ? (
                <div className="text-center py-12 bg-white-pure rounded-lg border border-grey-light">
                    <p className="text-grey-medium">{t('history.noHistory')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reversedHistory.map((msg, index) => (
                        <Card key={index} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${msg.role === 'user'
                                        ? 'bg-fleek-navy/10 text-fleek-navy'
                                        : 'bg-fleek-gold/10 text-fleek-gold-dark'
                                    }`}>
                                    {msg.role === 'user' ? t('history.you') : t('history.johnStyles')}
                                </span>
                                <span className="text-xs text-grey-medium">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className="prose prose-sm max-w-none text-grey-dark">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}
