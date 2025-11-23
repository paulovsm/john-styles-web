import React from 'react';
import { CircularProgress } from '@mui/material';

export default function Loading({ type = 'spinner', className = '', ...props }) {
    if (type === 'spinner') {
        return (
            <div className={`flex justify-center items-center ${className}`} {...props}>
                <CircularProgress className="text-fleek-navy" />
            </div>
        );
    }

    if (type === 'skeleton') {
        return (
            <div className={`animate-pulse bg-grey-light rounded ${className}`} {...props}></div>
        );
    }

    return null;
}
