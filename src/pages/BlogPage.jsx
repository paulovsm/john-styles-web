import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogFooter, BlogHeader } from '../components/blog/BlogChrome';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { listPublishedPosts } from '../services/api/blogService';
import { formatPostDate } from '../utils/blog';
import {
    ORGANIZATION_ID,
    WEBSITE_ID,
    absoluteSiteUrl,
    breadcrumbSchema,
    organizationSchema,
    websiteSchema,
} from '../utils/seo';
import './Blog.css';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const blogUrl = absoluteSiteUrl('/blog');
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            organizationSchema(),
            websiteSchema(),
            {
                '@type': 'Blog',
                '@id': `${blogUrl}#blog`,
                url: blogUrl,
                name: 'Fleek Journal',
                description: 'Conteúdo da Fleek Authority sobre estilo pessoal, ocasiões, guarda-roupa e escolhas de imagem.',
                publisher: { '@id': ORGANIZATION_ID },
                isPartOf: { '@id': WEBSITE_ID },
                inLanguage: 'pt-BR',
                blogPost: posts.map((post) => ({
                    '@type': 'BlogPosting',
                    '@id': `${absoluteSiteUrl(`/blog/${post.slug}`)}#article`,
                    headline: post.title,
                    description: post.excerpt,
                    url: absoluteSiteUrl(`/blog/${post.slug}`),
                    datePublished: post.publishedAt,
                    dateModified: post.updatedAt || post.publishedAt,
                    image: absoluteSiteUrl(post.coverImage || '/og.jpg'),
                })),
            },
            breadcrumbSchema([
                { name: 'Fleek Authority', path: '/' },
                { name: 'Fleek Journal', path: '/blog' },
            ]),
        ],
    };

    useDocumentMeta({
        title: 'Fleek Journal | Estilo para todas as ocasiões',
        description: 'Referências e orientação prática da Fleek Authority para usar melhor o guarda-roupa e fazer escolhas de estilo com mais clareza.',
        image: '/experience-v2/universal-hero-v2.webp',
        imageAlt: 'Fleek Authority: estilo para diferentes pessoas e ocasiões',
        canonical: '/blog',
        author: 'Fleek Authority',
        structuredData,
    });

    useEffect(() => {
        let active = true;
        listPublishedPosts()
            .then((result) => {
                if (active) setPosts(result);
            })
            // Without this the failure surfaces as an unhandled rejection; the
            // empty state below is the right thing to show either way.
            .catch(() => {
                if (active) setPosts([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    return (
        <div className="blog-site">
            <BlogHeader />
            <main id="main-content" tabIndex={-1}>
                <section className="blog-index-hero">
                    <div className="blog-shell">
                        <span className="blog-kicker">Fleek Journal</span>
                        <h1>Referências para transformar estilo em repertório.</h1>
                        <p>Análises e orientação prática para entender códigos de estilo, usar melhor o guarda-roupa e decidir com mais clareza em cada ocasião.</p>
                    </div>
                </section>

                <section className="blog-index-list" aria-labelledby="latest-posts">
                    <div className="blog-shell">
                        <div className="blog-section-title">
                            <h2 id="latest-posts">Artigos recentes</h2>
                            <span>{posts.length ? `${posts.length} conteúdos` : ''}</span>
                        </div>
                        {loading ? (
                            <p className="blog-status" role="status">Carregando artigos...</p>
                        ) : posts.length ? (
                            <div className="blog-grid">
                                {posts.map((post, index) => (
                                    <article className="blog-card" key={post.id || post.slug} itemScope itemType="https://schema.org/BlogPosting">
                                        <Link className="blog-card__image" to={`/blog/${post.slug}`} aria-label={`Ler artigo: ${post.title}`}>
                                            <img
                                                src={post.coverImage || '/og.jpg'}
                                                alt={post.coverAlt || ''}
                                                itemProp="image"
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = '/og.jpg';
                                                }}
                                            />
                                            <span>{String(index + 1).padStart(2, '0')}</span>
                                        </Link>
                                        <div className="blog-card__meta">
                                            <span>{post.category || 'Estilo'}</span>
                                            <time dateTime={post.publishedAt} itemProp="datePublished">{formatPostDate(post.publishedAt)}</time>
                                            {post.readTime ? <span>{post.readTime} min</span> : null}
                                        </div>
                                        <h2 itemProp="headline"><Link to={`/blog/${post.slug}`} itemProp="url">{post.title}</Link></h2>
                                        <p itemProp="description">{post.excerpt}</p>
                                        <Link className="blog-read-link" to={`/blog/${post.slug}`}>
                                            Ler artigo <span aria-hidden="true">↗</span>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="blog-status">Ainda não há artigos publicados.</p>
                        )}
                    </div>
                </section>
            </main>
            <BlogFooter />
        </div>
    );
}
