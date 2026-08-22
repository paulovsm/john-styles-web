import React from 'react';

export default function Select({
    label,
    id,
    name,
    error,
    className = '',
    children,
    ...props
}) {
    const fieldId = id || name;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-grey-dark">
                    {label}
                </label>
            )}
            <select
                id={fieldId}
                name={name}
                className="theme-control block min-h-[44px] w-full rounded-md border border-control-border bg-white-pure px-3 py-2 text-grey-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:border-brand-navy sm:text-sm"
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                {...props}
            >
                {children}
            </select>
            {error && <p id={errorId} className="mt-2 text-sm text-status-error-content">{error}</p>}
        </div>
    );
}
