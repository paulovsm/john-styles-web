# Revisão de SEO, AIO e GEO — Landing e Fleek Journal

Data da revisão: 20 de setembro de 2026  
Escopo: página inicial, índice do blog, páginas de artigo, CMS, sitemap, metadados e rastreabilidade pública. Planejamento editorial e produção de conteúdo ficam fora deste branch.

## 1. Conclusão executiva

A fundação técnica do blog já era melhor do que a interface sugeria: as rotas públicas possuem renderização no servidor na Vercel, canonical, sitemap dinâmico e dados estruturados básicos. O principal problema foi de integração: a nova Home manteve apenas um link no rodapé, o blog continuou com o visual anterior e a relação semântica entre marca, site, blog e artigos era incompleta nas navegações feitas pelo React.

Este branch corrige essa desconexão. O Fleek Journal volta a ser um bloco editorial da Home, o blog converge para o design system monocromático e a camada de descoberta passa a descrever de forma consistente `Organization`, `WebSite`, `WebPage`, `Blog`, `BlogPosting` e breadcrumbs.

AIO e GEO não substituem SEO. O Google declara que não existe schema especial, arquivo de IA obrigatório ou requisito adicional para AI Overviews e AI Mode; conteúdo indexável, útil, original, textual e bem conectado continua sendo a base. A prioridade adotada foi melhorar esses fundamentos e a clareza das entidades, sem adicionar marcação especulativa.

## 2. Arquitetura recomendada

```text
Home — proposta de valor e entidade Fleek Authority
  └── Fleek Journal — repertório e clusters editoriais
       └── Artigo — resposta aprofundada, autoria, data e contexto
            └── CTA — aplicar a orientação no guarda-roupa com John Styles
```

Essa arquitetura distribui papéis claros:

- **Fleek Authority:** marca, ambiente e curadoria.
- **Fleek Journal:** fonte editorial sobre estilo para a vida real.
- **John Styles:** expert digital que transforma orientação em escolha pessoal.
- **Artigos:** evidência de conhecimento, respostas pesquisáveis e pontos de entrada orgânicos.

## 3. Auditoria técnica

| Área | Situação anterior | Alteração deste branch | Estado |
|---|---|---|---|
| Descoberta do blog na Home | Apenas link no rodapé | Seção editorial, link na navegação e três artigos em destaque | Concluído |
| Design do blog | Paleta e padrões anteriores, raios grandes e sombras | Sistema monocromático, raios 4/8, superfícies planas e mobile first | Concluído |
| Renderização de artigos | SSR já existente | Mantida e alinhada visual e semanticamente | Concluído |
| Canonical | Existia no SSR e no cliente | Preservado e sincronizado com `og:url` | Concluído |
| Open Graph / Twitter | Metadados principais | Incluídos URL, locale e texto alternativo de imagem | Concluído |
| Artigos | `BlogPosting` básico | Autoria, publisher, datas, seção, tags, idioma, entidade e breadcrumb | Concluído |
| Navegação SPA | JSON-LD podia permanecer da página anterior | Metadados e JSON-LD passam a ser substituídos a cada rota | Concluído |
| Sitemap | Home, blog e artigos | Rotas públicas adicionais e imagens dos artigos | Concluído |
| ChatGPT Search | Permitido implicitamente por `User-agent: *` | Intenção explícita para `OAI-SearchBot`, mantendo `/admin` e `/api` fora | Concluído |
| CMS | Gestão de posts, destaques, comentários, analytics e administradores | Fluxos preservados e cobertos por testes de API; nenhuma migração de conteúdo | Concluído |
| Medição | Não evidenciada no repositório | Plano abaixo | Pendente operacional |

## 4. SEO: decisões aplicadas

### 4.1 Rastreamento e indexação

- Landing, blog e artigos permanecem públicos e indexáveis.
- Rotas administrativas e APIs continuam bloqueadas no `robots.txt`.
- A experiência piloto continua com `noindex`; ela não compete com a URL principal.
- O sitemap passa a incluir Home, blog, artigos, Empresas, Assinatura e Privacidade.
- As imagens editoriais passam a ser informadas no sitemap de artigos.

### 4.2 Metadados e canonicals

