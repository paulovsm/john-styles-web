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

const canvasToJpegFile = (canvas, name, quality) =>
    new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) { reject(new Error('Canvas is empty')); return; }
                resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
            },
            'image/jpeg',
            quality
        );
    });

export const compressImage = async (file, maxDimension = 1500, quality = 0.7) => {
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
            return await canvasToJpegFile(canvas, file.name, quality);
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
                    resolve(await canvasToJpegFile(canvas, file.name, quality));
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
