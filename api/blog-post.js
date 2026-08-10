import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import {
    BlogError,
    assertUniqueSlug,
    handleBlogError,
    postCollection,
    requireAdmin,
    resolveTarget,
    sendData,
    sendError,
    serializePost,
    validatePostInput,
    validateSlug,
} from './_blog.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'GET') return await getPost(req, res);
        if (req.method === 'PUT') return await updatePost(req, res);
        if (req.method === 'DELETE') return await deletePost(req, res);
        res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    } catch (error) {
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-post error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to process the blog post');
    }
}

async function getPost(req, res) {
    const adminView = req.query?.admin === 'true' || Boolean(req.query?.id);
    if (adminView) await requireAdmin(req, requireAuth);

    const collection = postCollection();
    let doc;
    if (req.query?.id) {
        doc = await resolveTarget(collection, { id: req.query.id });
    } else {
        const slug = validateSlug(req.query?.slug);
        doc = await resolveTarget(collection, { slug });
    }

    if (!doc || (!adminView && doc.data().status !== 'published')) {
        throw new BlogError(404, 'NOT_FOUND', 'Blog post not found');
    }
    return sendData(res, serializePost(doc.id, doc.data()));
}

async function updatePost(req, res) {
    const { uid } = await requireAdmin(req, requireAuth);
    const collection = postCollection();
    const doc = await resolveTarget(collection, req.query);
    if (!doc) throw new BlogError(404, 'NOT_FOUND', 'Blog post not found');

    const input = validatePostInput(req.body, { partial: true });
    if (input.slug) await assertUniqueSlug(collection, input.slug, doc.id);
    const updates = { ...input, updatedAt: new Date(), updatedBy: uid };
    await doc.ref.update(updates);
    return sendData(res, serializePost(doc.id, { ...doc.data(), ...updates }));
}

async function deletePost(req, res) {
    await requireAdmin(req, requireAuth);
    const doc = await resolveTarget(postCollection(), req.query);
    if (!doc) throw new BlogError(404, 'NOT_FOUND', 'Blog post not found');
    await doc.ref.delete();
    return sendData(res, { id: doc.id, deleted: true });
}
