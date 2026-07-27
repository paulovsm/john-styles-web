import { GoogleGenAI } from '@google/genai';
import { applyCors } from './_cors.js';
import { requireAuth, handleAuthError } from './_auth.js';
import { oauthConfigured, refreshAccessToken } from './_googleOAuth.js';
import { getRefreshToken, getCachedContext, setCachedContext } from './_calendarStore.js';
import { MODELS } from './_models.js';

/**
 * Returns today's "dressing context" derived from the user's Google Calendar:
 * { connected, occasion, formality (1-5), headline, events[] }.
 * Classification is done by the LLM and cached once per day per user.
 */
export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { uid } = await requireAuth(req);

        if (!oauthConfigured()) return res.status(200).json({ connected: false, reason: 'not_configured' });

        const refreshToken = await getRefreshToken(uid);
        if (!refreshToken) return res.status(200).json({ connected: false });

        const { timeMin, timeMax, dayKey, language = 'pt' } = req.body || {};
        if (!timeMin || !timeMax || !dayKey) {
            return res.status(400).json({ error: 'Missing timeMin/timeMax/dayKey' });
        }

        // Serve cached classification if we already computed it for this day.
        const cached = await getCachedContext(uid, dayKey);
        if (cached) return res.status(200).json({ connected: true, ...cached, cached: true });

        // Fetch today's events with a fresh access token.
        const { access_token } = await refreshAccessToken(refreshToken);
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '20' });
        const calRes = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });
        if (!calRes.ok) return res.status(502).json({ connected: true, error: 'calendar_fetch_failed' });
        const calData = await calRes.json();

        const events = (calData.items || [])
            .filter((e) => e.status !== 'cancelled' && (e.summary || '').trim())
            .map((e) => ({
                summary: e.summary,
                start: e.start?.dateTime || e.start?.date,
                attendees: e.attendees?.length || 0,
            }));

        let context;
        if (events.length === 0) {
            context = { occasion: 'dia a dia', formality: 2, headline: null, events: [] };
        } else {
            context = await classify(events, language);
            context.events = events.map((e) => e.summary);
        }

        await setCachedContext(uid, dayKey, context);
        return res.status(200).json({ connected: true, ...context });
    } catch (error) {
        if (handleAuthError(res, error)) return;
        console.error('calendar-today error:', error);
        return res.status(500).json({ error: 'Failed to read calendar' });
    }
}

async function classify(events, language) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const fallback = { occasion: 'dia a dia', formality: 2, headline: null };
    if (!apiKey) return fallback;

    const list = events.map((e) => `- ${e.summary}${e.attendees ? ` (${e.attendees} pessoas)` : ''}`).join('\n');
    const system = `You classify a person's day for outfit planning based on their calendar events.
Consider the MOST important / most visible / dressiest meeting of the day (you dress for that one).
Return ONLY JSON: { "occasion": one of ["trabalho","casual executivo","dia a dia","festa","esporte","encontro"],
"formality": integer 1-5 (1 very casual, 5 formal), "headline": a short one-line reason in ${language} referencing the key event }.`;

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: MODELS.text,
            config: { responseMimeType: 'application/json', systemInstruction: { parts: [{ text: system }] } },
            contents: [{ role: 'user', parts: [{ text: `Events today:\n${list}` }] }],
        });
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(text);
        return {
            occasion: parsed.occasion || fallback.occasion,
            formality: Number(parsed.formality) || fallback.formality,
            headline: parsed.headline || null,
        };
    } catch (e) {
        console.error('classify error:', e);
        return fallback;
    }
}
