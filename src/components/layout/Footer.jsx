import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-white-pure border-t border-grey-light mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-grey-medium">
                    &copy; {new Date().getFullYear()} John Styles Assistant. {t('footer.rights', 'Todos os direitos reservados.')}
                </p>
            </div>
        </footer>
    );
}
