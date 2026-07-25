/**
 * Maps common color names (PT / EN / ES) to hex so wardrobe color swatches
 * render correctly. Item colors come from the AI as free-text names like
 * "Azul" / "Blue", which are not valid CSS colors on their own.
 */
const COLOR_MAP = {
    // neutrals
    preto: '#111827', black: '#111827', negro: '#111827',
    branco: '#FFFFFF', white: '#FFFFFF', blanco: '#FFFFFF',
    cinza: '#9CA3AF', cinzento: '#9CA3AF', gray: '#9CA3AF', grey: '#9CA3AF', gris: '#9CA3AF',
    bege: '#D9C6A5', beige: '#D9C6A5',
    marrom: '#7C4A2D', castanho: '#7C4A2D', brown: '#7C4A2D', marron: '#7C4A2D', cafe: '#7C4A2D',
    // primaries
    azul: '#2563EB', blue: '#2563EB', 'azul marinho': '#1E3A5F', navy: '#1E3A5F', marinho: '#1E3A5F',
    vermelho: '#DC2626', red: '#DC2626', rojo: '#DC2626',
    verde: '#16A34A', green: '#16A34A',
    amarelo: '#EAB308', yellow: '#EAB308', amarillo: '#EAB308',
    // extras
    rosa: '#EC4899', pink: '#EC4899', 'rosa claro': '#F9A8D4',
    roxo: '#7C3AED', lilas: '#A78BFA', purple: '#7C3AED', morado: '#7C3AED',
    laranja: '#EA580C', orange: '#EA580C', naranja: '#EA580C',
    dourado: '#C5A059', gold: '#C5A059', dorado: '#C5A059',
    prata: '#C0C5CE', silver: '#C0C5CE', plateado: '#C0C5CE',
    vinho: '#7B1E3B', bordo: '#7B1E3B', bordeaux: '#7B1E3B',
    'off white': '#F3F0E9', creme: '#F3F0E9', cream: '#F3F0E9',
};

/**
 * @param {string} name - a color name or CSS color string
 * @returns {string|null} a hex/CSS color, or null if unknown
 */
export function colorToHex(name) {
    if (!name || typeof name !== 'string') return null;
    const key = name.trim().toLowerCase();
    if (COLOR_MAP[key]) return COLOR_MAP[key];
    // Already a valid CSS color (hex / rgb)?
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key) || key.startsWith('rgb')) return name;
    // Try the first word (e.g. "azul escuro" -> "azul")
    const first = key.split(/\s+/)[0];
    return COLOR_MAP[first] || null;
}
