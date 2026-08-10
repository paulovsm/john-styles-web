import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../services/auth/firebaseConfig';
import './AdminBlogPage.css';
import './AdminBlogUsers.css';

const IS_LOCAL_CMS = import.meta.env.DEV;
const LOCAL_UPLOAD_LIMIT = 5 * 1024 * 1024;

const EMPTY_POST = {
    title: '', slug: '', excerpt: '', content: '', coverImage: '', coverAlt: '',
    author: 'Fleek Authority', category: 'Estilo', status: 'draft', featured: false,
    seoTitle: '', seoDescription: '', canonicalUrl: '', publishedAt: '',
};

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Visão geral', description: 'Analytics e atividade' },
    { id: 'posts', label: 'Todos os posts', description: 'Biblioteca editorial' },
    { id: 'editor', label: 'Criar novo post', description: 'Editor e publicação' },
    { id: 'featured', label: 'Destaques da home', description: 'Seleção do carrossel' },
    { id: 'comments', label: 'Comentários', description: 'Fila de moderação' },
    { id: 'users', label: 'Usuários e admins', description: 'Equipe e permissões' },
];

function slugify(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeList(payload) {
    const value = payload?.data?.posts || payload?.data || payload?.posts || payload;
    return Array.isArray(value) ? value : [];
}

function postToForm(post) {
    return Object.fromEntries(Object.keys(EMPTY_POST).map((key) => [key, post[key] ?? EMPTY_POST[key]]));
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.onload = () => {
            const dataUrl = String(reader.result || '');
            const separator = dataUrl.indexOf(',');
            if (separator < 0) reject(new Error('A imagem não pôde ser convertida.'));
            else resolve(dataUrl.slice(separator + 1));
        };
        reader.readAsDataURL(file);
    });
}

function formatDate(value) {
    if (!value) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        .format(new Date(value));
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
}

