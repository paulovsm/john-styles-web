import { getAdminDb } from './_firebaseAdmin.js';

export const BLOG_COLLECTION = 'blogPosts';
export const BLOG_STATUSES = new Set(['draft', 'published']);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX = {
    slug: 100,
    title: 180,
    excerpt: 600,
    content: 120_000,
    category: 80,
    author: 120,
    coverImage: 2_000,
    coverAlt: 240,
    seoTitle: 180,
    seoDescription: 320,
    canonicalUrl: 2_000,
};

export class BlogError extends Error {
    constructor(status, code, message) {
        super(message);
        this.name = 'BlogError';
        this.status = status;
        this.code = code;
    }
}

export function sendData(res, data, status = 200, meta) {
    const body = { data };
    if (meta) body.meta = meta;
    return res.status(status).json(body);
}

export function sendError(res, status, code, message) {
    return res.status(status).json({ error: { code, message } });
}

export function handleBlogError(res, error) {
    if (!(error instanceof BlogError)) return false;
    sendError(res, error.status, error.code, error.message);
    return true;
}

const LOCAL_CMS_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function firstHeaderValue(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw !== 'string') return '';
    return raw.split(',', 1)[0].trim();
}

/**
 * Returns the hostname clients used to reach the API. Proxies commonly expose
 * it through x-forwarded-host, while the local Express server uses Host.
 */
export function effectiveHostname(req) {
    const headers = req?.headers || {};
    const rawHost = firstHeaderValue(
        headers['x-forwarded-host']
        || headers['X-Forwarded-Host']
        || headers.host
        || headers.Host,
    );
    if (!rawHost || /[\s/?#]/.test(rawHost)) return '';

    try {
        const parsed = new URL(`http://${rawHost}`);
        if (parsed.username || parsed.password || parsed.pathname !== '/') return '';
        return parsed.hostname.toLowerCase();
    } catch {
        return '';
    }
}

/** Local CMS access is deliberately impossible when NODE_ENV is production. */
export function isLocalCmsRequest(req) {
    return process.env.NODE_ENV !== 'production' && LOCAL_CMS_HOSTS.has(effectiveHostname(req));
}

export async function requireAdmin(req, requireAuth) {
    if (isLocalCmsRequest(req)) {
        return { uid: 'local-cms', token: { admin: true, localCms: true } };
    }

    const auth = await requireAuth(req);
    if (auth.token?.admin !== true) {
        throw new BlogError(403, 'FORBIDDEN', 'Administrator access is required');
    }
    return auth;
}

function requiredString(value, field, max) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} is required`);
    }
    const clean = value.trim();
    if (clean.length > max) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} must be at most ${max} characters`);
    }
    return clean;
}

function optionalString(value, field, max) {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    if (typeof value !== 'string') {
        throw new BlogError(400, 'INVALID_INPUT', `${field} must be a string`);
    }
    const clean = value.trim();
    if (clean.length > max) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} must be at most ${max} characters`);
    }
    return clean || null;
}

export function validateSlug(value, field = 'slug') {
    const slug = requiredString(value, field, MAX.slug);
    if (slug.length < 3 || !SLUG_RE.test(slug)) {
        throw new BlogError(
            400,
            'INVALID_INPUT',
            `${field} must be 3-${MAX.slug} lowercase letters, numbers, or hyphen-separated words`,
        );
    }
    return slug;
}

export function parseDate(value, field = 'publishedAt') {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string' && !(value instanceof Date)) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} must be an ISO 8601 date`);
    }
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new BlogError(400, 'INVALID_INPUT', `${field} must be a valid ISO 8601 date`);
    }
    if (typeof value === 'string') {
        const match = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
        if (!match) throw new BlogError(400, 'INVALID_INPUT', `${field} must be an ISO 8601 date`);
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const calendarDate = new Date(Date.UTC(year, month - 1, day));
        if (
            calendarDate.getUTCFullYear() !== year
            || calendarDate.getUTCMonth() !== month - 1
            || calendarDate.getUTCDate() !== day
        ) {
            throw new BlogError(400, 'INVALID_INPUT', `${field} must be a valid calendar date`);
        }
    }
    return date;
}

function validateTags(value) {
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || value.length > 20) {
        throw new BlogError(400, 'INVALID_INPUT', 'tags must be an array with at most 20 items');
    }
    const tags = value.map((tag) => requiredString(tag, 'tag', 50));
    if (new Set(tags).size !== tags.length) {
        throw new BlogError(400, 'INVALID_INPUT', 'tags must not contain duplicates');
    }
    return tags;
}

function validateCoverImage(value) {
    const image = optionalString(value, 'coverImage', MAX.coverImage);
    if (image == null) return image;
    if (!/^\/(?!\/)/.test(image) && !/^https:\/\//i.test(image)) {
        throw new BlogError(400, 'INVALID_INPUT', 'coverImage must be an HTTPS URL or an absolute site path');
    }
    return image;
}

function validateCanonicalUrl(value) {
    const canonicalUrl = optionalString(value, 'canonicalUrl', MAX.canonicalUrl);
    if (canonicalUrl == null) return canonicalUrl;
    try {
        const parsed = new URL(canonicalUrl);
        if (parsed.protocol !== 'https:') throw new Error('invalid protocol');
        return parsed.href;
    } catch {
        throw new BlogError(400, 'INVALID_INPUT', 'canonicalUrl must be an absolute HTTPS URL');
    }
}

