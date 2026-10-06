/**
 * Instruction for isolating a garment from its background.
 *
 * Two things drive the wording. First, the stored photo feeds the virtual
 * try-on, so a garment the model "improved" produces a wrong look later —
 * every clause that forbids redrawing is load-bearing, not boilerplate.
 *
 * Second, the storage pipeline is JPEG end to end (compressImage forces
 * image/jpeg, Storage writes .jpg), and JPEG carries no alpha. So this asks for
 * a painted white background rather than transparency: a cut-out would be
 * flattened on write, and an undefined flatten background comes out black.
 */
const BASE_INSTRUCTION = [
    'Remove the background from this garment photo and replace it with a plain, uniform white background.',
    'Keep the garment itself completely unchanged: same colour, same pattern, same print, same texture, same proportions, same shape, same folds.',
    'Do not redraw, restyle, straighten, or reposition the garment. Do not add, remove or invent any detail.',
    'Preserve every logo, label, button, zipper and graphic exactly as it appears.',
    'Keep the garment centred, fully inside the frame, with a small even margin around it.',
    'Even out harsh shadows and colour casts from the original lighting, but do not change the garment colour itself.',
    'Return a photorealistic product photo, not an illustration or a render.',
].join(' ');

/**
 * @param {string} [garmentType] canonical garment type, when the catalogue knows it
 * @returns {string}
 */
export function buildPhotoCleanupPrompt(garmentType) {
    const type = typeof garmentType === 'string' ? garmentType.trim() : '';
    if (!type) return BASE_INSTRUCTION;

    // Naming the garment keeps the model from isolating the wrong object when
    // the photo caught a hanger, a second item, or part of the person holding it.
    return `${BASE_INSTRUCTION} The garment in this photo is a ${type}; isolate only that item.`;
}
