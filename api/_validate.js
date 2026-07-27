/**
 * Lightweight server-side input validation for the API endpoints.
 */

// Max decoded size for a single uploaded/generated image (~8 MB).
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// Max characters for free-text prompts / descriptions.
const MAX_TEXT_LEN = 8000;

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
    }
}

/**
 * Parses a base64 image (optionally a data URL) and validates its size/type.
 * @returns {{data: string, mimeType: string}} bare base64 data + detected mime
 */
export function parseImage(input, label = 'image') {
    if (typeof input !== 'string' || !input) {
        throw new ValidationError(`Missing or invalid ${label}`);
    }

    let mimeType = 'image/jpeg';
    let data = input;

    const match = /^data:([^;]+);base64,(.+)$/s.exec(input);
    if (match) {
        mimeType = match[1];
        data = match[2];
    }

    if (!/^image\/(png|jpe?g|webp)$/i.test(mimeType)) {
        throw new ValidationError(`Unsupported ${label} type: ${mimeType}`);
    }

    // Approximate decoded byte length from base64 length.
    const approxBytes = Math.floor((data.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
        throw new ValidationError(`${label} exceeds maximum size`);
    }

    return { data, mimeType };
}

export function validateText(input, label = 'text') {
    if (typeof input !== 'string' || !input.trim()) {
        throw new ValidationError(`Missing ${label}`);
    }
    if (input.length > MAX_TEXT_LEN) {
        throw new ValidationError(`${label} is too long`);
    }
    return input;
}

/**
 * Sends a ValidationError as JSON. @returns {boolean} true if handled.
 */
export function handleValidationError(res, err) {
    if (err instanceof ValidationError) {
        res.status(400).json({ error: 'INVALID_INPUT', message: err.message });
        return true;
    }
    return false;
}
