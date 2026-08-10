import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { postCollection, serializePost } from './_blog.js';

const BRAND = 'Fleek Authority';
const FALLBACK_ORIGIN = 'https://fleekauthority.com';
let cachedAppAssets;

function appAssets() {
    if (cachedAppAssets) return cachedAppAssets;
    try {
        const template = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
        cachedAppAssets = {
            stylesheets: (template.match(/<link[^>]+href="\/assets\/[^"]+\.css"[^>]*>/g) || []).join(''),
            scripts: (template.match(/<script[^>]+src="\/assets\/[^"]+\.js"[^>]*><\/script>/g) || []).join(''),
        };
    } catch {
        cachedAppAssets = { stylesheets: '', scripts: '' };
    }
    return cachedAppAssets;
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function originFor(req) {
    if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
    return host ? `${protocol}://${host}` : FALLBACK_ORIGIN;
}

function absoluteUrl(value, origin) {
    if (!value) return `${origin}/og.jpg`;
    try { return new URL(value, origin).href; } catch { return `${origin}/og.jpg`; }
}

async function publishedPosts() {
    try {
        const collection = postCollection();
        const snapshot = await collection.where('status', '==', 'published').get();
        if (!snapshot.empty) {
            return snapshot.docs
                .map((doc) => serializePost(doc.id, doc.data()))
                .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
        }
    } catch (error) {
        console.warn('SSR blog could not load Firestore posts:', error.message);
    }
    return [];
}

function dateLabel(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value));
}

function shell({ req, title, description, path, canonicalUrl, image, type = 'website', jsonLd, body, status = 200, robots = 'index, follow' }) {
    const origin = originFor(req);
    const canonical = new URL(canonicalUrl || path, origin).href;
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeImage = escapeHtml(absoluteUrl(image, origin));
    const structuredData = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
    const assets = appAssets();

    return {
        status,
        html: `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeTitle}</title><meta name="description" content="${safeDescription}"><meta name="robots" content="${escapeHtml(robots)}">
<link rel="canonical" href="${escapeHtml(canonical)}"><link rel="icon" type="image/avif" href="/FA_Icon_White.avif">
<meta property="og:site_name" content="${BRAND}"><meta property="og:type" content="${type}">
<meta property="og:title" content="${safeTitle}"><meta property="og:description" content="${safeDescription}">
<meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${safeImage}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safeTitle}">
<meta name="twitter:description" content="${safeDescription}"><meta name="twitter:image" content="${safeImage}">
<script type="application/ld+json">${structuredData}</script>
${assets.stylesheets}<style>${styles}${fleekOverrides}</style></head><body><div id="root">${body}</div>${assets.scripts}</body></html>`,
    };
}

function blogIndex(req, posts) {
    const origin = originFor(req);
    const body = renderToStaticMarkup(React.createElement(React.Fragment, null,
        React.createElement('header', { className: 'site-header' },
            React.createElement('a', { href: '/', className: 'brand' },
                React.createElement('img', { src: '/FA_Icon_White.avif', alt: '' }),
                React.createElement('span', null, BRAND),
            ),
            React.createElement('a', { href: '/', className: 'back' }, 'Conheça o John Styles'),
        ),
        React.createElement('main', null,
            React.createElement('section', { className: 'hero' },
                React.createElement('span', null, 'Fleek Authority · Conteúdo'),
                React.createElement('h1', null, 'Estilo com intenção.'),
                React.createElement('p', null, 'Ideias práticas para construir presença, simplificar escolhas e usar melhor o seu guarda-roupa.'),
            ),
            React.createElement('section', { className: 'grid', 'aria-label': 'Artigos publicados' },
                posts.map((post) => React.createElement('article', { className: 'card', key: post.slug },
                    React.createElement('a', { href: `/blog/${encodeURIComponent(post.slug)}`, className: 'cover', 'aria-label': post.title },
                        React.createElement('img', { src: post.coverImage || '/JohnStyles.jpg', alt: post.coverAlt || '', loading: 'lazy' }),
                    ),
                    React.createElement('div', { className: 'card-body' },
                        React.createElement('span', { className: 'category' }, post.category || 'Estilo'),
                        React.createElement('h2', null, React.createElement('a', { href: `/blog/${encodeURIComponent(post.slug)}` }, post.title)),
                        React.createElement('p', null, post.excerpt),
                        React.createElement('time', { dateTime: post.publishedAt || undefined }, dateLabel(post.publishedAt)),
                    ),
                )),
            ),
        ),
        React.createElement('footer', null, `© ${new Date().getFullYear()} Fleek Authority`),
    ));

    return shell({
        req,
        title: `Blog | ${BRAND}`,
        description: 'Conteúdo sobre estilo profissional, imagem pessoal e um guarda-roupa mais inteligente.',
        path: '/blog',
        body,
        jsonLd: {
            '@context': 'https://schema.org', '@type': 'Blog', name: `Blog ${BRAND}`,
            url: `${origin}/blog`, description: 'Conteúdo sobre estilo profissional e imagem pessoal',
            blogPost: posts.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: `${origin}/blog/${post.slug}`, datePublished: post.publishedAt })),
        },
    });
}

