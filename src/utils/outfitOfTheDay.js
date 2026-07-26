/**
 * Deterministic "outfit of the day": picks one item per core category from the
 * wardrobe, stable for a given day (so it doesn't shuffle on every render) but
 * changing daily. No AI cost — a lightweight daily hook to bring users back.
 */

function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0; // 32-bit
    }
    return Math.abs(h);
}

export function todayKey(date = new Date()) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * @param {Array} items - wardrobe items
 * @param {string} seed - a per-day seed (default: today)
 * @param {{cold?: boolean}} [opts] - when cold, include an outerwear piece if available
 * @returns {Array} one item per available core category (+ outerwear when cold)
 */
export function pickOutfitOfTheDay(items = [], seed = todayKey(), opts = {}) {
    const categories = ['tops', 'bottoms', 'shoes'];
    if (opts.cold) categories.push('outerwear');

    const outfit = [];
    for (const category of categories) {
        const inCat = items.filter((i) => i.category === category);
        if (inCat.length === 0) continue;
        const idx = hashString(`${seed}:${category}`) % inCat.length;
        outfit.push(inCat[idx]);
    }
    return outfit;
}
