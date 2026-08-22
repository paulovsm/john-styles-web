import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { submitBusinessContact } from '../services/api/businessContactService';
import './BusinessPage.css';

const INITIAL_FORM = {
    company: '',
    email: '',
    phone: '',
    projectType: 'Uniformes para equipe',
    message: '',
    website: '',
};

const materials = [
    {
        number: '01',
        title: 'Algodão Pima',
        description: 'Fibra longa, toque macio e resistência para peças que mantêm uma aparência refinada mesmo com uso frequente.',
    },
    {
        number: '02',
        title: 'Algodão egípcio',
        description: 'Conforto superior e acabamento sofisticado para experiências de marca em que cada detalhe importa.',
    },
    {
        number: '03',
        title: 'Fibras tecnológicas',
        description: 'Materiais selecionados para oferecer respirabilidade, mobilidade e praticidade na rotina da sua equipe.',
    },
];

const solutions = [
    ['Uniformes corporativos', 'Peças que traduzem a identidade da empresa sem abrir mão do conforto e do estilo de quem veste.'],
    ['Eventos e ativações', 'Coleções especiais para encontros, lançamentos, experiências de marca e momentos que precisam ser lembrados.'],
    ['Projetos exclusivos', 'Modelagens, combinações e detalhes desenvolvidos de acordo com a necessidade específica do seu negócio.'],
];

function BusinessBrand() {
    return (
        <Link className="business-brand" to="/" aria-label="Voltar para a página inicial da Fleek Authority">
            <img src="/FA_Icon_White.avif" alt="" />
            <span>Fleek Authority</span>
        </Link>
    );
}