/** Validates and returns only fields that may be persisted. */
export function validatePostInput(input, { partial = false, now = new Date() } = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new BlogError(400, 'INVALID_INPUT', 'A JSON object is required');
    }

    const allowed = new Set([
        'slug', 'title', 'excerpt', 'content', 'category', 'author', 'coverImage', 'coverAlt',
        'tags', 'status', 'publishedAt', 'seoTitle', 'seoDescription', 'canonicalUrl',
        'readTime', 'featured',
    ]);
    const unknown = Object.keys(input).filter((key) => !allowed.has(key));
    if (unknown.length) {
        throw new BlogError(400, 'INVALID_INPUT', `Unknown field${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`);
    }

    const out = {};
    if (!partial || input.slug !== undefined) out.slug = validateSlug(input.slug);
    if (!partial || input.title !== undefined) out.title = requiredString(input.title, 'title', MAX.title);
    if (!partial || input.content !== undefined) out.content = requiredString(input.content, 'content', MAX.content);

    for (const field of ['excerpt', 'category', 'author', 'coverAlt', 'seoTitle', 'seoDescription']) {
        if (input[field] !== undefined) out[field] = optionalString(input[field], field, MAX[field]);
    }
    if (input.coverImage !== undefined) out.coverImage = validateCoverImage(input.coverImage);
    if (input.canonicalUrl !== undefined) out.canonicalUrl = validateCanonicalUrl(input.canonicalUrl);
    if (input.tags !== undefined) out.tags = validateTags(input.tags);
    if (input.featured !== undefined) {
        if (typeof input.featured !== 'boolean') {
            throw new BlogError(400, 'INVALID_INPUT', 'featured must be a boolean');
        }
        out.featured = input.featured;
    }

    if (!partial || input.status !== undefined) {
        const status = input.status ?? 'draft';
        if (!BLOG_STATUSES.has(status)) {
            throw new BlogError(400, 'INVALID_INPUT', 'status must be draft or published');
        }
        out.status = status;
    }

    if (input.publishedAt !== undefined) out.publishedAt = parseDate(input.publishedAt);
    if (input.readTime !== undefined) {
        if (!Number.isInteger(input.readTime) || input.readTime < 1 || input.readTime > 120) {
            throw new BlogError(400, 'INVALID_INPUT', 'readTime must be an integer from 1 to 120');
        }
        out.readTime = input.readTime;
    }

    if (!partial && out.status === 'published' && !out.publishedAt) out.publishedAt = now;
    if (!partial && out.status === 'draft' && input.publishedAt === undefined) out.publishedAt = null;
    if (partial && out.status === 'published' && input.publishedAt === undefined) out.publishedAt = now;

    if (partial && Object.keys(out).length === 0) {
        throw new BlogError(400, 'INVALID_INPUT', 'At least one editable field is required');
    }
    return out;
}

export function parseLimit(value, fallback = 20) {
    if (value === undefined) return fallback;
    if (!/^\d+$/.test(String(value))) {
        throw new BlogError(400, 'INVALID_INPUT', 'limit must be an integer from 1 to 50');
    }
    const limit = Number(value);
    if (limit < 1 || limit > 50) {
        throw new BlogError(400, 'INVALID_INPUT', 'limit must be an integer from 1 to 50');
    }
    return limit;
}

export function toIso(value) {
    if (value == null) return null;
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function serializePost(id, data, extra = {}) {
    const safeData = { ...data };
    delete safeData.createdBy;
    delete safeData.updatedBy;
    return {
        ...safeData,
        id,
        publishedAt: toIso(data.publishedAt),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
        ...extra,
    };
}

export function postCollection() {
    return getAdminDb().collection(BLOG_COLLECTION);
}

export async function findPostBySlug(collection, slug) {
    const snapshot = await collection.where('slug', '==', slug).limit(2).get();
    if (snapshot.empty) return null;
    if (snapshot.docs.length > 1) {
        throw new BlogError(409, 'DUPLICATE_SLUG', 'More than one post uses this slug');
    }
    return snapshot.docs[0];
}

export async function assertUniqueSlug(collection, slug, exceptId) {
    const found = await findPostBySlug(collection, slug);
    if (found && found.id !== exceptId) {
        throw new BlogError(409, 'SLUG_CONFLICT', 'A post with this slug already exists');
    }
}

function defaultPost(raw) {
    const publishedAt = raw.publishedAt ?? raw.date ?? null;
    return {
        ...raw,
        slug: validateSlug(raw.slug),
        status: 'published',
        coverImage: raw.coverImage ?? raw.image ?? null,
        publishedAt: toIso(publishedAt),
    };
}

export async function loadDefaultPosts() {
    try {
        const module = await import('../content/blogPosts.js');
        const posts = module.defaultBlogPosts ?? module.blogPosts ?? module.default ?? [];
        if (!Array.isArray(posts)) return [];
        return posts.map(defaultPost);
    } catch (error) {
        if (error?.code === 'ERR_MODULE_NOT_FOUND') return [];
        throw error;
    }
}

export async function resolveTarget(collection, query = {}) {
    if (query.id && query.slug) {
        throw new BlogError(400, 'INVALID_INPUT', 'Use either id or slug, not both');
    }
    if (query.id) {
        if (typeof query.id !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(query.id)) {
            throw new BlogError(400, 'INVALID_INPUT', 'id is invalid');
        }
        const doc = await collection.doc(query.id).get();
        return doc.exists ? doc : null;
    }
    if (query.slug) return findPostBySlug(collection, validateSlug(query.slug));
    throw new BlogError(400, 'INVALID_INPUT', 'A query parameter id or slug is required');
}
