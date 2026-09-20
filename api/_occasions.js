/**
 * Occasion vocabularies for the calendar classifier.
 *
 * These are the canonical (PT) tokens the onboarding stores on the profile, so
 * the classifier must answer inside the list the caller's experience can
 * actually offer: production onboarding only shows the base six, and the
 * expanded ones are selectable in the universal pilot alone. Mirrors
 * BASE_OCCASIONS / UNIVERSAL_OCCASIONS in src/pages/OnboardingPage.jsx —
 * api/ is bundled separately and never imports from src/.
 */
export const BASE_OCCASIONS = Object.freeze([
    'trabalho', 'casual executivo', 'dia a dia', 'festa', 'esporte', 'encontro',
]);

export const UNIVERSAL_OCCASIONS = Object.freeze([
    ...BASE_OCCASIONS, 'evento formal', 'casamento ou formatura', 'viagem', 'lazer',
]);

export const DEFAULT_OCCASION = 'dia a dia';

export function occasionsFor(experience) {
    return experience === 'universal' ? UNIVERSAL_OCCASIONS : BASE_OCCASIONS;
}

/**
 * Keeps an occasion inside the vocabulary the caller can render. Also covers
 * the day cache, which is keyed per user and not per experience: without this a
 * pilot visit would hand an expanded occasion back to production on the same day.
 */
export function normalizeOccasion(occasion, experience) {
    return occasionsFor(experience).includes(occasion) ? occasion : DEFAULT_OCCASION;
}
