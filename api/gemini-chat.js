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

    const { messages, history } = req.body;

    if (!messages && !history) {
        return res.status(400).json({ error: 'Missing messages or history' });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Check if this is a stateful chat request (with history) or a stateless agent request
        if (history) {
            // --- Legacy / Interactive Chat Mode ---
            let chatHistory = history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const chat = ai.chats.create({
                model: "gemini-2.5-flash-preview-09-2025",
                history: chatHistory
            });

            const lastMessage = messages ? messages[messages.length - 1].content : req.body.prompt;

            if (!lastMessage) {
                return res.status(400).json({ error: 'No message to send' });
            }

            const response = await chat.sendMessage({
                message: lastMessage
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
            return res.status(200).json({ role: 'assistant', content: text });

        } else {
            // --- Stateless / Agent Mode ---
            // Agents send a full list of messages including system prompt

            let systemInstruction = undefined;
            let contents = [];

            if (messages) {
                // Extract system prompt if it's the first message
                if (messages.length > 0 && messages[0].role === 'system') {
                    systemInstruction = messages[0].content;
                    // Add the rest of the messages
                    contents = messages.slice(1).map(msg => ({
                        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    }));
                } else {
                    contents = messages.map(msg => ({
                        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    }));
                }
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-09-2025",
                config: {
                    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
                },
                contents: contents
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
            return res.status(200).json({ role: 'assistant', content: text });
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
}
