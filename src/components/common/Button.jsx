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
    // min-h-[44px] meets the touch-target minimum even when callers shrink the
    // padding (e.g. py-1 / text-xs). active: gives immediate press feedback —
    // without it, taps feel dead and iOS leaves the hover style "stuck" on.
    const baseStyles = "inline-flex items-center justify-center min-h-[44px] px-5 py-2 border text-sm font-semibold rounded-full transition-transform transition-colors active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "border-transparent text-white-pure bg-brand-navy hover:bg-opacity-90 active:bg-opacity-80 focus:ring-brand-navy",
        outline: "border-brand-navy text-brand-navy bg-transparent hover:bg-grey-light active:bg-grey-light focus:ring-brand-navy",
        text: "border-transparent text-brand-navy bg-transparent hover:bg-grey-light active:bg-grey-light focus:ring-brand-navy shadow-none",
        accent: "border-transparent text-white-pure bg-brand-gold hover:bg-opacity-90 active:bg-opacity-80 focus:ring-brand-gold"
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
