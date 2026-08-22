import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-white-pure border-t border-grey-light mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-sm text-grey-medium">
                    &copy; {new Date().getFullYear()} John Styles. {t('footer.rights', 'Todos os direitos reservados.')}
                </p>
                <Link to="/privacy" className="inline-flex min-h-11 items-center text-sm text-grey-medium hover:text-brand-navy">
                    {t('footer.privacy', 'Política de Privacidade')}
                </Link>
            </div>
        </footer>
    );
}
