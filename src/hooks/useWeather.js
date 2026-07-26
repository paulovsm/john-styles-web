import { useEffect, useState } from 'react';
import { weatherService, weatherCondition } from '../services/api/weatherService';

/**
 * Fetches current weather from the browser's geolocation (opt-in via the
 * permission prompt). Degrades gracefully: returns { status } that callers use
 * to decide whether to show anything. Never blocks the dashboard.
 */
export function useWeather() {
    // loading | ready | unavailable — initial value derived (no setState-in-effect)
    const [state, setState] = useState(() =>
        navigator.geolocation ? { status: 'loading' } : { status: 'unavailable' }
    );

    useEffect(() => {
        if (!navigator.geolocation) return;
        let active = true;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { tempC, code } = await weatherService.getCurrent(
                        pos.coords.latitude,
                        pos.coords.longitude
                    );
                    if (!active) return;
                    setState({ status: 'ready', tempC, condition: weatherCondition(code), cold: tempC <= 15 });
                } catch {
                    if (active) setState({ status: 'unavailable' });
                }
            },
            () => { if (active) setState({ status: 'unavailable' }); },
            { timeout: 8000, maximumAge: 30 * 60 * 1000 }
        );
        return () => { active = false; };
    }, []);

    return state;
}
