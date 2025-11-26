import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to sign in: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white-off px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white-pure p-10 rounded-xl shadow-lg border border-grey-light">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-serif font-bold text-fleek-navy">
                        {t('app.name')}
                    </h2>
                    <p className="mt-2 text-sm text-grey-medium">
                        {t('app.tagline')}
                    </p>
                </div>

                {error && (
                    <div className="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => handleLogin(loginWithGoogle)}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-grey-light text-sm font-medium rounded-md text-grey-dark bg-white hover:bg-grey-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fleek-navy transition-colors"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Google className="h-5 w-5 text-grey-medium group-hover:text-fleek-navy" />
                        </span>
                        {t('auth.signInWith', { provider: 'Google' })}
                    </button>

                    <button
                        onClick={() => handleLogin(loginWithFacebook)}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-grey-light text-sm font-medium rounded-md text-grey-dark bg-white hover:bg-grey-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fleek-navy transition-colors"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Facebook className="h-5 w-5 text-blue-600" />
                        </span>
                        {t('auth.signInWith', { provider: 'Facebook' })}
                    </button>

                    <button
                        onClick={() => handleLogin(loginWithApple)}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-grey-light text-sm font-medium rounded-md text-grey-dark bg-white hover:bg-grey-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fleek-navy transition-colors"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Apple className="h-5 w-5 text-black" />
                        </span>
                        {t('auth.signInWith', { provider: 'Apple' })}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <p className="text-xs text-grey-medium">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
