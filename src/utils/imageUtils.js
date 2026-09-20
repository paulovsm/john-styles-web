/**
 * Ensures an image reference is a base64 data URL.
 * Wardrobe/gallery images are now stored as Storage URLs, but our image APIs
 * expect inline base64, so remote URLs are fetched and converted client-side.
 *
 * @param {string} src - a data: URL or an http(s) URL
 * @returns {Promise<string>} a data URL
 */
export const toDataUrl = async (src) => {
    if (!src) return src;
    if (src.startsWith('data:')) return src;

    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

export const MAX_WARDROBE_IMAGE_BYTES = 8 * 1024 * 1024;
export const SUPPORTED_WARDROBE_IMAGE_TYPES = Object.freeze([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

const SUPPORTED_WARDROBE_IMAGE_EXTENSIONS = Object.freeze(['jpg', 'jpeg', 'png', 'webp']);

/**
 * Validates the formats promised by the wardrobe upload UI before any costly
 * decoding, AI call or network request.
 *
 * @returns {'unsupported_type'|'too_large'|null}
 */
export function validateWardrobeImageFile(file) {
    if (!file) return 'unsupported_type';

    const mimeType = String(file.type || '').toLowerCase();
    const extension = String(file.name || '').split('.').pop()?.toLowerCase();
    const supported = SUPPORTED_WARDROBE_IMAGE_TYPES.includes(mimeType)
        || (!mimeType && SUPPORTED_WARDROBE_IMAGE_EXTENSIONS.includes(extension));

    if (!supported) return 'unsupported_type';
    if (file.size > MAX_WARDROBE_IMAGE_BYTES) return 'too_large';
    return null;
}

/** Small-card image source with transparent fallback for legacy wardrobe data. */
export const getWardrobeThumbnailUrl = (item) => item?.thumbnailUrl || item?.image || '';

/**
 * Fetches an image (data: or http(s) URL) and returns a RE-COMPRESSED data URL.
 * Used to shrink the try-on payload so several images fit under the serverless
 * request-body limit (~4.5MB on Vercel).
 *
 * @param {string} src
 * @param {number} maxDimension
 * @param {number} quality
 * @returns {Promise<string>} compressed data URL
 */
export const toCompressedDataUrl = async (src, maxDimension = 1024, quality = 0.7) => {
    const res = await fetch(src);
    const blob = await res.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
    const compressed = await compressImage(file, maxDimension, quality);
    return blobToDataUrl(compressed);
};

/**
 * Compresses an image file to ensure it meets size requirements.
 * Resizes the image if dimensions exceed maxDimension (default 1500px).
 * Compresses to JPEG with specified quality (default 0.7).
 * 
 * @param {File|Blob} file - The image file to compress.
 * @param {number} maxDimension - The maximum width or height in pixels.
 * @param {number} quality - The JPEG quality (0 to 1).
 * @returns {Promise<File>} - A promise that resolves to the compressed File object.
 */
// Scales (w,h) down so the largest side fits maxDimension, preserving ratio.
const fitDimensions = (width, height, maxDimension) => {
    if (width <= maxDimension && height <= maxDimension) return { width, height };
    return width > height
        ? { width: maxDimension, height: Math.round((height * maxDimension) / width) }
        : { width: Math.round((width * maxDimension) / height), height: maxDimension };
};

const canvasToBlob = (canvas, mimeType, quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));

const FALLBACK_MIME_TYPE = 'image/jpeg';

const EXTENSION_BY_MIME_TYPE = Object.freeze({
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
});

/** Puts the extension in sync with the format the browser actually encoded. */
const withExtensionFor = (name, mimeType) => {
    const extension = EXTENSION_BY_MIME_TYPE[mimeType];
    if (!extension) return name;
    return /\.[^.]+$/.test(name)
        ? name.replace(/\.[^.]+$/, `.${extension}`)
        : `${name}.${extension}`;
};

/**
 * Encodes the canvas, falling back to JPEG when the browser refuses the format
 * we asked for. Every WebKit browser — so every iPhone, plus Safari on desktop
 * — ignores a webp request in toBlob and silently hands back a PNG. Failing
 * there costs the user the whole upload, and storing that PNG under a .webp
 * name would be worse, so the returned File always carries the type and
 * extension of the bytes actually produced.
 */
const canvasToFile = async (canvas, name, mimeType, quality) => {
    let blob = await canvasToBlob(canvas, mimeType, quality);

    if (blob && blob.type !== mimeType && mimeType !== FALLBACK_MIME_TYPE) {
        blob = (await canvasToBlob(canvas, FALLBACK_MIME_TYPE, quality)) || blob;
    }

    if (!blob) throw new Error('Canvas is empty');

    const type = blob.type || mimeType;
    return new File([blob], withExtensionFor(name, type), { type, lastModified: Date.now() });
};

const resizeImage = async (file, maxDimension, quality, mimeType, outputName) => {
    // Decode with EXIF orientation applied. Phone photos carry an orientation
    // flag in EXIF; the canvas re-encode below strips that metadata, so unless
    // we bake the rotation into the pixels here the image ends up sideways
    // (classic "photo tombada" bug). createImageBitmap({imageOrientation}) does
    // exactly that. Falls back to the legacy <img> path on older browsers.
    if (typeof createImageBitmap === 'function') {
        try {
            const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
            const { width, height } = fitDimensions(bitmap.width, bitmap.height, maxDimension);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
            bitmap.close?.();
            return await canvasToFile(canvas, outputName, mimeType, quality);
        } catch {
            // fall through to the legacy path
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = async () => {
                const { width, height } = fitDimensions(img.width, img.height, maxDimension);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                try {
                    resolve(await canvasToFile(canvas, outputName, mimeType, quality));
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const compressImage = (file, maxDimension = 1500, quality = 0.7) =>
    resizeImage(file, maxDimension, quality, 'image/jpeg', file.name);

/**
 * Cuts `area` out of an image file and returns the crop as a new File.
 *
 * `area` is in pixels of the ORIENTED image — the same coordinate space the
 * cropper UI reports, because both the <img> the user dragged over and the
 * bitmap below have EXIF rotation already applied. Feeding raw-file coordinates
 * here would cut the wrong region out of any phone photo carrying that flag.
 *
 * Quality is deliberately high: the crop is an intermediate, and `compressImage`
 * still runs afterwards. Compressing twice at 0.7 would show.
 *
 * @param {File} file
 * @param {{x:number,y:number,width:number,height:number}} area
 * @returns {Promise<File>} the cropped region, JPEG
 */
export const cropImage = async (file, area, quality = 0.92) => {
    if (!area || area.width <= 0 || area.height <= 0) return file;

    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    try {
        // Clamp to the image: the cropper can report a region slightly outside
        // the bounds, and drawImage would then paint transparent padding.
        const x = Math.max(0, Math.min(Math.round(area.x), bitmap.width - 1));
        const y = Math.max(0, Math.min(Math.round(area.y), bitmap.height - 1));
        const width = Math.max(1, Math.min(Math.round(area.width), bitmap.width - x));
        const height = Math.max(1, Math.min(Math.round(area.height), bitmap.height - y));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(bitmap, x, y, width, height, 0, 0, width, height);

        const baseName = String(file.name || 'photo').replace(/\.[^.]+$/, '');
        return await canvasToFile(canvas, `${baseName}-crop.jpg`, 'image/jpeg', quality);
    } finally {
        bitmap.close?.();
    }
};

export const createWardrobeThumbnail = (file, maxDimension = 320, quality = 0.76) => {
    const baseName = String(file.name || 'wardrobe-item').replace(/\.[^.]+$/, '');
    return resizeImage(file, maxDimension, quality, 'image/webp', `${baseName}-thumb.webp`);
};
