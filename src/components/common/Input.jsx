import React from 'react';

export default function Input({
    label,
    type = 'text',
    id,
    name,
    value,
    onChange,
    placeholder,
    error,
    className = '',
    rows = 3,
    ...props
}) {
    const fieldId = id || name;
    const errorId = error ? `${fieldId}-error` : undefined;
    const baseStyles = "theme-control appearance-none block w-full min-h-[44px] px-3 py-2 border border-control-border rounded-md bg-white-pure text-grey-dark shadow-sm placeholder:text-grey-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:border-brand-navy sm:text-sm";
    const errorStyles = "border-status-error focus-visible:ring-status-error focus-visible:border-status-error";

    return (
        <div className={className}>
            {label && (
                <label htmlFor={fieldId} className="block text-sm font-medium text-grey-dark mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        id={fieldId}
                        name={name}
                        rows={rows}
                        className={`${baseStyles} ${error ? errorStyles : ''}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        aria-invalid={Boolean(error)}
                        aria-describedby={errorId}
                        {...props}
                    />
                ) : (
                    <input
                        id={fieldId}
                        name={name}
                        type={type}
                        className={`${baseStyles} ${error ? errorStyles : ''}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        aria-invalid={Boolean(error)}
                        aria-describedby={errorId}
                        {...props}
                    />
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-status-error-content" id={errorId}>
                    {error}
                </p>
            )}
        </div>
    );
}
