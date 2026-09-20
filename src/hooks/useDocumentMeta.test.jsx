import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import useDocumentMeta from './useDocumentMeta';

function MetaHarness(props) {
    useDocumentMeta(props);
    return null;
}

afterEach(() => {
    cleanup();
    document.head.innerHTML = '';
    document.documentElement.lang = '';
});

describe('useDocumentMeta', () => {
    it('keeps canonical, social metadata and structured data synchronized', () => {
        const { rerender } = render(<MetaHarness
            title="Fleek Journal"
            description="Conteúdo Fleek"
            image="/cover.webp"
            imageAlt="Capa editorial"
            canonical="/blog"
            language="pt-BR"
            author="Fleek Authority"
            structuredData={{ '@context': 'https://schema.org', '@type': 'Blog' }}
        />);

        expect(document.title).toBe('Fleek Journal');
        expect(document.documentElement.lang).toBe('pt-BR');
        expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `${window.location.origin}/blog`);
        expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', `${window.location.origin}/blog`);
        expect(document.querySelector('meta[property="og:image:alt"]')).toHaveAttribute('content', 'Capa editorial');
        expect(JSON.parse(document.querySelector('#page-structured-data').textContent)).toMatchObject({ '@type': 'Blog' });

        rerender(<MetaHarness
            title="Novo artigo"
            description="Descrição"
            canonical="/blog/novo-artigo"
            type="article"
            robots="noindex, follow"
            publishedAt="2026-09-01T12:00:00.000Z"
            structuredData={{ '@context': 'https://schema.org', '@type': 'BlogPosting' }}
        />);

        expect(document.querySelectorAll('#page-structured-data')).toHaveLength(1);
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
        expect(document.querySelector('meta[property="article:published_time"]')).toHaveAttribute('content', '2026-09-01T12:00:00.000Z');
        expect(JSON.parse(document.querySelector('#page-structured-data').textContent)).toMatchObject({ '@type': 'BlogPosting' });
    });
});
