import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { submitBusinessContact } from '../services/api/businessContactService';
import './SubscriptionPage.css';

const INITIAL_FORM = {
    contactType: 'subscription',
    name: '',
    email: '',
    phone: '',
    projectType: 'Quero conhecer a assinatura',
    message: '',
    website: '',
};

const shipmentExamples = [
    {
        number: '01',
        title: 'Essenciais elevados',
        items: ['Camiseta premium', 'Polo versátil', 'Camisa de fibra longa'],
        description: 'Uma base de alta qualidade para multiplicar as combinações que você já possui.',
    },
    {
        number: '02',
        title: 'Smart casual',
        items: ['Overshirt', 'Calça de corte preciso', 'Malha leve'],
        description: 'Peças para transitar entre reuniões, viagens e momentos menos formais.',
    },
    {
        number: '03',
        title: 'Presença profissional',
        items: ['Camisa refinada', 'Polo estruturada', 'Peça complementar'],
        description: 'Uma renovação orientada à imagem que você deseja construir na próxima fase da carreira.',
    },
];

const steps = [
    ['Conhecemos seu estilo', 'Entendemos rotina, preferências, medidas e objetivos para orientar cada seleção.'],
    ['Montamos sua renovação', 'A cada três meses, preparamos uma seleção coerente com o seu momento e guarda-roupa.'],
    ['Você usa e decide', 'As novas peças entram na sua rotina enquanto você identifica o que ainda faz sentido manter.'],
    ['Você devolve e recebe créditos', 'As peças que não quer mais voltam para a Fleek, são avaliadas e podem gerar créditos ou descontos.'],
];

function SubscriptionBrand() {
    return (
        <Link className="subscription-brand" to="/" aria-label="Voltar para a página inicial da Fleek Authority">
            <img src="/FA_Icon_White.avif" alt="" />
            <span>Fleek Authority</span>
        </Link>
    );
}

