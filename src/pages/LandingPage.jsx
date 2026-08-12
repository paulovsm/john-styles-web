import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublishedPosts } from '../services/api/blogService';
import './LandingPage.css';

const CONTACT_EMAIL = 'contato@fleekauthority.com';
const FLEEK_STORE_URL = 'https://loja.fleekauthority.com';

const serviceCards = [
    {
        image: '/landing/service-style-v2.webp',
        alt: 'Defina seu estilo pessoal',
        title: 'Defina o seu estilo pessoal',
        description:
            'Converse com John Styles, nosso personal stylist, entendendo seu contexto e objetivos profissionais para criar o seu guia de estilo personalizado, adaptado às suas necessidades e que te ensina a transformar seu guarda-roupa.',
        action: 'Monte seu estilo',
        href: '/login',
    },
    {
        image: '/landing/service-store-v2.webp',
        alt: 'Guarda-roupa estiloso de roupas profissionais',
        title: 'Renove seu guarda-roupas',
        description:
            'Compre as peças de roupa da Fleek Authority, com altíssima qualidade e preço justo, para renovar o seu guarda-roupa e transformar seu estilo. Na loja Fleek, selecionamos os melhores itens para elevar seu estilo profissional.',
        action: 'Fleek Store',
        href: FLEEK_STORE_URL,
    },
    {
        image: '/landing/service-subscription-v2.webp',
        alt: 'Homem elegante se arrumando',
        title: 'Mantenha seu estilo atualizado',
        description:
            'Tenha um guarda-roupa sempre atualizado por R$199/mês. A cada três meses, receba uma seleção de peças e transforme devoluções elegíveis em créditos ou descontos.',
        action: 'Assinatura',
        href: '/assinatura',
    },
];

