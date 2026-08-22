import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }) {
    return (
        <div className="app-shell min-h-screen flex flex-col bg-white-off">
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