export default function SubscriptionPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [formState, setFormState] = useState({ status: 'idle', message: '' });

    useDocumentMeta({
        title: 'Assinatura Fleek | Renove seu guarda-roupa a cada 3 meses',
        description: 'Receba uma seleção de roupas a cada três meses e transforme peças que não usa mais em créditos ou descontos. Assinatura por R$ 199 mensais.',
        image: '/landing/service-subscription-v2.webp',
        canonical: '/assinatura',
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
                message: 'Recebemos seu interesse. Nossa equipe entrará em contato para apresentar os próximos passos.',
            });
        } catch (error) {
            setFormState({
                status: 'error',
                message: error.message || 'Não foi possível enviar sua solicitação agora.',
            });
        }
    };

    return (
        <div className="subscription-page">
            <header className="subscription-header">
                <div className="subscription-shell subscription-nav">
                    <SubscriptionBrand />
                    <nav aria-label="Navegação da página Assinatura">
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#envios">Exemplos de envios</a>
                        <a href="#devolucao">Devoluções</a>
                        <a className="subscription-nav-cta" href="#contato">Quero conhecer</a>
                    </nav>
                </div>
            </header>

            <main id="main-content" tabIndex={-1}>
                <section className="subscription-hero">
                    <div className="subscription-shell subscription-hero-grid">
                        <div className="subscription-hero-copy">
                            <span className="subscription-kicker">Assinatura Fleek</span>
                            <h1>Seu estilo evolui. Seu guarda-roupa também.</h1>
                            <p>
                                A cada três meses, você recebe uma nova seleção de peças para renovar seu estilo com intenção.
                                O que deixou de fazer sentido pode voltar para a Fleek e se transformar em créditos ou descontos.
                            </p>
                            <div className="subscription-price">
                                <div><strong>R$ 199</strong><span>por mês</span></div>
                                <p>Seleções trimestrais<br />e renovação contínua</p>
                            </div>
                            <div className="subscription-hero-actions">
                                <a className="subscription-button subscription-button--light" href="#contato">Tenho interesse</a>
                                <a className="subscription-text-link" href="#como-funciona">Entenda o serviço <span aria-hidden="true">↓</span></a>
                            </div>
                        </div>
                        <div className="subscription-hero-image">
                            <img
                                src="/landing/service-subscription-v2.webp"
                                alt="Profissional ajustando uma peça de alfaiataria diante do espelho"
                            />
                        </div>
                    </div>
                </section>

                <section className="subscription-manifesto">
                    <div className="subscription-shell subscription-manifesto-grid">
                        <span className="subscription-section-label">Menos acúmulo. Mais intenção.</span>
                        <div>
                            <h2>Renovar não precisa significar começar tudo de novo.</h2>
                            <p>
                                A assinatura Fleek cria um ciclo mais inteligente: novas peças entram com propósito, seu guarda-roupa
                                acompanha suas mudanças e aquilo que você não usa mais ganha uma nova possibilidade.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="subscription-steps" id="como-funciona" aria-labelledby="subscription-steps-title">
                    <div className="subscription-shell">
                        <header className="subscription-section-heading">
                            <span className="subscription-section-label">Como funciona</span>
                            <h2 id="subscription-steps-title">Um ciclo simples para manter seu estilo em movimento.</h2>
                        </header>
                        <ol>
                            {steps.map(([title, description]) => (
                                <li key={title}>
                                    <strong>{title}</strong>
                                    <span>{description}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="subscription-shipments" id="envios" aria-labelledby="shipments-title">
                    <div className="subscription-shell">
                        <header className="subscription-section-heading subscription-section-heading--dark">
                            <span className="subscription-section-label">O que pode chegar</span>
                            <h2 id="shipments-title">Seleções pensadas para diferentes momentos do seu estilo.</h2>
                            <p>Exemplos ilustrativos. A composição de cada envio será definida de acordo com seu perfil e a curadoria disponível.</p>
                        </header>
                        <div className="subscription-shipment-grid">
                            {shipmentExamples.map((shipment) => (
                                <article key={shipment.title}>
                                    <span>{shipment.number}</span>
                                    <h3>{shipment.title}</h3>
                                    <ul>
                                        {shipment.items.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                    <p>{shipment.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="subscription-return" id="devolucao" aria-labelledby="return-title">
                    <div className="subscription-shell subscription-return-grid">
                        <div>
                            <span className="subscription-section-label">O ciclo continua</span>
                            <h2 id="return-title">Devolva o que não usa. Abra espaço para o que vem a seguir.</h2>
                            <p>
                                Você poderá enviar para a Fleek as peças que não precisa ou não quer mais. Depois da avaliação,
                                as peças elegíveis podem gerar créditos ou descontos na mensalidade.
                            </p>
                            <small>Os valores e a elegibilidade dependem do tipo e do estado de conservação de cada peça.</small>
                        </div>
                        <ol>
                            <li><span>01</span><div><strong>Solicite a devolução</strong><p>Entre em contato e informe quais peças deseja enviar.</p></div></li>
                            <li><span>02</span><div><strong>Receba as orientações</strong><p>Nossa equipe explica como preparar e encaminhar as peças.</p></div></li>
                            <li><span>03</span><div><strong>Acompanhamos a avaliação</strong><p>Conferimos as condições e comunicamos o crédito ou desconto aplicável.</p></div></li>
                        </ol>
                    </div>
                </section>

                <section className="subscription-value" aria-labelledby="value-title">
                    <div className="subscription-shell subscription-value-grid">
                        <div>
                            <span className="subscription-section-label">Uma assinatura, quatro benefícios</span>
                            <h2 id="value-title">Seu guarda-roupa deixa de ser estático e passa a acompanhar você.</h2>
                        </div>
                        <ul>
                            <li>Renovação trimestral orientada por estilo</li>
                            <li>Peças selecionadas para combinar com sua rotina</li>
                            <li>Possibilidade de créditos pelas devoluções</li>
                            <li>Uma relação mais consciente com o consumo</li>
                        </ul>
                    </div>
                </section>

                <section className="subscription-contact" id="contato" aria-labelledby="subscription-contact-title">
                    <div className="subscription-shell subscription-contact-grid">
                        <div className="subscription-contact-copy">
                            <span className="subscription-section-label">Faça parte do próximo ciclo</span>
                            <h2 id="subscription-contact-title">Quer conhecer a assinatura Fleek?</h2>
                            <p>
                                Deixe seus dados e nossa equipe entrará em contato para explicar o serviço e entender o que você busca para o seu estilo.
                            </p>
                            <div className="subscription-contact-price"><strong>R$ 199</strong><span>/ mês</span></div>
                            <a href="mailto:contato@fleekauthority.com">contato@fleekauthority.com</a>
                        </div>

                        <form className="subscription-form" onSubmit={handleSubmit}>
                            <label>
                                Nome
                                <input name="name" value={form.name} onChange={updateField} autoComplete="name" maxLength="120" required />
                            </label>
                            <div className="subscription-form-row">
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
                                Seu interesse
                                <select name="projectType" value={form.projectType} onChange={updateField}>
                                    <option>Quero conhecer a assinatura</option>
                                    <option>Quero entrar para a próxima seleção</option>
                                    <option>Tenho dúvidas sobre as devoluções</option>
                                    <option>Outro assunto</option>
                                </select>
                            </label>
                            <label>
                                O que você busca renovar? <span>(opcional)</span>
                                <textarea name="message" value={form.message} onChange={updateField} rows="5" maxLength="1200" />
                            </label>
                            <label className="subscription-honeypot" aria-hidden="true">
                                Website
                                <input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" />
                            </label>
                            <button type="submit" disabled={formState.status === 'submitting'}>
                                {formState.status === 'submitting' ? 'Enviando...' : 'Quero conhecer a assinatura'}
                            </button>
                            <p className={`subscription-form-status is-${formState.status}`} role="status" aria-live="polite">
                                {formState.message}
                            </p>
                            <small>
                                Este formulário registra seu interesse e não realiza uma cobrança. Ao enviar, você autoriza a Fleek Authority
                                a utilizar estes dados para responder à solicitação. Consulte nossa <Link to="/privacy">Política de Privacidade</Link>.
                            </small>
                        </form>
                    </div>
                </section>
            </main>

            <footer className="subscription-footer">
                <div className="subscription-shell">
                    <SubscriptionBrand />
                    <p>Renove seu estilo com intenção.</p>
                    <Link to="/">Voltar para a página inicial</Link>
                </div>
            </footer>
        </div>
    );
}
