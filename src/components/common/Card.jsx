import React from 'react';

export default function Card({
    children,
    className = '',
    onClick,
    hoverable = false,
    ...props
}) {
    const baseStyles = "bg-white-pure border border-grey-light rounded-card shadow-card overflow-hidden";
    const hoverStyles = hoverable ? "transition-shadow hover:shadow-md active:shadow-inner cursor-pointer" : "";

    // A clickable card must also be operable by keyboard and announced as a
    // control — otherwise (e.g. the wardrobe grid) it is unreachable without a mouse.
    const interactive = typeof onClick === 'function';
    const interactiveProps = interactive
        ? {
            role: 'button',
            tabIndex: 0,
            onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e);
                }
            },
        }
        : {};

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
            {...interactiveProps}
            {...props}
        >
            {children}
        </div>
    );
}

Card.Image = function CardImage({ src, alt, className = '', eager = false }) {
    // `aspect-[3/4]` (core) rather than aspect-w-3/aspect-h-4 — the aspect-ratio
    // plugin isn't installed, so those classes emitted nothing and the box had
    // no intrinsic height, making every image pop in and shift the layout.
    return (
        <div className={`w-full aspect-[3/4] bg-grey-light ${className}`}>
            <img
                src={src}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                style={{ imageOrientation: 'from-image' }}
                className="w-full h-full object-center object-cover"
            />
        </div>
    );
};

Card.Body = function CardBody({ children, className = '' }) {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
};

Card.Title = function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-lg font-semibold text-brand-navy ${className}`}>
            {children}
        </h3>
    );
};

Card.Subtitle = function CardSubtitle({ children, className = '' }) {
    return (
        <p className={`text-sm text-grey-medium ${className}`}>
            {children}
        </p>
    );
};
