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
 * @param {{cold?: boolean, preferStyles?: string[]}} [opts]
 *   - cold: include an outerwear piece if available
 *   - preferStyles: bias each category toward items whose styles match (e.g. a
 *     formal day prefers "Formal"/"Smart casual"); falls back to all when none match
 * @returns {Array} one item per available core category (+ outerwear when cold)
 */
export function pickOutfitOfTheDay(items = [], seed = todayKey(), opts = {}) {
    const categories = ['tops', 'bottoms', 'shoes'];
    if (opts.cold) categories.push('outerwear');

    const prefer = (opts.preferStyles || []).map((s) => s.toLowerCase());
    const matchesPreferred = (item) => {
        if (prefer.length === 0) return false;
        const styles = (item.styles || []).map((s) => String(s).toLowerCase());
        return styles.some((s) => prefer.some((p) => s.includes(p) || p.includes(s)));
    };

    const outfit = [];
    for (const category of categories) {
        const inCat = items.filter((i) => i.category === category);
        if (inCat.length === 0) continue;
        const preferred = inCat.filter(matchesPreferred);
        const pool = preferred.length > 0 ? preferred : inCat;
        const idx = hashString(`${seed}:${category}`) % pool.length;
        outfit.push(pool[idx]);
    }
    return outfit;
}