- Cada página possui título e descrição próprios.
- Canonical e `og:url` apontam para a mesma URL.
- Imagens sociais recebem URL absoluta e texto alternativo.
- Artigos expõem publicação, atualização e autoria nos metadados e no conteúdo visível.
- Artigos inexistentes usam `noindex, follow`.

### 4.3 Dados estruturados

Os grafos usam identificadores estáveis para evitar entidades duplicadas:

- `https://fleekauthority.com/#organization`
- `https://fleekauthority.com/#website`
- `https://fleekauthority.com/blog#blog`
- `https://fleekauthority.com/blog/{slug}#article`

A marcação descreve somente elementos reais e visíveis. Não foram adicionados `FAQPage`, avaliações, preços, pessoas ou credenciais que o conteúdo não comprova.

### 4.4 Links internos e HTML semântico

- A Home volta a apontar contextualmente para artigos.
- Blog e artigos retornam à Home e conduzem à experiência de John.
- O índice usa `BlogPosting`, títulos hierárquicos, datas e descrições visíveis.
- Artigos mantêm Markdown com `h2`, listas e parágrafos, formato adequado para leitura humana e extração de trechos.

## 5. AIO e GEO: o que realmente foi otimizado

Neste documento:

- **AIO** significa otimização para respostas e experiências de busca com IA.
- **GEO** significa tornar conteúdo e entidades mais fáceis de recuperar, compreender e citar por mecanismos generativos.

As melhorias concretas são:

1. **Entidades coerentes:** a Fleek é publisher e marca; John é a solução de styling, sem substituir a marca.
2. **Respostas em texto:** títulos, resumos, subtítulos e explicações permanecem no HTML, não apenas em imagens.
3. **Autoria e atualização:** mecanismos e pessoas conseguem avaliar origem e atualidade.
4. **Passagens citáveis:** artigos são organizados por perguntas ou decisões específicas, com subtítulos descritivos.
5. **Conexão temática:** a Home introduz os artigos e os artigos conectam a orientação geral à aplicação pessoal.
6. **Acesso ao ChatGPT Search:** `OAI-SearchBot` pode ler conteúdo público. Isso é independente de `GPTBot`, que controla possível uso para treinamento.
7. **Sem arquivos artificiais:** não foi criado `llms.txt`; o Google afirma que arquivos ou marcação especiais de IA não são necessários para aparecer em seus recursos generativos.

## 6. Medição após publicação

### Primeiros 7 dias

1. Validar Home, `/blog` e ao menos dois artigos no Google Rich Results Test.
2. Inspecionar as URLs no Google Search Console e solicitar recrawl.
3. Enviar `https://fleekauthority.com/sitemap.xml` ao Google Search Console e Bing Webmaster Tools.
4. Confirmar que HTML servido contém conteúdo, canonical e JSON-LD antes da execução do JavaScript.
5. Verificar Core Web Vitals em mobile, especialmente LCP da Home e imagens do blog.

### Primeiros 30–90 dias

| Indicador | Fonte | Leitura |
|---|---|---|
| Páginas indexadas e erros | Search Console | Saúde técnica |
| Impressões, posição e CTR por consulta | Search Console | Descoberta orgânica |
| Citações em Copilot | Bing Webmaster Tools — AI Performance | Visibilidade em respostas de IA |
| Sessões com `utm_source=chatgpt.com` | Analytics | Tráfego do ChatGPT Search |
| Cliques Home → artigo e artigo → John | Analytics | Valor do conteúdo no funil |
| Conversão orgânica para login | Analytics | Resultado de negócio |

Não existe garantia de indexação, rich result ou citação por IA. O objetivo da implementação é eliminar impedimentos técnicos, melhorar compreensão e criar uma base mensurável.

## 7. Itens que exigem decisão ou acesso externo

- Verificar propriedade e enviar sitemap no Google Search Console.
- Ativar/consultar Bing Webmaster Tools e o relatório AI Performance.
- Definir política separada para `GPTBot` (treinamento); este branch não altera essa escolha.
- Avaliar IndexNow quando o ritmo de publicação justificar notificação automática.

## 8. Fontes primárias

- [Google — AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google — Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google — Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google — Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Schema.org — BlogPosting](https://schema.org/BlogPosting)
- [OpenAI — Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Bing — AI Performance in Webmaster Tools](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [IndexNow — protocol](https://www.indexnow.org/documentation)
