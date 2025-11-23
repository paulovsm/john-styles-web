import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation();

    return (
        <div className="relative bg-white-pure overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-white-pure sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                        <div className="sm:text-center lg:text-left">
                            <h1 className="text-4xl tracking-tight font-extrabold text-fleek-navy sm:text-5xl md:text-6xl font-serif">
                                <span className="block xl:inline">{t('landing.hero.title')}</span>{' '}
                                <span className="block text-fleek-gold xl:inline">{t('landing.hero.subtitle')}</span>
                            </h1>
                            <p className="mt-3 text-base text-grey-medium sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                {t('landing.hero.description')}
                            </p>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                <div className="rounded-md shadow">
                                    <Link
                                        to="/login"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white-pure bg-fleek-navy hover:bg-opacity-90 md:py-4 md:text-lg md:px-10"
                                    >
                                        {t('landing.hero.getStarted')}
                                    </Link>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-3">
                                    <Link
                                        to="/login"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-fleek-navy bg-fleek-gold/20 hover:bg-fleek-gold/30 md:py-4 md:text-lg md:px-10"
                                    >
                                        {t('landing.hero.login')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                <img
                    className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                    src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2121&auto=format&fit=crop"
                    alt="Stylish man in suit"
                />
            </div>
        </div>
    );
}
