import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { calendarService } from '../services/api/calendarService';

/**
 * Loads today's calendar-derived dressing context for the current user.
 * Returns { status, connected, occasion, formality, headline }.
 *   status: loading | ready | error
 */
export function useDailyContext() {
    const { currentUser } = useAuth();
    const { i18n } = useTranslation();
    const [state, setState] = useState({ status: 'loading', connected: false });

    useEffect(() => {
        if (!currentUser) return;
        let active = true;
        calendarService.today(i18n.language)
            .then((ctx) => { if (active) setState({ status: 'ready', ...ctx }); })
            .catch(() => { if (active) setState({ status: 'error', connected: false }); });
        return () => { active = false; };
    }, [currentUser, i18n.language]);

    return state;
}

/** Maps a formality score (1-5) to preferred item styles for the outfit picker. */
export function preferStylesForFormality(formality) {
    if (!formality) return [];
    if (formality >= 4) return ['formal', 'social', 'smart casual', 'elegante', 'alfaiataria', 'blazer'];
    if (formality === 3) return ['smart casual', 'social', 'casual'];
    return ['casual', 'esportivo', 'streetwear'];
}
