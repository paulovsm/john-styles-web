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
 * Popups are unreliable on mobile: iOS Safari and in-app webviews (Instagram,
 * Facebook, LinkedIn) block or silently close them, which dead-ends sign-in.
 * Redirect is the supported flow there.
 */
function prefersRedirect() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const isInAppWebview = /FBAN|FBAV|Instagram|Line|Twitter|LinkedInApp/i.test(ua);
    return isMobile || isInAppWebview;
}

function signIn(provider) {
    return prefersRedirect()
        ? signInWithRedirect(auth, provider)
        : signInWithPopup(auth, provider);
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
