import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogFooter, BlogHeader, formatPostDate } from '../components/blog/BlogChrome';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { listPublishedPosts } from '../services/api/blogService';
import './Blog.css';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useDocumentMeta({
        title: 'Fleek Posts | Estilo profissional, imagem e tecnologia',
        description: 'Conteúdos da Fleek Authority para construir um estilo profissional autêntico, versátil e alinhado à sua carreira.',
        image: '/og.jpg',
        canonical: '/blog',
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
                        <span className="blog-kicker">Fleek Posts</span>
                        <h1>Ideias para vestir sua melhor versão.</h1>
                        <p>Estilo, carreira e tecnologia traduzidos em escolhas que funcionam na vida real.</p>
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
                                    <article className="blog-card" key={post.id || post.slug}>
                                        <Link className="blog-card__image" to={`/blog/${post.slug}`}>
                                            <img
                                                src={post.coverImage || '/og.jpg'}
                                                alt={post.coverAlt || ''}
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
                                            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                                        </div>
                                        <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
                                        <p>{post.excerpt}</p>
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
