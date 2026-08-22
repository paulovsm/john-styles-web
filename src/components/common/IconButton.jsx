import React from 'react';

export default function IconButton({ label, className = '', type = 'button', children, ...props }) {
    return (
        <button
            type={type}
            aria-label={label}
            title={props.title || label}
            className={`inline-grid h-11 w-11 shrink-0 place-items-center rounded-full text-grey-medium transition-colors hover:bg-grey-light hover:text-brand-navy active:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
