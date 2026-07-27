import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WardrobeSummary from '../components/dashboard/WardrobeSummary';
import QuickActions from '../components/dashboard/QuickActions';
import OutfitOfTheDay from '../components/dashboard/OutfitOfTheDay';
import RecentLooks from '../components/dashboard/RecentLooks';
import InsightsCard from '../components/dashboard/InsightsCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWeather } from '../hooks/useWeather';
import { useDailyContext } from '../hooks/useDailyContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const toast = useToast();
    const weather = useWeather();
    const dailyContext = useDailyContext();
    const [searchParams, setSearchParams] = useSearchParams();

    // Feedback after returning from the Google Calendar OAuth flow.
    useEffect(() => {
        const status = searchParams.get('calendar');
        if (!status) return;
        const map = {
            connected: () => toast.success(t('dashboard.calendarConnected', 'Google Agenda conectada!')),
            denied: () => toast.info(t('dashboard.calendarDenied', 'Conexão da agenda cancelada.')),
            error: () => toast.error(t('dashboard.calendarError', 'Não foi possível conectar a agenda.')),
            noRefresh: () => toast.error(t('dashboard.calendarError', 'Não foi possível conectar a agenda.')),
        };
        (map[status] || (() => {}))();
        searchParams.delete('calendar');
        setSearchParams(searchParams, { replace: true });
    }, [searchParams, setSearchParams, toast, t]);

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-navy">
                        {t('dashboard.welcome', { name: currentUser?.displayName?.split(' ')[0] || 'User' })}
                    </h1>
                    <p className="mt-2 text-grey-medium">{t('dashboard.subtitle')}</p>
                </div>
                <Link to="/onboarding" className="text-brand-navy hover:text-opacity-80 font-medium underline">
                    {t('dashboard.myProfile')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <OutfitOfTheDay weather={weather} dailyContext={dailyContext} />
                </div>
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WardrobeSummary />
                </div>
                <div className="lg:col-span-2">
                    <RecentLooks />
                </div>
            </div>

            <div className="mt-6">
                <InsightsCard />
            </div>
        </MainLayout>
    );
}
