import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import {
    BlogError,
    findPostBySlug,
    handleBlogError,
    parseLimit,
    postCollection,
    requireAdmin,
    sendData,
    sendError,
    validateSlug,
} from './_blog.js';
import {
    COMMENT_STATUSES,
    commentCollection,
    serializeComment,
    validateCommentInput,
} from './_blogComments.js';
import { clientIp, consumeRateLimit, handleRateLimitError } from './_rateLimit.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'GET') return await listComments(req, res);
        if (req.method === 'POST') return await createComment(req, res);
        res.setHeader('Allow', 'GET, POST, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    } catch (error) {
        if (handleRateLimitError(res, error, sendError)) return;
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-comments error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to process blog comments');
    }
}

async function listComments(req, res) {
    const adminView = req.query?.admin === 'true';
    const limit = parseLimit(req.query?.limit, 50);
    let comments;

    if (adminView) {
        await requireAdmin(req, requireAuth);
        if (req.query?.status && !COMMENT_STATUSES.has(req.query.status)) {
            throw new BlogError(400, 'INVALID_INPUT', 'status must be pending, approved or rejected');
        }
        const snapshot = await commentCollection().get();
        comments = snapshot.docs.map((doc) => serializeComment(doc.id, doc.data(), { admin: true }));
        if (req.query?.status) comments = comments.filter((comment) => comment.status === req.query.status);
    } else {
        const slug = validateSlug(req.query?.slug);
        const snapshot = await commentCollection().where('postSlug', '==', slug).get();
        comments = snapshot.docs
            .map((doc) => serializeComment(doc.id, doc.data()))
            .filter((comment) => comment.status === 'approved');
    }

    comments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return sendData(res, comments.slice(0, limit), 200, { count: Math.min(comments.length, limit) });
}

async function createComment(req, res) {
    // Anyone can post, so cap it per address before touching Firestore.
    await consumeRateLimit('blogComment', clientIp(req));
    const input = validateCommentInput(req.body);
    const post = await findPostBySlug(postCollection(), input.postSlug);
    if (!post || post.data().status !== 'published') {
        throw new BlogError(404, 'NOT_FOUND', 'Blog post not found');
    }

    const now = new Date();
    const ref = commentCollection().doc();
    const stored = {
        ...input,
        postId: post.id,
        postTitle: post.data().title,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        moderatedAt: null,
    };
    await ref.create(stored);
    return sendData(res, serializeComment(ref.id, stored), 201);
}