function blogPost(req, post) {
    const origin = originFor(req);
    const path = `/blog/${post.slug}`;
    const description = post.seoDescription || post.excerpt || '';
    const article = renderToStaticMarkup(React.createElement(React.Fragment, null,
        React.createElement('header', { className: 'site-header' },
            React.createElement('a', { href: '/', className: 'brand' },
                React.createElement('img', { src: '/FA_Icon_White.avif', alt: '' }),
                React.createElement('span', null, BRAND),
            ),
            React.createElement('a', { href: '/blog', className: 'back' }, 'Todos os artigos'),
        ),
        React.createElement('main', { className: 'article-wrap' },
            React.createElement('article', null,
                React.createElement('header', { className: 'article-head' },
                    React.createElement('span', { className: 'category' }, post.category || 'Estilo'),
                    React.createElement('h1', null, post.title),
                    React.createElement('p', { className: 'lead' }, post.excerpt),
                    React.createElement('div', { className: 'byline' },
                        React.createElement('span', null, post.author || 'Fleek Authority'),
                        post.publishedAt && React.createElement('time', { dateTime: post.publishedAt }, dateLabel(post.publishedAt)),
                    ),
                ),
                post.coverImage && React.createElement('img', { className: 'article-cover', src: post.coverImage, alt: post.coverAlt || '' }),
                React.createElement('div', { className: 'prose' }, React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, post.content || '')),
            ),
        ),
        React.createElement('footer', null, `© ${new Date().getFullYear()} Fleek Authority`),
    ));

    return shell({
        req,
        title: post.seoTitle || `${post.title} | ${BRAND}`,
        description,
        path,
        canonicalUrl: post.canonicalUrl,
        image: post.coverImage,
        type: 'article',
        body: article,
        jsonLd: {
            '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
            description, image: absoluteUrl(post.coverImage, origin),
            datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt,
            author: { '@type': 'Organization', name: post.author || 'Fleek Authority' },
            publisher: { '@type': 'Organization', name: 'Fleek Authority' },
            mainEntityOfPage: post.canonicalUrl || `${origin}${path}`,
        },
    });
}

