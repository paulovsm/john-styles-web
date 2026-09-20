import React from 'react';
import { useTranslation } from 'react-i18next';

export default function JohnSignature({ compact = false, className = '' }) {
    const { t } = useTranslation();
    const imageSize = compact ? 'h-11 w-11' : 'h-14 w-14';

    return (
        <div className={`flex items-center gap-3 ${className}`.trim()}>
            <img
                src="/JohnStyles.jpg"
                alt={t('experienceV2.john.avatarAlt')}
                width="320"
                height="320"
                className={`${imageSize} shrink-0 rounded-sm object-cover grayscale`}
            />
            <div className="min-w-0">
                <strong className="block font-display text-sm font-bold text-brand-navy">John Styles</strong>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gold-dark">
                    {t('experienceV2.john.role')}
                </span>
            </div>
        </div>
    );
}
