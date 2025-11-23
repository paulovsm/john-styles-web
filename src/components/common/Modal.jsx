import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Close } from '@mui/icons-material';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-grey-dark bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    ref={modalRef}
                    className={`inline-block align-bottom bg-white-pure rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}
                >
                    <div className="bg-white-pure px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center mb-4">
                                    {title && (
                                        <h3 className="text-lg leading-6 font-medium text-fleek-navy" id="modal-title">
                                            {title}
                                        </h3>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="bg-white-pure rounded-md text-grey-medium hover:text-grey-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fleek-navy"
                                    >
                                        <span className="sr-only">Close</span>
                                        <Close />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
