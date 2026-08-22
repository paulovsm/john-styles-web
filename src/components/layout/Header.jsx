import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Menu, Close, Logout, Person, Sync, DarkMode, LightMode } from '@mui/icons-material';
import LanguageSelector from '../common/LanguageSelector';
import IconButton from '../common/IconButton';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isSyncing, syncNow } = useSyncStatus();
    const { theme, toggleTheme } = useTheme();
    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef(null);
    const accountTriggerRef = useRef(null);
    const firstAccountItemRef = useRef(null);

    // Close the account menu on any outside click.
    useEffect(() => {
        if (!accountOpen) return;
        const onClick = (e) => {
            if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setAccountOpen(false);
                accountTriggerRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [accountOpen]);

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

    const navItems = [
        { to: '/dashboard', label: t('nav.dashboard') },
        { to: '/chat', label: t('nav.chat') },
        { to: '/wardrobe', label: t('nav.wardrobe') },
        { to: '/try-on', label: t('nav.tryOn') },
        { to: '/history', label: t('nav.history') },
        { to: '/gallery', label: t('nav.gallery', 'Galeria') },
    ];

    const desktopNavClass = ({ isActive }) => `inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${isActive
        ? 'bg-grey-light text-brand-navy'
        : 'text-grey-medium hover:bg-grey-light hover:text-brand-navy'}`;

    const toggleAccountMenu = () => {
        const willOpen = !accountOpen;
        setAccountOpen(willOpen);
        if (willOpen) requestAnimationFrame(() => firstAccountItemRef.current?.focus());
    };

    const handleAccountMenuKeyDown = (event) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        const items = [...event.currentTarget.querySelectorAll('[role="menuitem"]')];
        const currentIndex = items.indexOf(document.activeElement);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
        if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = items.length - 1;
        event.preventDefault();
        items[nextIndex]?.focus();
    };

    return (
        <header className="bg-white-pure border-b border-grey-light sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex min-h-11 items-center text-2xl font-serif font-bold text-brand-navy" aria-label={t('common.homeLabel', 'Fleek Authority — início')}>
                                <img src="/FA_Icon_White.avif" alt="" className="h-8 w-8 mr-2 invert dark:invert-0" />
                                John Styles
                            </Link>
                        </div>
                        <div className="hidden lg:ml-6 lg:flex lg:space-x-1 xl:space-x-3">
                            {navItems.map(({ to, label }) => <NavLink key={to} to={to} className={desktopNavClass}>{label}</NavLink>)}
                        </div>
                    </div>
                    <div className="hidden lg:ml-6 lg:flex lg:items-center space-x-1">
                        <IconButton
                            onClick={toggleTheme}
                            label={t('common.toggleTheme', 'Alternar tema')}
                        >
                            {theme === 'dark' ? <LightMode /> : <DarkMode />}
                        </IconButton>
                        <IconButton
                            onClick={handleSync}
                            className={isSyncing ? 'animate-spin' : ''}
                            label={t('common.sync', 'Sincronizar')}
                            disabled={isSyncing}
                        >
                            <Sync />
                        </IconButton>
                        <LanguageSelector />
                        {currentUser ? (
                            <div className="ml-3 relative" ref={accountRef}>
                                <button
                                    ref={accountTriggerRef}
                                    type="button"
                                    onClick={toggleAccountMenu}
                                    aria-haspopup="menu"
                                    aria-expanded={accountOpen}
                                    aria-label={t('common.account', 'Conta')}
                                    className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                                >
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
                                </button>
                                {accountOpen && (
                                    <div role="menu" onKeyDown={handleAccountMenuKeyDown} className="absolute right-0 mt-2 w-56 rounded-card border border-control-border bg-white-pure shadow-card py-1 z-50">
                                        <div className="px-4 py-3 border-b border-grey-light">
                                            <p className="text-sm font-semibold text-brand-navy truncate">{currentUser.displayName || 'User'}</p>
                                            <p className="text-xs text-grey-medium truncate">{currentUser.email}</p>
                                        </div>
                                        <Link
                                            to="/onboarding"
                                            ref={firstAccountItemRef}
                                            role="menuitem"
                                            onClick={() => setAccountOpen(false)}
                                            className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm text-grey-dark hover:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy"
                                        >
                                            <Person fontSize="small" /> {t('dashboard.myProfile')}
                                        </Link>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => { setAccountOpen(false); handleLogout(); }}
                                            className="w-full flex min-h-11 items-center gap-2 px-4 py-2 text-sm text-grey-dark hover:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy"
                                        >
                                            <Logout fontSize="small" /> {t('common.logout', 'Sair')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="inline-flex min-h-11 items-center text-grey-dark hover:text-brand-navy font-medium">
                                    {t('auth.login')}
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-navigation"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-grey-medium hover:text-brand-navy hover:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                        >
                            <span className="sr-only">
                                {isMenuOpen
                                    ? t('common.closeMainMenu', 'Fechar menu principal')
                                    : t('common.openMainMenu', 'Abrir menu principal')}
                            </span>
                            {isMenuOpen ? <Close /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div id="mobile-navigation" className="lg:hidden bg-white-pure border-t border-grey-light">
                    <div className="pt-2 pb-3">
                        {[
                            ...navItems,
                            { to: '/onboarding', label: t('dashboard.myProfile') },
                        ].map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `flex items-center pl-3 pr-4 py-3 min-h-[48px] border-l-4 text-base font-medium ${isActive
                                    ? 'border-brand-navy text-brand-navy bg-grey-light'
                                    : 'border-transparent text-grey-medium hover:bg-grey-light hover:border-brand-navy hover:text-brand-navy'}`}
                            >
                                {label}
                            </NavLink>
                        ))}
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
                                <IconButton
                                    onClick={handleLogout}
                                    className="ml-auto"
                                    label={t('common.logout', 'Sair')}
                                >
                                    <Logout />
                                </IconButton>
                            </div>
                        ) : (
                            <div className="px-4">
                                <Link to="/login" className="flex min-h-11 w-full items-center justify-center rounded-full border border-transparent bg-brand-navy px-4 py-2 text-center text-sm font-semibold text-white-pure shadow-sm hover:bg-opacity-90">
                                    {t('auth.login')}
                                </Link>
                            </div>
                        )}

                        {/* Sync + language are desktop-only in the top bar; expose them here too. */}
                        <div className="mt-3 px-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-grey-dark hover:bg-grey-light hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                                aria-label={t('common.sync', 'Sincronizar')}
                            >
                                <Sync className={isSyncing ? 'animate-spin' : ''} fontSize="small" />
                                {t('common.sync', 'Sincronizar')}
                            </button>
                            <div className="flex items-center gap-3">
                                <IconButton
                                    onClick={toggleTheme}
                                    label={t('common.toggleTheme', 'Alternar tema')}
                                >
                                    {theme === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                                </IconButton>
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
