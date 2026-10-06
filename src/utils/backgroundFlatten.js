/**
 * Normalises a light, uneven backdrop to a single flat colour.
 *
 * The cleanup model will not return real transparency — asked for it, it paints
 * the chequerboard that *represents* transparency in image editors. Asked for
 * white, it paints a photographic white: soft gradients and a contact shadow,
 * different on every garment, so a wardrobe grid stops reading as a set.
 *
 * So the flat backdrop is produced here instead. The fill grows inward from the
 * border, comparing each pixel to the neighbour it came from, which follows a
 * gradient without needing to know its shape up front.
 *
 * Normalising *to white* is what makes this safe. Bleeding into a white garment
 * paints white over white and is invisible; a dark garment gives the border a
 * contrast step the fill cannot cross. The damaging case — a mid-tone garment
 * that fades into the backdrop — is what `maxFilledRatio` catches.
 */

const DEFAULTS = Object.freeze({
    /** Below this luminance a pixel is never treated as backdrop. */
    lightnessFloor: 170,
    /** Per-step channel distance from the neighbour the fill arrived from. */
    tolerance: 26,
    /** Abort if the fill claims more than this share — it ate the garment. */
    maxFilledRatio: 0.92,
    fill: [255, 255, 255],
});

const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * @param {ImageData} imageData mutated in place when the fill is accepted
 * @param {object} [options]
 * @returns {{filled: number, total: number, ratio: number, applied: boolean}}
 */
export function flattenBackdrop(imageData, options = {}) {
    const { lightnessFloor, tolerance, maxFilledRatio, fill } = { ...DEFAULTS, ...options };
    const { width, height, data } = imageData;
    const total = width * height;

    const visited = new Uint8Array(total);
    const stack = new Int32Array(total);
    let top = 0;

    const consider = (index, fromR, fromG, fromB) => {
        if (visited[index]) return;
        const p = index * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];

        if (luminance(r, g, b) < lightnessFloor) return;
        if (Math.abs(r - fromR) > tolerance
            || Math.abs(g - fromG) > tolerance
            || Math.abs(b - fromB) > tolerance) return;

        visited[index] = 1;
        stack[top++] = index;
    };

    // Seed from the border: with the garment centred, these pixels are backdrop.
    for (let x = 0; x < width; x++) {
        for (const y of [0, height - 1]) {
            const index = y * width + x;
            const p = index * 4;
            consider(index, data[p], data[p + 1], data[p + 2]);
        }
    }
    for (let y = 0; y < height; y++) {
        for (const x of [0, width - 1]) {
            const index = y * width + x;
            const p = index * 4;
            consider(index, data[p], data[p + 1], data[p + 2]);
        }
    }

    const claimed = [];
    while (top > 0) {
        const index = stack[--top];
        claimed.push(index);

        const p = index * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const x = index % width;
        const y = (index - x) / width;

        if (x > 0) consider(index - 1, r, g, b);
        if (x < width - 1) consider(index + 1, r, g, b);
        if (y > 0) consider(index - width, r, g, b);
        if (y < height - 1) consider(index + width, r, g, b);
    }

    const ratio = total === 0 ? 0 : claimed.length / total;
    if (ratio > maxFilledRatio) {
        return { filled: claimed.length, total, ratio, applied: false };
    }

    for (const index of claimed) {
        const p = index * 4;
        data[p] = fill[0];
        data[p + 1] = fill[1];
        data[p + 2] = fill[2];
        data[p + 3] = 255;
    }

    return { filled: claimed.length, total, ratio, applied: true };
}
