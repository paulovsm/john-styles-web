import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SkipLink() {
    const { t } = useTranslation();

    return (
        <a
            href="#main-content"
            className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-md bg-brand-navy px-4 py-3 font-semibold text-white-pure shadow-lg transition-transform focus:translate-y-0 focus-visible:translate-y-0"
        >
            {t('common.skipToContent', 'Pular para o conteúdo')}
        </a>
    );
}
