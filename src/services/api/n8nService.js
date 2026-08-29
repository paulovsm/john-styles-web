import i18n from '../../i18n/config';
import { authFetch } from './authFetch';

/**
 * Chat service. Talks to our authenticated /api/chat proxy, which forwards to
 * the n8n agent server-side. The webhook URL is no longer exposed to the client
 * and the endpoint requires a valid Firebase token.
 */
export const n8nService = {
    async sendMessage(message, context) {
        try {
            const response = await authFetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    // Tell the agent which language to answer in; inferring it from the
                    // message text is unreliable and the sub-agents default to Portuguese.
                    language: i18n.language,
                    userProfile: context.userProfile,
                    wardrobeItems: context.wardrobeItems,
                    chatHistory: context.chatHistory,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to connect to John Styles agent');
            }

            const data = await response.json();
            return data.content || i18n.t('chat.noResponse');
        } catch (error) {
            console.error('Chat Service Error:', error);
            throw error;
        }
    }
};
