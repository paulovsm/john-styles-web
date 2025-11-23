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
    const baseStyles = "appearance-none block w-full px-3 py-2 border border-grey-light rounded-md shadow-sm placeholder-grey-medium focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm";
    const errorStyles = "border-status-error focus:ring-status-error focus:border-status-error";

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id || name} className="block text-sm font-medium text-grey-dark mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        id={id || name}
                        name={name}
                        rows={rows}
                        className={`${baseStyles} ${error ? errorStyles : ''}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        {...props}
                    />
                ) : (
                    <input
                        id={id || name}
                        name={name}
                        type={type}
                        className={`${baseStyles} ${error ? errorStyles : ''}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        {...props}
                    />
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-status-error" id={`${id || name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}
