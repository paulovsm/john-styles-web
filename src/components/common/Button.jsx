import React from 'react';
import Loading from './Loading';

export default function Button({
    children,
    variant = 'primary', // primary, outline, text
    type = 'button',
    className = '',
    isLoading = false,
    disabled = false,
    onClick,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "border-transparent text-white-pure bg-brand-navy hover:bg-opacity-90 focus:ring-brand-navy",
        outline: "border-brand-navy text-brand-navy bg-transparent hover:bg-grey-light focus:ring-brand-navy",
        text: "border-transparent text-brand-navy bg-transparent hover:bg-grey-light focus:ring-brand-navy shadow-none",
        accent: "border-transparent text-white-pure bg-brand-gold hover:bg-opacity-90 focus:ring-brand-gold"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading && (
                <Loading type="spinner" size={16} className="mr-2" />
            )}
            {children}
        </button>
    );
}
