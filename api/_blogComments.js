import { getAdminDb } from './_firebaseAdmin.js';
import { BlogError, toIso, validateSlug } from './_blog.js';

export const BLOG_COMMENTS_COLLECTION = 'blogComments';
export const COMMENT_STATUSES = new Set(['pending', 'approved', 'rejected']);

const MAX = {
    authorName: 100,
    email: 254,
    body: 2_000,
};

function requiredText(value, field, max) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} is required`);
    }
    const clean = value.trim();
    if (clean.length > max) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} must be at most ${max} characters`);
    }
    return clean;
}

export function validateCommentInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new BlogError(400, 'INVALID_INPUT', 'A JSON object is required');
    }
    const allowed = new Set(['slug', 'authorName', 'email', 'body']);
    const unknown = Object.keys(input).filter((key) => !allowed.has(key));
    if (unknown.length) {
        throw new BlogError(400, 'INVALID_INPUT', `Unknown field${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`);
    }

    const email = requiredText(input.email, 'email', MAX.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BlogError(400, 'INVALID_INPUT', 'email must be valid');
    }

    return {
        postSlug: validateSlug(input.slug),
        authorName: requiredText(input.authorName, 'authorName', MAX.authorName),
        email,
        body: requiredText(input.body, 'body', MAX.body),
    };
}

export function validateModerationInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new BlogError(400, 'INVALID_INPUT', 'A JSON object is required');
    }
    if (Object.keys(input).length !== 1 || !COMMENT_STATUSES.has(input.status)) {
        throw new BlogError(400, 'INVALID_INPUT', 'status must be pending, approved or rejected');
    }
    return { status: input.status };
}

export function serializeComment(id, data, { admin = false } = {}) {
    const comment = {
        id,
        postId: data.postId,
        postSlug: data.postSlug,
        postTitle: data.postTitle,
        authorName: data.authorName,
        body: data.body,
        status: data.status,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
        moderatedAt: toIso(data.moderatedAt),
    };
    if (admin) comment.email = data.email;
    return comment;
}

export function commentCollection() {
    return getAdminDb().collection(BLOG_COMMENTS_COLLECTION);
}

export function validateCommentId(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(value)) {
        throw new BlogError(400, 'INVALID_INPUT', 'id is invalid');
    }
    return value;
}
