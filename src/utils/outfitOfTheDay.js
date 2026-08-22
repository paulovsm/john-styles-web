/**
 * Deterministic "outfit of the day": picks one item per core category from the
 * wardrobe, stable for a given day (so it doesn't shuffle on every render) but
 * changing daily. No AI cost — a lightweight daily hook to bring users back.
 */

import { garmentsConflict, getOccupiedCategories } from './garmentTaxonomy';

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
    const prefer = (opts.preferStyles || []).map((s) => s.toLowerCase());
    const matchesPreferred = (item) => {
        if (prefer.length === 0) return false;
        const styles = (item.styles || []).map((s) => String(s).toLowerCase());
        return styles.some((s) => prefer.some((p) => s.includes(p) || p.includes(s)));
    };

    const pickFrom = (candidates, slot) => {
        if (candidates.length === 0) return null;
        const preferred = candidates.filter(matchesPreferred);
        const pool = preferred.length > 0 ? preferred : candidates;
        return pool[hashString(`${seed}:${slot}`) % pool.length];
    };

    const outfit = [];
    const addForSlot = (slot, acceptedCategories = [slot]) => {
        if (outfit.some((item) => getOccupiedCategories(item).includes(slot))) return;

        const candidates = items.filter((item) =>
            acceptedCategories.includes(item.category)
            && !outfit.some((selected) => garmentsConflict(selected, item)));
        const selected = pickFrom(candidates, slot);
        if (selected) outfit.push(selected);
    };

    // A set competes with a separate bottom as the structural base of the look.
    // Its occupied slots determine which individual pieces can still be added.
    addForSlot('bottoms', ['bottoms', 'sets']);
    addForSlot('tops');
    addForSlot('shoes');
    if (opts.cold) addForSlot('outerwear');

    return outfit;
}
