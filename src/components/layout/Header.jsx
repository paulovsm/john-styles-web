import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Menu, Close, Logout, Person, Sync, DarkMode, LightMode } from '@mui/icons-material';
import LanguageSelector from '../common/LanguageSelector';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isSyncing, syncNow } = useSyncStatus();
    const { theme, toggleTheme } = useTheme();

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
                            <Link to="/" className="flex items-center text-2xl font-serif font-bold text-brand-navy">
                                <img src="/FA_Icon_White.avif" alt="Logo" className="h-8 w-8 mr-2" />
                                John Styles
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/dashboard" className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-grey-medium hover:text-brand-navy hover:bg-grey-light transition-colors">
                                {t('nav.dashboard')}
                            </Link>
                            <Link to="/chat" className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-grey-medium hover:text-brand-navy hover:bg-grey-light transition-colors">
                                {t('nav.chat')}
                            </Link>
                            <Link to="/wardrobe" className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-grey-medium hover:text-brand-navy hover:bg-grey-light transition-colors">
                                {t('nav.wardrobe')}
                            </Link>
                            <Link to="/try-on" className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-grey-medium hover:text-brand-navy hover:bg-grey-light transition-colors">
                                {t('nav.tryOn')}
                            </Link>
                            <Link to="/history" className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-grey-medium hover:text-brand-navy hover:bg-grey-light transition-colors">
                                {t('nav.history')}
                            </Link>
                            <Link to="/gallery" className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-grey-medium hover:text-brand-navy hover:bg-grey-light transition-colors">
                                {t('nav.gallery', 'Galeria')}
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
                        <button
                            onClick={toggleTheme}
                            className="p-1 rounded-full text-grey-medium hover:text-brand-navy focus:outline-none"
                            aria-label={t('common.toggleTheme', 'Alternar tema')}
                            title={t('common.toggleTheme', 'Alternar tema')}
                        >
                            {theme === 'dark' ? <LightMode /> : <DarkMode />}
                        </button>
                        <button
                            onClick={handleSync}
                            className={`p-1 rounded-full text-grey-medium hover:text-brand-navy focus:outline-none ${isSyncing ? 'animate-spin' : ''}`}
                            aria-label={t('common.sync', 'Sincronizar')}
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
                                    className="p-1 rounded-full text-grey-medium hover:text-brand-navy focus:outline-none"
                                    aria-label={t('common.logout', 'Sair')}
                                    title={t('common.logout', 'Sair')}
                                >
                                    <Logout />
                                </button>
                                {currentUser.photoURL ? (
                                    <img
                                        className="h-8 w-8 rounded-full object-cover"
                                        src={currentUser.photoURL}
                                        alt={t('common.userAvatar', 'Foto do usuário')}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-brand-navy flex items-center justify-center text-white-pure">
                                        <Person />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-grey-dark hover:text-brand-navy font-medium">
                                    {t('auth.login')}
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-grey-medium hover:text-brand-navy hover:bg-grey-light focus:outline-none"
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
                        <Link to="/dashboard" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy">
                            {t('nav.dashboard')}
                        </Link>
                        <Link to="/chat" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy">
                            {t('nav.chat')}
                        </Link>
                        <Link to="/wardrobe" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy">
                            {t('nav.wardrobe')}
                        </Link>
                        <Link to="/try-on" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy">
                            {t('nav.tryOn')}
                        </Link>
                        <Link to="/history" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy">
                            {t('nav.history')}
                        </Link>
                        <Link to="/gallery" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy">
                            {t('nav.gallery', 'Galeria')}
                        </Link>
                    </div>
                    <div className="pt-4 pb-4 border-t border-grey-light">
                        {currentUser ? (
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    {currentUser.photoURL ? (
                                        <img className="h-10 w-10 rounded-full object-cover" src={currentUser.photoURL} alt={t('common.userAvatar', 'Foto do usuário')} referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-brand-navy flex items-center justify-center text-white-pure">
                                            <Person />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-brand-navy">{currentUser.displayName || 'User'}</div>
                                    <div className="text-sm font-medium text-grey-medium">{currentUser.email}</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="ml-auto flex-shrink-0 p-1 rounded-full text-grey-medium hover:text-brand-navy focus:outline-none"
                                    aria-label={t('common.logout', 'Sair')}
                                >
                                    <Logout />
                                </button>
                            </div>
                        ) : (
                            <div className="px-4">
                                <Link to="/login" className="block text-center w-full py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white-pure bg-brand-navy hover:bg-opacity-90">
                                    {t('auth.login')}
                                </Link>
                            </div>
                        )}

                        {/* Sync + language are desktop-only in the top bar; expose them here too. */}
                        <div className="mt-3 px-4 flex items-center justify-between">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center gap-2 text-sm text-grey-dark hover:text-brand-navy focus:outline-none"
                                aria-label={t('common.sync', 'Sincronizar')}
                            >
                                <Sync className={isSyncing ? 'animate-spin' : ''} fontSize="small" />
                                {t('common.sync', 'Sincronizar')}
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 text-sm text-grey-dark hover:text-brand-navy focus:outline-none"
                                    aria-label={t('common.toggleTheme', 'Alternar tema')}
                                >
                                    {theme === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                                </button>
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
