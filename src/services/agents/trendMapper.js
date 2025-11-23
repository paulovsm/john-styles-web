import { BaseAgent } from './baseAgent';
import { AGENT_PROMPTS } from '../../utils/agentPrompts';

export class TrendMapperAgent extends BaseAgent {
    constructor() {
        super('TrendMapper');
    }

    async mapTrends(styleProfile) {
        const prompt = `
            Com base no perfil de estilo: ${JSON.stringify(styleProfile)},
            identifique 3-5 tendências de moda atuais relevantes.
        `;

        const messages = [
            { role: 'system', content: AGENT_PROMPTS.trendMapper },
            { role: 'user', content: prompt }
        ];

        const response = await this.callGemini(messages);

        return response.content;
    }
}
