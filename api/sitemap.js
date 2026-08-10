import { postCollection, serializePost } from './_blog.js';

function originFor(req) {
    if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
    return host ? `${protocol}://${host}` : 'https://fleekauthority.com';
}

function xmlEscape(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

async function postsForSitemap() {
    try {
        const snapshot = await postCollection().where('status', '==', 'published').get();
        return snapshot.docs.map((doc) => serializePost(doc.id, doc.data()));
    } catch (error) {
        console.warn('Sitemap could not load Firestore posts:', error.message);
    }
    return [];
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return res.status(405).send('Method not allowed');
    }
    const origin = originFor(req);
    const posts = await postsForSitemap();
    const staticUrls = ['/', '/blog'].map((path) => `<url><loc>${xmlEscape(`${origin}${path}`)}</loc><changefreq>${path === '/' ? 'weekly' : 'daily'}</changefreq><priority>${path === '/' ? '1.0' : '0.9'}</priority></url>`);
    const postUrls = posts.map((post) => `<url><loc>${xmlEscape(`${origin}/blog/${post.slug}`)}</loc>${post.updatedAt || post.publishedAt ? `<lastmod>${xmlEscape(post.updatedAt || post.publishedAt)}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority></url>`);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticUrls, ...postUrls].join('')}</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(req.method === 'HEAD' ? '' : xml);
}
