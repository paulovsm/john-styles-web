import i18n from '../../i18n/config';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/john-styles-chat';

export const n8nService = {
    async sendMessage(message, context) {
        try {
            // Remove image field from wardrobe items to reduce token usage
            const wardrobeWithoutImages = context.wardrobeItems?.map(item => {
                const { image, ...itemWithoutImage } = item;
                return itemWithoutImage;
            }) || [];

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: context.userId,
                    message: message,
                    userProfile: context.userProfile,
                    wardrobeItems: wardrobeWithoutImages,
                    chatHistory: context.chatHistory
                })
            });

            if (!response.ok) {
                throw new Error('Failed to connect to John Styles agent');
            }

            const data = await response.json();
            // Assuming n8n returns { output: "Agent response text" } or similar
            // Adjust based on actual n8n workflow output node
            return data.output || data.text || data.content || i18n.t('chat.noResponse');
        } catch (error) {
            console.error('n8n Service Error:', error);
            throw error;
        }
    }
};
