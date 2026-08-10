import React from 'react';
import { AutoAwesome, CheckCircleOutline, Close, PhotoCamera } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

const steps = [
    { key: 'photo', icon: <PhotoCamera fontSize="small" /> },
    { key: 'analyze', icon: <AutoAwesome fontSize="small" /> },
    { key: 'review', icon: <CheckCircleOutline fontSize="small" /> },
];

export default function WardrobeTutorial({ onAddItem, onDismiss }) {
    const { t } = useTranslation();

    return (
        <section className="relative mb-6 rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-5" aria-labelledby="wardrobe-tutorial-title">
            <button
                type="button"
                onClick={onDismiss}
                className="absolute right-3 top-3 rounded-md p-1 text-grey-medium hover:bg-white-pure hover:text-grey-dark focus:outline-none focus:ring-2 focus:ring-brand-navy"
                aria-label={t('wardrobe.tutorial.dismiss')}
            >
                <Close fontSize="small" />
            </button>

            <div className="pr-8">
                <h2 id="wardrobe-tutorial-title" className="text-lg font-semibold text-brand-navy">
                    {t('wardrobe.tutorial.title')}
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-grey-dark">
                    {t('wardrobe.tutorial.description')}
                </p>
            </div>

            <ol className="mt-5 grid gap-3 md:grid-cols-3">
                {steps.map(({ key, icon }, index) => (
                    <li key={key} className="flex gap-3 rounded-lg border border-grey-light bg-white-pure p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white-pure" aria-hidden="true">
                            {icon}
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-brand-navy">
                                {index + 1}. {t(`wardrobe.tutorial.steps.${key}.title`)}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-grey-medium">
                                {t(`wardrobe.tutorial.steps.${key}.description`)}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-grey-medium">{t('wardrobe.tutorial.tip')}</p>
                <Button onClick={onAddItem} className="shrink-0">
                    <PhotoCamera className="mr-2" fontSize="small" />
                    {t('wardrobe.tutorial.cta')}
                </Button>
            </div>
        </section>
    );
}
