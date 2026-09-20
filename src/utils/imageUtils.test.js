import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    MAX_WARDROBE_IMAGE_BYTES,
    compressImage,
    createWardrobeThumbnail,
    getWardrobeThumbnailUrl,
    validateWardrobeImageFile,
} from './imageUtils';

describe('wardrobe image utilities', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('accepts JPG, PNG and WebP files up to 8 MB', () => {
        for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
            expect(validateWardrobeImageFile({ name: 'piece', type, size: MAX_WARDROBE_IMAGE_BYTES })).toBeNull();
        }
        expect(validateWardrobeImageFile({ name: 'piece.jpg', type: '', size: 10 })).toBeNull();
    });

    it('rejects unsupported and oversized files before decoding', () => {
        expect(validateWardrobeImageFile({ name: 'photo.heic', type: 'image/heic', size: 10 })).toBe('unsupported_type');
        expect(validateWardrobeImageFile({ name: 'photo.jpg', type: 'image/jpeg', size: MAX_WARDROBE_IMAGE_BYTES + 1 })).toBe('too_large');
    });

    it('uses the thumbnail URL and falls back to the original for legacy items', () => {
        expect(getWardrobeThumbnailUrl({ thumbnailUrl: 'thumb.webp', image: 'original.jpg' })).toBe('thumb.webp');
        expect(getWardrobeThumbnailUrl({ image: 'original.jpg' })).toBe('original.jpg');
        expect(getWardrobeThumbnailUrl(null)).toBe('');
    });

    // Canvas stub that honours the requested format, like Chromium does.
    const stubCanvas = (encode) => {
        const drawImage = vi.fn();
        const canvas = {
            width: 0,
            height: 0,
            getContext: () => ({ drawImage }),
            toBlob: (callback, mimeType, quality) => callback(encode(mimeType, quality)),
        };
        const bitmap = { width: 1600, height: 800, close: vi.fn() };
        vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
        vi.spyOn(document, 'createElement').mockReturnValue(canvas);
        return { canvas, drawImage, bitmap };
    };

    it('creates a 320px WebP thumbnail while preserving aspect ratio', async () => {
        const drawImage = vi.fn();
        const canvas = {
            width: 0,
            height: 0,
            getContext: () => ({ drawImage }),
            toBlob: (callback) => callback(new Blob(['webp'], { type: 'image/webp' })),
        };
        const bitmap = { width: 1600, height: 800, close: vi.fn() };
        vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
        vi.spyOn(document, 'createElement').mockReturnValue(canvas);

        const thumbnail = await createWardrobeThumbnail(
            new File(['image'], 'terno.jpg', { type: 'image/jpeg' }),
        );

        expect(canvas.width).toBe(320);
        expect(canvas.height).toBe(160);
        expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 320, 160);
        expect(thumbnail.name).toBe('terno-thumb.webp');
        expect(thumbnail.type).toBe('image/webp');
    });

    // Asking WebKit for webp yields a PNG, verified against WebKit 26.6. The
    // upload used to fail outright on every iPhone, so the thumbnail falls back
    // to JPEG rather than trusting the requested format.
    it('falls back to a JPEG thumbnail where webp cannot be encoded', async () => {
        const requested = [];
        stubCanvas((mimeType) => {
            requested.push(mimeType);
            return mimeType === 'image/webp'
                ? new Blob(['png'], { type: 'image/png' })
                : new Blob(['jpeg'], { type: 'image/jpeg' });
        });

        const thumbnail = await createWardrobeThumbnail(
            new File(['image'], 'terno.jpg', { type: 'image/jpeg' }),
        );

        expect(requested).toEqual(['image/webp', 'image/jpeg']);
        expect(thumbnail.name).toBe('terno-thumb.jpg');
        expect(thumbnail.type).toBe('image/jpeg');
    });

    it('does not re-encode the full-size image, which is already JPEG', async () => {
        const requested = [];
        stubCanvas((mimeType) => {
            requested.push(mimeType);
            return new Blob(['jpeg'], { type: 'image/jpeg' });
        });

        const compressed = await compressImage(new File(['image'], 'terno.png', { type: 'image/png' }));

        expect(requested).toEqual(['image/jpeg']);
        expect(compressed.name).toBe('terno.jpg');
        expect(compressed.type).toBe('image/jpeg');
    });
});
