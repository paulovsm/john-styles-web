import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfileContext } from '../../contexts/UserProfileContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const { profile, isLoadingProfile } = useUserProfileContext();
    const { t } = useTranslation();
    const location = useLocation();

    if (loading || isLoadingProfile) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3 bg-white-off">
                <Loading type="spinner" size={40} />
                <p className="text-sm text-grey-medium">{t('common.loading', 'Carregando...')}</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // If user is logged in but hasn't completed onboarding, redirect to onboarding
    // unless they are already there.
    if (!profile?.onboardingCompleted && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" />;
    }

    return children;
}
