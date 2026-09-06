import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowOutward,
    ChatBubbleOutline,
    Checkroom,
    Close,
    Menu,
    PhotoCamera,
} from '@mui/icons-material';
import LanguageSelector from '../components/common/LanguageSelector';
import useDocumentMeta from '../hooks/useDocumentMeta';
import './UniversalLandingPage.css';

const FLEEK_STORE_URL = 'https://loja.fleekauthority.com';
const OCCASIONS = ['work', 'everyday', 'date', 'celebration', 'travel', 'wellbeing'];
const CAPABILITIES = [
    { id: 'wardrobe', Icon: Checkroom },
    { id: 'conversation', Icon: ChatBubbleOutline },
    { id: 'tryOn', Icon: PhotoCamera },
];

export default function UniversalLandingPage() {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);

    useDocumentMeta({
        title: t('experienceV2.meta.title'),
        description: t('experienceV2.meta.description'),
        image: '/experience-v2/universal-hero-v2.webp',
        canonical: '/teste-novo-app',
    });

    const closeMenu = () => setMenuOpen(false);
    return (
        <div className="universal-landing" id="inicio">
            <header className="universal-header">
                <div className="universal-shell universal-nav">
                    <Link className="universal-brand" to="/" aria-label={t('common.homeLabel')}>
                        <img src="/FA_Icon_White.avif" alt="" />
                        <span>Fleek Authority</span>
                        <small>{t('experienceV2.previewBadge')}</small>
                    </Link>

                    <button
                        className="universal-menu-button"
                        type="button"
                        aria-label={menuOpen ? t('common.closeMainMenu') : t('common.openMainMenu')}
                        aria-expanded={menuOpen}
                        aria-controls="universal-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <Close /> : <Menu />}
                    </button>

                    <nav
                        id="universal-navigation"
                        className={`universal-nav-links${menuOpen ? ' is-open' : ''}`}
                        aria-label={t('experienceV2.nav.label')}
                    >
                        <a href="#como-funciona" onClick={closeMenu}>{t('experienceV2.nav.how')}</a>
                        <a href="#ocasioes" onClick={closeMenu}>{t('experienceV2.nav.occasions')}</a>
                        <a href="#solucoes" onClick={closeMenu}>{t('experienceV2.nav.solutions')}</a>
                        <LanguageSelector />
                        <Link className="universal-nav-login" to="/login" onClick={closeMenu}>
                            {t('auth.login')}
                        </Link>
                    </nav>
                </div>
            </header>

            <main id="main-content" tabIndex={-1}>
                <section className="universal-hero" aria-labelledby="universal-hero-title">
                    <div className="universal-shell universal-hero-grid">
                        <figure className="universal-hero-media">
                            <img
                                src="/experience-v2/universal-hero-v2.webp"
                                alt={t('experienceV2.hero.imageAlt')}
                                width="1120"
                                height="1400"
                                fetchPriority="high"
                            />
                            <figcaption className="universal-john-card">
                                <img
                                    src="/JohnStyles.jpg"
                                    alt={t('experienceV2.john.avatarAlt')}
                                    width="320"
                                    height="320"
                                />
                                <span>
                                    <strong>John Styles</strong>
                                    <small>{t('experienceV2.john.role')}</small>
                                    <p>{t('experienceV2.hero.imageCaption')}</p>
                                </span>
                            </figcaption>
                        </figure>

                        <div className="universal-hero-copy">
                            <span className="universal-kicker">{t('experienceV2.hero.kicker')}</span>
                            <h1 id="universal-hero-title">{t('experienceV2.hero.title')}</h1>
                            <p>{t('experienceV2.hero.description')}</p>
                            <div className="universal-hero-actions">
                                <Link className="universal-button universal-button--primary" to="/login">
                                    {t('experienceV2.hero.cta')} <ArrowOutward aria-hidden="true" />
                                </Link>
                                <a className="universal-button universal-button--secondary" href="#como-funciona">
                                    {t('experienceV2.hero.secondary')} <span aria-hidden="true">↓</span>
                                </a>
                            </div>
                            <p className="universal-trust-line">{t('experienceV2.hero.trustLine')}</p>
                            <p className="universal-pilot-note">{t('experienceV2.hero.pilotNote')}</p>
                        </div>

                    </div>
                </section>

                <section className="universal-principle" aria-label={t('experienceV2.principle.label')}>
                    <div className="universal-shell">
                        <p>{t('experienceV2.principle.text')}</p>
                    </div>
                </section>

                <section className="universal-how" id="como-funciona" aria-labelledby="universal-how-title">
                    <div className="universal-shell">
                        <header className="universal-section-heading">
                            <span className="universal-kicker">{t('experienceV2.how.kicker')}</span>
                            <h2 id="universal-how-title">{t('experienceV2.how.title')}</h2>
                            <p>{t('experienceV2.how.description')}</p>
                        </header>

                        <div className="universal-capability-grid">
                            {CAPABILITIES.map(({ id, Icon }, index) => (
                                <article key={id}>
                                    <div className="universal-capability-icon" aria-hidden="true">
                                        {React.createElement(Icon)}
                                    </div>
                                    <span>0{index + 1}</span>
                                    <h3>{t(`experienceV2.how.cards.${id}.title`)}</h3>
                                    <p>{t(`experienceV2.how.cards.${id}.description`)}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="universal-occasions" id="ocasioes" aria-labelledby="universal-occasions-title">
                    <div className="universal-shell universal-occasions-grid">
                        <div className="universal-occasions-media">
                            <img
                                src="/experience-v2/universal-occasions.webp"
                                alt={t('experienceV2.occasions.imageAlt')}
                                width="1536"
                                height="1024"
                                loading="lazy"
                            />
                        </div>
                        <div className="universal-occasions-copy">
                            <span className="universal-kicker">{t('experienceV2.occasions.kicker')}</span>
                            <h2 id="universal-occasions-title">{t('experienceV2.occasions.title')}</h2>
                            <p>{t('experienceV2.occasions.description')}</p>
                            <ul>
                                {OCCASIONS.map((occasion) => (
                                    <li key={occasion}>{t(`experienceV2.occasions.items.${occasion}`)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="universal-solutions" id="solucoes" aria-labelledby="universal-solutions-title">
                    <div className="universal-shell">
                        <header className="universal-section-heading">
                            <span className="universal-kicker">{t('experienceV2.solutions.kicker')}</span>
                            <h2 id="universal-solutions-title">{t('experienceV2.solutions.title')}</h2>
                            <p>{t('experienceV2.solutions.description')}</p>
                        </header>

                        <div className="universal-solution-grid">
                            <article>
                                <span>{t('experienceV2.solutions.conceptBadge')}</span>
                                <h3>{t('experienceV2.solutions.store.title')}</h3>
                                <p>{t('experienceV2.solutions.store.description')}</p>
                                <a href={FLEEK_STORE_URL}>
                                    {t('experienceV2.solutions.store.action')} <ArrowOutward aria-hidden="true" />
                                </a>
                            </article>
                            <article>
                                <span>{t('experienceV2.solutions.conceptBadge')}</span>
                                <h3>{t('experienceV2.solutions.subscription.title')}</h3>
                                <p>{t('experienceV2.solutions.subscription.description')}</p>
                                <Link to="/assinatura">
                                    {t('experienceV2.solutions.subscription.action')} <ArrowOutward aria-hidden="true" />
                                </Link>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="universal-final-cta" aria-labelledby="universal-final-title">
                    <div className="universal-shell universal-final-inner">
                        <span className="universal-kicker">{t('experienceV2.final.kicker')}</span>
                        <h2 id="universal-final-title">{t('experienceV2.final.title')}</h2>
                        <p>{t('experienceV2.final.description')}</p>
                        <Link className="universal-button universal-button--light" to="/login">
                            {t('experienceV2.final.cta')} <ArrowOutward aria-hidden="true" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="universal-footer">
                <div className="universal-shell">
                    <div>
                        <strong>Fleek Authority</strong>
                        <p>{t('experienceV2.footer.tagline')}</p>
                    </div>
                    <div>
                        <Link to="/privacy">{t('footer.privacy')}</Link>
                        <small>© {new Date().getFullYear()} Fleek Authority</small>
                    </div>
                </div>
            </footer>
        </div>
    );
}
