import { GoogleGenAI } from "@google/genai";
import { applyCors } from "./_cors.js";
import { requireAuth, handleAuthError } from "./_auth.js";
import { parseImage, validateText, handleValidationError } from "./_validate.js";
import { consumeUsage, UsageLimitError } from "./_usage.js";
import { MODELS } from "./_models.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const { uid } = await requireAuth(req);

        const { prompt, userImage, itemImages, itemImage } = req.body;
        validateText(prompt, 'prompt');

        // Build + validate image parts.
        const contents = [{ text: prompt }];
        if (userImage) {
            const { data, mimeType } = parseImage(userImage, 'user image');
            contents.push({ inlineData: { data, mimeType } });
        }
        const items = Array.isArray(itemImages) ? itemImages : (itemImage ? [itemImage] : []);
        for (const img of items) {
            if (!img) continue;
            const { data, mimeType } = parseImage(img, 'item image');
            contents.push({ inlineData: { data, mimeType } });
        }

        // Consume one unit of the daily quota (atomic, server-authoritative).
        await consumeUsage(uid, 'lookGeneration');

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: MODELS.image,
            contents,
        });

        let imageBase64 = null;
        for (const candidate of response.candidates || []) {
            for (const part of candidate.content?.parts || []) {
                if (part.inlineData) { imageBase64 = part.inlineData.data; break; }
            }
            if (imageBase64) break;
        }

        if (!imageBase64) {
            console.error("No image data found in response");
            return res.status(500).json({ error: 'No image generated' });
        }

        return res.status(200).json({ image: `data:image/png;base64,${imageBase64}` });
    } catch (error) {
        if (handleAuthError(res, error)) return;
        if (handleValidationError(res, error)) return;
        if (error instanceof UsageLimitError) {
            return res.status(429).json({ error: 'LIMIT_REACHED', limitType: error.limitType, limit: error.limit });
        }

        // Gemini upstream quota (distinct from our per-user daily limit).
        if (error.status === 429) {
            let retryDelay = 60;
            if (error.errorDetails) {
                const retryInfo = error.errorDetails.find(
                    (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
                );
                const delayMatch = retryInfo?.retryDelay?.match(/(\d+)s?/);
                if (delayMatch) retryDelay = parseInt(delayMatch[1], 10);
            }
            return res.status(429).json({
                error: 'QUOTA_EXCEEDED',
                message: 'API quota exceeded. Please wait before trying again.',
                retryAfter: retryDelay,
                details: error.message,
            });
        }

        console.error('Image Generation Error:', error);
        return res.status(error.status || 500).json({
            error: 'GENERATION_FAILED',
            message: 'Failed to generate image',
            details: error.message,
        });
    }
}
