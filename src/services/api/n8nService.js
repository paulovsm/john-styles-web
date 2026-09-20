import i18n from '../../i18n/config';
import { authFetch } from './authFetch';
import { getCurrentExperience } from '../../experience/experience';

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
                    experience: getCurrentExperience().agentExperience,
                    // Tell the agent which language to answer in; inferring it from the
                    // message text is unreliable and the sub-agents default to Portuguese.
                    language: i18n.language,
                    userProfile: context.userProfile,
                    wardrobeItems: context.wardrobeItems,
                    chatHistory: context.chatHistory,
                }),
            });

            if (!response.ok) {
                // Carry the server's code so the caller can tell "the agent took
                // too long" apart from "we could not reach it" — they read the
                // same to the user otherwise, and the timeout is the common one.
                const body = await response.json().catch(() => ({}));
                const error = new Error(body.message || body.error || 'Failed to connect to John Styles agent');
                error.code = body.error;
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            return data.content || i18n.t('chat.noResponse');
        } catch (error) {
            console.error('Chat Service Error:', error);
            throw error;
        }
    }
};
