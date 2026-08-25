import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, appleProvider } from '../services/auth/firebaseConfig';

/**
 * iOS Safari partitions the storage of the firebaseapp.com auth domain, so the
 * state signInWithRedirect leaves behind is unreachable when the user comes
 * back: getRedirectResult finds nothing, the session never starts and the login
 * loops. The popup keeps the whole exchange in one window and reports back to
 * the opener, so it works there. Popups are the default everywhere for that
 * reason; redirect is only for in-app webviews (Instagram, Facebook, LinkedIn),
 * which block window.open outright.
 */
function isInAppWebview() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line|Twitter|LinkedInApp/i.test(ua);
}

// A popup the browser refuses is not an error the user can act on: fall back to
// redirect instead of dead-ending sign-in.
const POPUP_UNAVAILABLE = new Set([
    'auth/popup-blocked',
    'auth/operation-not-supported-in-this-environment',
    'auth/web-storage-unsupported'
]);

async function signIn(provider) {
    if (isInAppWebview()) {
        return signInWithRedirect(auth, provider);
    }

    try {
        return await signInWithPopup(auth, provider);
    } catch (error) {
        if (POPUP_UNAVAILABLE.has(error?.code)) {
            return signInWithRedirect(auth, provider);
        }
        throw error;
    }
}

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function loginWithGoogle() {
        return signIn(googleProvider);
    }

    function loginWithFacebook() {
        return signIn(facebookProvider);
    }

    function loginWithApple() {
        return signIn(appleProvider);
    }

    function logout() {
        return signOut(auth);
    }

    // Completes the redirect flow when the user comes back from the provider.
    useEffect(() => {
        getRedirectResult(auth).catch((error) => {
            console.error('Redirect sign-in failed', error);
        });
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loginWithGoogle,
        loginWithFacebook,
        loginWithApple,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
