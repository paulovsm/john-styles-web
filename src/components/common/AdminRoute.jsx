import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from './Loading';

export default function AdminRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();
    const [claimState, setClaimState] = useState({ uid: null, isAdmin: false });

    useEffect(() => {
        if (import.meta.env.DEV) return undefined;

        let active = true;

        async function checkAdminClaim() {
            if (!currentUser) {
                return;
            }

            try {
                // Force-refresh so a newly granted/revoked custom claim takes effect.
                const token = await currentUser.getIdTokenResult(true);
                if (active) {
                    setClaimState({ uid: currentUser.uid, isAdmin: token.claims.admin === true });
                }
            } catch {
                if (active) setClaimState({ uid: currentUser.uid, isAdmin: false });
            }
        }

        checkAdminClaim();

        return () => {
            active = false;
        };
    }, [currentUser]);

    if (import.meta.env.DEV) {
        return children;
    }

    if (loading || (currentUser && claimState.uid !== currentUser.uid)) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white-off">
                <Loading type="spinner" size={40} />
                <p className="text-sm text-grey-medium">Verificando acesso administrativo...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!claimState.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
