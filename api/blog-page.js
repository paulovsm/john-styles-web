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

function shell({ req, title, description, path, canonicalUrl, image, imageAlt = '', type = 'website', jsonLd, body, status = 200, robots = 'index, follow', publishedAt, modifiedAt, author }) {
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
<meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${safeImage}"><meta property="og:image:alt" content="${escapeHtml(imageAlt)}"><meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safeTitle}">
<meta name="twitter:description" content="${safeDescription}"><meta name="twitter:image" content="${safeImage}"><meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
${author ? `<meta name="author" content="${escapeHtml(author)}"><meta property="article:author" content="${escapeHtml(author)}">` : ''}${publishedAt ? `<meta property="article:published_time" content="${escapeHtml(publishedAt)}">` : ''}${modifiedAt ? `<meta property="article:modified_time" content="${escapeHtml(modifiedAt)}">` : ''}
<script id="page-structured-data" type="application/ld+json">${structuredData}</script>
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
                React.createElement('span', null, 'Fleek Journal'),
                React.createElement('h1', null, 'Referências para transformar estilo em repertório.'),
                React.createElement('p', null, 'Análises e orientação prática para entender códigos de estilo, usar melhor o guarda-roupa e decidir com mais clareza em cada ocasião.'),
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
        title: `Fleek Journal | Estilo para todas as ocasiões`,
        description: 'Referências e orientação prática da Fleek Authority para usar melhor o guarda-roupa e fazer escolhas de estilo com mais clareza.',
        path: '/blog',
        image: '/experience-v2/universal-hero-v2.webp',
        imageAlt: 'Fleek Authority: estilo para diferentes pessoas e ocasiões',
        author: BRAND,
        body,
        jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [
                { '@type': 'Organization', '@id': `${origin}/#organization`, name: BRAND, url: `${origin}/`, logo: { '@type': 'ImageObject', url: `${origin}/FA_Icon_White.avif` } },
                { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: BRAND, publisher: { '@id': `${origin}/#organization` }, inLanguage: 'pt-BR' },
                {
                    '@type': 'Blog', '@id': `${origin}/blog#blog`, name: 'Fleek Journal', url: `${origin}/blog`,
                    description: 'Conteúdo sobre estilo pessoal, ocasiões, guarda-roupa e escolhas de imagem.',
                    publisher: { '@id': `${origin}/#organization` }, isPartOf: { '@id': `${origin}/#website` }, inLanguage: 'pt-BR',
                    blogPost: posts.map((post) => ({
                        '@type': 'BlogPosting', '@id': `${origin}/blog/${post.slug}#article`, headline: post.title,
                        description: post.excerpt, url: `${origin}/blog/${post.slug}`, datePublished: post.publishedAt,
                        dateModified: post.updatedAt || post.publishedAt, image: absoluteUrl(post.coverImage, origin),
                    })),
                },
                { '@type': 'BreadcrumbList', itemListElement: [
                    { '@type': 'ListItem', position: 1, name: BRAND, item: `${origin}/` },
                    { '@type': 'ListItem', position: 2, name: 'Fleek Journal', item: `${origin}/blog` },
                ] },
            ],
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
        imageAlt: post.coverAlt || '',
        type: 'article',
        author: post.author || BRAND,
        publishedAt: post.publishedAt,
        modifiedAt: post.updatedAt || post.publishedAt,
        body: article,
        jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [
                { '@type': 'Organization', '@id': `${origin}/#organization`, name: BRAND, url: `${origin}/`, logo: { '@type': 'ImageObject', url: `${origin}/FA_Icon_White.avif` } },
                { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: BRAND, publisher: { '@id': `${origin}/#organization` }, inLanguage: 'pt-BR' },
                {
                    '@type': 'BlogPosting', '@id': `${post.canonicalUrl || `${origin}${path}`}#article`, headline: post.title,
                    description, image: absoluteUrl(post.coverImage, origin), url: post.canonicalUrl || `${origin}${path}`,
                    datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt,
                    author: post.author && post.author !== BRAND ? { '@type': 'Person', name: post.author } : { '@id': `${origin}/#organization` },
                    publisher: { '@id': `${origin}/#organization` }, mainEntityOfPage: post.canonicalUrl || `${origin}${path}`,
                    articleSection: post.category || 'Estilo', keywords: post.tags?.join(', ') || undefined,
                    isPartOf: { '@id': `${origin}/blog#blog` }, inLanguage: 'pt-BR',
                },
                { '@type': 'BreadcrumbList', itemListElement: [
                    { '@type': 'ListItem', position: 1, name: BRAND, item: `${origin}/` },
                    { '@type': 'ListItem', position: 2, name: 'Fleek Journal', item: `${origin}/blog` },
                    { '@type': 'ListItem', position: 3, name: post.title, item: post.canonicalUrl || `${origin}${path}` },
                ] },
            ],
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

const styles = `*{box-sizing:border-box}body{margin:0;background:#fff;color:#1a211e;font-family:Inter,Arial,sans-serif}a{color:inherit;text-decoration:none}.site-header{height:68px;padding:0 clamp(16px,5vw,72px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e0e0e0;background:#fff;position:sticky;top:0;z-index:2}.brand{display:inline-flex;align-items:center;gap:10px;font:700 18px/1 Montserrat,Inter,sans-serif;letter-spacing:-.03em}.brand img{width:32px;height:32px;object-fit:contain;filter:invert(1)}.back{min-height:44px;display:inline-flex;align-items:center;padding:0 14px;border-radius:4px;background:#0c0c0c;color:#fff;font-size:12px;font-weight:800;text-transform:uppercase}.hero{padding:clamp(64px,9vw,120px) clamp(16px,6vw,90px);background:#0c0c0c;color:#fff}.hero span,.category{font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.hero h1{max-width:980px;margin:.35em 0;font:700 clamp(2.5rem,6vw,4.75rem)/.98 Montserrat,Inter,sans-serif;letter-spacing:-.056em}.hero p{max-width:720px;color:#b7b7b7;font-size:1.05rem;line-height:1.65}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:48px 28px;padding:clamp(56px,7vw,100px) clamp(16px,5vw,72px)}.card{min-width:0}.cover{display:block;aspect-ratio:4/3;border-radius:4px;overflow:hidden;background:#e0e0e0}.cover img{width:100%;height:100%;object-fit:cover;filter:grayscale(1)}.card-body{padding:18px 0}.card h2{margin:.6em 0;font:700 1.5rem/1.18 Montserrat,Inter,sans-serif;letter-spacing:-.03em}.card p{color:#606562;line-height:1.65}.card time{display:block;margin-top:18px;color:#606562;font-size:.78rem}.article-wrap{padding:clamp(52px,8vw,104px) 16px}.article-wrap article{max-width:1040px;margin:auto}.article-head{text-align:center}.article-head h1{margin:.3em auto;max-width:1000px;font:700 clamp(2.25rem,6vw,4.25rem)/1 Montserrat,Inter,sans-serif;letter-spacing:-.05em}.lead{max-width:720px;margin:24px auto;color:#606562;font-size:1.1rem;line-height:1.65}.byline{display:flex;justify-content:center;gap:20px;color:#606562;font-size:.85rem}.article-cover{width:100%;max-height:680px;margin:52px 0 48px;border-radius:4px;object-fit:cover}.prose{max-width:720px;margin:auto;font:1.06rem/1.82 Inter,Arial,sans-serif}.prose h2,.prose h3{margin:1.8em 0 .5em;font-family:Montserrat,Inter,sans-serif;line-height:1.2}.prose img{max-width:100%}.prose a{text-decoration:underline;text-underline-offset:4px}.prose blockquote{margin-left:0;border-left:3px solid #0c0c0c;padding-left:20px;color:#333}.not-found{min-height:75vh;display:grid;place-content:center;text-align:center;padding:20px}.not-found h1{font:700 3rem/1 Montserrat,Inter,sans-serif}.button{display:inline-block;margin:20px auto;padding:14px 20px;border-radius:4px;background:#0c0c0c;color:#fff}footer{padding:36px;text-align:center;background:#0c0c0c;color:#aaa;border-top:1px solid #222}@media(max-width:850px){.grid{grid-template-columns:1fr;gap:42px}.article-cover{margin:35px 0}.byline{flex-direction:column;gap:6px}}`;

const fleekOverrides = '';
