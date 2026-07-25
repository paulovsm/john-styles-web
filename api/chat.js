import { applyCors } from "./_cors.js";
import { requireAuth, handleAuthError } from "./_auth.js";
import { validateText, handleValidationError } from "./_validate.js";
import { consumeUsage, UsageLimitError } from "./_usage.js";

/**
 * Authenticated proxy to the John Styles n8n agent.
 *
 * The webhook URL lives ONLY on the server (N8N_WEBHOOK_URL, no VITE_ prefix),
 * so it never ships in the client bundle and can't be called directly by third
 * parties. We also verify the caller's Firebase token and enforce the daily
 * chat quota before forwarding.
 */
export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
        return res.status(500).json({ error: 'Chat backend not configured' });
    }

    try {
        const { uid } = await requireAuth(req);

        const { message, userProfile, wardrobeItems, chatHistory } = req.body || {};
        validateText(message, 'message');

        await consumeUsage(uid, 'chat');

        // Strip inline images from wardrobe items to keep the payload small.
        const wardrobeWithoutImages = Array.isArray(wardrobeItems)
            ? wardrobeItems.map(({ image, ...rest }) => rest)
            : [];

        const upstream = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: uid,
                message,
                userProfile,
                wardrobeItems: wardrobeWithoutImages,
                chatHistory,
            }),
        });

        if (!upstream.ok) {
            return res.status(502).json({ error: 'Chat agent unavailable' });
        }

        const data = await upstream.json();
        const content = data.output || data.text || data.content || '';
        return res.status(200).json({ role: 'assistant', content });
    } catch (error) {
        if (handleAuthError(res, error)) return;
        if (handleValidationError(res, error)) return;
        if (error instanceof UsageLimitError) {
            return res.status(429).json({ error: 'LIMIT_REACHED', limitType: error.limitType, limit: error.limit });
        }
        console.error('Chat proxy error:', error);
        return res.status(500).json({ error: 'Failed to process chat message' });
    }
}
