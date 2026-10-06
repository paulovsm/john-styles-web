/**
 * Instruction for isolating a garment from its background.
 *
 * Asking for a cut-out rather than a painted backdrop is deliberate. A model
 * told to paint white paints a *photographic* white — soft gradients and a
 * contact shadow — so garments come out on visibly different backgrounds and
 * the wardrobe grid stops looking like a set. Transparency has no such
 * freedom: the client composites the flat colour itself (flattenOnBackground),
 * which is also what keeps the JPEG pipeline from encoding alpha as black.
 *
 * The clauses forbidding redrawing are load-bearing, not boilerplate: this
 * photo feeds the virtual try-on, so a garment the model "improved" produces a
 * wrong look later.
 */
const BASE_INSTRUCTION = [
    'Cut the garment out of this photo and return it on a fully transparent background, as a PNG with an alpha channel.',
    'Every pixel that is not part of the garment must be fully transparent. Do not paint, shade or gradient the background.',
    'Keep the garment itself completely unchanged: same colour, same pattern, same print, same texture, same proportions, same shape, same folds.',
    'Do not redraw, restyle, straighten, or reposition the garment. Do not add, remove or invent any detail.',
    'Preserve every logo, label, button, zipper and graphic exactly as it appears.',
    'Do not add a drop shadow, reflection or contact shadow under the garment.',
    'Keep the garment centred, fully inside the frame, with a small even margin around it.',
    'Even out colour casts from the original lighting, but do not change the garment colour itself.',
    'Return a photorealistic product cut-out, not an illustration or a render.',
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
