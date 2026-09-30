import React, { useEffect, useRef, useState } from 'react';
import { AddAPhoto, Close, Send } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useExperience } from '../../experience/ExperienceContext';
import { validateWardrobeImageFile } from '../../utils/imageUtils';

export default function ChatInput({ onSend, disabled, requestLookPhoto = false, onPhotoPromptHandled }) {
    const [message, setMessage] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoError, setPhotoError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const { t } = useTranslation();
    const experience = useExperience();

    useEffect(() => () => {
        if (photo?.preview) URL.revokeObjectURL(photo.preview);
    }, [photo]);

    const selectPhoto = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        const validationError = validateWardrobeImageFile(file);
        if (validationError) {
            setPhotoError(validationError === 'too_large'
                ? t('wardrobe.errors.imageTooLarge')
                : t('wardrobe.errors.unsupportedImageType'));
            return;
        }
        setPhotoError('');
        setPhoto({ file, preview: URL.createObjectURL(file) });
        onPhotoPromptHandled?.();
    };

    const removePhoto = () => setPhoto(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((message.trim() || photo) && !disabled && !submitting) {
            setSubmitting(true);
            try {
                await onSend(message, photo?.file || null);
            } finally {
                setSubmitting(false);
            }
            setMessage('');
            setPhoto(null);
        }
    };

    const isDisabled = disabled || submitting;

    return (
        <form onSubmit={handleSubmit} className="border-t border-grey-light p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {requestLookPhoto && !photo && (
                <div className="mb-3 rounded-card border border-brand-gold/50 bg-white-off p-3">
                    <p className="text-sm font-semibold text-brand-navy">
                        {t('lookEvaluation.promptTitle', 'Envie uma foto do look completo')}
                    </p>
                    <p className="mt-1 text-sm text-grey-medium">
                        {t('lookEvaluation.promptDescription', 'John vai avaliar a composição e só sugerirá uma troca se ela realmente melhorar o resultado.')}
                    </p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                    >
                        <AddAPhoto fontSize="small" />
                        {t('lookEvaluation.choosePhoto', 'Escolher foto')}
                    </button>
                </div>
            )}
            {photo && (
                <div className="mb-3 flex items-center gap-3 rounded-card border border-control-border bg-white-off p-2">
                    <img
                        src={photo.preview}
                        alt={t('lookEvaluation.photoPreview', 'Foto do look selecionada')}
                        className="h-16 w-12 shrink-0 rounded object-cover"
                    />
                    <p className="min-w-0 flex-1 text-sm text-grey-dark">
                        {t('lookEvaluation.ready', 'Foto pronta para a avaliação de John.')}
                    </p>
                    <button
                        type="button"
                        onClick={removePhoto}
                        disabled={isDisabled}
                        aria-label={t('lookEvaluation.removePhoto', 'Remover foto')}
                        className="grid min-h-11 min-w-11 place-items-center rounded-full text-grey-medium hover:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                    >
                        <Close fontSize="small" />
                    </button>
                </div>
            )}
            {photoError && <p role="alert" className="mb-2 text-sm text-error">{photoError}</p>}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectPhoto}
                className="sr-only"
                aria-label={t('lookEvaluation.choosePhoto', 'Escolher foto')}
            />
            <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled}
                    aria-label={t('lookEvaluation.attachPhoto', 'Anexar foto do look')}
                    className="shrink-0 grid min-h-[44px] min-w-[44px] place-items-center rounded-lg border border-control-border bg-white-pure text-brand-navy hover:bg-grey-light disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                >
                    <AddAPhoto />
                </button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={experience.isUniversal ? t('experienceV2.chat.placeholder') : t('chat.placeholder')}
                    disabled={isDisabled}
                    aria-label={t('chat.inputLabel', 'Mensagem para o John Styles')}
                    enterKeyHint="send"
                    autoCapitalize="sentences"
                    autoComplete="off"
                    className="theme-control flex-1 min-w-0 px-4 py-2 border border-control-border rounded-lg bg-white-pure text-grey-dark placeholder:text-grey-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:border-brand-navy disabled:bg-grey-light disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={isDisabled || (!message.trim() && !photo)}
                    aria-label={t('chat.send', 'Enviar')}
                    className="shrink-0 grid place-items-center min-h-[44px] min-w-[44px] px-4 bg-brand-navy text-white-pure rounded-lg hover:bg-opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                >
                    <Send />
                </button>
            </div>
        </form>
    );
}
