import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ admin: true, docs: new Map(), sequence: 0 }));

function snapshot(id) {
    const data = state.docs.get(id);
    const ref = {
        id,
        get: async () => snapshot(id),
        create: async (value) => {
            if (state.docs.has(id)) throw new Error('already exists');
            state.docs.set(id, value);
        },
        update: async (value) => state.docs.set(id, { ...state.docs.get(id), ...value }),
        delete: async () => state.docs.delete(id),
    };
    return { id, exists: Boolean(data), data: () => data, ref };
}

function result(ids) {
    const docs = ids.map(snapshot);
    return { empty: docs.length === 0, docs };
}

function collection() {
    const ids = () => [...state.docs.keys()];
    return {
        doc: (id = `post-${++state.sequence}`) => snapshot(id).ref,
        get: async () => result(ids()),
        limit: (count) => ({ get: async () => result(ids().slice(0, count)) }),
        where: (field, operator, value) => {
            if (operator !== '==') throw new Error('unsupported test operator');
            const matches = ids().filter((id) => state.docs.get(id)?.[field] === value);
            return {
                get: async () => result(matches),
                limit: (count) => ({ get: async () => result(matches.slice(0, count)) }),
            };
        },
    };
}

vi.mock('./_firebaseAdmin.js', () => ({ getAdminDb: () => ({ collection }) }));
vi.mock('./_cors.js', () => ({ applyCors: () => false }));
vi.mock('./_auth.js', () => ({
    AuthError: class AuthError extends Error {
        constructor(status, message) { super(message); this.status = status; }
    },
    requireAuth: async () => ({ uid: 'admin-1', token: { admin: state.admin } }),
}));

import postsHandler from './blog-posts.js';
import postHandler from './blog-post.js';

function response() {
    return {
        statusCode: 200, body: undefined, headers: {},
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
        setHeader(key, value) { this.headers[key] = value; },
    };
}

async function call(handler, { method = 'GET', query = {}, body, headers = {} } = {}) {
    const res = response();
    await handler({ method, query, body, headers }, res);
    return res;
}

beforeEach(() => {
    state.admin = true;
    state.docs.clear();
    state.sequence = 0;
});

describe('blog posts API', () => {
    it('lists only stored published posts for public requests', async () => {
        state.docs.set('published', {
            slug: 'post-publicado', title: 'Publicado', content: 'Texto', status: 'published',
            publishedAt: new Date('2026-08-01T10:00:00Z'),
        });
        state.docs.set('draft', { slug: 'rascunho', title: 'Rascunho', content: 'Texto', status: 'draft' });

        const res = await call(postsHandler);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((post) => post.slug)).toEqual(['post-publicado']);
    });

    it('returns an empty public list when Firestore is empty', async () => {
        const res = await call(postsHandler);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it('requires an admin claim before creating a post', async () => {
        state.admin = false;
        const res = await call(postsHandler, {
            method: 'POST',
            body: { slug: 'novo-post', title: 'Novo post', content: 'Texto', status: 'draft' },
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows local CMS writes without an admin token outside production', async () => {
        state.admin = false;
        const previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        try {
            const res = await call(postsHandler, {
                method: 'POST',
                headers: { host: 'localhost:3000' },
                body: { slug: 'post-local', title: 'Post local', content: 'Texto', status: 'draft' },
            });
            expect(res.statusCode).toBe(201);
            expect(state.docs.get('post-1').createdBy).toBe('local-cms');
        } finally {
            process.env.NODE_ENV = previousNodeEnv;
        }
    });

    it('requires an admin claim to list drafts and returns all posts to an admin', async () => {
        state.docs.set('draft', { slug: 'rascunho', title: 'Rascunho', content: 'Texto', status: 'draft' });
        state.admin = false;
        const denied = await call(postsHandler, { query: { admin: 'true' } });
        expect(denied.statusCode).toBe(403);

        state.admin = true;
        const allowed = await call(postsHandler, { query: { admin: 'true' } });
        expect(allowed.statusCode).toBe(200);
        expect(allowed.body.data.map((post) => post.slug)).toEqual(['rascunho']);
    });

    it('creates a validated post and prevents duplicate slugs', async () => {
        const body = { slug: 'novo-post', title: 'Novo post', content: 'Texto', status: 'published' };
        const created = await call(postsHandler, { method: 'POST', body });
        expect(created.statusCode).toBe(201);
        expect(created.body.data.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

        const duplicate = await call(postsHandler, { method: 'POST', body });
        expect(duplicate.statusCode).toBe(409);
        expect(duplicate.body.error.code).toBe('SLUG_CONFLICT');
    });

    it('seeds defaults once and skips existing slugs on a repeated seed', async () => {
        const seeded = await call(postsHandler, { method: 'POST', body: { action: 'seed' } });
        expect(seeded.statusCode).toBe(201);
        expect(seeded.body.data.created).toHaveLength(3);
        expect(state.docs.size).toBe(3);

        const repeated = await call(postsHandler, { method: 'POST', body: { action: 'seed' } });
        expect(repeated.body.data.created).toEqual([]);
        expect(repeated.body.data.skipped).toHaveLength(3);
    });
});

describe('single blog post API', () => {
    beforeEach(() => {
        state.docs.set('p1', { slug: 'meu-post', title: 'Meu post', content: 'Texto', status: 'published' });
        state.docs.set('p2', { slug: 'meu-draft', title: 'Draft', content: 'Texto', status: 'draft' });
    });

    it('reads a published post by slug but hides drafts', async () => {
        const found = await call(postHandler, { query: { slug: 'meu-post' } });
        expect(found.statusCode).toBe(200);
        expect(found.body.data.id).toBe('p1');

        const hidden = await call(postHandler, { query: { slug: 'meu-draft' } });
        expect(hidden.statusCode).toBe(404);

        const adminDraft = await call(postHandler, { query: { slug: 'meu-draft', admin: 'true' } });
        expect(adminDraft.statusCode).toBe(200);
        expect(adminDraft.body.data.status).toBe('draft');
    });

    it('updates by slug and deletes by id for an admin', async () => {
        const updated = await call(postHandler, {
            method: 'PUT', query: { slug: 'meu-post' }, body: { title: 'Titulo atualizado' },
        });
        expect(updated.statusCode).toBe(200);
        expect(state.docs.get('p1').title).toBe('Titulo atualizado');

        const removed = await call(postHandler, { method: 'DELETE', query: { id: 'p1' } });
        expect(removed.statusCode).toBe(200);
        expect(state.docs.has('p1')).toBe(false);
    });

    it('does not update an article that has not been migrated to Firestore', async () => {
        const res = await call(postHandler, {
            method: 'PUT',
            query: { slug: 'como-tres-executivos-criaram-a-ia-que-transforma-seu-guarda-roupa' },
            body: { title: 'Alterado' },
        });
        expect(res.statusCode).toBe(404);
    });
});
