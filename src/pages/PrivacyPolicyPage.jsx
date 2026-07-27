import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

/**
 * Public privacy policy (hosted on the app's own domain) — required for the
 * Google OAuth verification. Includes the Google API Services User Data Policy
 * "Limited Use" disclosure for the Calendar scope.
 */
export default function PrivacyPolicyPage() {
    const updated = 'Julho de 2026';
    return (
        <div className="min-h-screen flex flex-col bg-white-off">
            <header className="border-b border-grey-light bg-white-pure">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="text-xl font-serif font-bold text-brand-navy">John Styles</Link>
                    <Link to="/" className="text-sm text-brand-navy hover:underline">Início</Link>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
                <article className="prose dark:prose-invert max-w-none prose-headings:font-serif">
                    <h1>Política de Privacidade — John Styles</h1>
                    <p className="text-grey-medium">Última atualização: {updated}</p>

                    <p>
                        O John Styles é um assistente pessoal de moda que ajuda você a organizar seu
                        guarda-roupa, receber recomendações de estilo e visualizar looks (prova virtual).
                        Esta política explica quais dados coletamos, como os usamos e seus direitos.
                    </p>

                    <h2>Dados que coletamos</h2>
                    <ul>
                        <li><strong>Conta</strong>: nome, e-mail e foto do provedor de login (Google/Facebook/Apple).</li>
                        <li><strong>Perfil de estilo</strong>: preferências informadas no onboarding (cores, ocasiões, tipo de corpo, etc.).</li>
                        <li><strong>Guarda-roupa e fotos</strong>: imagens de peças e a foto que você usa na prova virtual.</li>
                        <li><strong>Conversas</strong>: mensagens trocadas com o assistente.</li>
                        <li><strong>Google Agenda (opcional)</strong>: se você conectar, lemos apenas os eventos do dia
                            para sugerir um look adequado. Usamos o escopo somente-leitura
                            (<code>calendar.readonly</code>) e não modificamos sua agenda.</li>
                    </ul>

                    <h2>Como usamos</h2>
                    <ul>
                        <li>Fornecer as funcionalidades do app (recomendações, prova virtual, análise de peças).</li>
                        <li>Personalizar sugestões com base no seu perfil, guarda-roupa, clima e agenda.</li>
                        <li>Processamento por IA (Google Gemini) para análise de imagens e recomendações.</li>
                    </ul>

                    <h2>Uso Limitado dos dados do Google (Limited Use)</h2>
                    <p>
                        O uso e a transferência, pelo John Styles, de informações recebidas das APIs do Google
                        obedecem à <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política
                        de Dados do Usuário dos Serviços de API do Google</a>, incluindo os requisitos de Uso Limitado.
                        Os dados da sua Google Agenda são usados exclusivamente para gerar a sugestão de look do dia,
                        não são vendidos, não são usados para publicidade e não são compartilhados com terceiros
                        além dos provedores estritamente necessários para operar o recurso.
                    </p>

                    <h2>Compartilhamento com terceiros</h2>
                    <ul>
                        <li><strong>Google Firebase</strong>: autenticação, banco de dados e armazenamento.</li>
                        <li><strong>Google Gemini</strong>: processamento de IA de imagens e texto.</li>
                        <li><strong>n8n</strong>: orquestração do assistente de chat.</li>
                    </ul>
                    <p>Não vendemos seus dados.</p>

                    <h2>Retenção e exclusão</h2>
                    <p>
                        Mantemos seus dados enquanto sua conta existir. Você pode remover peças, fotos e looks a
                        qualquer momento no app. Para excluir sua conta e dados associados (incluindo a conexão com
                        a Google Agenda), entre em contato pelo e-mail abaixo. Você também pode revogar o acesso à
                        agenda em <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.
                    </p>

                    <h2>Segurança</h2>
                    <p>
                        Chaves e credenciais sensíveis ficam apenas no servidor; tokens de acesso à agenda são
                        armazenados de forma restrita e não expostos ao navegador.
                    </p>

                    <h2>Contato</h2>
                    <p>Dúvidas sobre esta política: <strong>paulo.victor.moura@accenture.com</strong>.</p>
                </article>
            </main>

            <Footer />
        </div>
    );
}
