import { FieldValue } from 'firebase-admin/firestore';
import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import {
    BlogError,
    findPostBySlug,
    handleBlogError,
    postCollection,
    requireAdmin,
    sendData,
    sendError,
    serializePost,
    validateSlug,
} from './_blog.js';
import { commentCollection, serializeComment } from './_blogComments.js';
import { clientIp, consumeRateLimit, handleRateLimitError } from './_rateLimit.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'GET') return await getAnalytics(req, res);
        if (req.method === 'POST') return await recordView(req, res);
        res.setHeader('Allow', 'GET, POST, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    } catch (error) {
        if (handleRateLimitError(res, error, sendError)) return;
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-analytics error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to process blog analytics');
    }
}

export function summarizeAnalytics(posts, comments) {
    const approvedByPost = new Map();
    for (const comment of comments) {
        if (comment.status === 'approved') {
            const key = comment.postId || comment.postSlug;
            approvedByPost.set(key, (approvedByPost.get(key) || 0) + 1);
        }
    }

    const enriched = posts.map((post) => ({
        ...post,
        viewCount: Number(post.viewCount) || 0,
        commentCount: approvedByPost.get(post.id) || approvedByPost.get(post.slug) || 0,
    }));
    const overview = {
        totalPosts: enriched.length,
        publishedPosts: enriched.filter((post) => post.status === 'published').length,
        draftPosts: enriched.filter((post) => post.status === 'draft').length,
        featuredPosts: enriched.filter((post) => post.featured === true && post.status === 'published').length,
        totalViews: enriched.reduce((total, post) => total + post.viewCount, 0),
        totalComments: comments.length,
        pendingComments: comments.filter((comment) => comment.status === 'pending').length,
        approvedComments: comments.filter((comment) => comment.status === 'approved').length,
    };
    const topPosts = [...enriched]
        .filter((post) => post.status === 'published')
        .sort((a, b) => b.viewCount - a.viewCount || b.commentCount - a.commentCount)
        .slice(0, 5);
    const recentPosts = [...enriched]
        .sort((a, b) => (b.updatedAt || b.publishedAt || '').localeCompare(a.updatedAt || a.publishedAt || ''))
        .slice(0, 5);
    return { overview, topPosts, recentPosts };
}

async function getAnalytics(req, res) {
    await requireAdmin(req, requireAuth);
    const [postSnapshot, commentSnapshot] = await Promise.all([
        postCollection().get(),
        commentCollection().get(),
    ]);
    const posts = postSnapshot.docs.map((doc) => serializePost(doc.id, doc.data()));
    const comments = commentSnapshot.docs.map((doc) => serializeComment(doc.id, doc.data(), { admin: true }));
    return sendData(res, summarizeAnalytics(posts, comments));
}

async function recordView(req, res) {
    // Unauthenticated counter increment — cap it per address so it cannot be
    // driven up in a loop. The client also de-dupes per session.
    await consumeRateLimit('blogView', clientIp(req));
    const slug = validateSlug(req.body?.slug);
    const post = await findPostBySlug(postCollection(), slug);
    if (!post || post.data().status !== 'published') {
        throw new BlogError(404, 'NOT_FOUND', 'Blog post not found');
    }
    await post.ref.update({ viewCount: FieldValue.increment(1), lastViewedAt: new Date() });
    return sendData(res, { recorded: true }, 202);
}
