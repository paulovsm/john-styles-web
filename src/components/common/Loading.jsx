import React from 'react';

/**
 * Lightweight, dependency-free loading primitive.
 * - type="spinner": an animated SVG spinner (honors `size` in px, inherits color)
 * - type="skeleton": a pulsing placeholder block
 */
export default function Loading({ type = 'spinner', size = 40, className = '', ...props }) {
    if (type === 'spinner') {
        return (
            <span className={`inline-flex justify-center items-center text-brand-navy ${className}`} {...props}>
                <svg
                    className="animate-spin"
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    role="status"
                    aria-label="Loading"
                >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
            </span>
        );
    }

    if (type === 'skeleton') {
        return (
            <div className={`animate-pulse bg-grey-light rounded ${className}`} {...props}></div>
        );
    }

    return null;
}