export default function AdminBlogPage() {
    const { currentUser, logout } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [form, setForm] = useState(EMPTY_POST);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [postQuery, setPostQuery] = useState('');
    const [postStatus, setPostStatus] = useState('all');
    const [commentStatus, setCommentStatus] = useState('pending');
    const [preview, setPreview] = useState(false);
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminEmail, setAdminEmail] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);

    const authFetch = useCallback(async (url, options = {}) => {
        const token = !IS_LOCAL_CMS && currentUser ? await currentUser.getIdToken() : null;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...options.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error?.message || data.error || data.message || `Erro ${response.status}`);
        return data;
    }, [currentUser]);

    const loadWorkspace = useCallback(async ({ migrate = false } = {}) => {
        setLoading(true);
        try {
            let postPayload = await authFetch('/api/blog-posts?admin=true&limit=50');
            let nextPosts = normalizeList(postPayload);
            if (migrate && IS_LOCAL_CMS && nextPosts.length === 0) {
                const migration = await authFetch('/api/blog-posts', {
                    method: 'POST', body: JSON.stringify({ action: 'seed' }),
                });
                postPayload = await authFetch('/api/blog-posts?admin=true&limit=50');
                nextPosts = normalizeList(postPayload);
                const count = migration.data?.created?.length || 0;
                if (count) setMessage({ type: 'success', text: `${count} artigos atuais foram migrados para o banco.` });
            }
            const [commentPayload, analyticsPayload] = await Promise.all([
                authFetch('/api/blog-comments?admin=true&limit=50'),
                authFetch('/api/blog-analytics'),
            ]);
            setPosts(nextPosts);
            setComments(normalizeList(commentPayload));
            setAnalytics(analyticsPayload.data || null);
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível carregar o CMS: ${error.message}` });
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => { loadWorkspace({ migrate: true }); }, [loadWorkspace]);

    const loadAdminUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const payload = await authFetch('/api/blog-admin-users');
            setAdminUsers(Array.isArray(payload.data?.users) ? payload.data.users : []);
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível carregar os administradores: ${error.message}` });
        } finally {
            setUsersLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        if (activeView === 'users') loadAdminUsers();
    }, [activeView, loadAdminUsers]);

    const filteredPosts = useMemo(() => {
        const term = postQuery.trim().toLowerCase();
        return posts.filter((post) => {
            const matchesTerm = !term || `${post.title} ${post.slug} ${post.category || ''}`.toLowerCase().includes(term);
            return matchesTerm && (postStatus === 'all' || post.status === postStatus);
        });
    }, [posts, postQuery, postStatus]);

    const filteredComments = useMemo(() => comments.filter((comment) => (
        commentStatus === 'all' || comment.status === commentStatus
    )), [comments, commentStatus]);

    const featuredPosts = useMemo(() => posts.filter((post) => post.status === 'published'), [posts]);
    const overview = analytics?.overview || {};

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => {
            const next = { ...current, [name]: value };
            if (name === 'title' && (!editingId || current.slug === slugify(current.title))) next.slug = slugify(value);
            return next;
        });
    }

    function startNew() {
        setEditingId(null);
        setForm(EMPTY_POST);
        setPreview(false);
        setMessage(null);
        setActiveView('editor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function editPost(post) {
        setEditingId(post.id || post.slug);
        setForm(postToForm(post));
        setPreview(false);
        setMessage(null);
        setActiveView('editor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function savePost(event) {
        event.preventDefault();
        if (!form.content.trim()) {
            setPreview(false);
            setMessage({ type: 'error', text: 'Escreva o conteúdo do post antes de salvar.' });
            return;
        }
        setSaving(true);
        setMessage(null);
        const payload = { ...form, slug: slugify(form.slug) };
        if (!payload.publishedAt) delete payload.publishedAt;
        try {
            await authFetch(editingId ? `/api/blog-post?id=${encodeURIComponent(editingId)}` : '/api/blog-posts', {
                method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload),
            });
            setMessage({ type: 'success', text: editingId ? 'Post atualizado com sucesso.' : 'Post criado com sucesso.' });
            setEditingId(null);
            setForm(EMPTY_POST);
            setActiveView('posts');
            await loadWorkspace();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível salvar: ${error.message}` });
        } finally {
            setSaving(false);
        }
    }

    async function deletePost(post) {
        if (!window.confirm(`Excluir “${post.title}”? Esta ação não pode ser desfeita.`)) return;
        try {
            await authFetch(`/api/blog-post?id=${encodeURIComponent(post.id || post.slug)}`, { method: 'DELETE' });
            setMessage({ type: 'success', text: 'Post excluído.' });
            if (editingId === (post.id || post.slug)) { setEditingId(null); setForm(EMPTY_POST); }
            await loadWorkspace();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível excluir: ${error.message}` });
        }
    }

    async function toggleFeatured(post) {
        setSaving(true);
        try {
            await authFetch(`/api/blog-post?id=${encodeURIComponent(post.id)}`, {
                method: 'PUT', body: JSON.stringify({ featured: !post.featured }),
            });
            setMessage({ type: 'success', text: post.featured ? 'Post removido dos destaques.' : 'Post adicionado aos destaques.' });
            await loadWorkspace();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível alterar o destaque: ${error.message}` });
        } finally {
            setSaving(false);
        }
    }

    async function moderateComment(comment, status) {
        try {
            await authFetch(`/api/blog-comment?id=${encodeURIComponent(comment.id)}`, {
                method: 'PUT', body: JSON.stringify({ status }),
            });
            setMessage({ type: 'success', text: status === 'approved' ? 'Comentário aprovado.' : 'Comentário rejeitado.' });
            await loadWorkspace();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível moderar: ${error.message}` });
        }
    }

    async function deleteComment(comment) {
        if (!window.confirm('Excluir este comentário definitivamente?')) return;
        try {
            await authFetch(`/api/blog-comment?id=${encodeURIComponent(comment.id)}`, { method: 'DELETE' });
            setMessage({ type: 'success', text: 'Comentário excluído.' });
            await loadWorkspace();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível excluir: ${error.message}` });
        }
    }

    async function importDefaults() {
        setSaving(true);
        try {
            const result = await authFetch('/api/blog-posts', { method: 'POST', body: JSON.stringify({ action: 'seed' }) });
            const created = result.data?.created?.length || 0;
            setMessage({ type: 'success', text: created ? `${created} artigos migrados para o banco.` : 'Os artigos atuais já estão no banco.' });
            await loadWorkspace();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível migrar os artigos: ${error.message}` });
        } finally {
            setSaving(false);
        }
    }

    async function uploadCover(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const limit = IS_LOCAL_CMS ? LOCAL_UPLOAD_LIMIT : 8 * 1024 * 1024;
        if (!file.type.startsWith('image/') || file.size > limit) {
            setMessage({ type: 'error', text: `Selecione uma imagem de até ${IS_LOCAL_CMS ? 5 : 8} MB.` });
            return;
        }
        setUploading(true);
        try {
            let url;
            if (IS_LOCAL_CMS) {
                const result = await authFetch('/api/blog-media', {
                    method: 'POST',
                    body: JSON.stringify({ filename: file.name, contentType: file.type, base64: await fileToBase64(file) }),
                });
                url = result.data?.url;
            } else {
                const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
                const objectRef = ref(storage, `blog/${currentUser.uid}/${Date.now()}-${safeName}`);
                await uploadBytes(objectRef, file, { contentType: file.type });
                url = await getDownloadURL(objectRef);
            }
            if (!url) throw new Error('A API não retornou a URL da imagem.');
            setForm((current) => ({ ...current, coverImage: url }));
            setMessage({ type: 'success', text: 'Imagem enviada.' });
        } catch (error) {
            setMessage({ type: 'error', text: `Falha no upload: ${error.message}` });
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    }

    async function grantAdmin(event) {
        event.preventDefault();
        const email = adminEmail.trim().toLowerCase();
        if (!email) return;
        setUsersLoading(true);
        setMessage(null);
        try {
            await authFetch('/api/blog-admin-users', {
                method: 'PUT', body: JSON.stringify({ email, admin: true }),
            });
            setAdminEmail('');
            setMessage({ type: 'success', text: `Acesso administrativo concedido a ${email}. A pessoa deve renovar a sessão para usar a nova permissão.` });
            await loadAdminUsers();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível conceder acesso: ${error.message}` });
            setUsersLoading(false);
        }
    }

    async function revokeAdmin(user) {
        if (!window.confirm(`Remover o acesso administrativo de ${user.email || user.displayName || user.uid}?`)) return;
        setUsersLoading(true);
        try {
            await authFetch('/api/blog-admin-users', {
                method: 'PUT', body: JSON.stringify({ uid: user.uid, admin: false }),
            });
            setMessage({ type: 'success', text: 'Acesso administrativo removido.' });
            await loadAdminUsers();
        } catch (error) {
            setMessage({ type: 'error', text: `Não foi possível remover o acesso: ${error.message}` });
            setUsersLoading(false);
        }
    }

    function renderDashboard() {
        const metrics = [
            ['Posts publicados', overview.publishedPosts, `${overview.draftPosts || 0} rascunhos`],
            ['Visualizações', overview.totalViews, 'total acumulado'],
            ['Comentários', overview.totalComments, `${overview.pendingComments || 0} aguardando`],
            ['Destaques da home', overview.featuredPosts, 'posts selecionados'],
        ];
        return (
            <div className="admin-view">
                <div className="admin-view__heading">
                    <div><span>Visão geral</span><h1>O que está acontecendo no blog</h1><p>Conteúdo, alcance e conversas em um só lugar.</p></div>
                    <button className="admin-button admin-button--primary" type="button" onClick={startNew}>Criar novo post</button>
                </div>
                <div className="admin-metrics">
                    {metrics.map(([label, value, helper]) => (
                        <article key={label}><span>{label}</span><strong>{formatNumber(value)}</strong><small>{helper}</small></article>
                    ))}
                </div>
                <div className="admin-dashboard-grid">
                    <section className="admin-panel">
                        <div className="admin-panel__heading"><div><span>Performance</span><h2>Posts mais vistos</h2></div></div>
                        {analytics?.topPosts?.length ? (
                            <ol className="admin-ranking">
                                {analytics.topPosts.map((post, index) => (
                                    <li key={post.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{post.title}</strong><small>{formatNumber(post.viewCount)} visualizações · {post.commentCount || 0} comentários</small></div><button type="button" onClick={() => editPost(post)}>Editar</button></li>
                                ))}
                            </ol>
                        ) : <p className="admin-empty">As visualizações aparecerão após as primeiras visitas.</p>}
                    </section>
                    <section className="admin-panel">
                        <div className="admin-panel__heading"><div><span>Próximas ações</span><h2>Central de gestão</h2></div></div>
                        <div className="admin-quick-actions">
                            <button type="button" onClick={startNew}><strong>Novo artigo</strong><small>Escrever e publicar</small></button>
                            <button type="button" onClick={() => setActiveView('comments')}><strong>Moderar comentários</strong><small>{overview.pendingComments || 0} na fila</small></button>
                            <button type="button" onClick={() => setActiveView('featured')}><strong>Organizar destaques</strong><small>Escolher posts da home</small></button>
                            <a href="/blog" target="_blank" rel="noreferrer"><strong>Abrir o blog</strong><small>Visualizar como leitor</small></a>
                        </div>
                    </section>
                    <section className="admin-panel admin-panel--wide">
                        <div className="admin-panel__heading"><div><span>Atividade recente</span><h2>Últimos conteúdos atualizados</h2></div><button type="button" onClick={() => setActiveView('posts')}>Ver todos</button></div>
                        <div className="admin-recent-list">
                            {(analytics?.recentPosts || posts.slice(0, 5)).map((post) => (
                                <button type="button" key={post.id} onClick={() => editPost(post)}><span className={`admin-status is-${post.status}`}>{post.status === 'published' ? 'Publicado' : 'Rascunho'}</span><strong>{post.title}</strong><small>{formatDate(post.updatedAt || post.publishedAt)}</small></button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    function renderPosts() {
        return (
            <div className="admin-view">
                <div className="admin-view__heading"><div><span>Biblioteca editorial</span><h1>Todos os posts</h1><p>Encontre, revise e gerencie todo o conteúdo armazenado no banco.</p></div><button className="admin-button admin-button--primary" type="button" onClick={startNew}>Criar novo post</button></div>
                <section className="admin-panel">
                    <div className="admin-toolbar">
                        <input type="search" value={postQuery} onChange={(event) => setPostQuery(event.target.value)} placeholder="Buscar por título, slug ou categoria" />
                        <select value={postStatus} onChange={(event) => setPostStatus(event.target.value)}><option value="all">Todos os status</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select>
                    </div>
                    {!posts.length && !loading && <div className="admin-empty"><p>Nenhum conteúdo foi encontrado no banco.</p><button className="admin-button" type="button" onClick={importDefaults} disabled={saving}>Migrar artigos atuais</button></div>}
                    <div className="admin-post-table">
                        {filteredPosts.map((post) => (
                            <article key={post.id || post.slug}>
                                <img src={post.coverImage || '/og.jpg'} alt="" />
                                <div><span className={`admin-status is-${post.status}`}>{post.status === 'published' ? 'Publicado' : 'Rascunho'}</span><h2>{post.title}</h2><p>/{post.slug} · {post.category || 'Sem categoria'} · {formatDate(post.updatedAt || post.publishedAt)}</p></div>
                                <div className="admin-row-actions"><button type="button" onClick={() => editPost(post)}>Editar</button>{post.status === 'published' && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">Ver</a>}<button className="is-danger" type="button" onClick={() => deletePost(post)}>Excluir</button></div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    function renderFeatured() {
        const selected = featuredPosts.filter((post) => post.featured);
        return (
            <div className="admin-view">
                <div className="admin-view__heading"><div><span>Home page</span><h1>Destaques do carrossel</h1><p>Os três posts destacados mais recentes aparecem primeiro na home.</p></div><div className="admin-selection-count"><strong>{selected.length}</strong><span>selecionados</span></div></div>
                <section className="admin-panel">
                    <div className="admin-featured-grid">
                        {featuredPosts.map((post) => (
                            <article className={post.featured ? 'is-selected' : ''} key={post.id}>
                                <div className="admin-featured-image"><img src={post.coverImage || '/og.jpg'} alt="" />{post.featured && <span>Na home</span>}</div>
                                <div><small>{post.category || 'Estilo'} · {formatDate(post.publishedAt)}</small><h2>{post.title}</h2><button className={`admin-button${post.featured ? '' : ' admin-button--primary'}`} type="button" onClick={() => toggleFeatured(post)} disabled={saving}>{post.featured ? 'Remover dos destaques' : 'Destacar na home'}</button></div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    function renderComments() {
        const counts = { pending: 0, approved: 0, rejected: 0 };
        comments.forEach((comment) => { if (counts[comment.status] !== undefined) counts[comment.status] += 1; });
        return (
            <div className="admin-view">
                <div className="admin-view__heading"><div><span>Comunidade</span><h1>Moderação de comentários</h1><p>Aprove, rejeite ou exclua as contribuições enviadas pelos leitores.</p></div></div>
                <section className="admin-panel">
                    <div className="admin-filter-tabs">
                        {[['pending', `Pendentes (${counts.pending})`], ['approved', `Aprovados (${counts.approved})`], ['rejected', `Rejeitados (${counts.rejected})`], ['all', `Todos (${comments.length})`]].map(([value, label]) => <button type="button" className={commentStatus === value ? 'is-active' : ''} onClick={() => setCommentStatus(value)} key={value}>{label}</button>)}
                    </div>
                    <div className="admin-comment-list">
                        {filteredComments.length ? filteredComments.map((comment) => (
                            <article key={comment.id}>
                                <header><div><span className={`admin-status is-${comment.status}`}>{comment.status === 'pending' ? 'Pendente' : comment.status === 'approved' ? 'Aprovado' : 'Rejeitado'}</span><strong>{comment.authorName}</strong><small>{comment.email} · {formatDate(comment.createdAt)}</small></div><a href={`/blog/${comment.postSlug}`} target="_blank" rel="noreferrer">{comment.postTitle || comment.postSlug}</a></header>
                                <p>{comment.body}</p>
                                <footer>{comment.status !== 'approved' && <button className="admin-button admin-button--primary" type="button" onClick={() => moderateComment(comment, 'approved')}>Aprovar</button>}{comment.status !== 'rejected' && <button className="admin-button" type="button" onClick={() => moderateComment(comment, 'rejected')}>Rejeitar</button>}<button className="admin-button is-danger" type="button" onClick={() => deleteComment(comment)}>Excluir</button></footer>
                            </article>
                        )) : <p className="admin-empty">Nenhum comentário nesta fila.</p>}
                    </div>
                </section>
            </div>
        );
    }

    function renderUsers() {
        return (
            <div className="admin-view">
                <div className="admin-view__heading">
                    <div><span>Acessos</span><h1>Usuários e administradores</h1><p>Controle quem pode editar conteúdo, moderar comentários e gerenciar o blog.</p></div>
                    <div className="admin-selection-count"><strong>{adminUsers.length}</strong><span>administradores</span></div>
                </div>
                <div className="admin-users-layout">
                    <section className="admin-panel admin-users-list">
                        <div className="admin-panel__heading"><div><span>Equipe atual</span><h2>Administradores do blog</h2></div></div>
                        {usersLoading && !adminUsers.length ? <p className="admin-empty">Carregando acessos...</p> : adminUsers.length ? adminUsers.map((user) => (
                            <article key={user.uid}>
                                {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <span className="admin-user-avatar">{(user.displayName || user.email || 'A').slice(0, 1).toUpperCase()}</span>}
                                <div><strong>{user.displayName || 'Administrador'}</strong><span>{user.email || user.uid}</span><small>{user.providers.includes('google.com') ? 'Google' : 'Firebase'} · {user.emailVerified ? 'e-mail verificado' : 'e-mail não verificado'}{user.lastSignInAt ? ` · último acesso ${formatDate(user.lastSignInAt)}` : ''}</small></div>
                                <span className="admin-role-badge">Administrador</span>
                                <button className="admin-button is-danger" type="button" onClick={() => revokeAdmin(user)} disabled={usersLoading || adminUsers.length <= 1}>Remover acesso</button>
                            </article>
                        )) : <p className="admin-empty">Nenhum administrador encontrado.</p>}
                    </section>
                    <aside className="admin-panel admin-add-user">
                        <span>Adicionar pessoa</span>
                        <h2>Conceder acesso administrativo</h2>
                        <p>A pessoa precisa ter entrado pelo menos uma vez no John Styles usando a conta Google.</p>
                        <form onSubmit={grantAdmin}>
                            <label>E-mail do usuário<input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="usuario@gmail.com" required /></label>
                            <button className="admin-button admin-button--primary" disabled={usersLoading}>{usersLoading ? 'Atualizando...' : 'Adicionar administrador'}</button>
                        </form>
                        <div className="admin-access-note"><strong>Permissões administrativas</strong><p>Criar e editar posts, definir destaques, moderar comentários e administrar outros acessos.</p></div>
                    </aside>
                </div>
            </div>
        );
    }

    function renderEditor() {
        return (
            <div className="admin-view">
                <div className="admin-view__heading"><div><span>{editingId ? 'Edição' : 'Novo conteúdo'}</span><h1>{editingId ? 'Editar post' : 'Criar novo post'}</h1><p>Escreva, revise a prévia e defina como o artigo será publicado.</p></div>{editingId && <button className="admin-button" type="button" onClick={startNew}>Começar novo</button>}</div>
                <form className="admin-editor" onSubmit={savePost}>
                    <section className="admin-panel admin-editor__main">
                        <div className="admin-fields">
                            <label className="is-wide">Título<input name="title" value={form.title} onChange={updateField} required maxLength="180" placeholder="Título do artigo" /></label>
                            <label className="is-wide">Slug<div className="admin-slug"><span>/blog/</span><input name="slug" value={form.slug} onChange={updateField} required pattern="[a-z0-9-]+" /></div></label>
                            <label className="is-wide">Resumo<textarea name="excerpt" value={form.excerpt} onChange={updateField} rows="3" maxLength="600" required /><small>{form.excerpt.length}/600</small></label>
                        </div>
                        <div className="admin-editor-tabs"><button type="button" className={!preview ? 'is-active' : ''} onClick={() => setPreview(false)}>Escrever</button><button type="button" className={preview ? 'is-active' : ''} onClick={() => setPreview(true)}>Prévia</button></div>
                        {!preview ? <textarea className="admin-content-editor" aria-label="Conteúdo em Markdown" name="content" value={form.content} onChange={updateField} required rows="24" placeholder="## Comece a escrever..." /> : <article className="admin-markdown-preview">{form.content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown> : <p>A prévia aparecerá aqui.</p>}</article>}
                        <details className="admin-seo"><summary>Configurações de SEO</summary><div className="admin-fields"><label>Título SEO<input name="seoTitle" value={form.seoTitle} onChange={updateField} maxLength="180" /></label><label>Descrição SEO<textarea name="seoDescription" value={form.seoDescription} onChange={updateField} maxLength="320" rows="3" /></label><label className="is-wide">URL canônica<input name="canonicalUrl" type="url" value={form.canonicalUrl} onChange={updateField} placeholder="https://..." /></label></div></details>
                    </section>
                    <aside className="admin-editor__side">
                        <section className="admin-panel"><h2>Publicação</h2><label>Status<select name="status" value={form.status} onChange={updateField}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label><label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />Destacar na home</label></section>
                        <section className="admin-panel"><h2>Organização</h2><label>Categoria<input name="category" value={form.category} onChange={updateField} /></label><label>Autor<input name="author" value={form.author} onChange={updateField} /></label></section>
                        <section className="admin-panel"><h2>Imagem de capa</h2><label className="admin-upload">{uploading ? 'Enviando...' : 'Enviar imagem'}<input type="file" accept="image/*" onChange={uploadCover} disabled={uploading} /></label>{form.coverImage && <div className="admin-cover-preview"><img src={form.coverImage} alt="Prévia da capa" /><button type="button" onClick={() => setForm((current) => ({ ...current, coverImage: '' }))}>Remover</button></div>}<label>URL<input name="coverImage" value={form.coverImage} onChange={updateField} placeholder="https://... ou /imagem" /></label><label>Texto alternativo<input name="coverAlt" value={form.coverAlt} onChange={updateField} maxLength="240" /></label></section>
                        <button className="admin-button admin-button--primary admin-save" disabled={saving || uploading}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar post'}</button>
                    </aside>
                </form>
            </div>
        );
    }

    return (
        <main className="admin-cms">
            <aside className="admin-sidebar">
                <div className="admin-brand"><span>FA</span><div><strong>Fleek Authority</strong><small>Blog CMS{IS_LOCAL_CMS ? ' · Local' : ''}</small></div></div>
                <nav aria-label="Gestão do blog">{NAV_ITEMS.map((item) => <button type="button" className={activeView === item.id ? 'is-active' : ''} onClick={() => item.id === 'editor' ? startNew() : setActiveView(item.id)} key={item.id}><strong>{item.label}</strong><small>{item.description}</small>{item.id === 'comments' && overview.pendingComments > 0 && <span>{overview.pendingComments}</span>}</button>)}</nav>
                <div className="admin-sidebar__footer"><a href="/blog" target="_blank" rel="noreferrer">Ver blog público ↗</a>{currentUser && <button type="button" onClick={logout}>Sair</button>}</div>
            </aside>
            <section className="admin-workspace">
                {message && <div className={`admin-notice is-${message.type}`} role="status"><span>{message.text}</span><button type="button" onClick={() => setMessage(null)} aria-label="Fechar aviso">×</button></div>}
                {loading && !posts.length ? <div className="admin-loading" role="status">Preparando o CMS...</div> : activeView === 'dashboard' ? renderDashboard() : activeView === 'posts' ? renderPosts() : activeView === 'featured' ? renderFeatured() : activeView === 'comments' ? renderComments() : activeView === 'users' ? renderUsers() : renderEditor()}
            </section>
        </main>
    );
}
