export const TAXONOMY_VERSION = 1;

export const WARDROBE_CATEGORIES = Object.freeze([
    'tops',
    'bottoms',
    'shoes',
    'outerwear',
    'sets',
    'accessories',
]);

const TYPE_DEFINITIONS = {
    tops: [
        ['tshirt', ['t-shirt', 't shirt', 'tee', 'camiseta', 'playera']],
        ['polo', ['polo shirt', 'camisa polo', 'polo']],
        ['shirt', ['dress shirt', 'button-up shirt', 'button down shirt', 'camisa social', 'camisa', 'oxford shirt', 'flannel shirt']],
        ['tank_top', ['tank top', 'sleeveless shirt', 'regata', 'camiseta sin mangas']],
        ['blouse', ['blouse', 'silk blouse', 'blusa', 'camisa feminina', 'blusa de seda']],
        ['bodysuit', ['bodysuit', 'body suit', 'body']],
        ['other_top', []],
    ],
    bottoms: [
        ['jeans', ['denim pants', 'calca jeans', 'jeans', 'vaqueros']],
        ['chinos', ['chino pants', 'calca chino', 'calca de sarja', 'chinos']],
        ['trousers', ['dress pants', 'tailored trousers', 'suit trousers', 'calca social', 'calca de alfaiataria', 'pantalon de vestir', 'trousers']],
        ['casual_pants', ['casual pants', 'calca casual', 'pantalon casual', 'pants', 'calca', 'pantalon']],
        ['cargo_pants', ['cargo pants', 'calca cargo', 'pantalon cargo', 'cargos']],
        ['joggers', ['sweatpants', 'track pants', 'calca jogger', 'calca de moletom', 'joggers']],
        ['shorts', ['bermuda', 'shorts', 'short']],
        ['skirt', ['pencil skirt', 'midi skirt', 'maxi skirt', 'saia lapis', 'saia midi', 'saia', 'falda', 'skirt']],
        ['leggings', ['yoga pants', 'calca legging', 'legging', 'leggings', 'mallas']],
        ['other_bottom', []],
    ],
    shoes: [
        ['sneakers', ['athletic shoes', 'running shoes', 'tenis', 'sneakers', 'trainer', 'zapatillas']],
        ['dress_shoes', ['dress shoes', 'social shoes', 'sapato social', 'zapato de vestir', 'oxford shoes', 'derby shoes', 'monk strap']],
        ['loafers', ['loafer', 'loafers', 'mocassim', 'mocasin', 'driver shoes']],
        ['boots', ['chelsea boots', 'combat boots', 'coturno', 'bota', 'botas', 'boots']],
        ['sandals', ['flip flops', 'flip-flops', 'slides', 'chinelo', 'sandalia', 'sandals']],
        ['heels', ['high heels', 'stiletto', 'salto alto', 'scarpin', 'tacones', 'heels', 'heel']],
        ['flats', ['ballet flats', 'sapatilha', 'bailarina', 'flats']],
        ['other_shoes', []],
    ],
    outerwear: [
        ['blazer', ['sport coat', 'suit jacket', 'paleto', 'blazer']],
        ['jacket', ['denim jacket', 'leather jacket', 'bomber jacket', 'windbreaker', 'jaqueta', 'chaqueta', 'jacket']],
        ['coat', ['trench coat', 'overcoat', 'parka', 'sobretudo', 'casaco', 'abrigo', 'coat']],
        ['sweater', ['turtleneck', 'cardigan', 'sueter', 'tricô', 'tricot', 'jersey', 'sweater']],
        ['hoodie', ['hooded sweatshirt', 'moletom com capuz', 'sudadera con capucha', 'hoodie']],
        ['sweatshirt', ['crewneck sweatshirt', 'moletom sem capuz', 'moletom', 'sudadera', 'sweatshirt']],
        ['vest', ['puffer vest', 'colete', 'chaleco', 'vest']],
        ['other_outerwear', []],
    ],
    sets: [
        ['suit', ['business suit', 'two piece suit', 'three piece suit', 'terno', 'traje'], ['bottoms', 'outerwear']],
        ['tuxedo', ['dinner suit', 'black tie suit', 'smoking', 'esmoquin'], ['bottoms', 'outerwear']],
        ['matching_set', ['co ord set', 'co-ord set', 'coordinated set', 'matching set', 'conjunto coordenado', 'conjunto combinado'], ['tops', 'bottoms']],
        ['dress', ['shirt dress', 'midi dress', 'maxi dress', 'cocktail dress', 'vestido longo', 'vestido', 'dress'], ['tops', 'bottoms']],
        ['jumpsuit', ['jumpsuit', 'romper', 'macaquinho', 'macacao', 'enterizo'], ['tops', 'bottoms']],
        ['other_set', ['clothing set', 'outfit set', 'conjunto', 'set de ropa'], ['tops', 'bottoms']],
    ],
    accessories: [
        ['belt', ['cinto', 'cinturon', 'belt']],
        ['tie', ['bow tie', 'gravata borboleta', 'corbata de moño', 'gravata', 'corbata', 'tie']],
        ['watch', ['relogio', 'reloj', 'watch']],
        ['bag', ['briefcase', 'backpack', 'messenger bag', 'mochila', 'pasta', 'bolsa', 'bolso', 'bag']],
        ['headwear', ['baseball cap', 'beanie', 'chapeu', 'bone', 'sombrero', 'gorra', 'gorro', 'hat', 'cap']],
        ['eyewear', ['sunglasses', 'eyeglasses', 'oculos', 'gafas', 'glasses']],
        ['scarf', ['cachecol', 'lenco', 'bufanda', 'panuelo', 'scarf']],
        ['jewelry', ['cufflinks', 'bracelet', 'necklace', 'ring', 'earrings', 'brinco', 'brincos', 'aretes', 'abotoadura', 'pulseira', 'colar', 'anel', 'joya', 'joia', 'jewelry']],
        ['other_accessory', []],
    ],
};

