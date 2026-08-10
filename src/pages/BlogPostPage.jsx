import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogFooter, BlogHeader, formatPostDate } from '../components/blog/BlogChrome';
import useDocumentMeta from '../hooks/useDocumentMeta';
import {
    getPublishedPost,
    listPostComments,
    registerPostView,
    submitPostComment,
} from '../services/api/blogService';
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

    useDocumentMeta({
        title: post?.seoTitle || (post ? `${post.title} | Fleek Authority` : 'Fleek Posts'),
        description: post?.seoDescription || post?.excerpt,
        image: post?.coverImage,
        canonical: post?.canonicalUrl || `/blog/${slug}`,
        type: 'article',
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
            <main>
                {loading ? (
                    <div className="blog-shell blog-status" role="status">Carregando artigo...</div>
                ) : notFound || !post ? (
                    <div className="blog-shell blog-empty">
                        <span className="blog-kicker">404</span>
                        <h1>Este artigo não foi encontrado.</h1>
                        <Link className="blog-button" to="/blog">Ver todos os artigos</Link>
                    </div>
                ) : (
                    <article className="blog-article">
                        <header className="blog-article__header">
                            <div className="blog-shell blog-article__header-inner">
                                <Link className="blog-back" to="/blog">← Todos os artigos</Link>
                                <div className="blog-article__meta">
                                    <span>{post.category || 'Estilo profissional'}</span>
                                    <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                                </div>
                                <h1>{post.title}</h1>
                                <p>{post.excerpt}</p>
                            </div>
                        </header>
                        {post.coverImage && (
                            <div className="blog-shell blog-article__cover">
                                <img
                                    src={post.coverImage}
                                    alt={post.coverAlt || ''}
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
                                <strong>{post.author || 'Fleek Authority'}</strong>
                            </aside>
                            <div className="blog-prose">
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
                            <span>Seu estilo também pode trabalhar a seu favor.</span>
                            <h2>Transforme intenção em presença.</h2>
                            <Link className="blog-button blog-button--light" to="/login">
                                Conheça o John Styles <span aria-hidden="true">↗</span>
                            </Link>
                        </div>
                    </article>
                )}
            </main>
            <BlogFooter />
        </div>
    );
}
