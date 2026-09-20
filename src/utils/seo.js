export const SITE_URL = 'https://fleekauthority.com';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteSiteUrl(path = '/') {
    return new URL(path, SITE_URL).href;
}

export function organizationSchema() {
    return {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Fleek Authority',
        url: `${SITE_URL}/`,
        description: 'Curadoria, ferramentas e orientação digital para transformar o estilo em escolhas mais claras para todas as ocasiões.',
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/FA_Icon_White.avif`,
        },
    };
}

export function websiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: 'Fleek Authority',
        description: 'O lugar para transformar seu estilo com curadoria e John Styles, o expert digital da Fleek Authority.',
        publisher: { '@id': ORGANIZATION_ID },
        inLanguage: 'pt-BR',
    };
}

export function breadcrumbSchema(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteSiteUrl(item.path),
        })),
    };
}
