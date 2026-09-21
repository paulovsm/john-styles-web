import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ posts: [] }));

vi.mock('./_blog.js', () => ({
    postCollection: () => ({
        where: () => ({
            get: async () => ({
                empty: state.posts.length === 0,
                docs: state.posts.map((post) => ({ id: post.id, data: () => post })),
            }),
        }),
    }),
    serializePost: (id, post) => ({ ...post, id }),
}));

import blogPageHandler from './blog-page.js';
import sitemapHandler from './sitemap.js';

function response() {
    return {
        statusCode: 200,
        body: undefined,
        headers: {},
        status(code) { this.statusCode = code; return this; },
        send(body) { this.body = body; return this; },
        setHeader(key, value) { this.headers[key] = value; },
    };
}

async function call(handler, { method = 'GET', query = {}, url = '/', headers = {} } = {}) {
    const res = response();
    await handler({ method, query, url, headers: { host: 'fleekauthority.com', ...headers } }, res);
    return res;
}

const post = {
    id: 'post-1',
    slug: 'estilo-com-contexto',
    title: 'Estilo com contexto',
    excerpt: 'Um método para escolher com clareza.',
    content: '## O contexto importa\n\nEscolhas melhores começam pela ocasião.',
    status: 'published',
    author: 'Fleek Authority',
    category: 'Estilo',
    tags: ['contexto', 'guarda-roupa'],
    coverImage: '/capa.webp',
    coverAlt: 'Pessoa escolhendo um look',
    publishedAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-12T12:00:00.000Z',
};

beforeEach(() => {
    state.posts = [{ ...post }];
});

describe('server-rendered blog pages', () => {
    it('renders an index with crawlable content, canonical metadata and Blog schema', async () => {
        const res = await call(blogPageHandler, { url: '/blog' });

        expect(res.statusCode).toBe(200);
        expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
        expect(res.body).toContain('<link rel="canonical" href="https://fleekauthority.com/blog">');
        expect(res.body).toContain('id="page-structured-data"');
        expect(res.body).toContain('"@type":"Blog"');
        expect(res.body).toContain('Estilo com contexto');
        expect(res.body).toContain('/blog/estilo-com-contexto');
    });

    it('renders article metadata and BlogPosting schema directly in HTML', async () => {
        const res = await call(blogPageHandler, {
            query: { slug: post.slug },
            url: `/blog/${post.slug}`,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toContain('<meta property="og:type" content="article">');
        expect(res.body).toContain(`article:published_time" content="${post.publishedAt}`);
        expect(res.body).toContain('"@type":"BlogPosting"');
        expect(res.body).toContain('"dateModified":"2026-09-12T12:00:00.000Z"');
        expect(res.body).toContain('<h2>O contexto importa</h2>');
    });

    it('returns a noindex page and empty body for HEAD when an article is absent', async () => {
        const missing = await call(blogPageHandler, { query: { slug: 'nao-existe' }, url: '/blog/nao-existe' });
        expect(missing.statusCode).toBe(404);
        expect(missing.body).toContain('<meta name="robots" content="noindex, follow">');

        const head = await call(blogPageHandler, { method: 'HEAD', url: '/blog' });
        expect(head.statusCode).toBe(200);
        expect(head.body).toBe('');
    });
});

describe('blog sitemap', () => {
    it('includes public routes, article dates and image metadata', async () => {
        const res = await call(sitemapHandler, { url: '/sitemap.xml' });

        expect(res.statusCode).toBe(200);
        expect(res.headers['Content-Type']).toBe('application/xml; charset=utf-8');
        expect(res.body).toContain('<loc>https://fleekauthority.com/blog</loc>');
        expect(res.body).toContain('<loc>https://fleekauthority.com/empresas</loc>');
        expect(res.body).toContain('<loc>https://fleekauthority.com/blog/estilo-com-contexto</loc>');
        expect(res.body).toContain(`<lastmod>${post.updatedAt}</lastmod>`);
        expect(res.body).toContain('<image:loc>https://fleekauthority.com/capa.webp</image:loc>');
        expect(res.body).toContain('<image:caption>Pessoa escolhendo um look</image:caption>');
    });
});
