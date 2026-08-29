/**
 * Curated SAMPLE catalog offered to new users (opt-in) so they can try the
 * product with a populated closet + try-on in seconds. Items are picked to
 * match the user's onboarding preferences (colors / occasions / preferred
 * items). Every seeded item is flagged `demo: true` so the UI can badge it as
 * a sample and offer to remove them.
 *
 * Images are CORS-enabled Unsplash URLs; each id↔garment pair was verified by
 * visually inspecting the photo (single-item / clear shots only). Replaceable
 * later with owned/brand imagery.
 */
import { TAXONOMY_VERSION } from '../utils/garmentTaxonomy';

const img = (id) => `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;

// NOTE: every sample below is menswear — each photo was visually checked against
// its garment. There is no womenswear sample set yet: adding one requires photos
// that a human has actually looked at, so it is intentionally left empty rather
// than filled with unverified image URLs. Until then, users whose styling
// register has no samples simply aren't offered the sample-closet shortcut.
export const SAMPLE_CATALOG = [
    // Tops
    { id: 'sample-white-tee', name: 'Camiseta Branca', type: 'tshirt', category: 'tops', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Branco'], styles: ['Casual'], occasions: ['dia a dia', 'casual'], image: img('photo-1521572163474-6864f9cf17ab') },
    { id: 'sample-black-tee', name: 'Camiseta Preta', type: 'tshirt', category: 'tops', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Preto'], styles: ['Casual'], occasions: ['dia a dia', 'casual'], image: img('photo-1618354691373-d851c5c3a990') },
    { id: 'sample-black-tee-print', name: 'Camiseta Preta Estampada', type: 'tshirt', category: 'tops', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Preto'], styles: ['Casual'], occasions: ['dia a dia', 'casual'], image: img('photo-1583743814966-8936f5b7be1a') },
    { id: 'sample-chambray-shirt', name: 'Camisa Chambray Azul', type: 'shirt', category: 'tops', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Azul'], styles: ['Smart casual'], occasions: ['casual', 'casual executivo'], image: img('photo-1596755094514-f87e34085b2c') },
    { id: 'sample-blue-dress-shirt', name: 'Camisa Social Azul Claro', type: 'shirt', category: 'tops', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Azul'], styles: ['Formal'], occasions: ['trabalho', 'casual executivo'], image: img('photo-1620012253295-c15cc3e65df4') },
    { id: 'sample-white-sweatshirt', name: 'Moletom Branco', type: 'sweatshirt', category: 'outerwear', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Branco'], styles: ['Casual'], occasions: ['dia a dia', 'casual'], image: img('photo-1620799140408-edc6dcb6d633') },
    // Bottoms
    { id: 'sample-blue-jeans', name: 'Calça Jeans Azul', type: 'jeans', category: 'bottoms', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Azul'], styles: ['Casual'], occasions: ['dia a dia', 'casual'], image: img('photo-1541099649105-f69ad21f3246') },
    { id: 'sample-dark-jeans', name: 'Calça Jeans Escura', type: 'jeans', category: 'bottoms', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Preto', 'Azul'], styles: ['Casual'], occasions: ['dia a dia', 'casual'], image: img('photo-1542272604-787c3835535d') },
    { id: 'sample-pink-joggers', name: 'Calça Jogger Rosa', type: 'joggers', category: 'bottoms', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Rosa'], styles: ['Casual'], occasions: ['casual'], image: img('photo-1594633312681-425c7b97ccd1') },
    // Shoes
    { id: 'sample-white-sneakers', name: 'Tênis Branco Esportivo', type: 'sneakers', category: 'shoes', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Branco'], styles: ['Esportivo'], occasions: ['dia a dia', 'esporte'], image: img('photo-1600185365483-26d7a4cc7519') },
    { id: 'sample-pastel-sneakers', name: 'Tênis Pastel', type: 'sneakers', category: 'shoes', taxonomyVersion: TAXONOMY_VERSION, audience: 'menswear', colors: ['Multicolor'], styles: ['Casual'], occasions: ['casual'], image: img('photo-1595950653106-6c9ebd614d3a') },
];

const norm = (arr) => (Array.isArray(arr) ? arr : []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);

/**
 * Picks sample items tailored to the user's profile, ensuring category variety.
 * Falls back to a balanced default when the profile has no useful signal.
 *
 * @param {Object} profile - onboarding profile (favoriteColors, occasions, preferredItems, dislikes)
 * @param {number} count
 * @returns {Array} sample items flagged demo:true
 */
export function samplesForPreference(preference) {
    if (preference !== 'menswear' && preference !== 'womenswear') return SAMPLE_CATALOG;
    return SAMPLE_CATALOG.filter((item) => item.audience === preference);
}

export function pickSampleItems(profile = {}, count = 6) {
    const favColors = norm(profile.favoriteColors);
    const occasions = norm(profile.occasions);
    const preferred = norm(profile.preferredItems);
    const dislikes = norm(profile.dislikes);

    // Only offer samples that match how the user wants to be dressed.
    const catalog = samplesForPreference(profile.stylePreference);
    if (catalog.length === 0) return [];

    const scored = catalog.map((item) => {
        const colors = norm(item.colors);
        const occs = norm(item.occasions);
        const hay = [item.name, item.category, ...item.styles, ...colors].join(' ').toLowerCase();

        let score = 0;
        if (favColors.some((c) => colors.includes(c))) score += 3;
        if (occasions.some((o) => occs.some((io) => io.includes(o) || o.includes(io)))) score += 2;
        if (preferred.some((p) => hay.includes(p) || p.includes(item.category))) score += 2;
        if (dislikes.some((d) => hay.includes(d) || (d.includes('viv') && colors.includes('multicolor')))) score -= 3;
        return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Guarantee at least one of each core category, then fill by score.
    const picked = [];
    const usedIds = new Set();
    for (const cat of ['tops', 'bottoms', 'shoes']) {
        const best = scored.find(({ item }) => item.category === cat && !usedIds.has(item.id));
        if (best && best.score > -3) { picked.push(best.item); usedIds.add(best.item.id); }
    }
    for (const { item, score } of scored) {
        if (picked.length >= count) break;
        if (!usedIds.has(item.id) && score > -3) { picked.push(item); usedIds.add(item.id); }
    }

    return picked.slice(0, count).map((item) => ({ ...item, demo: true }));
}
