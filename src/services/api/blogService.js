const CURATED_COVERS_BY_SLUG = {
    'como-tres-executivos-criaram-a-ia-que-transforma-seu-guarda-roupa': '/landing/blog-origin-v2.webp',
    'revolucao-no-estilo-profissional-masculino': '/landing/blog-style-revolution-v2.webp',
    'john-styles-o-stylist-digital': '/landing/blog-john-styles-v2.webp',
};

function withCuratedCover(post) {
    const coverImage = CURATED_COVERS_BY_SLUG[post?.slug];
    return coverImage ? { ...post, coverImage } : post;
}

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

export async function listPublishedPosts({ featured = false, limit } = {}) {
    const params = new URLSearchParams();
    if (featured) params.set('featured', 'true');
    if (limit) params.set('limit', String(limit));
    const query = params.toString();
    const response = await fetch(`/api/blog-posts${query ? `?${query}` : ''}`);
    const payload = await parseResponse(response);
    return Array.isArray(payload.data) ? payload.data.map(withCuratedCover) : [];
}

export async function getPublishedPost(slug) {
    const response = await fetch(`/api/blog-post?slug=${encodeURIComponent(slug)}`);
    const payload = await parseResponse(response);
    if (!payload.data) throw new Error('Artigo não encontrado.');
    return withCuratedCover(payload.data);
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
