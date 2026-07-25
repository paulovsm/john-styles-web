/**
 * Centralized Gemini model IDs so they aren't duplicated (and drifting)
 * across handlers. These IDs are validated as working; update in one place.
 */
export const MODELS = {
    text: 'gemini-3.6-flash',
    vision: 'gemini-3.6-flash',
    image: 'gemini-3.1-flash-image',
};
