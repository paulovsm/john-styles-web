import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Menu, Close, Logout, Person, Sync } from '@mui/icons-material';
import LanguageSelector from '../common/LanguageSelector';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export default function Header() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isSyncing, syncNow } = useSyncStatus();

    const handleSync = async () => {
        try {
            await syncNow();
        } catch (error) {
            console.error("Sync failed", error);
        }
    };

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <header className="bg-white-pure border-b border-grey-light sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center text-2xl font-serif font-bold text-fleek-navy">
                                <img src="/FA_Icon_White.avif" alt="Logo" className="h-8 w-8 mr-2" />
                                John Styles
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/dashboard" className="border-transparent text-grey-medium hover:border-fleek-navy hover:text-fleek-navy inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t('nav.dashboard')}
                            </Link>
                            <Link to="/chat" className="border-transparent text-grey-medium hover:border-fleek-navy hover:text-fleek-navy inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t('nav.chat')}
                            </Link>
                            <Link to="/wardrobe" className="border-transparent text-grey-medium hover:border-fleek-navy hover:text-fleek-navy inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t('nav.wardrobe')}
                            </Link>
                            <Link to="/try-on" className="border-transparent text-grey-medium hover:border-fleek-navy hover:text-fleek-navy inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t('nav.tryOn')}
                            </Link>
                            <Link to="/history" className="border-transparent text-grey-medium hover:border-fleek-navy hover:text-fleek-navy inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t('nav.history')}
                            </Link>
                            <Link to="/gallery" className="border-transparent text-grey-medium hover:border-fleek-navy hover:text-fleek-navy inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t('nav.gallery', 'Galeria')}
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
                        <button
                            onClick={handleSync}
                            className={`p-1 rounded-full text-grey-medium hover:text-fleek-navy focus:outline-none ${isSyncing ? 'animate-spin' : ''}`}
                            title={t('common.sync', 'Sincronizar')}
                            disabled={isSyncing}
                        >
                            <Sync />
                        </button>
                        <LanguageSelector />
                        {currentUser ? (
                            <div className="ml-3 relative flex items-center space-x-4">
                                <span className="text-sm text-grey-dark">{currentUser.displayName || currentUser.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="p-1 rounded-full text-grey-medium hover:text-fleek-navy focus:outline-none"
                                    title="Logout"
                                >
                                    <Logout />
                                </button>
                                {currentUser.photoURL ? (
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src={currentUser.photoURL}
                                        alt="User avatar"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-fleek-navy flex items-center justify-center text-white-pure">
                                        <Person />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-grey-dark hover:text-fleek-navy font-medium">
                                    {t('auth.login')}
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-grey-medium hover:text-fleek-navy hover:bg-grey-light focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <Close /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white-pure border-t border-grey-light">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/dashboard" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-fleek-navy hover:text-fleek-navy">
                            {t('nav.dashboard')}
                        </Link>
                        <Link to="/chat" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-fleek-navy hover:text-fleek-navy">
                            {t('nav.chat')}
                        </Link>
                        <Link to="/wardrobe" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-fleek-navy hover:text-fleek-navy">
                            {t('nav.wardrobe')}
                        </Link>
                        <Link to="/try-on" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-fleek-navy hover:text-fleek-navy">
                            {t('nav.tryOn')}
                        </Link>
                        <Link to="/history" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-fleek-navy hover:text-fleek-navy">
                            {t('nav.history')}
                        </Link>
                        <Link to="/gallery" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-fleek-navy hover:text-fleek-navy">
                            {t('nav.gallery', 'Galeria')}
                        </Link>
                    </div>
                    <div className="pt-4 pb-4 border-t border-grey-light">
                        {currentUser ? (
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    {currentUser.photoURL ? (
                                        <img className="h-10 w-10 rounded-full" src={currentUser.photoURL} alt="" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-fleek-navy flex items-center justify-center text-white-pure">
                                            <Person />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-fleek-navy">{currentUser.displayName || 'User'}</div>
                                    <div className="text-sm font-medium text-grey-medium">{currentUser.email}</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="ml-auto flex-shrink-0 p-1 rounded-full text-grey-medium hover:text-fleek-navy focus:outline-none"
                                >
                                    <Logout />
                                </button>
                            </div>
                        ) : (
                            <div className="px-4">
                                <Link to="/login" className="block text-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white-pure bg-fleek-navy hover:bg-opacity-90">
                                    {t('auth.login')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
