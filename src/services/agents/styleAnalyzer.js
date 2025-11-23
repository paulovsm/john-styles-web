import { BaseAgent } from './baseAgent';
import { AGENT_PROMPTS } from '../../utils/agentPrompts';

export class StyleAnalyzerAgent extends BaseAgent {
    constructor() {
        super('StyleAnalyzer');
    }

    async analyzeProfile(userMessage, userId, chatHistory) {
        // 1. Get existing profile from localStorage (simulated for now, will be passed or fetched)
        // In a real scenario, we might fetch this from a database or context

        // 2. Prepare context
        const context = [
            { role: 'system', content: AGENT_PROMPTS.styleAnalyzer },
            ...chatHistory.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                content: msg.content
            })),
            { role: 'user', content: userMessage }
        ];

        // 3. Send to Gemini
        const response = await this.callGemini(context);

        // 4. Parse response to extract profile updates (if structured output is supported/requested)
        // For now, we assume the agent returns a natural language response + potential JSON block
        // We might need to refine the prompt to force JSON if we want structured updates.

        return {
            content: response.content,
            // In a more advanced version, we'd parse specific profile fields here
        };
    }
}
