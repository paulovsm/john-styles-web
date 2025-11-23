import { StyleAnalyzerAgent } from './agents/styleAnalyzer';
import { TrendMapperAgent } from './agents/trendMapper';
import { WardrobeAnalyzerAgent } from './agents/wardrobeAnalyzer';
import { RecommendationConsultantAgent } from './agents/recommendationConsultant';

export class AgentCoordinator {
    constructor(userId) {
        this.userId = userId;
        this.agents = {
            styleAnalyzer: new StyleAnalyzerAgent(),
            trendMapper: new TrendMapperAgent(),
            wardrobeAnalyzer: new WardrobeAnalyzerAgent(),
            recommendationConsultant: new RecommendationConsultantAgent()
        };
    }

    async processUserMessage(message, conversationState) {
        const results = {};

        // Task 1: Style Analysis
        // Always run style analysis to update/refine profile based on new input
        results.styleProfile = await this.agents.styleAnalyzer.analyzeProfile(
            message,
            this.userId,
            conversationState.chatHistory || []
        );

        // Determine if we should proceed to other tasks based on the message intent
        // For a simple MVP, we might want to trigger the full pipeline only on specific requests
        // or let the user guide it. However, the requirements say "Task Pipeline"
        // Let's implement a simplified pipeline where we check if we have enough info to recommend.

        // For now, let's return the style analysis result so the UI can show it
        // and maybe trigger other agents if the analysis suggests so.

        // If the user asks for recommendations explicitly:
        if (message.toLowerCase().includes('recomenda') || message.toLowerCase().includes('sugest') || message.toLowerCase().includes('look')) {
            // Task 3: Trend Mapping
            results.trends = await this.agents.trendMapper.mapTrends(results.styleProfile);

            // Task 4: Recommendations
            results.recommendations = await this.agents.recommendationConsultant.provideRecommendations(
                results.styleProfile,
                results.trends,
                conversationState.wardrobeItems
            );
        }

        return results;
    }
}
