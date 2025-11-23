import React from 'react';
import { AutoAwesome, Checkroom, CameraAlt } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function FeaturesSection() {
    const { t } = useTranslation();

    const features = [
        {
            name: t('landing.features.aiAnalysis.title'),
            description: t('landing.features.aiAnalysis.description'),
            icon: AutoAwesome,
        },
        {
            name: t('landing.features.virtualWardrobe.title'),
            description: t('landing.features.virtualWardrobe.description'),
            icon: Checkroom,
        },
        {
            name: t('landing.features.virtualTryOn.title'),
            description: t('landing.features.virtualTryOn.description'),
            icon: CameraAlt,
        },
    ];

    return (
        <div className="py-12 bg-white-off">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center">
                    <h2 className="text-base text-fleek-gold font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-fleek-navy sm:text-4xl font-serif">
                        {t('landing.features.title')}
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-grey-medium lg:mx-auto">
                        {t('landing.features.subtitle')}
                    </p>
                </div>

                <div className="mt-10">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-fleek-navy text-white-pure">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-fleek-navy">{feature.name}</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-grey-medium">{feature.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
