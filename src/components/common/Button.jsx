import React from 'react';
import { CircularProgress } from '@mui/material';

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
        primary: "border-transparent text-white-pure bg-fleek-navy hover:bg-opacity-90 focus:ring-fleek-navy",
        outline: "border-fleek-navy text-fleek-navy bg-transparent hover:bg-grey-light focus:ring-fleek-navy",
        text: "border-transparent text-fleek-navy bg-transparent hover:bg-grey-light focus:ring-fleek-navy shadow-none",
        accent: "border-transparent text-white-pure bg-fleek-gold hover:bg-opacity-90 focus:ring-fleek-gold"
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
                <CircularProgress size={16} color="inherit" className="mr-2" />
            )}
            {children}
        </button>
    );
}
