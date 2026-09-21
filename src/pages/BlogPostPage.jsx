import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogFooter, BlogHeader } from '../components/blog/BlogChrome';
import useDocumentMeta from '../hooks/useDocumentMeta';
import {
    getPublishedPost,
    listPostComments,
    registerPostView,
    submitPostComment,
} from '../services/api/blogService';
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

const EMPTY_COMMENT = { authorName: '', email: '', body: '' };

function formatCommentDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        .format(new Date(value));
}

export default function BlogPostPage() {
    const { slug } = useParams();
    const [request, setRequest] = useState({ slug: null, status: 'loading', post: null });
    const [comments, setComments] = useState([]);
    const [commentForm, setCommentForm] = useState(EMPTY_COMMENT);
    const [commentState, setCommentState] = useState({ submitting: false, message: null });

    useEffect(() => {
        let active = true;
        getPublishedPost(slug)
            .then(async (result) => {
                if (!active) return;
                setRequest({ slug, status: 'loaded', post: result });
                const [commentResult] = await Promise.allSettled([
                    listPostComments(slug),
                    registerPostView(slug),
                ]);
                if (active && commentResult.status === 'fulfilled') setComments(commentResult.value);
            })
            .catch(() => {
                if (active) setRequest({ slug, status: 'not-found', post: null });
            });
        return () => { active = false; };
    }, [slug]);

    const loading = request.slug !== slug || request.status === 'loading';
    const notFound = request.slug === slug && request.status === 'not-found';
    const post = request.slug === slug ? request.post : null;
    const postUrl = post?.canonicalUrl || absoluteSiteUrl(`/blog/${slug}`);
    const postAuthor = post?.author || 'Fleek Authority';
    const structuredData = post ? {
        '@context': 'https://schema.org',
        '@graph': [
            organizationSchema(),
            websiteSchema(),
            {
                '@type': 'BlogPosting',
                '@id': `${postUrl}#article`,
                url: postUrl,
                mainEntityOfPage: postUrl,
                headline: post.title,
                description: post.seoDescription || post.excerpt,
                image: absoluteSiteUrl(post.coverImage || '/og.jpg'),
                datePublished: post.publishedAt,
                dateModified: post.updatedAt || post.publishedAt,
                author: postAuthor === 'Fleek Authority'
                    ? { '@id': ORGANIZATION_ID }
                    : { '@type': 'Person', name: postAuthor },
                publisher: { '@id': ORGANIZATION_ID },
                isPartOf: { '@id': `${absoluteSiteUrl('/blog')}#blog` },
                articleSection: post.category || 'Estilo',
                keywords: post.tags?.join(', ') || undefined,
                inLanguage: 'pt-BR',
            },
            breadcrumbSchema([
                { name: 'Fleek Authority', path: '/' },
                { name: 'Fleek Journal', path: '/blog' },
                { name: post.title, path: postUrl },
            ]),
            {
                '@type': 'WebPage',
                '@id': `${postUrl}#webpage`,
                url: postUrl,
                name: post.seoTitle || post.title,
                isPartOf: { '@id': WEBSITE_ID },
                mainEntity: { '@id': `${postUrl}#article` },
                inLanguage: 'pt-BR',
            },
        ],
    } : undefined;

    useDocumentMeta({
        title: post?.seoTitle || (post ? `${post.title} | Fleek Authority` : 'Fleek Journal'),
        description: post?.seoDescription || post?.excerpt || 'Conteúdo da Fleek Authority sobre estilo e guarda-roupa.',
        image: post?.coverImage || '/experience-v2/universal-hero-v2.webp',
        imageAlt: post?.coverAlt || 'Fleek Authority',
        canonical: post?.canonicalUrl || `/blog/${slug}`,
        type: 'article',
        // Only state it for a missing post. Claiming "index, follow" for a found
        // one would also claim it inside the pilot, which must stay unindexed.
        robots: notFound ? 'noindex, follow' : undefined,
        publishedAt: post?.publishedAt,
        modifiedAt: post?.updatedAt || post?.publishedAt,
        author: postAuthor,
        structuredData,
    });

    async function handleCommentSubmit(event) {
        event.preventDefault();
        setCommentState({ submitting: true, message: null });
        try {
            await submitPostComment({ slug, ...commentForm });
            setCommentForm(EMPTY_COMMENT);
            setCommentState({
                submitting: false,
                message: { type: 'success', text: 'Comentário enviado. Ele aparecerá após a moderação.' },
            });
        } catch (error) {
            setCommentState({
                submitting: false,
                message: { type: 'error', text: error.message || 'Não foi possível enviar o comentário.' },
            });
        }
    }

    return (
        <div className="blog-site">
            <BlogHeader />
            <main id="main-content" tabIndex={-1}>
                {loading ? (
                    <div className="blog-shell blog-status" role="status">Carregando artigo...</div>
                ) : notFound || !post ? (
                    <div className="blog-shell blog-empty">
                        <span className="blog-kicker">404</span>
                        <h1>Este artigo não foi encontrado.</h1>
                        <Link className="blog-button" to="/blog">Ver todos os artigos</Link>
                    </div>
                ) : (
                    <article className="blog-article" itemScope itemType="https://schema.org/BlogPosting">
                        <header className="blog-article__header">
                            <div className="blog-shell blog-article__header-inner">
                                <Link className="blog-back" to="/blog">← Todos os artigos</Link>
                                <div className="blog-article__meta">
                                    <span>{post.category || 'Estilo profissional'}</span>
                                    <time dateTime={post.publishedAt} itemProp="datePublished">{formatPostDate(post.publishedAt)}</time>
                                    {post.readTime ? <span>{post.readTime} min de leitura</span> : null}
                                </div>
                                <h1 itemProp="headline">{post.title}</h1>
                                <p itemProp="description">{post.excerpt}</p>
                            </div>
                        </header>
                        {post.coverImage && (
                            <div className="blog-shell blog-article__cover">
                                <img
                                    src={post.coverImage}
                                    alt={post.coverAlt || ''}
                                    itemProp="image"
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = '/og.jpg';
                                    }}
                                />
                            </div>
                        )}
                        <div className="blog-shell blog-article__body-wrap">
                            <aside>
                                <span>Escrito por</span>
                                <strong itemProp="author">{postAuthor}</strong>
                                {post.updatedAt && post.updatedAt !== post.publishedAt ? (
                                    <small>Atualizado em <time dateTime={post.updatedAt} itemProp="dateModified">{formatPostDate(post.updatedAt)}</time></small>
                                ) : null}
                                {post.tags?.length ? (
                                    <ul className="blog-article__tags" aria-label="Temas do artigo">
                                        {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
                                    </ul>
                                ) : null}
                            </aside>
                            <div className="blog-prose" itemProp="articleBody">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                            </div>
                        </div>

                        <section className="blog-shell blog-comments" aria-labelledby="comments-title">
                            <div className="blog-comments__intro">
                                <span className="blog-kicker">Conversa</span>
                                <h2 id="comments-title">Comentários</h2>
                                <p>Compartilhe sua perspectiva. Todos os comentários passam por moderação.</p>
                            </div>
                            <div className="blog-comments__layout">
                                <div className="blog-comments__list">
                                    {comments.length ? comments.map((comment) => (
                                        <article className="blog-comment" key={comment.id}>
                                            <header>
                                                <strong>{comment.authorName}</strong>
                                                <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
                                            </header>
                                            <p>{comment.body}</p>
                                        </article>
                                    )) : <p className="blog-comments__empty">Seja o primeiro a comentar.</p>}
                                </div>
                                <form className="blog-comment-form" onSubmit={handleCommentSubmit}>
                                    <h3>Deixe um comentário</h3>
                                    <label>
                                        Nome
                                        <input
                                            value={commentForm.authorName}
                                            onChange={(event) => setCommentForm((current) => ({ ...current, authorName: event.target.value }))}
                                            maxLength="100"
                                            required
                                        />
                                    </label>
                                    <label>
                                        E-mail <small>não será publicado</small>
                                        <input
                                            type="email"
                                            value={commentForm.email}
                                            onChange={(event) => setCommentForm((current) => ({ ...current, email: event.target.value }))}
                                            maxLength="254"
                                            required
                                        />
                                    </label>
                                    <label>
                                        Comentário
                                        <textarea
                                            value={commentForm.body}
                                            onChange={(event) => setCommentForm((current) => ({ ...current, body: event.target.value }))}
                                            rows="5"
                                            maxLength="2000"
                                            required
                                        />
                                    </label>
                                    {commentState.message && (
                                        <p className={`blog-comment-form__message is-${commentState.message.type}`} role="status">
                                            {commentState.message.text}
                                        </p>
                                    )}
                                    <button type="submit" disabled={commentState.submitting}>
                                        {commentState.submitting ? 'Enviando...' : 'Enviar para moderação'}
                                    </button>
                                </form>
                            </div>
                        </section>

                        <div className="blog-shell blog-article__cta">
                            <span>A Fleek transforma repertório em escolha.</span>
                            <h2>Leve esta orientação para o seu próprio guarda-roupa.</h2>
                            <p>John Styles entende suas peças e o contexto para ajudar você a decidir o que vestir em cada ocasião.</p>
                            <Link className="blog-button blog-button--light" to="/login">
                                Encontrar meu look com John <span aria-hidden="true">↗</span>
                            </Link>
                        </div>
                    </article>
                )}
            </main>
            <BlogFooter />
        </div>
    );
}
