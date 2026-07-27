/**
 * Style archetypes used by the guided onboarding. Each has:
 * - items: preferred-item hints fed into recommendations/sample selection
 * - keywords: signal words used to INFER the archetype from a free-text /
 *   AI-generated profile (so the archetypes step can be pre-filled).
 */
export const ARCHETYPES = [
    { id: 'casual', items: ['camisetas', 'jeans', 'tênis'], keywords: ['casual', 'camiseta', 'jeans', 'tênis', 'confort', 'dia a dia', 'descontra'] },
    { id: 'classic', items: ['camisa social', 'alfaiataria'], keywords: ['clássic', 'classic', 'social', 'alfaiataria', 'atemporal', 'formal', 'trabalho'] },
    { id: 'streetwear', items: ['moletom', 'tênis', 'oversized'], keywords: ['street', 'moletom', 'oversized', 'urbano', 'boné', 'hoodie'] },
    { id: 'minimalist', items: ['peças básicas', 'tons neutros'], keywords: ['minimal', 'básic', 'neutro', 'clean', 'simples', 'discret'] },
    { id: 'sporty', items: ['esportivo', 'tênis'], keywords: ['esport', 'ativo', 'academia', 'corrida', 'sport'] },
    { id: 'elegant', items: ['blazer', 'camisa social'], keywords: ['elegan', 'blazer', 'sofistic', 'refinad', 'terno'] },
];

const norm = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((s) => String(s).toLowerCase());

/**
 * Infers up to `max` archetype ids from an AI/free-text profile by matching
 * keywords against preferred items, style goals and occasions.
 *
 * @param {Object} profile - { preferredItems, styleGoals, occasions }
 * @param {number} max
 * @returns {string[]} archetype ids (may be empty when there's no signal)
 */
export function inferArchetypes(profile = {}, max = 2) {
    const hay = [
        ...norm(profile.preferredItems),
        ...norm(profile.styleGoals),
        ...norm(profile.occasions),
    ].join(' ');
    if (!hay.trim()) return [];

    const scored = ARCHETYPES
        .map((a) => ({ id: a.id, score: a.keywords.reduce((n, kw) => (hay.includes(kw) ? n + 1 : n), 0) }))
        .filter((a) => a.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, max).map((a) => a.id);
}
