import { describe, expect, it } from 'vitest';
import { flattenBackdrop } from './backgroundFlatten';

/** Builds ImageData-shaped input from a grid of [r,g,b] triples. */
const imageFrom = (rows) => {
    const height = rows.length;
    const width = rows[0].length;
    const data = new Uint8ClampedArray(width * height * 4);
    rows.forEach((row, y) => row.forEach(([r, g, b], x) => {
        const p = (y * width + x) * 4;
        data[p] = r; data[p + 1] = g; data[p + 2] = b; data[p + 3] = 255;
    }));
    return { width, height, data };
};

const pixel = (image, x, y) => {
    const p = (y * image.width + x) * 4;
    return [image.data[p], image.data[p + 1], image.data[p + 2]];
};

const W = [250, 250, 250];
const DARK = [30, 30, 40];

describe('flattenBackdrop', () => {
    it('flattens a graded backdrop to one flat colour', () => {
        // Each row a little darker than the last — the gradient the model paints.
        const image = imageFrom([
            [[252, 252, 252], [248, 248, 248], [244, 244, 244]],
            [[246, 246, 246], DARK, [238, 238, 238]],
            [[240, 240, 240], [234, 234, 234], [228, 228, 228]],
        ]);

        const result = flattenBackdrop(image);

        expect(result.applied).toBe(true);
        expect(pixel(image, 0, 0)).toEqual([255, 255, 255]);
        expect(pixel(image, 2, 2)).toEqual([255, 255, 255]);
    });

    it('stops at a dark garment instead of painting over it', () => {
        const image = imageFrom([
            [W, W, W, W],
            [W, DARK, DARK, W],
            [W, DARK, DARK, W],
            [W, W, W, W],
        ]);

        flattenBackdrop(image);

        expect(pixel(image, 1, 1)).toEqual(DARK);
        expect(pixel(image, 2, 2)).toEqual(DARK);
        expect(pixel(image, 0, 0)).toEqual([255, 255, 255]);
    });

    it('leaves a garment that never touches the border alone', () => {
        const image = imageFrom([
            [W, W, W],
            [W, [60, 90, 200], W],
            [W, W, W],
        ]);

        flattenBackdrop(image);

        expect(pixel(image, 1, 1)).toEqual([60, 90, 200]);
    });

    it('refuses to apply when the fill claims nearly everything', () => {
        // An all-white frame: the garment faded into the backdrop, so filling
        // would silently erase it.
        const image = imageFrom([[W, W], [W, W]]);

        const result = flattenBackdrop(image);

        expect(result.applied).toBe(false);
        expect(result.ratio).toBe(1);
        // Untouched, so the caller can keep the model's own output.
        expect(pixel(image, 0, 0)).toEqual(W);
    });

    it('does not reach a light patch walled off by dark pixels', () => {
        const image = imageFrom([
            [W, W, W, W],
            [W, DARK, DARK, W],
            [W, DARK, [252, 252, 252], W],
            [W, W, W, W],
        ]);

        flattenBackdrop(image);

        // Enclosed on two sides by dark, but still reachable around the corner —
        // what matters is that the dark wall itself survives.
        expect(pixel(image, 1, 1)).toEqual(DARK);
        expect(pixel(image, 1, 2)).toEqual(DARK);
    });
});
