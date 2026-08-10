import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import { BlogError, handleBlogError, requireAdmin, sendData, sendError } from './_blog.js';
import {
    commentCollection,
    serializeComment,
    validateCommentId,
    validateModerationInput,
} from './_blogComments.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'PUT') return await moderateComment(req, res);
        if (req.method === 'DELETE') return await deleteComment(req, res);
        res.setHeader('Allow', 'PUT, DELETE, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    } catch (error) {
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-comment error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to process the blog comment');
    }
}

async function getComment(req) {
    await requireAdmin(req, requireAuth);
    const id = validateCommentId(req.query?.id);
    const doc = await commentCollection().doc(id).get();
    if (!doc.exists) throw new BlogError(404, 'NOT_FOUND', 'Comment not found');
    return doc;
}

async function moderateComment(req, res) {
    const doc = await getComment(req);
    const input = validateModerationInput(req.body);
    const updates = { ...input, moderatedAt: new Date(), updatedAt: new Date() };
    await doc.ref.update(updates);
    return sendData(res, serializeComment(doc.id, { ...doc.data(), ...updates }, { admin: true }));
}

async function deleteComment(req, res) {
    const doc = await getComment(req);
    await doc.ref.delete();
    return sendData(res, { deleted: true, id: doc.id });
}
