import { GoogleGenAI } from "@google/genai";
import { applyCors } from "./_cors.js";
import { requireAuth, handleAuthError } from "./_auth.js";
import { parseImage, handleValidationError } from "./_validate.js";
import { consumeUsage, UsageLimitError } from "./_usage.js";
import { MODELS } from "./_models.js";
import {
    GARMENT_TYPES,
    deriveCategory,
    normalizeGarmentType,
} from "../src/utils/garmentTaxonomy.js";

const ALLOWED_TYPES = Object.entries(GARMENT_TYPES)
    .map(([type, definition]) => `"${type}" (${definition.category})`)
    .join(', ');

export function normalizeAnalysisResult(data) {
    const rest = { ...(data || {}) };
    delete rest.category;
    delete rest.subcategory;
    const type = normalizeGarmentType(data?.type);

    return {
        ...rest,
        type,
        category: deriveCategory(type),
    };
}

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
        - type: Exactly one canonical type from this allowlist: ${ALLOWED_TYPES}. Return null when the image does not show one clear item or the type cannot be determined. ALWAYS use the English key; never translate it.
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

        const analysisData = normalizeAnalysisResult(JSON.parse(text));
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