export const GARMENT_TYPES_BY_CATEGORY = Object.freeze(
    Object.fromEntries(
        WARDROBE_CATEGORIES.map((category) => [
            category,
            Object.freeze(TYPE_DEFINITIONS[category].map(([type]) => type)),
        ]),
    ),
);

export const GARMENT_TYPES = Object.freeze(
    Object.fromEntries(
        WARDROBE_CATEGORIES.flatMap((category) =>
            TYPE_DEFINITIONS[category].map(([type, aliases, occupiedCategories = [category]]) => [
                type,
                Object.freeze({
                    category,
                    aliases: Object.freeze(aliases),
                    occupiedCategories: Object.freeze(occupiedCategories),
                }),
            ]),
        ),
    ),
);

export const GARMENT_TYPE_KEYS = Object.freeze(Object.keys(GARMENT_TYPES));

const FALLBACK_TYPE_BY_CATEGORY = Object.freeze({
    tops: 'other_top',
    bottoms: 'other_bottom',
    shoes: 'other_shoes',
    outerwear: 'other_outerwear',
    sets: 'other_set',
    accessories: 'other_accessory',
});

const normalizeText = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const ALIAS_ENTRIES = Object.entries(GARMENT_TYPES)
    .flatMap(([type, definition]) => [type.replaceAll('_', ' '), ...definition.aliases]
        .map((alias) => ({ type, alias: normalizeText(alias) })))
    .filter(({ alias }) => alias)
    .sort((a, b) => b.alias.length - a.alias.length);

/**
 * Converts a canonical key or a garment description in PT/EN/ES to a V1 type.
 * Returns null instead of silently assuming a category.
 */
