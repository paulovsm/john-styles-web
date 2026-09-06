export const UNIVERSAL_EXPERIENCE_PREFIX = '/teste-novo-app';

export const EXPERIENCES = Object.freeze({
    legacy: Object.freeze({
        id: 'legacy',
        basename: '/',
        isUniversal: false,
    }),
    universal: Object.freeze({
        id: 'universal',
        basename: UNIVERSAL_EXPERIENCE_PREFIX,
        isUniversal: true,
    }),
});

export function isUniversalExperiencePath(pathname = '/') {
    return pathname === UNIVERSAL_EXPERIENCE_PREFIX
        || pathname.startsWith(`${UNIVERSAL_EXPERIENCE_PREFIX}/`);
}

export function getCurrentExperience(pathname = globalThis.location?.pathname || '/') {
    return isUniversalExperiencePath(pathname) ? EXPERIENCES.universal : EXPERIENCES.legacy;
}

