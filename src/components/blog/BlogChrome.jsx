import React from 'react';
import { Link } from 'react-router-dom';

export function BlogHeader() {
    return (
        <header className="blog-header">
            <div className="blog-shell blog-header__inner">
                <Link className="blog-brand" to="/" aria-label="Fleek Authority — início">
                    <img src="/FA_Icon_White.avif" alt="" />
                    <span>Fleek Authority</span>
                </Link>
                <nav aria-label="Navegação do blog">
                    <Link to="/blog">Artigos</Link>
                    <Link to="/login">John Styles</Link>
                    <Link className="blog-header__cta" to="/login">Transforme seu estilo</Link>
                </nav>
            </div>
        </header>
    );
}

export function BlogFooter() {
    return (
        <footer className="blog-footer">
            <div className="blog-shell blog-footer__inner">
                <div>
                    <strong>Fleek Authority</strong>
                    <p>Estilo profissional que evolui com você.</p>
                </div>
                <div className="blog-footer__links">
                    <a href="mailto:contato@fleekauthority.com">contato@fleekauthority.com</a>
                    <Link to="/privacy">Política de Privacidade</Link>
                </div>
                <small>© {new Date().getFullYear()} Fleek Authority</small>
            </div>
        </footer>
    );
}

export function formatPostDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}
