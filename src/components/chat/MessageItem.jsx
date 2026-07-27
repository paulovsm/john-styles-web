import React from 'react';
import Avatar from '../common/Avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function MessageItem({ message, userAvatar }) {
    const isUser = message.role === 'user';
    const navigate = useNavigate();
    const { t } = useTranslation();

    const runAction = (action) => {
        if (action.type === 'tryOn') {
            navigate('/try-on', { state: { preselect: action.itemIds } });
        } else if (action.type === 'navigate') {
            navigate(action.to);
        }
    };

    const actionLabel = (action) => {
        if (action.label) return action.label;
        if (action.type === 'tryOn') return t('chat.actions.tryOn', 'Provar este look');
        return t('chat.actions.open', 'Abrir');
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && (
                <div className="flex-shrink-0 mr-3">
                    <Avatar src="/JohnStyles.jpg" alt="John Styles" size="sm" />
                </div>
            )}
            <div
                className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${isUser
                    ? 'bg-brand-navy text-white-pure rounded-br-none'
                    : 'bg-white-pure border border-grey-light text-grey-dark rounded-bl-none'
                    }`}
            >
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-a:text-brand-gold-dark">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
                {!isUser && message.actions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => runAction(action)}
                                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-brand-navy text-white-pure hover:bg-opacity-90 transition-colors"
                            >
                                {action.type === 'tryOn' ? <AutoAwesome style={{ fontSize: 14 }} /> : <ArrowForward style={{ fontSize: 14 }} />}
                                {actionLabel(action)}
                            </button>
                        ))}
                    </div>
                )}
                <div className={`text-xs mt-1 ${isUser ? 'text-grey-light' : 'text-grey-medium'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            {isUser && (
                <div className="flex-shrink-0 ml-3">
                    <Avatar src={userAvatar} alt="User" size="sm" />
                </div>
            )}
        </div>
    );
}
