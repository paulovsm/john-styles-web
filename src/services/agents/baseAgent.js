import { geminiService } from '../api/geminiService';

export class BaseAgent {
    constructor(name) {
        this.name = name;
    }

    async callGemini(messages, model = 'gemini-2.5-flash-preview-09-2025') {
        try {
            // Format messages for Gemini API if needed, or pass directly if service handles it
            // The current geminiService.sendMessage takes (text, history)
            // We might need to adapt this or use the API endpoint directly for more control

            // Using the API endpoint directly via fetch for agent-specific structured calls
            // as defined in ARCHITECTURE.md to avoid interference with main chat history logic
            // or we can extend geminiService.

            // For now, let's use the existing service but we might need to refactor it
            // to support system prompts and specific message structures better.
            // Actually, looking at ARCHITECTURE.md, it suggests calling /api/gemini-chat directly.

            const response = await fetch('/api/gemini-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages,
                    model: model
                })
            });

            if (!response.ok) {
                throw new Error(`Agent ${this.name} failed to get response`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error in agent ${this.name}:`, error);
            throw error;
        }
    }
}