function Brand() {
    return (
        <a className="fleek-brand" href="#inicio" aria-label="Fleek Authority — início">
            <img src="/FA_Icon_White.avif" alt="" />
            <span>Fleek Authority</span>
        </a>
    );
}

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [articles, setArticles] = useState([]);
    const [articlePage, setArticlePage] = useState(0);

    useEffect(() => {
        let active = true;
        listPublishedPosts({ featured: true, limit: 12 })
            .then((posts) => {
                if (active) setArticles(posts);
            })
            // The landing must render even when the blog API is down; the
            // highlights section already has an empty state to fall back to.
            .catch(() => {
                if (active) setArticles([]);
            });
        return () => { active = false; };
    }, []);

    const closeMenu = () => setMenuOpen(false);
    const articlePages = Math.max(1, Math.ceil(articles.length / 3));
    const visibleArticles = articles.slice(articlePage * 3, (articlePage * 3) + 3);

    // There is no subscription backend yet, so hand the address off to the
    // visitor's mail client rather than claiming a signup we never recorded.
    const handleSubscribe = (event) => {
        event.preventDefault();
        const address = email.trim();
        if (!address) return;

        const subject = encodeURIComponent('Quero entrar para o movimento Fleek');
        const body = encodeURIComponent(
            `Olá! Gostaria de receber as novidades e promoções da Fleek Authority.\n\nE-mail para cadastro: ${address}`
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        setSubscribed(true);
    };

    return (
        <div className="fleek-landing" id="inicio">
            <header className="fleek-header">
                <div className="fleek-shell fleek-nav">
                    <Brand />
                    <button
                        className="fleek-menu-button"
                        type="button"
                        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                    <nav className={`fleek-nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Navegação principal">
                        <Link to="/login" onClick={closeMenu}>John Styles</Link>
                        <Link to="/assinatura" onClick={closeMenu}>Assinatura</Link>
                        <Link to="/empresas" onClick={closeMenu}>Empresas</Link>
                        <a href="#contato" onClick={closeMenu}>Contato</a>
                        <Link to="/blog" onClick={closeMenu}>Blog</Link>
                        <a className="fleek-nav-cta" href={FLEEK_STORE_URL} onClick={closeMenu}>Fleek Store</a>
                    </nav>
                </div>
            </header>

            <main>
                <section className="fleek-hero" aria-labelledby="hero-title">
                    <div className="fleek-shell fleek-hero-grid">
                        <div className="fleek-hero-copy">
                            <h1 id="hero-title" className="sr-only">Fleek Authority — transforme seu estilo profissional</h1>
                            <img
                                className="fleek-title-art"
                                src="/landing/fleek-title.avif"
                                alt="Fleek Authority — transforme seu estilo profissional e torne-se a sua melhor versão"
                            />
                            <Link className="fleek-outline-button" to="/login">
                                Transforme seu estilo profissional
                                <span aria-hidden="true">↗</span>
                            </Link>
                        </div>
                        <div className="fleek-hero-portrait-wrap">
                            <div className="fleek-hero-halo" />
                            <img
                                className="fleek-hero-portrait"
                                src="/landing/john-styles-hero.avif"
                                alt="John Styles, estilista pessoal para moda masculina"
                            />
                        </div>
                    </div>
                </section>

                <section className="fleek-services" id="empresas" aria-labelledby="services-title">
                    <div className="fleek-shell">
                        <header className="fleek-section-heading fleek-section-heading--dark">
                            <h2 id="services-title">Nunca foi tão fácil elevar o seu estilo profissional</h2>
                            <p>Como a Fleek te ajuda a transformar o seu estilo:</p>
                        </header>
                        <div className="fleek-card-grid">
                            {serviceCards.map((card) => (
                                <article className="fleek-service-card" key={card.title}>
                                    <img src={card.image} alt={card.alt} />
                                    <div className="fleek-service-body">
                                        <h3>{card.title}</h3>
                                        <p>{card.description}</p>
                                        {card.href.startsWith('/') ? (
                                            <Link className="fleek-light-button" to={card.href}>{card.action}</Link>
                                        ) : (
                                            <a className="fleek-light-button" href={card.href}>{card.action}</a>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="fleek-articles" id="artigos" aria-labelledby="articles-title">
                    <div className="fleek-shell">
                        <header className="fleek-section-heading fleek-section-heading--light">
                            <h2 id="articles-title">Artigos e conteúdos exclusivos</h2>
                            <p>Fleek Posts em destaque</p>
                            <Link className="fleek-all-articles" to="/blog">Ver todos os artigos <span aria-hidden="true">↗</span></Link>
                        </header>
                        <div className="fleek-article-carousel-head">
                            <span>{articles.length ? `${articlePage + 1} / ${articlePages}` : 'Sem destaques'}</span>
                            {articlePages > 1 && <div><button type="button" aria-label="Destaques anteriores" onClick={() => setArticlePage((page) => (page - 1 + articlePages) % articlePages)}>←</button><button type="button" aria-label="Próximos destaques" onClick={() => setArticlePage((page) => (page + 1) % articlePages)}>→</button></div>}
                        </div>
                        <div className="fleek-article-grid" aria-live="polite">
                            {visibleArticles.map((article, index) => (
                                <article className="fleek-article-card" key={article.title}>
                                    <div className="fleek-article-image-wrap">
                                        <img
                                            src={article.coverImage || '/og.jpg'}
                                            alt={article.coverAlt || ''}
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = '/og.jpg';
                                            }}
                                        />
                                        <span>{String((articlePage * 3) + index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h3><Link to={`/blog/${article.slug}`}>{article.title}</Link></h3>
                                    <Link to={`/blog/${article.slug}`} aria-label={`Ler artigo: ${article.title}`}>
                                        Ler artigo <span aria-hidden="true">↗</span>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="fleek-voices" aria-labelledby="voices-title">
                    <div className="fleek-shell">
                        <header className="fleek-section-heading fleek-section-heading--light">
                            <h2 id="voices-title">Vozes do estilo</h2>
                            <p>Veja como nossas soluções de estilo e IA transformaram vidas.</p>
                        </header>
                        <div className="fleek-testimonial">
                            <div className="fleek-testimonial-photo">
                                <img src="/landing/testimonial-client-v2.webp" alt="Profissional vestindo alfaiataria em tons de marrom e marfim" loading="lazy" />
                            </div>
                            <blockquote>
                                <span className="fleek-quote-mark" aria-hidden="true">“</span>
                                <p>
                                    A linha de roupas da Fleek Authority redefiniu minha percepção de estilo profissional. O personal stylist de IA cria looks alinhados às tendências, ao meu gosto e às necessidades da minha carreira. Assino com confiança, sabendo que sempre saio com qualidade e elegância, economizando inúmeras horas de compras.
                                </p>
                                <footer>
                                    <strong>Gabriel Leitão</strong>
                                    <span>Executivo de Design e Inovação</span>
                                </footer>
                            </blockquote>
                        </div>
                    </div>
                </section>

                <section className="fleek-newsletter" id="assinatura" aria-labelledby="newsletter-title">
                    <div className="fleek-shell fleek-newsletter-inner">
                        <div>
                            <span className="fleek-kicker">Fique por dentro</span>
                            <h2 id="newsletter-title">Junte-se ao movimento da Fleek Authority</h2>
                            <p>Eleve o seu estilo sendo sempre o primeiro a saber de novidades e promoções.</p>
                        </div>
                        {subscribed ? (
                            <p className="fleek-subscribe-success" role="status">
                                Abrimos seu app de e-mail com a mensagem pronta — é só enviar para concluir.
                                Se nada abriu, escreva para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                            </p>
                        ) : (
                            <form className="fleek-subscribe-form" onSubmit={handleSubscribe}>
                                <label className="sr-only" htmlFor="fleek-email">Seu melhor e-mail</label>
                                <input
                                    id="fleek-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="yourstyle@fleek.com"
                                    required
                                />
                                <button type="submit">Assinar</button>
                            </form>
                        )}
                    </div>
                </section>
            </main>

            <footer className="fleek-footer" id="contato">
                <div className="fleek-shell fleek-footer-inner">
                    <Brand />
                    <p>Estilo profissional que evolui com você.</p>
                    <div className="fleek-footer-links">
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        <Link to="/privacy">Política de Privacidade</Link>
                    </div>
                    <small>© {new Date().getFullYear()} Fleek Authority</small>
                </div>
            </footer>
        </div>
    );
}
