import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import WardrobeSummary from '../components/dashboard/WardrobeSummary';
import QuickActions from '../components/dashboard/QuickActions';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-fleek-navy">
                        {t('dashboard.welcome', { name: currentUser?.displayName?.split(' ')[0] || 'User' })}
                    </h1>
                    <p className="mt-2 text-grey-medium">
                        {t('dashboard.subtitle')}
                    </p>
                </div>
                <a href="/onboarding" className="text-fleek-navy hover:text-opacity-80 font-medium underline">
                    {t('dashboard.myProfile')}
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <WardrobeSummary />
                </div>
                <div className="md:col-span-1">
                    <QuickActions />
                </div>
            </div>

            {/* Future: Recent Activity / Recommendations */}
        </MainLayout>
    );
}
