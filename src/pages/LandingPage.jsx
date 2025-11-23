import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white-pure">
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    );
}
