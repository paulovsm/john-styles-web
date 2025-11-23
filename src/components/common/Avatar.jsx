import React from 'react';
import { Person } from '@mui/icons-material';

export default function Avatar({
    src,
    alt,
    size = 'md', // sm, md, lg, xl
    className = '',
    status, // online, busy, etc. (optional)
    ...props
}) {
    const sizeStyles = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg"
    };

    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`relative inline-block ${className}`} {...props}>
            {src ? (
                <img
                    className={`${sizeStyles[size]} rounded-full object-cover`}
                    src={src}
                    alt={alt}
                />
            ) : (
                <div className={`${sizeStyles[size]} rounded-full bg-fleek-navy flex items-center justify-center text-white-pure font-medium`}>
                    {alt ? getInitials(alt) : <Person className="h-1/2 w-1/2" />}
                </div>
            )}
            {status && (
                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white-pure ${status === 'online' ? 'bg-status-success' : 'bg-grey-medium'
                    }`} />
            )}
        </div>
    );
}
