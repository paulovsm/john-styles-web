import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WardrobeSummary from '../components/dashboard/WardrobeSummary';
import OutfitOfTheDay from '../components/dashboard/OutfitOfTheDay';
import RecentLooks from '../components/dashboard/RecentLooks';
import WardrobeCarousel from '../components/dashboard/WardrobeCarousel';
import Button from '../components/common/Button';
import { Chat, AddAPhoto, History } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWeather } from '../hooks/useWeather';
import { useDailyContext } from '../hooks/useDailyContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
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
            <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold text-brand-navy">
                    {t('dashboard.welcome', { name: currentUser?.displayName?.split(' ')[0] || 'User' })}
                </h1>
                <p className="mt-2 text-grey-medium">{t('dashboard.subtitle')}</p>
            </div>

            {/* Primary actions, inline under the subtitle */}
            <div className="mb-8 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('/chat')}>
                    <Chat className="mr-2 h-5 w-5" />
                    {t('dashboard.askJohn')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/wardrobe')}>
                    <AddAPhoto className="mr-2 h-5 w-5" />
                    {t('dashboard.addNewItem')}
                </Button>
                <Button variant="text" onClick={() => navigate('/history')}>
                    <History className="mr-2 h-5 w-5" />
                    {t('dashboard.viewHistory')}
                </Button>
            </div>

            {/* Row A: outfit of the day + recent looks (carousel) — equal halves */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <OutfitOfTheDay weather={weather} dailyContext={dailyContext} />
                </div>
                <div>
                    <RecentLooks />
                </div>
            </div>

            {/* Row B: wardrobe summary (with insights sub-section) */}
            <div className="mt-6">
                <WardrobeSummary />
            </div>

            {/* Row C: wardrobe photos (carousel) */}
            <div className="mt-6">
                <WardrobeCarousel />
            </div>
        </MainLayout>
    );
}
