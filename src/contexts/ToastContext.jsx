import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, Error as ErrorIcon, Info, Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ToastContext = createContext();

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

let nextId = 0;

const STYLES = {
    success: { icon: CheckCircle, cls: 'border-status-success text-status-success-content' },
    error: { icon: ErrorIcon, cls: 'border-status-error text-status-error-content' },
    info: { icon: Info, cls: 'border-status-info text-status-info-content' },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const { t } = useTranslation();

    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((t) => t.id !== id));
    }, []);

    const show = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++nextId;
        setToasts((list) => [...list, { id, message, type }]);
        if (duration > 0) setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    const toast = {
        success: (msg, d) => show(msg, 'success', d),
        error: (msg, d) => show(msg, 'error', d),
        info: (msg, d) => show(msg, 'info', d),
        dismiss,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Inset from BOTH edges on mobile: `w-full` + `right-4` alone pushes
                the left edge off-screen, where overflow-x:hidden clips the text. */}
            <div className="fixed top-4 left-4 right-4 sm:left-auto sm:w-full sm:max-w-sm z-[100] flex flex-col gap-2 pointer-events-none" aria-live="polite">
                {toasts.map(({ id, message, type }) => {
                    const { icon: Icon, cls } = STYLES[type] || STYLES.info;
                    return (
                        <div
                            key={id}
                            role="status"
                            className={`pointer-events-auto flex items-start gap-3 bg-white-pure border-l-4 ${cls} shadow-lg rounded-md px-4 py-3`}
                        >
                            <Icon fontSize="small" className="mt-0.5 shrink-0" />
                            <p className="text-sm text-grey-dark flex-1">{message}</p>
                            <button
                                onClick={() => dismiss(id)}
                                className="grid place-items-center h-11 w-11 -my-2.5 -mr-2 text-grey-medium hover:text-grey-dark shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                                aria-label={t('common.closeNotification', 'Fechar notificação')}
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
