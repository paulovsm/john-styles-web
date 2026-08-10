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

export default function useDocumentMeta({ title, description, image, canonical, type = 'website' }) {
    useEffect(() => {
        if (title) document.title = title;

        upsertMeta('description', description);
        upsertMeta('og:title', title, true);
        upsertMeta('og:description', description, true);
        upsertMeta('og:type', type, true);
        upsertMeta('twitter:card', image ? 'summary_large_image' : 'summary');
        upsertMeta('twitter:title', title);
        upsertMeta('twitter:description', description);

        const absoluteImage = image ? new URL(image, window.location.origin).href : '';
        upsertMeta('og:image', absoluteImage, true);
        upsertMeta('twitter:image', absoluteImage);

        let canonicalLink = document.head.querySelector('link[rel="canonical"]');
        if (canonical) {
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = new URL(canonical, window.location.origin).href;
        } else {
            canonicalLink?.remove();
        }
    }, [title, description, image, canonical, type]);
}
