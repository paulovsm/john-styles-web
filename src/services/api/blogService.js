async function parseResponse(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = payload.error?.message
            || payload.message
            || (typeof payload.error === 'string' ? payload.error : null)
            || 'Não foi possível carregar os artigos.';
        const error = new Error(message);
        error.status = response.status;
        error.code = payload.error?.code;
        throw error;
    }
    return payload;
}

const pendingPostLists = new Map();

export function listPublishedPosts({ featured = false, limit } = {}) {
    const params = new URLSearchParams();
    if (featured) params.set('featured', 'true');
    if (limit) params.set('limit', String(limit));
    const query = params.toString();
    if (pendingPostLists.has(query)) return pendingPostLists.get(query);

    const request = fetch(`/api/blog-posts${query ? `?${query}` : ''}`)
        .then(parseResponse)
        .then((payload) => (Array.isArray(payload.data) ? payload.data : []));
    pendingPostLists.set(query, request);

    return request.finally(() => {
        if (pendingPostLists.get(query) === request) pendingPostLists.delete(query);
    });
}

export async function getPublishedPost(slug) {
    const response = await fetch(`/api/blog-post?slug=${encodeURIComponent(slug)}`);
    const payload = await parseResponse(response);
    if (!payload.data) throw new Error('Artigo não encontrado.');
    return payload.data;
}

export async function listPostComments(slug) {
    const response = await fetch(`/api/blog-comments?slug=${encodeURIComponent(slug)}&limit=50`);
    const payload = await parseResponse(response);
    return Array.isArray(payload.data) ? payload.data : [];
}

export async function submitPostComment(input) {
    const response = await fetch('/api/blog-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return parseResponse(response);
}

export async function registerPostView(slug) {
    const storageKey = `fleek-blog-view:${slug}`;
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey)) return;
    const response = await fetch('/api/blog-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
    });
    await parseResponse(response);
    if (typeof window !== 'undefined') window.sessionStorage.setItem(storageKey, '1');
}
