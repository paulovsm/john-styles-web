import { GoogleGenAI } from "@google/genai";
import { applyCors } from "./_cors.js";
import { requireAuth, handleAuthError } from "./_auth.js";
import { parseImage, handleValidationError } from "./_validate.js";
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

        const { image, language = 'en' } = req.body;
        const { data: base64Image, mimeType } = parseImage(image, 'image');

        // Consume one unit of the daily quota (atomic, server-authoritative).
        await consumeUsage(uid, 'wardrobeAnalysis');

        const ai = new GoogleGenAI({ apiKey });

        const analysisPrompt = `Analyze this image of a clothing item. Return ONLY a valid JSON object (no markdown formatting, no backticks) with the following fields:
        - name: A short, descriptive name for the item in ${language} (e.g., "Blue Denim Jacket" or "Jaqueta Jeans Azul").
        - category: One of "tops", "bottoms", "shoes", "accessories", "outerwear" (ALWAYS in English, do not translate this value).
        - subcategory: ONLY when category is "tops", classify the top as one of "shirt" (a collared button-up / dress shirt / camisa), "polo" (polo shirt), or "tshirt" (t-shirt / casual top / blusa). For any other category, use null. (ALWAYS in English, do not translate this value).
        - color: The primary color of the item in ${language}.
        - style: The style of the item in ${language} (e.g., "Casual", "Formal", "Sporty").
        - brand: The brand name if visible, otherwise null.
        - description: A brief description of the item in ${language}.
        `;

        const contents = [
            { text: analysisPrompt },
            { inlineData: { data: base64Image, mimeType } },
        ];

        const response = await ai.models.generateContent({
            model: MODELS.vision,
            config: { responseMimeType: "application/json" },
            contents,
        });

        let text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysisData = JSON.parse(text);
        return res.status(200).json(analysisData);
    } catch (error) {
        if (handleAuthError(res, error)) return;
        if (handleValidationError(res, error)) return;
        if (error instanceof UsageLimitError) {
            return res.status(429).json({ error: 'LIMIT_REACHED', limitType: error.limitType, limit: error.limit });
        }
        console.error('Gemini Vision API Error:', error);
        return res.status(500).json({ error: 'Failed to analyze image', details: error.message });
    }
}
