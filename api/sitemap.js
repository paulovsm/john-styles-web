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

function absoluteUrl(value, origin) {
    try { return new URL(value, origin).href; } catch { return null; }
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
    const staticUrls = [
        { path: '/', changefreq: 'weekly', priority: '1.0' },
        { path: '/blog', changefreq: 'daily', priority: '0.9' },
        { path: '/empresas', changefreq: 'monthly', priority: '0.6' },
        { path: '/assinatura', changefreq: 'monthly', priority: '0.5' },
        { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
    ].map(({ path, changefreq, priority }) => `<url><loc>${xmlEscape(`${origin}${path}`)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`);
    const postUrls = posts.map((post) => {
        const image = absoluteUrl(post.coverImage, origin);
        const imageMarkup = image
            ? `<image:image><image:loc>${xmlEscape(image)}</image:loc>${post.coverAlt ? `<image:caption>${xmlEscape(post.coverAlt)}</image:caption>` : ''}</image:image>`
            : '';
        return `<url><loc>${xmlEscape(`${origin}/blog/${encodeURIComponent(post.slug)}`)}</loc>${post.updatedAt || post.publishedAt ? `<lastmod>${xmlEscape(post.updatedAt || post.publishedAt)}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority>${imageMarkup}</url>`;
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${[...staticUrls, ...postUrls].join('')}</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(req.method === 'HEAD' ? '' : xml);
}
