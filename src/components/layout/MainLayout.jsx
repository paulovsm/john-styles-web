import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-white-off">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
