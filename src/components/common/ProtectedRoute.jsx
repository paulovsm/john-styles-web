import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfileContext } from '../../contexts/UserProfileContext';

export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const { profile } = useUserProfileContext();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
