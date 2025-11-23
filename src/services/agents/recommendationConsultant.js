import { BaseAgent } from './baseAgent';
import { AGENT_PROMPTS } from '../../utils/agentPrompts';

export class RecommendationConsultantAgent extends BaseAgent {
    constructor() {
        super('RecommendationConsultant');
    }

    async provideRecommendations(styleProfile, trends, wardrobeItems) {
        const context = {
            profile: styleProfile,
            trends: trends,
            existingPieces: wardrobeItems || []
        };

        const messages = [
            { role: 'system', content: AGENT_PROMPTS.recommendationConsultant },
            { role: 'user', content: `Forneça recomendações baseadas em: ${JSON.stringify(context)}` }
        ];

        const response = await this.callGemini(messages);

        // Here we could add logic to format the response for the web UI
        // For now, we return the raw content
        return response.content;
    }
}
