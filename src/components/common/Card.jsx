import React from 'react';

export default function Card({
    children,
    className = '',
    onClick,
    hoverable = false,
    ...props
}) {
    const baseStyles = "bg-white-pure border border-grey-light rounded-lg shadow-sm overflow-hidden";
    const hoverStyles = hoverable ? "transition-shadow hover:shadow-md cursor-pointer" : "";

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}

Card.Image = function CardImage({ src, alt, className = '' }) {
    return (
        <div className={`w-full aspect-w-3 aspect-h-4 bg-grey-light ${className}`}>
            <img src={src} alt={alt} className="w-full h-full object-center object-cover" />
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
        <h3 className={`text-lg font-medium text-fleek-navy ${className}`}>
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
