/**
 * Wardrobe insights: a lightweight, dependency-free gap analysis over the user's
 * wardrobe. Highlights missing/thin categories and turns them into shopping
 * suggestions (a monetization hook — the query can later point to an affiliate).
 */
const CORE = ['tops', 'bottoms', 'shoes'];
const EXTRA = ['outerwear', 'accessories'];

/**
 * @param {Array} items - wardrobe items ({ category, colors, ... })
 * @param {Object} profile - onboarding profile (favoriteColors, ...)
 */
export function computeWardrobeInsights(items = [], profile = {}) {
    const counts = { total: items.length };
    for (const c of [...CORE, ...EXTRA]) {
        counts[c] = items.filter((i) => i.category === c).length;
    }

    // Gaps: missing/thin core categories, then missing extras.
    const gaps = [];
    for (const c of CORE) {
        if (counts[c] === 0) gaps.push({ category: c, severity: 'missing' });
        else if (counts[c] < 2) gaps.push({ category: c, severity: 'thin' });
    }
    for (const c of EXTRA) {
        if (counts[c] === 0) gaps.push({ category: c, severity: 'missing' });
    }

    // Coverage = share of essential categories that have at least one item.
    const coveredCore = CORE.filter((c) => counts[c] > 0).length;
    const coverage = Math.round((coveredCore / CORE.length) * 100);

    // Shopping suggestions from the top gaps, tinted by a favorite color.
    const favColor = (profile.favoriteColors || [])[0] || '';
    const suggestions = gaps.slice(0, 3).map((g) => ({
        category: g.category,
        severity: g.severity,
        color: favColor,
    }));

    return { counts, gaps, coverage, suggestions };
}

/** Builds a shopping search URL (Google Shopping) for a suggestion. */
export function shoppingSearchUrl(query) {
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}
