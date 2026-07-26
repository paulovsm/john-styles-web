import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WardrobeSummary from '../components/dashboard/WardrobeSummary';
import QuickActions from '../components/dashboard/QuickActions';
import OutfitOfTheDay from '../components/dashboard/OutfitOfTheDay';
import RecentLooks from '../components/dashboard/RecentLooks';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-navy">
                        {t('dashboard.welcome', { name: currentUser?.displayName?.split(' ')[0] || 'User' })}
                    </h1>
                    <p className="mt-2 text-grey-medium">
                        {t('dashboard.subtitle')}
                    </p>
                </div>
                <Link to="/onboarding" className="text-brand-navy hover:text-opacity-80 font-medium underline">
                    {t('dashboard.myProfile')}
                </Link>
            </div>

            {/* Daily hub: outfit of the day + quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <OutfitOfTheDay />
                </div>
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
            </div>

            {/* Wardrobe summary + recent activity */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WardrobeSummary />
                </div>
                <div className="lg:col-span-2">
                    <RecentLooks />
                </div>
            </div>
        </MainLayout>
    );
}
