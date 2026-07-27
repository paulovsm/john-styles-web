const API_BASE_URL = '/api';
import { compressImage } from '../../utils/imageUtils';
import { authFetch } from './authFetch';

export const geminiService = {
    /**
     * Analyzes an image using the Gemini Vision API.
     * @param {File} imageFile - The image file to analyze.
     * @param {string} language - The language code (e.g., 'en', 'pt', 'es').
     * @returns {Promise<Object>} - The analysis result (clothing items, colors, style).
     */
    async analyzeImage(imageFile, language = 'en') {
        try {
            // Compress image before sending
            const compressedFile = await compressImage(imageFile);

            // Convert file to base64
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            const response = await authFetch(`${API_BASE_URL}/gemini-image-analyze`, {
                method: 'POST',
                body: JSON.stringify({ image: base64Image, language }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const enrichedError = new Error(errorData.message || errorData.error || 'Failed to analyze image');
                enrichedError.code = errorData.error;
                enrichedError.status = response.status;
                throw enrichedError;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing image with Gemini:', error);
            throw error;
        }
    },

    /**
     * Generates a try-on image from a prompt + the user's photo and item images.
     * @param {string} prompt - The image generation prompt.
     * @param {string} userImage - The user's photo (base64 or URL).
     * @param {Array<string>} itemImages - Array of item images (base64 or URL).
     * @returns {Promise<string>} - The generated image as a data URL.
     */
    async generateImage(prompt, userImage = null, itemImages = []) {
        try {
            const body = { prompt };
            if (userImage) {
                body.userImage = userImage;
            }
            if (itemImages && itemImages.length > 0) {
                // Ensure it's an array
                body.itemImages = Array.isArray(itemImages) ? itemImages : [itemImages];
            }

            const response = await authFetch(`${API_BASE_URL}/gemini-image-generate`, {
                method: 'POST',
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
            const response = await authFetch(`${API_BASE_URL}/gemini-profile-analyze`, {
                method: 'POST',
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const enrichedError = new Error(errorData.error || 'Failed to analyze profile');
                enrichedError.details = errorData.details;
                enrichedError.status = response.status;
                throw enrichedError;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing profile with Gemini:', error);
            throw error;
        }
    }
};
