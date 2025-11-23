import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image, prompt, language = 'en' } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Missing image data' });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Remove header if present (e.g., "data:image/jpeg;base64,")
        const base64Image = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const analysisPrompt = `Analyze this image of a clothing item. Return ONLY a valid JSON object (no markdown formatting, no backticks) with the following fields:
        - name: A short, descriptive name for the item in ${language} (e.g., "Blue Denim Jacket" or "Jaqueta Jeans Azul").
        - category: One of "tops", "bottoms", "shoes", "accessories", "outerwear" (ALWAYS in English, do not translate this value).
        - color: The primary color of the item in ${language}.
        - style: The style of the item in ${language} (e.g., "Casual", "Formal", "Sporty").
        - brand: The brand name if visible, otherwise null.
        - description: A brief description of the item in ${language}.
        `;

        const contents = [
            { text: analysisPrompt },
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg", // Assuming jpeg for simplicity
                }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-09-2025",
            contents: contents,
        });

        let text = response.candidates[0].content.parts[0].text;

        // Clean up potential markdown code blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the JSON string to ensure it's valid
        const analysisData = JSON.parse(text);

        return res.status(200).json(analysisData);
    } catch (error) {
        console.error('Gemini Vision API Error:', error);
        return res.status(500).json({ error: 'Failed to analyze image', details: error.message });
    }
}