function notFound(req) {
    const body = '<main class="not-found"><p class="category">Blog</p><h1>Artigo não encontrado</h1><p>Este conteúdo não existe ou ainda não foi publicado.</p><a class="button" href="/blog">Voltar ao blog</a></main>';
    return shell({ req, status: 404, title: `Artigo não encontrado | ${BRAND}`, description: 'Artigo não encontrado.', path: req.url || '/blog', body, robots: 'noindex, follow', jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Artigo não encontrado' } });
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return res.status(405).send('Method not allowed');
    }
    const posts = await publishedPosts();
    const slug = Array.isArray(req.query?.slug) ? req.query.slug[0] : req.query?.slug;
    const page = slug ? (posts.find((post) => post.slug === slug) ? blogPost(req, posts.find((post) => post.slug === slug)) : notFound(req)) : blogIndex(req, posts);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(page.status).send(req.method === 'HEAD' ? '' : page.html);
}

const styles = `*{box-sizing:border-box}body{margin:0;background:#f8f7f3;color:#1c1b18;font-family:Inter,Arial,sans-serif}.site-header{height:76px;padding:0 clamp(20px,6vw,90px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #ddd9cf;background:#fff}.brand{font:700 1.2rem Georgia,serif}.back{font-size:.88rem}a{color:inherit;text-decoration:none}.hero{padding:clamp(65px,10vw,140px) clamp(20px,8vw,130px);background:#171714;color:#fff}.hero span,.category{color:#7350da;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.hero span{color:#b9a8ef}.hero h1{max-width:850px;margin:.18em 0;font:400 clamp(3rem,8vw,7rem)/.95 Georgia,serif}.hero p{max-width:650px;color:#d7d4cc;font-size:1.1rem;line-height:1.7}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;padding:clamp(40px,7vw,100px) clamp(20px,6vw,90px)}.card{overflow:hidden;border:1px solid #ddd9cf;border-radius:14px;background:#fff}.cover{display:block;aspect-ratio:16/10;background:#e7e4dc}.cover img{width:100%;height:100%;object-fit:cover}.card-body{padding:22px}.card h2{margin:.6em 0;font:600 1.5rem/1.15 Georgia,serif}.card p{color:#625f58;line-height:1.55}.card time{display:block;margin-top:18px;color:#77736a;font-size:.78rem}.article-wrap{padding:clamp(45px,8vw,110px) 20px}.article-wrap article{max-width:920px;margin:auto}.article-head{text-align:center}.article-head h1{margin:.3em auto;max-width:900px;font:500 clamp(2.5rem,6vw,5.2rem)/1 Georgia,serif}.lead{max-width:720px;margin:25px auto;color:#5f5b53;font-size:1.2rem;line-height:1.65}.byline{display:flex;justify-content:center;gap:20px;color:#77736a;font-size:.85rem}.article-cover{width:100%;max-height:570px;margin:55px 0 45px;border-radius:16px;object-fit:cover}.prose{max-width:720px;margin:auto;font:1.06rem/1.8 Georgia,serif}.prose h2,.prose h3{margin:1.8em 0 .5em;line-height:1.2}.prose img{max-width:100%}.prose a{text-decoration:underline}.prose blockquote{margin-left:0;border-left:3px solid #7350da;padding-left:20px;color:#555}.not-found{min-height:75vh;display:grid;place-content:center;text-align:center;padding:20px}.not-found h1{font:500 3rem Georgia,serif}.button{display:inline-block;margin:20px auto;padding:12px 20px;border-radius:999px;background:#6840d8;color:#fff}footer{padding:35px;text-align:center;color:#77736a;border-top:1px solid #ddd9cf}@media(max-width:850px){.grid{grid-template-columns:1fr}.site-header{height:64px}.article-cover{margin:35px 0}.byline{flex-direction:column;gap:6px}}`;

const fleekOverrides = `body{background:#f5f3ef;color:#050505;font-family:Inter,Arial,sans-serif}.site-header{height:80px;background:#000;color:#fff;border-bottom:1px solid #242424}.brand{display:inline-flex;align-items:center;gap:12px;font:700 24px/1 Montserrat,Inter,sans-serif;letter-spacing:-.8px}.brand img{width:32px;height:32px;object-fit:contain}.back{padding:10px 16px;border-radius:999px;color:#fff;font-weight:600}.back:hover{background:#1c1c1c}.hero{background:#000}.hero span{color:#aaa}.hero h1{font-family:Montserrat,Inter,sans-serif;font-weight:700;letter-spacing:-.05em}.hero p{color:#aaa}.category{color:#050505}.card{border-color:#e1ded7;border-radius:18px;box-shadow:0 18px 48px rgba(0,0,0,.06)}.cover{aspect-ratio:1}.card h2,.article-head h1,.not-found h1{font-family:Montserrat,Inter,sans-serif;font-weight:700}.article-head h1{letter-spacing:-.04em}.article-cover{border-radius:24px}.prose{font-family:Inter,Arial,sans-serif}.prose h2,.prose h3{font-family:Montserrat,Inter,sans-serif}.prose blockquote{border-left-color:#000}.button{background:#000}.article-wrap+footer,body>footer{background:#000;color:#888;border-color:#222}@media(max-width:850px){.brand{font-size:19px}}`;
