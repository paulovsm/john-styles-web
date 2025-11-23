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

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Missing text description' });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
        Analyze the following user description of their style preferences and extract the following structured data in JSON format.
        IMPORTANT: The output values MUST be in the SAME LANGUAGE as the User Description. If the user writes in Portuguese, the values must be in Portuguese.

        Fields to extract:
        - favoriteColors: Array of strings
        - preferredItems: Array of strings
        - dislikes: Array of strings (Extract explicit negative preferences, e.g., "I don't like", "hate", "avoid", "não gosto", "odeio", "evito")
        - occasions: Array of strings
        - bodyType: String (e.g., "Athletic", "Slim", "Plus Size", or "Unspecified")
        - favoriteBrands: Array of strings
        - styleGoals: String (Summary of their goals in the SAME LANGUAGE as input)

        User Description: "${text}"
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-09-2025",
            config: {
                responseMimeType: "application/json"
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const profileData = JSON.parse(responseText);

        return res.status(200).json(profileData);

    } catch (error) {
        console.error('Gemini Profile Analysis Error:', error);
        return res.status(500).json({ error: 'Failed to analyze profile', details: error.message });
    }
}
