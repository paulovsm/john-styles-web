import { useEffect } from 'react';

function upsertMeta(name, content, property = false) {
    const attribute = property ? 'property' : 'name';
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!content) {
        element?.remove();
        return;
    }
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

function upsertStructuredData(serializedStructuredData) {
    let element = document.head.querySelector('#page-structured-data');
    if (!serializedStructuredData) {
        element?.remove();
        return;
    }
    if (!element) {
        element = document.createElement('script');
        element.id = 'page-structured-data';
        element.type = 'application/ld+json';
        document.head.appendChild(element);
    }
    element.textContent = serializedStructuredData;
}

export default function useDocumentMeta({
    title,
    description,
    image,
    imageAlt,
    canonical,
    type = 'website',
    language = 'pt-BR',
    robots = 'index, follow',
    publishedAt,
    modifiedAt,
    author,
    structuredData,
}) {
    const serializedStructuredData = structuredData
        ? JSON.stringify(structuredData).replaceAll('<', '\\u003c')
        : '';

    useEffect(() => {
        if (title) document.title = title;
        document.documentElement.lang = language;

        upsertMeta('description', description);
        upsertMeta('robots', robots);
        upsertMeta('author', author);
        upsertMeta('og:title', title, true);
        upsertMeta('og:description', description, true);
        upsertMeta('og:type', type, true);
        upsertMeta('og:locale', language.replace('-', '_'), true);
        upsertMeta('twitter:card', image ? 'summary_large_image' : 'summary');
        upsertMeta('twitter:title', title);
        upsertMeta('twitter:description', description);

        const absoluteImage = image ? new URL(image, window.location.origin).href : '';
        upsertMeta('og:image', absoluteImage, true);
        upsertMeta('og:image:alt', imageAlt, true);
        upsertMeta('twitter:image', absoluteImage);
        upsertMeta('twitter:image:alt', imageAlt);
        upsertMeta('article:published_time', publishedAt, true);
        upsertMeta('article:modified_time', modifiedAt, true);
        upsertMeta('article:author', author, true);

        let canonicalLink = document.head.querySelector('link[rel="canonical"]');
        if (canonical) {
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = new URL(canonical, window.location.origin).href;
            upsertMeta('og:url', canonicalLink.href, true);
        } else {
            canonicalLink?.remove();
            upsertMeta('og:url', '', true);
        }

        upsertStructuredData(serializedStructuredData);
    }, [
        author,
        canonical,
        description,
        image,
        imageAlt,
        language,
        modifiedAt,
        publishedAt,
        robots,
        serializedStructuredData,
        title,
        type,
    ]);
}
