import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
    const { currentUser } = useAuth();

    if (currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-white-pure">
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    );
}
