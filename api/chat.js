import { fetch as undiciFetch, Agent } from "undici";
import { applyCors } from "./_cors.js";
import { requireAuth, handleAuthError } from "./_auth.js";
import { validateText, handleValidationError } from "./_validate.js";
import { consumeUsage, UsageLimitError } from "./_usage.js";

// The n8n agent (web search + multiple sub-agents) can take a while to respond.
// undici's default headers/body timeouts abort it too early, so use a dispatcher
// with generous limits; an AbortSignal below caps the overall wait.
const N8N_TIMEOUT_MS = 120000;
const n8nDispatcher = new Agent({ headersTimeout: N8N_TIMEOUT_MS, bodyTimeout: N8N_TIMEOUT_MS });

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

        const upstream = await undiciFetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: uid,
                message,
                userProfile,
                wardrobeItems: wardrobeWithoutImages,
                chatHistory,
            }),
            dispatcher: n8nDispatcher,
            signal: AbortSignal.timeout(N8N_TIMEOUT_MS),
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
        if (error?.name === 'TimeoutError' || error?.name === 'AbortError' || error?.code === 'UND_ERR_HEADERS_TIMEOUT') {
            return res.status(504).json({ error: 'CHAT_TIMEOUT', message: 'The assistant took too long to respond. Please try again.' });
        }
        console.error('Chat proxy error:', error);
        return res.status(500).json({ error: 'Failed to process chat message' });
    }
}
