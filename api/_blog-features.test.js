import { describe, expect, it, vi } from 'vitest';

vi.mock('./_firebaseAdmin.js', () => ({ getAdminDb: vi.fn() }));
vi.mock('./_cors.js', () => ({ applyCors: () => false }));
vi.mock('./_auth.js', () => ({
    AuthError: class AuthError extends Error {},
    requireAuth: vi.fn(),
}));

import { summarizeAnalytics } from './blog-analytics.js';
import {
    serializeComment,
    validateCommentInput,
    validateModerationInput,
} from './_blogComments.js';

describe('blog comments', () => {
    it('validates and normalizes a public comment', () => {
        expect(validateCommentInput({
            slug: 'guia-de-estilo',
            authorName: '  Victor  ',
            email: 'VICTOR@example.com',
            body: '  Ótimo conteúdo.  ',
        })).toEqual({
            postSlug: 'guia-de-estilo',
            authorName: 'Victor',
            email: 'victor@example.com',
            body: 'Ótimo conteúdo.',
        });
    });

    it('rejects invalid comments and moderation statuses', () => {
        expect(() => validateCommentInput({ slug: 'post-valido', authorName: 'A', email: 'invalid', body: 'Texto' }))
            .toThrow('email must be valid');
        expect(() => validateCommentInput({ slug: 'post-valido', authorName: 'A', email: 'a@b.com', body: '' }))
            .toThrow('body is required');
        expect(() => validateModerationInput({ status: 'published' })).toThrow('status must be');
    });

    it('never exposes a commenter email in the public response', () => {
        const data = { authorName: 'Ana', email: 'ana@example.com', body: 'Texto', status: 'approved' };
        expect(serializeComment('c1', data)).not.toHaveProperty('email');
        expect(serializeComment('c1', data, { admin: true }).email).toBe('ana@example.com');
    });
});

describe('blog analytics', () => {
    it('summarizes editorial and engagement metrics', () => {
        const result = summarizeAnalytics([
            { id: 'p1', slug: 'post-um', title: 'Post um', status: 'published', featured: true, viewCount: 12, updatedAt: '2026-08-10T10:00:00Z' },
            { id: 'p2', slug: 'post-dois', title: 'Post dois', status: 'draft', viewCount: 3, updatedAt: '2026-08-09T10:00:00Z' },
        ], [
            { postId: 'p1', status: 'approved' },
            { postId: 'p1', status: 'pending' },
        ]);

        expect(result.overview).toMatchObject({
            totalPosts: 2,
            publishedPosts: 1,
            draftPosts: 1,
            featuredPosts: 1,
            totalViews: 15,
            totalComments: 2,
            pendingComments: 1,
        });
        expect(result.topPosts[0]).toMatchObject({ id: 'p1', commentCount: 1, viewCount: 12 });
    });
});
