import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const modalRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement;

        const getFocusable = () =>
            modalRef.current
                ? Array.from(
                      modalRef.current.querySelectorAll(
                          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                      )
                  )
                : [];

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            // Focus trap
            if (e.key === 'Tab') {
                const focusable = getFocusable();
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        // Move focus into the dialog on open.
        const focusable = getFocusable();
        (focusable[0] || modalRef.current)?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            // Restore focus to the trigger element.
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
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
                <div className="fixed inset-0 bg-black/60 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    ref={modalRef}
                    tabIndex={-1}
                    className={`inline-block align-bottom bg-white-pure rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full focus:outline-none ${sizeClasses[size]}`}
                >
                    <div className="bg-white-pure px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center gap-3 mb-4">
                                    {title && (
                                        <h3 className="text-lg leading-6 font-medium text-brand-navy min-w-0 truncate" id="modal-title">
                                            {title}
                                        </h3>
                                    )}
                                    <button
                                        onClick={onClose}
                                        aria-label={t('common.close', 'Fechar')}
                                        className="ml-auto grid place-items-center h-11 w-11 -mr-2 shrink-0 bg-white-pure rounded-full text-grey-medium hover:text-grey-dark active:text-grey-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
                                    >
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