export function normalizeGarmentType(raw) {
    if (typeof raw !== 'string' || !raw.trim()) return null;

    const normalized = normalizeText(raw);
    const directKey = normalized.replaceAll(' ', '_');
    if (GARMENT_TYPES[directKey]) return directKey;

    const padded = ` ${normalized} `;
    const match = ALIAS_ENTRIES.find(({ alias }) =>
        normalized === alias || padded.includes(` ${alias} `));
    return match?.type || null;
}

export function deriveCategory(type) {
    const canonicalType = normalizeGarmentType(type);
    return canonicalType ? GARMENT_TYPES[canonicalType].category : null;
}

export function fallbackTypeForCategory(category) {
    return FALLBACK_TYPE_BY_CATEGORY[category] || null;
}

/**
 * Returns the outfit slots occupied by a type or wardrobe item. Composite
 * garments can occupy more than their broad storage category.
 */
export function getOccupiedCategories(value) {
    const type = typeof value === 'string'
        ? normalizeGarmentType(value)
        : resolveGarmentType(value);

    if (type) return GARMENT_TYPES[type].occupiedCategories;

    const category = value && typeof value === 'object' ? value.category : null;
    return WARDROBE_CATEGORIES.includes(category) ? Object.freeze([category]) : Object.freeze([]);
}

export function garmentsConflict(first, second) {
    const firstSlots = getOccupiedCategories(first);
    const secondSlots = getOccupiedCategories(second);
    return firstSlots.some((slot) => secondSlots.includes(slot));
}

/**
 * Reads V1 and legacy wardrobe items without requiring a Firestore migration.
 */
export function resolveGarmentType(item) {
    if (!item || typeof item !== 'object') return null;

    const explicitType = normalizeGarmentType(item.type);
    if (explicitType) return explicitType;

    const legacySubtype = normalizeGarmentType(item.subcategory);
    if (legacySubtype && deriveCategory(legacySubtype) === 'tops') return legacySubtype;

    const inferredFromName = normalizeGarmentType(item.name);
    if (inferredFromName) return inferredFromName;

    return fallbackTypeForCategory(item.category);
}

/**
 * Style registers a user can be dressed in. This is a STYLING preference, not a
 * gender identity: it decides which garment types are offered and how the
 * shopping search is phrased.
 */
export const STYLE_PREFERENCES = Object.freeze(['menswear', 'womenswear', 'both']);
// Deliberately NEUTRAL: when the preference is unknown we must not fall back to
// menswear — that is the old hardcoded bias relocated. A neutral shopping query
// and the full type list are never wrong, only slightly broader.
export const DEFAULT_STYLE_PREFERENCE = 'both';

// Only types that genuinely belong to one register are listed; everything else
// is worn across both and stays available to everyone.
const AUDIENCE_BY_TYPE = Object.freeze({
    blouse: 'womenswear',
    bodysuit: 'womenswear',
    skirt: 'womenswear',
    leggings: 'womenswear',
    heels: 'womenswear',
    flats: 'womenswear',
    dress: 'womenswear',
    jumpsuit: 'womenswear',
    tie: 'menswear',
    tuxedo: 'menswear',
});

/** 'menswear' | 'womenswear' | 'all' */
export function audienceForType(type) {
    const canonical = normalizeGarmentType(type);
    return (canonical && AUDIENCE_BY_TYPE[canonical]) || 'all';
}

/**
 * Types to offer for a style preference. 'both' (or anything unknown) returns
 * everything, so a preference is never a hard restriction.
 */
export function typesForPreference(preference) {
    if (preference !== 'menswear' && preference !== 'womenswear') return GARMENT_TYPE_KEYS;
    return GARMENT_TYPE_KEYS.filter((type) => {
        const audience = audienceForType(type);
        return audience === 'all' || audience === preference;
    });
}

/** The term appended to a shopping query; empty for 'both'. */
export function shoppingAudienceTerm(preference, labels) {
    if (preference === 'menswear') return labels?.menswear ?? '';
    if (preference === 'womenswear') return labels?.womenswear ?? '';
    return '';
}
