const API_BASE_URL = '/api';

export const geminiService = {
    /**
     * Sends a message to the Gemini Chat API.
     * @param {string} message - The user's message.
     * @param {Array} history - The conversation history.
     * @returns {Promise<string>} - The AI's response.
     */
    async sendMessage(message, history = []) {
        try {
            const response = await fetch(`${API_BASE_URL}/gemini-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...history, { role: 'user', content: message }]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            throw error;
        }
    },

    /**
     * Analyzes an image using the Gemini Vision API.
     * @param {File} imageFile - The image file to analyze.
     * @param {string} language - The language code (e.g., 'en', 'pt', 'es').
     * @returns {Promise<Object>} - The analysis result (clothing items, colors, style).
     */
    async analyzeImage(imageFile, language = 'en') {
        try {
            // Convert file to base64
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            const response = await fetch(`${API_BASE_URL}/gemini-image-analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image, language }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze image');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing image with Gemini:', error);
            throw error;
        }
    },

    /**
     * Generates an image based on a prompt (Mock/Placeholder for now).
     * @param {string} prompt - The image generation prompt.
     * @returns {Promise<string>} - The URL of the generated image.
     */
    async generateImage(prompt, userImage = null, itemImage = null) {
        try {
            const body = { prompt };
            if (userImage) {
                body.userImage = userImage;
            }
            if (itemImage) {
                body.itemImage = itemImage;
            }

            const response = await fetch(`${API_BASE_URL}/gemini-image-generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Create a detailed error object
                const enrichedError = new Error(errorData.message || errorData.error || 'Failed to generate image');
                enrichedError.code = errorData.error;
                enrichedError.retryAfter = errorData.retryAfter;
                enrichedError.details = errorData.details;
                enrichedError.status = response.status;

                throw enrichedError;
            }

            const data = await response.json();
            return data.image;
        } catch (error) {
            console.error('Error generating image with Gemini:', error);
            throw error;
        }
    },

    /**
     * Analyzes a user's profile description to extract structured data.
     * @param {string} text - The user's description of their style.
     * @returns {Promise<Object>} - The structured profile data.
     */
    async analyzeProfile(text) {
        try {
            const response = await fetch(`${API_BASE_URL}/gemini-profile-analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing profile with Gemini:', error);
            throw error;
        }
    }
};
