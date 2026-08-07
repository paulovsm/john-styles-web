import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const serviceCards = [
    {
        image: '/landing/define-seu-estilo.avif',
        alt: 'Defina seu estilo pessoal',
        title: 'Defina o seu estilo pessoal',
        description:
            'Converse com John Styles, nosso personal stylist, entendendo seu contexto e objetivos profissionais para criar o seu guia de estilo personalizado, adaptado às suas necessidades e que te ensina a transformar seu guarda-roupa.',
        action: 'Monte seu estilo',
        href: '/login',
    },
    {
        image: '/landing/renove-guarda-roupa.avif',
        alt: 'Guarda-roupa estiloso de roupas profissionais',
        title: 'Renove seu guarda-roupas',
        description:
            'Compre as peças de roupa da Fleek Authority, com altíssima qualidade e preço justo, para renovar o seu guarda-roupa e transformar seu estilo. Na loja Fleek, selecionamos os melhores itens para elevar seu estilo profissional.',
        action: 'Fleek Store',
        href: '#contato',
    },
    {
        image: '/landing/mantenha-estilo.avif',
        alt: 'Homem elegante se arrumando',
        title: 'Mantenha seu estilo atualizado',
        description:
            'Tenha um guarda-roupa sempre atualizado e sob medida por apenas R$120/mês! Seu estilo evolui com a sua carreira, acompanha as tendências e ainda contribui para uma moda mais sustentável.',
        action: 'Assinatura',
        href: '#assinatura',
    },
];

const articles = [
    {
        image: '/landing/article-1.avif',
        alt: 'Três executivos discutindo estilo e tecnologia',
        title: 'Como três executivos cansados de PowerPoint criaram a IA que vai transformar seu guarda-roupa (e sua imagem profissional)',
    },
    {
        image: '/landing/article-2.avif',
        alt: 'Profissional interagindo com tecnologia de moda',
        title: 'A Revolução no Estilo Profissional Masculino: Como a Fleek Authority Está Mudando as Regras do Jogo',
    },
    {
        image: '/landing/article-3.avif',
        alt: 'Homem de terno usando uma experiência digital de estilo',
        title: 'John Styles: O stylist digital que está revolucionando o estilo profissional masculino',
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

    const closeMenu = () => setMenuOpen(false);

    const handleSubscribe = (event) => {
        event.preventDefault();
        if (!email.trim()) return;
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
                        <a href="#assinatura" onClick={closeMenu}>Assinatura</a>
                        <a href="#empresas" onClick={closeMenu}>Empresas</a>
                        <a href="#contato" onClick={closeMenu}>Contato</a>
                        <a href="#artigos" onClick={closeMenu}>Blog</a>
                        <a className="fleek-nav-cta" href="#contato" onClick={closeMenu}>Fleek Store</a>
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
                        </header>
                        <div className="fleek-article-grid">
                            {articles.map((article, index) => (
                                <article className="fleek-article-card" key={article.title}>
                                    <div className="fleek-article-image-wrap">
                                        <img src={article.image} alt={article.alt} loading="lazy" />
                                        <span>0{index + 1}</span>
                                    </div>
                                    <h3>{article.title}</h3>
                                    <a href="#contato" aria-label={`Ler artigo: ${article.title}`}>
                                        Ler artigo <span aria-hidden="true">↗</span>
                                    </a>
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
                                <img src="/landing/testimonial-model.avif" alt="Cliente Fleek Authority vestindo traje profissional" loading="lazy" />
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
                            <p className="fleek-subscribe-success" role="status">Obrigado! Você entrou para o movimento Fleek.</p>
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
                        <a href="mailto:contato@fleekauthority.com">contato@fleekauthority.com</a>
                        <Link to="/privacy">Política de Privacidade</Link>
                    </div>
                    <small>© {new Date().getFullYear()} Fleek Authority</small>
                </div>
            </footer>
        </div>
    );
}
