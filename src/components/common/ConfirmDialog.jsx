import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { useTranslation } from 'react-i18next';

/**
 * Styled confirmation dialog to replace window.confirm().
 */
export default function ConfirmDialog({
    isOpen,
    onCancel,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    danger = false,
    loading = false,
}) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
            <p className="text-sm text-grey-dark">{message}</p>
            <div className="flex justify-end gap-3 pt-6">
                <Button variant="text" onClick={onCancel} disabled={loading}>
                    {cancelLabel || t('common.cancel', 'Cancelar')}
                </Button>
                <Button
                    variant="primary"
                    onClick={onConfirm}
                    isLoading={loading}
                    className={danger ? 'bg-status-error border-status-error focus:ring-status-error hover:bg-status-error' : ''}
                >
                    {confirmLabel || t('common.confirm', 'Confirmar')}
                </Button>
            </div>
        </Modal>
    );
}
