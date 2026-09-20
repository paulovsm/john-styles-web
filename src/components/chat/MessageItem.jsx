import React from 'react';
import Avatar from '../common/Avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, ArrowForward, Checkroom } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MAX_LOOK_DESCRIPTION } from '../../utils/agentActions';
import { describesLook } from '../../utils/lookDetection';

export default function MessageItem({ message, userAvatar }) {
    const isUser = message.role === 'user';
    const navigate = useNavigate();
    const { t } = useTranslation();

    const openTryOn = (state) => navigate('/try-on', { state });

    const runAction = (action) => {
        if (action.type === 'tryOn') {
            // Carry the described look too: the pieces John named that are not in
            // the wardrobe have no id, and without the text they would be lost.
            openTryOn({
                preselect: action.itemIds,
                lookPrompt: action.lookDescription || message.content?.slice(0, MAX_LOOK_DESCRIPTION),
            });
        } else if (action.type === 'navigate') {
            navigate(action.to);
        }
    };

    // The agent does not always emit an <actions> block, and users were copying
    // John's reply into the advanced prompt by hand. Offer that as one tap —
    // but only where there is a look to carry, which is about the garments named
    // and not the length of the reply.
    const hasTryOnAction = message.actions?.some((a) => a.type === 'tryOn');
    const offerAdvancedTryOn = !isUser && !hasTryOnAction && describesLook(message.content);

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
                className={`max-w-[85%] sm:max-w-[75%] break-words rounded-lg px-4 py-3 shadow-sm ${isUser
                    ? 'bg-brand-navy text-white-pure rounded-br-none'
                    : 'bg-white-pure border border-grey-light text-grey-dark rounded-bl-none'
                    }`}
            >
                {/* The user bubble is filled with ink, which FLIPS with the theme
                    (black in light, white in dark), so a fixed `prose-invert` is
                    only right half the time. Inherit the bubble's own foreground
                    instead — `text-white-pure` already tracks the fill. The
                    assistant bubble sits on a surface and keeps the defaults. */}
                <div className={`text-sm prose prose-sm max-w-none prose-p:my-1 ${isUser
                    ? 'text-inherit prose-p:text-inherit prose-headings:text-inherit prose-strong:text-inherit prose-em:text-inherit prose-li:text-inherit prose-code:text-inherit prose-blockquote:text-inherit prose-a:text-inherit prose-a:underline'
                    : 'dark:prose-invert prose-a:text-brand-navy'
                    }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
                {!isUser && (message.actions?.length > 0 || offerAdvancedTryOn) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.actions?.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => runAction(action)}
                                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full bg-brand-navy text-white-pure hover:bg-opacity-90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                            >
                                {action.type === 'tryOn' ? <AutoAwesome style={{ fontSize: 14 }} /> : <ArrowForward style={{ fontSize: 14 }} />}
                                {actionLabel(action)}
                            </button>
                        ))}
                        {offerAdvancedTryOn && (
                            <button
                                onClick={() => openTryOn({ lookPrompt: message.content.slice(0, MAX_LOOK_DESCRIPTION) })}
                                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-control-border px-3 py-1.5 text-sm font-medium text-brand-navy transition-colors hover:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                            >
                                <Checkroom style={{ fontSize: 14 }} />
                                {t('chat.actions.tryOnAdvanced', 'Provar no modo avançado')}
                            </button>
                        )}
                    </div>
                )}
                <div className={`text-xs mt-1 ${isUser ? 'text-white-pure/70' : 'text-grey-medium'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            {isUser && (
                <div className="flex-shrink-0 ml-3">
                    <Avatar src={userAvatar} alt={t('common.userAvatar', 'Foto do usuário')} size="sm" />
                </div>
            )}
        </div>
    );
}
