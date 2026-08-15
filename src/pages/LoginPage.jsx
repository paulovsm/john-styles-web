import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Google, Facebook, Apple } from '@mui/icons-material';

export default function LoginPage() {
    const { loginWithGoogle, loginWithFacebook, loginWithApple, currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, navigate]);

    async function handleLogin(providerMethod) {
        try {
            setError('');
            setLoading(true);
            await providerMethod();
            // On mobile this is a redirect: the browser navigates away and the
            // session is picked up by getRedirectResult/onAuthStateChanged.
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            // Raw Firebase messages are English and unhelpful; map the ones a
            // user can actually act on, and never treat a self-cancelled popup
            // as a failure.
            const code = err?.code || '';
            if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
                setError('');
            } else if (code === 'auth/popup-blocked') {
                setError(t('auth.errors.popupBlocked', 'Seu navegador bloqueou a janela de login. Permita pop-ups ou tente novamente.'));
            } else if (code === 'auth/network-request-failed') {
                setError(t('auth.errors.network', 'Falha de conexão. Verifique sua internet e tente novamente.'));
            } else if (code === 'auth/account-exists-with-different-credential') {
                setError(t('auth.errors.accountExists', 'Já existe uma conta com este e-mail usando outro método de login.'));
            } else {
                setError(t('auth.errors.generic', 'Não foi possível entrar. Tente novamente.'));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white-off px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white-pure p-6 sm:p-10 rounded-xl shadow-lg border border-grey-light">
                <div className="text-center">
                    <h1 className="mt-6 text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
                        {t('app.name')}
                    </h1>
                    <p className="mt-2 text-sm text-grey-medium">
                        {t('app.tagline')}
                    </p>
                </div>

                {error && (
                    <div className="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {loading && (
                    <p className="text-center text-sm text-grey-medium" role="status">
                        {t('auth.signingIn', 'Entrando...')}
                    </p>
                )}

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => handleLogin(loginWithGoogle)}
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center min-h-[48px] py-3 px-4 border border-grey-light text-sm font-semibold rounded-full text-grey-dark bg-white hover:bg-grey-light active:bg-grey-light disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-colors"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Google className="h-5 w-5 text-grey-medium group-hover:text-brand-navy" />
                        </span>
                        {t('auth.signInWith', { provider: 'Google' })}
                    </button>

                    <button
                        onClick={() => handleLogin(loginWithFacebook)}
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center min-h-[48px] py-3 px-4 border border-grey-light text-sm font-semibold rounded-full text-grey-dark bg-white hover:bg-grey-light active:bg-grey-light disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-colors"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Facebook className="h-5 w-5 text-blue-600" />
                        </span>
                        {t('auth.signInWith', { provider: 'Facebook' })}
                    </button>

                    <button
                        onClick={() => handleLogin(loginWithApple)}
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center min-h-[48px] py-3 px-4 border border-grey-light text-sm font-semibold rounded-full text-grey-dark bg-white hover:bg-grey-light active:bg-grey-light disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-colors"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            {/* Theme-aware: a hard-coded black mark is invisible on the dark surface. */}
                            <Apple className="h-5 w-5 text-brand-navy" />
                        </span>
                        {t('auth.signInWith', { provider: 'Apple' })}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <p className="text-xs text-grey-medium">
                        {t('auth.legalPrefix', 'Ao entrar, você concorda com nossa')}{' '}
                        <Link to="/privacy" className="underline hover:text-brand-navy">
                            {t('footer.privacy', 'Política de Privacidade')}
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
