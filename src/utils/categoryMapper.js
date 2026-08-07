export const WARDROBE_CATEGORIES = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];

// Sub-types for the 'tops' bucket only. Keeps the 5 core buckets intact
// (outfit/insights/try-on logic depend on them) while letting the summary
// break tops down into camisa / polo / camiseta.
export const TOP_SUBCATEGORIES = ['shirt', 'polo', 'tshirt'];

// Order matters: 'polo' first, then 'tshirt' (so "camiseta"/"t-shirt" resolve
// before the broader "shirt"/"camisa" match — note "camiseta".includes("camisa")).
const SUB_HEURISTICS = [
    { subcategory: 'polo', keywords: ['polo'] },
    { subcategory: 'tshirt', keywords: ['t-shirt', 'tshirt', 'tee', 'camiseta', 'blusa', 'blouse', 'tank'] },
    { subcategory: 'shirt', keywords: ['dress shirt', 'button', 'camisa', 'oxford', 'chambray', 'flannel', 'shirt'] },
];

const HEURISTICS = [
    { category: 'shoes', keywords: ['shoe', 'sneaker', 'boot', 'sandal', 'heel'] },
    { category: 'bottoms', keywords: ['pant', 'jeans', 'short', 'trousers', 'skirt', 'legging'] },
    { category: 'accessories', keywords: ['access', 'hat', 'cap', 'scarf', 'belt', 'bag', 'glasses'] },
    { category: 'outerwear', keywords: ['outer', 'coat', 'jacket', 'blazer', 'cardigan'] },
    { category: 'tops', keywords: ['top', 'shirt', 'blouse', 'sweater', 'hoodie', 'vest'] },
];

/**
 * Maps Gemini's free-form category string to one of the 5 internal buckets.
 * Falls back to keyword heuristics, then to 'tops'.
 * @param {string} raw
 * @returns {'tops'|'bottoms'|'shoes'|'accessories'|'outerwear'}
 */
export function mapCategory(raw) {
    if (!raw || typeof raw !== 'string') return 'tops';

    const lower = raw.toLowerCase().trim();
    if (WARDROBE_CATEGORIES.includes(lower)) return lower;

    for (const { category, keywords } of HEURISTICS) {
        if (keywords.some((kw) => lower.includes(kw))) return category;
    }
    return 'tops';
}

/**
 * Maps a free-form top descriptor to a top sub-type. Returns null when the
 * input gives no signal (caller decides the fallback). Only meaningful for
 * items whose category is 'tops'.
 * @param {string} raw
 * @returns {'shirt'|'polo'|'tshirt'|null}
 */
export function mapSubcategory(raw) {
    if (!raw || typeof raw !== 'string') return null;

    const lower = raw.toLowerCase().trim();
    if (TOP_SUBCATEGORIES.includes(lower)) return lower;

    for (const { subcategory, keywords } of SUB_HEURISTICS) {
        if (keywords.some((kw) => lower.includes(kw))) return subcategory;
    }
    return null;
}