export default function BusinessPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [formState, setFormState] = useState({ status: 'idle', message: '' });

    useDocumentMeta({
        title: 'Fleek para Empresas | Uniformes e peças customizadas',
        description: 'Uniformes corporativos e peças personalizadas para empresas e eventos, criados com algodão Pima, algodão egípcio e fibras tecnológicas.',
        image: '/landing/service-store-v2.webp',
        canonical: '/empresas',
    });

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormState({ status: 'submitting', message: '' });

        try {
            await submitBusinessContact(form);
            setForm(INITIAL_FORM);
            setFormState({
                status: 'success',
                message: 'Recebemos sua solicitação. Nossa equipe entrará em contato em breve.',
            });
        } catch (error) {
            setFormState({
                status: 'error',
                message: error.message || 'Não foi possível enviar sua solicitação agora.',
            });
        }
    };

    return (
        <div className="business-page">
            <header className="business-header">
                <div className="business-shell business-nav">
                    <BusinessBrand />
                    <nav aria-label="Navegação da página Empresas">
                        <a href="#materiais">Materiais</a>
                        <a href="#solucoes">Soluções</a>
                        <a href="#processo">Como funciona</a>
                        <a className="business-nav-cta" href="#contato">Solicitar proposta</a>
                    </nav>
                </div>
            </header>

            <main id="main-content" tabIndex={-1}>
                <section className="business-hero">
                    <div className="business-shell business-hero-grid">
                        <div className="business-hero-copy">
                            <span className="business-kicker">Fleek para empresas</span>
                            <h1>Sua marca vestida com a qualidade que ela representa.</h1>
                            <p>
                                Criamos uniformes e peças customizadas para empresas, equipes e eventos com matérias-primas superiores,
                                design intencional e conforto para o uso real.
                            </p>
                            <div className="business-hero-actions">
                                <a className="business-button business-button--light" href="#contato">Criar um projeto</a>
                                <a className="business-text-link" href="#materiais">Conheça os materiais <span aria-hidden="true">↓</span></a>
                            </div>
                        </div>
                        <div className="business-hero-image">
                            <img
                                src="/landing/service-store-v2.webp"
                                alt="Profissional selecionando uma peça de roupa em um guarda-roupa de alfaiataria"
                            />
                        </div>
                    </div>
                </section>

                <section className="business-intro">
                    <div className="business-shell business-intro-grid">
                        <span className="business-section-label">Além do uniforme</span>
                        <div>
                            <h2>Peças que fortalecem o pertencimento sem apagar a individualidade.</h2>
                            <p>
                                Uma roupa corporativa pode comunicar cultura, cuidado e excelência. Nosso trabalho começa entendendo
                                como sua marca quer ser percebida e termina em peças que as pessoas realmente querem vestir.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="business-materials" id="materiais" aria-labelledby="materials-title">
                    <div className="business-shell">
                        <header className="business-section-heading">
                            <span className="business-section-label">Qualidade desde a fibra</span>
                            <h2 id="materials-title">Materiais escolhidos para elevar a experiência.</h2>
                        </header>
                        <div className="business-material-grid">
                            {materials.map((material) => (
                                <article key={material.title}>
                                    <span>{material.number}</span>
                                    <h3>{material.title}</h3>
                                    <p>{material.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="business-solutions" id="solucoes" aria-labelledby="solutions-title">
                    <div className="business-shell">
                        <header className="business-section-heading business-section-heading--dark">
                            <span className="business-section-label">Feito para o seu contexto</span>
                            <h2 id="solutions-title">Da rotina da equipe ao evento que marca uma nova fase.</h2>
                        </header>
                        <div className="business-solution-list">
                            {solutions.map(([title, description], index) => (
                                <article key={title}>
                                    <span>{String(index + 1).padStart(2, '0')}</span>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="business-process" id="processo" aria-labelledby="process-title">
                    <div className="business-shell">
                        <header className="business-section-heading">
                            <span className="business-section-label">Como funciona</span>
                            <h2 id="process-title">Um processo próximo, do briefing à entrega.</h2>
                        </header>
                        <ol>
                            <li><strong>Briefing</strong><span>Entendemos a marca, o público, a ocasião, as quantidades e a rotina de uso.</span></li>
                            <li><strong>Criação</strong><span>Definimos materiais, modelagens, cores e possibilidades de personalização.</span></li>
                            <li><strong>Validação</strong><span>Alinhamos os detalhes da proposta antes de seguir para a produção.</span></li>
                            <li><strong>Produção</strong><span>Acompanhamos a execução para entregar consistência em cada peça.</span></li>
                        </ol>
                    </div>
                </section>

                <section className="business-contact" id="contato" aria-labelledby="contact-title">
                    <div className="business-shell business-contact-grid">
                        <div className="business-contact-copy">
                            <span className="business-section-label">Vamos criar juntos</span>
                            <h2 id="contact-title">Conte um pouco sobre o seu projeto.</h2>
                            <p>Compartilhe seus dados e nossa equipe entrará em contato para entender a necessidade da sua empresa.</p>
                            <a href="mailto:contato@fleekauthority.com">contato@fleekauthority.com</a>
                        </div>

                        <form className="business-form" onSubmit={handleSubmit}>
                            <label>
                                Empresa
                                <input name="company" value={form.company} onChange={updateField} autoComplete="organization" maxLength="120" required />
                            </label>
                            <div className="business-form-row">
                                <label>
                                    E-mail
                                    <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" maxLength="180" required />
                                </label>
                                <label>
                                    Telefone
                                    <input name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" maxLength="40" required />
                                </label>
                            </div>
                            <label>
                                Tipo de projeto
                                <select name="projectType" value={form.projectType} onChange={updateField}>
                                    <option>Uniformes para equipe</option>
                                    <option>Roupas para evento</option>
                                    <option>Peças customizadas</option>
                                    <option>Outro projeto</option>
                                </select>
                            </label>
                            <label>
                                O que você gostaria de criar? <span>(opcional)</span>
                                <textarea name="message" value={form.message} onChange={updateField} rows="5" maxLength="1200" />
                            </label>
                            <label className="business-honeypot" aria-hidden="true">
                                Website
                                <input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" />
                            </label>
                            <button type="submit" disabled={formState.status === 'submitting'}>
                                {formState.status === 'submitting' ? 'Enviando...' : 'Solicitar contato'}
                            </button>
                            <p className={`business-form-status is-${formState.status}`} role="status" aria-live="polite">
                                {formState.message}
                            </p>
                            <small>
                                Ao enviar, você autoriza a Fleek Authority a utilizar estes dados para responder à sua solicitação.
                                Consulte nossa <Link to="/privacy">Política de Privacidade</Link>.
                            </small>
                        </form>
                    </div>
                </section>
            </main>

            <footer className="business-footer">
                <div className="business-shell">
                    <BusinessBrand />
                    <p>Vista a cultura da sua empresa.</p>
                    <Link to="/">Voltar para a página inicial</Link>
                </div>
            </footer>
        </div>
    );
}
