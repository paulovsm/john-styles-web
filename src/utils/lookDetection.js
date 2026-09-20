import en from '../i18n/locales/en.json';
import pt from '../i18n/locales/pt.json';
import es from '../i18n/locales/es.json';

/**
 * Decides whether a reply from John actually describes a look, so the chat only
 * offers to carry it into the try-on where that means something.
 *
 * Reply length is not the signal: "preciso de um alinhamento: moda masculina ou
 * feminina? Casual executivo ou outra ocasião?" is long, mentions style and
 * occasion, and has no look in it at all. Named garments are the signal, and the
 * wardrobe taxonomy already carries them, translated — so the vocabulary here
 * stays in step with the one users pick from when cataloguing a piece.
 *
 * All three languages are matched, not just the active one: the agent answers in
 * the language of the question, which is not necessarily the interface's.
 */

// A look is at least two pieces. One match alone is too easy to hit by accident
// ("essa camisa combina?" is a question about a piece, not an outfit).
export const MIN_GARMENTS_FOR_LOOK = 2;

/**
 * Lowercases, strips accents and reduces every run of non-alphanumerics to a
 * single space, so a label can be found as a whole word with plain `includes`.
 *
 * Deliberately no regex lookbehind: WebKit only gained it in Safari 16.4, and a
 * SyntaxError here would be thrown at module load and take the chat down on
 * older iPhones. `\b` is no good either — it is ASCII-only, so it misbehaves
 * exactly around the accented characters these labels are full of.
 */
const normalize = (text) => ` ${String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

// Labels offering alternatives ("Bermuda ou shorts") describe two nameable
// garments, so each side is indexed on its own.
const CONNECTORS = / (?:ou|or|o) /g;

// Too generic on their own to count as naming a garment; the full label still
// matches, and the two-garment threshold absorbs the rest.
const TOO_GENERIC = new Set(['set', 'conjunto']);

/**
 * The bare noun a person is likely to write — "calça bege", not "calça de
 * alfaiataria bege". Noun compounds are head-initial in Portuguese and Spanish
 * ("Calça de alfaiataria") and head-final in English ("Tailored trousers"), so
 * taking a fixed end would pick the adjective in one of them.
 */
const headNoun = (chunk, headFinal) => {
    const words = chunk.split(' ').filter(Boolean);
    return headFinal ? words[words.length - 1] : words[0];
};

const termsForLabel = (label, headFinal) => {
    const normalized = normalize(label).trim();
    if (!normalized) return [];
    const chunks = normalized.split(CONNECTORS).filter(Boolean);
    const terms = new Set([normalized, ...chunks]);
    for (const chunk of chunks) {
        const head = headNoun(chunk, headFinal);
        if (head && head.length > 2 && !TOO_GENERIC.has(head)) terms.add(head);
    }
    return [...terms];
};

const GARMENT_TERMS = Object.freeze(
    [{ locale: en, headFinal: true }, { locale: pt, headFinal: false }, { locale: es, headFinal: false }]
        .flatMap(({ locale, headFinal }) =>
            Object.entries(locale.wardrobe?.types || {})
                // Catch-all buckets are not garments anyone names in prose.
                .filter(([key]) => key !== 'unclassified' && !key.startsWith('other_'))
                .flatMap(([key, label]) => termsForLabel(label, headFinal).map((term) => ({ key, term })))),
);

/** The distinct garment types named in a text, by taxonomy key. */
export function garmentsNamedIn(text) {
    if (!text) return [];
    const haystack = normalize(text);
    const found = new Set();
    for (const { key, term } of GARMENT_TERMS) {
        if (haystack.includes(` ${term} `)) found.add(key);
    }
    return [...found];
}

export function describesLook(text) {
    return garmentsNamedIn(text).length >= MIN_GARMENTS_FOR_LOOK;
}
