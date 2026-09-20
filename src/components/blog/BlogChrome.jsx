import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export function BlogHeader() {
    return (
        <header className="blog-header">
            <div className="blog-shell blog-header__inner">
                <Link className="blog-brand" to="/" aria-label="Fleek Authority — início">
                    <img src="/FA_Icon_White.avif" alt="" />
                    <span>Fleek Authority</span>
                </Link>
                <nav aria-label="Navegação do blog">
                    <Link to="/">Início</Link>
                    <NavLink to="/blog" end>Artigos</NavLink>
                    <Link to="/login">John Styles</Link>
                    <Link className="blog-header__cta" to="/login">Entrar</Link>
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
                    <p>O lugar para transformar o seu estilo.</p>
                </div>
                <div className="blog-footer__links">
                    <Link to="/">Início</Link>
                    <Link to="/empresas">Para empresas</Link>
                    <Link to="/assinatura">Assinatura Fleek</Link>
                    <Link to="/privacy">Política de Privacidade</Link>
                </div>
                <small>© {new Date().getFullYear()} Fleek Authority</small>
            </div>
        </footer>
    );
}
