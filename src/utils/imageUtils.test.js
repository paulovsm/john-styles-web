import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    MAX_WARDROBE_IMAGE_BYTES,
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
});
