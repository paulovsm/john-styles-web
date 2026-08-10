import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import {
    BlogError,
    assertUniqueSlug,
    handleBlogError,
    loadDefaultPosts,
    parseLimit,
    postCollection,
    requireAdmin,
    sendData,
    sendError,
    serializePost,
    validatePostInput,
} from './_blog.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'GET') return await listPosts(req, res);
        if (req.method === 'POST') return await createPost(req, res);
        res.setHeader('Allow', 'GET, POST, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    } catch (error) {
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-posts error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to process blog posts');
    }
}

async function listPosts(req, res) {
    const adminView = req.query?.admin === 'true';
    if (adminView) await requireAdmin(req, requireAuth);
    if (req.query?.featured !== undefined && !['true', 'false'].includes(req.query.featured)) {
        throw new BlogError(400, 'INVALID_INPUT', 'featured must be true or false');
    }

    const limit = parseLimit(req.query?.limit);
    const collection = postCollection();
    const snapshot = adminView
        ? await collection.get()
        : await collection.where('status', '==', 'published').get();

    let posts = snapshot.docs.map((doc) => serializePost(doc.id, doc.data()));
    if (req.query?.featured === 'true') posts = posts.filter((post) => post.featured === true);

    posts.sort((a, b) => (b.publishedAt || b.updatedAt || '').localeCompare(a.publishedAt || a.updatedAt || ''));
    return sendData(res, posts.slice(0, limit), 200, { count: Math.min(posts.length, limit) });
}

async function createPost(req, res) {
    const { uid } = await requireAdmin(req, requireAuth);
    const collection = postCollection();

    if (req.body?.action === 'seed') return seedDefaults(collection, uid, res);

    const input = validatePostInput(req.body);
    await assertUniqueSlug(collection, input.slug);
    const now = new Date();
    const ref = collection.doc();
    const stored = { ...input, createdAt: now, updatedAt: now, createdBy: uid, updatedBy: uid };
    await ref.create(stored);
    return sendData(res, serializePost(ref.id, stored), 201);
}

async function seedDefaults(collection, uid, res) {
    const defaults = await loadDefaultPosts();
    const created = [];
    const skipped = [];

    for (const post of defaults) {
        const existing = await collection.where('slug', '==', post.slug).limit(1).get();
        if (!existing.empty) {
            skipped.push(post.slug);
            continue;
        }
        const now = new Date();
        const ref = collection.doc();
        const input = validatePostInput({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            author: post.author,
            coverImage: post.coverImage,
            coverAlt: post.coverAlt,
            tags: post.tags,
            status: 'published',
            publishedAt: post.publishedAt || now.toISOString(),
            readTime: post.readTime,
            featured: post.featured,
        });
        const stored = { ...input, viewCount: 0, createdAt: now, updatedAt: now, createdBy: uid, updatedBy: uid };
        await ref.create(stored);
        created.push(serializePost(ref.id, stored));
    }

    return sendData(res, { created, skipped }, 201);
}
