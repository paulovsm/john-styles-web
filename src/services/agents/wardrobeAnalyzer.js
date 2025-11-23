import { BaseAgent } from './baseAgent';
import { AGENT_PROMPTS } from '../../utils/agentPrompts';

export class WardrobeAnalyzerAgent extends BaseAgent {
    constructor() {
        super('WardrobeAnalyzer');
    }

    async analyzeWardrobeImage(imageBase64) {
        // This requires the vision model capabilities
        // The current baseAgent.callGemini might need adjustment to handle images
        // or we use the specific endpoint for image analysis if it exists

        try {
            const response = await fetch('/api/gemini-image-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageBase64,
                    prompt: AGENT_PROMPTS.wardrobeAnalyzer
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze wardrobe image');
            }

            return await response.json();
        } catch (error) {
            console.error('Wardrobe analysis error:', error);
            throw error;
        }
    }
}
