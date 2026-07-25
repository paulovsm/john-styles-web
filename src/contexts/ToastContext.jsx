import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, Error as ErrorIcon, Info, Close } from '@mui/icons-material';

const ToastContext = createContext();

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

let nextId = 0;

const STYLES = {
    success: { icon: CheckCircle, cls: 'border-status-success text-status-success' },
    error: { icon: ErrorIcon, cls: 'border-status-error text-status-error' },
    info: { icon: Info, cls: 'border-brand-navy text-brand-navy' },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

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
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none" aria-live="polite">
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
                                className="text-grey-medium hover:text-grey-dark shrink-0"
                                aria-label="Fechar notificação"
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
