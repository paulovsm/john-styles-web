export const WARDROBE_CATEGORIES = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];

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
