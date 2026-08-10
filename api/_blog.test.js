import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./_firebaseAdmin.js', () => ({ getAdminDb: vi.fn() }));

import {
    BlogError,
    effectiveHostname,
    isLocalCmsRequest,
    parseDate,
    parseLimit,
    requireAdmin,
    serializePost,
    validatePostInput,
    validateSlug,
} from './_blog.js';

const originalNodeEnv = process.env.NODE_ENV;

describe('blog validation', () => {
    it('accepts and normalizes a complete published post', () => {
        const post = validatePostInput({
            slug: 'guia-de-estilo',
            title: '  Guia de estilo  ',
            content: '# Conteudo',
            status: 'published',
            coverImage: '/images/guide.jpg',
            canonicalUrl: 'https://fleekauthority.com/blog/guia-de-estilo',
            featured: true,
        }, { now: new Date('2026-08-07T12:00:00.000Z') });

        expect(post.title).toBe('Guia de estilo');
        expect(post.publishedAt.toISOString()).toBe('2026-08-07T12:00:00.000Z');
        expect(post.featured).toBe(true);
        expect(post.canonicalUrl).toBe('https://fleekauthority.com/blog/guia-de-estilo');
    });

    it.each([
        () => validateSlug('Slug Invalido'),
        () => validatePostInput({ slug: 'ok-slug', title: 'Title', content: 'Text', status: 'scheduled' }),
        () => validatePostInput({ slug: 'ok-slug', title: 'Title', content: 'Text', status: 'draft', extra: true }),
        () => parseDate('07/08/2026'),
        () => parseDate('2026-02-31'),
        () => parseLimit('0'),
        () => parseLimit('51'),
        () => validatePostInput({
            slug: 'ok-slug', title: 'Title', content: 'Text', canonicalUrl: 'http://example.com/post',
        }),
    ])('rejects invalid blog input', (run) => {
        expect(run).toThrow(BlogError);
    });

    it('requires at least one field on partial updates', () => {
        expect(() => validatePostInput({}, { partial: true })).toThrow('At least one editable field');
    });

    it('serializes Firestore timestamps as ISO strings', () => {
        const timestamp = { toDate: () => new Date('2026-08-07T09:30:00.000Z') };
        expect(serializePost('p1', { title: 'Post', publishedAt: timestamp }).publishedAt)
            .toBe('2026-08-07T09:30:00.000Z');
    });
});

describe('local CMS authorization', () => {
    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it.each([
        ['localhost:3000', 'localhost'],
        ['127.0.0.1:5173', '127.0.0.1'],
        ['[::1]:3000', '[::1]'],
    ])('recognizes the local host %s', (host, expected) => {
        process.env.NODE_ENV = 'development';
        const req = { headers: { host } };
        expect(effectiveHostname(req)).toBe(expected);
        expect(isLocalCmsRequest(req)).toBe(true);
    });

    it('does not accept lookalike or malformed hosts', () => {
        process.env.NODE_ENV = 'development';
        for (const host of ['localhost.example.com', '127.0.0.2', 'localhost/path', '']) {
            expect(isLocalCmsRequest({ headers: { host } })).toBe(false);
        }
    });

    it('uses the forwarded host as the effective host', () => {
        process.env.NODE_ENV = 'development';
        const req = { headers: { host: 'internal.invalid', 'x-forwarded-host': 'localhost:5173' } };
        expect(effectiveHostname(req)).toBe('localhost');
        expect(isLocalCmsRequest(req)).toBe(true);
    });

    it('returns the fixed local identity without calling Firebase auth', async () => {
        process.env.NODE_ENV = 'test';
        const auth = vi.fn();
        await expect(requireAdmin({ headers: { host: 'localhost:3000' } }, auth)).resolves.toMatchObject({
            uid: 'local-cms', token: { admin: true },
        });
        expect(auth).not.toHaveBeenCalled();
    });

    it('never bypasses Firebase auth in production', async () => {
        process.env.NODE_ENV = 'production';
        const auth = vi.fn().mockResolvedValue({ uid: 'real-user', token: { admin: false } });
        await expect(requireAdmin({ headers: { host: 'localhost:3000' } }, auth)).rejects.toMatchObject({
            status: 403, code: 'FORBIDDEN',
        });
        expect(auth).toHaveBeenCalledOnce();
    });
});
