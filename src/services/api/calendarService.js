import { authFetch } from './authFetch';

export const calendarService = {
    /** Gets the Google consent URL and redirects the browser to it. */
    async connect() {
        const res = await authFetch('/api/calendar-connect', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to start calendar connection');
        const { url } = await res.json();
        window.location.href = url;
    },

    /** Returns today's dressing context from the calendar (or { connected:false }). */
    async today(language = 'pt') {
        const now = new Date();
        const start = new Date(now); start.setHours(0, 0, 0, 0);
        const end = new Date(now); end.setHours(23, 59, 59, 999);
        const dayKey = start.toISOString().split('T')[0];

        const res = await authFetch('/api/calendar-today', {
            method: 'POST',
            body: JSON.stringify({
                timeMin: start.toISOString(),
                timeMax: end.toISOString(),
                dayKey,
                language,
            }),
        });
        if (!res.ok) throw new Error('Failed to read calendar');
        return res.json();
    },
};
