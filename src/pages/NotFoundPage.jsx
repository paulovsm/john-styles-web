import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white-off px-4 text-center">
            <p className="text-6xl font-serif font-bold text-brand-navy">404</p>
            <h1 className="mt-4 text-xl font-medium text-brand-navy">
                {t('notFound.title', 'Página não encontrada')}
            </h1>
            <p className="mt-2 text-grey-medium max-w-md">
                {t('notFound.description', 'A página que você procura não existe ou foi movida.')}
            </p>
            <Link
                to="/"
                className="mt-6 inline-flex items-center px-6 py-3 rounded-md text-white-pure bg-brand-navy hover:bg-opacity-90 font-medium"
            >
                {t('notFound.backHome', 'Voltar ao início')}
            </Link>
        </div>
    );
}
