export const UNIVERSAL_EXPERIENCE_PREFIX = '/teste-novo-app';

export const EXPERIENCES = Object.freeze({
    production: Object.freeze({
        id: 'universal',
        basename: '/',
        isUniversal: true,
        isPreview: false,
        agentExperience: 'legacy',
        expandedOccasions: false,
    }),
    universal: Object.freeze({
        id: 'universal',
        basename: UNIVERSAL_EXPERIENCE_PREFIX,
        isUniversal: true,
        isPreview: true,
        agentExperience: 'universal',
        expandedOccasions: true,
    }),
});

export function isUniversalExperiencePath(pathname = '/') {
    return pathname === UNIVERSAL_EXPERIENCE_PREFIX
        || pathname.startsWith(`${UNIVERSAL_EXPERIENCE_PREFIX}/`);
}

export function getCurrentExperience(pathname = globalThis.location?.pathname || '/') {
    return isUniversalExperiencePath(pathname) ? EXPERIENCES.universal : EXPERIENCES.production;
}
