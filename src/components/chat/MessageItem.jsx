import React from 'react';
import Avatar from '../common/Avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageItem({ message, userAvatar }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && (
                <div className="flex-shrink-0 mr-3">
                    <Avatar src="/JohnStyles.jpg" alt="John Styles" size="sm" />
                </div>
            )}
            <div
                className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${isUser
                    ? 'bg-fleek-navy text-white-pure rounded-br-none'
                    : 'bg-white-pure border border-grey-light text-grey-dark rounded-bl-none'
                    }`}
            >
                <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-a:text-blue-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
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
