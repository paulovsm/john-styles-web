# John Styles — Design System

> Guia de produto, interface e expressão digital da Fleek Authority.
>
> **Status:** fonte de verdade para novos desenvolvimentos de interface
>
> **Versão:** 1.1
>
> **Última atualização:** 22 de agosto de 2026

## 1. Como usar este documento

Este documento transforma a estratégia de marca da Fleek Authority em regras
práticas para o produto John Styles. Ele deve orientar decisões de design,
conteúdo e implementação antes que uma nova tela, componente ou fluxo seja
desenvolvido.

### Ordem de autoridade

Quando houver dúvida ou conflito, use esta ordem:

1. `DESIGN.md` — decisão de produto e experiência.
2. Tokens semânticos em `src/assets/styles/global.css` e
   `tailwind.config.js` — implementação visual.
3. Componentes em `src/components/common/` — comportamento e padrões
   reutilizáveis.
4. Estratégia de marca Fleek Authority — intenção, personalidade e linguagem.
5. CSS específico de páginas existentes — referência visual, não autorização
   automática para repetir exceções ou valores hardcoded.

Uma tela existente pode conter legado. Ao criar algo novo, siga este documento;
ao alterar algo existente, aproxime-o progressivamente deste sistema sem causar
uma reescrita desnecessária.

### Princípio central

> O produto deve fazer o usuário se sentir mais seguro, mais bem posicionado e
> mais eficiente — nunca julgado, confuso ou sobrecarregado.

### Política obrigatória: mobile first

John Styles é um produto **mobile first**. Mobile não é uma versão reduzida do
desktop nem uma etapa final de responsividade: é o ponto de partida para
decisões de produto, conteúdo, layout, interação, implementação e testes.

- Comece todo fluxo em **360 px**, orientação vertical, e garanta funcionamento
  sem overflow a partir de **320 px**.
- Defina primeiro hierarquia, ordem do conteúdo, ação principal e estados no
  mobile; depois acrescente espaço, colunas e recursos nos breakpoints maiores.
- CSS base representa mobile. Use preferencialmente media queries progressivas
  com `min-width`; evite construir desktop para depois desfazer regras no mobile.
- Uma funcionalidade não está pronta se o fluxo principal não puder ser
  concluído por toque, com uma mão e com o teclado virtual aberto quando houver
  formulário.
- Priorize dispositivos e conexões modestos: mídia, dependências e carregamento
  devem ser avaliados primeiro no contexto móvel.
- Exceções precisam de justificativa de produto documentada no PR e não podem
  comprometer acesso, leitura ou conclusão do fluxo em mobile.

---

## 2. Fundamentos da marca

### Propósito

Transformar a maneira como homens profissionais se apresentam ao mundo,
impulsionando sua confiança e sua jornada de crescimento com estilo.

### Crença central

> “Roupa não muda o mundo. Mas muda como o mundo te vê. E isso muda tudo.”

### Promessa digital

John Styles transforma decisões de vestuário em uma experiência clara,
inteligente e personalizada. Tecnologia deve reduzir esforço e ampliar
confiança; não deve aparecer como complexidade.

### Público principal

Homens de 25 a 50 anos, profissionais, líderes ou empreendedores, que valorizam
praticidade, confiança, tecnologia e diferenciação. Querem transmitir
autoridade com naturalidade e não desejam perder tempo decidindo o que vestir.

### Arquétipo

- **Principal — Mago:** transforma o comum em extraordinário por meio de
  inteligência, estética e contexto.
- **Secundário — Herói:** incentiva ação, progresso, desempenho e confiança.

O Mago dá inteligência à experiência. O Herói dá energia para agir. Nenhum dos
dois autoriza linguagem esotérica, exagerada, agressiva ou humilhante.

### Personalidade

- Inteligente, sem ser pedante.
- Afiada, sem ser hostil.
- Sofisticada, sem ser inacessível.
- Provocativa, sem diminuir o usuário.
- Tecnológica, sem parecer fria ou complicada.

### Território verbal

Priorize: estilo, autoridade, confiança, transformação, impacto, estratégia,
movimento, presença, sofisticação, performance, carreira, posicionamento,
conveniência, inteligência, design e atitude.

---

## 3. Princípios de experiência

### 3.1 Autoridade sem esforço

A interface deve comunicar precisão e confiança com poucos elementos. Evite
ornamentação gratuita, excesso de cores, excesso de decisões simultâneas ou
explicações longas antes da ação principal.

### 3.2 Inteligência útil

A IA deve sempre traduzir sua inteligência em benefício visível: uma sugestão,
uma explicação curta, uma ação recomendada ou uma economia de tempo. Nunca use
“IA” como decoração ou justificativa para respostas vagas.

### 3.3 Transformação explicável

Recomendações devem dizer o que fazer e, quando útil, por quê. Exemplos:
“adequado para uma reunião formal”, “equilibra as cores do look” ou “funciona
para 21 °C”. Evite apresentar decisões algorítmicas como verdades absolutas.

### 3.4 Progresso, não julgamento

Guarda-roupas incompletos, limites de uso e falhas de upload devem gerar
orientação, nunca constrangimento. Prefira “adicione uma peça para melhorar as
sugestões” a “seu guarda-roupa está incompleto”.

### 3.5 Mobile é o contexto principal

Fotografar peças, consultar looks e conversar com John são ações naturalmente
móveis. Todo fluxo novo deve funcionar primeiro em 360 px de largura, com toque,
teclado virtual, conexão lenta e uso com uma mão. Decisões desktop devem ser
tratadas como aprimoramentos progressivos e nunca alterar a prioridade, a ordem
ou a disponibilidade das ações essenciais definidas no mobile.

### 3.6 Consistência acima da novidade

Reutilize tokens e componentes existentes. Uma nova solução visual só deve ser
introduzida quando o sistema atual não resolver a necessidade e quando houver
intenção de reutilização.

---

## 4. Identidade visual

### 4.1 Direção estética

Minimalista, urbana, editorial e premium. A base é “tinta e papel”: alto
contraste, tipografia forte, superfícies limpas e fotografia com presença.

O produto não deve parecer:

- uma loja de moda genérica;
- um painel corporativo azul;
- um aplicativo de IA neon ou futurista;
- luxuoso por excesso de dourado, serifas ou ornamentação;
- jovem demais, informal demais ou dependente de tendências passageiras.

### 4.2 Paleta semântica

Use os tokens; não copie valores hexadecimais para JSX ou CSS novo.

| Papel | Token | Claro | Escuro | Uso principal |
|---|---|---:|---:|---|
| Fundo | `--c-bg` | `#FFFFFF` | `#000000` | Fundo geral da página |
| Superfície | `--c-surface` | `#FFFFFF` | `#171717` | Cards, menus, modais |
| Conteúdo | `--c-content` | `#000000` | `#FFFFFF` | Texto principal |
| Texto secundário | `--c-muted` | `#4E4E4E` | `#ABABAB` | Apoio, metadados |
| Borda | `--c-border` | `#E7E7E4` | `#252525` | Divisores e contornos |
| Ação primária | `--c-ink` | `#000000` | `#FFFFFF` | CTA e foco principal |
| Superfície sutil | `--c-subtle` | `#F4F4F2` | `#000000` | Áreas recuadas e agrupamentos |

`#F4F4F2` é a tradução digital preferencial do “bege urbano” citado pela
estratégia de marca. Tons quentes adicionais aparecem em páginas editoriais,
mas não devem entrar no produto sem antes se tornarem tokens semânticos.

#### Cores de estado

| Estado | Token Tailwind | Valor atual | Regra |
|---|---|---:|---|
| Sucesso | `status-success` | `#10B981` | Confirmação e conclusão |
| Erro | `status-error` | `#EF4444` | Falha e ação destrutiva |
| Aviso | `status-warning` | `#F59E0B` | Risco ou atenção necessária |
| Informação | `status-info` | `#3B82F6` | Informação neutra excepcional |

Cor de estado nunca deve ser o único sinal. Combine-a com texto, ícone ou
rótulo. Valide contraste sobre a superfície real antes de entregar.

#### Regras de cor

- Use preto, branco e cinzas como linguagem dominante.
- Reserve cores de estado para significado funcional.
- Não introduza gradientes de marca, dourado decorativo ou neon.
- Evite grandes áreas de cinza médio; prefira contraste claro entre fundo e
  superfície.
- No dark mode, use `#171717` para elevação e `#252525` para estrutura; não crie
  vários “quase pretos” sem função.

### 4.3 Tipografia

#### Famílias oficiais do produto

- **Montserrat:** títulos, números de destaque e mensagens de posicionamento.
- **Inter:** corpo, navegação, formulários, dados e controles.

A estratégia da marca também menciona Poppins para títulos. Para o produto
digital, Montserrat é a escolha oficial e não deve ser misturada com Poppins na
mesma experiência. Poppins pode ser usada apenas em uma campanha externa com
direção de arte própria.

#### Escala recomendada

| Papel | Desktop | Mobile | Peso | Família |
|---|---:|---:|---:|---|
| Display editorial | 56–72 px | 40–48 px | 700 | Montserrat |
| Título de página | 40–48 px | 32–36 px | 700 | Montserrat |
| Título de seção | 28–36 px | 24–30 px | 600–700 | Montserrat |
| Título de card | 18–24 px | 18–22 px | 600 | Montserrat |
| Corpo | 16–18 px | 16 px | 400 | Inter |
| Apoio | 14 px | 14 px | 400–500 | Inter |
| Microtexto | 12 px | 12 px | 500 | Inter |

Regras:

- Títulos usam `letter-spacing: -0.02em`, já definido globalmente.
- Corpo usa entre 1,5 e 1,7 de altura de linha.
- Títulos usam entre 1,0 e 1,2 de altura de linha.
- Texto funcional em mobile nunca deve ficar abaixo de 14 px.
- Inputs em mobile devem renderizar com pelo menos 16 px para impedir zoom
  automático no iOS.
- Use caixa alta apenas em rótulos curtos; nunca em parágrafos ou mensagens.

### 4.4 Espaçamento

Use a escala base de 4 px já configurada no Tailwind:

| Token | Valor | Uso típico |
|---|---:|---|
| `1` | 4 px | Ajustes internos mínimos |
| `2` | 8 px | Relação ícone–texto |
| `3` | 12 px | Elementos compactos |
| `4` | 16 px | Padding base e campos |
| `6` | 24 px | Grupos e cards |
| `8` | 32 px | Separação de blocos |
| `12` | 48 px | Seções compactas |
| `16` | 64 px | Seções principais |

Evite valores arbitrários. Quando um valor novo for necessário em mais de um
lugar, transforme-o em token antes de replicá-lo.

### 4.5 Layout e grid

- O estilo base deve representar o mobile; adicione complexidade com
  breakpoints `min-width`.
- Defina a ordem semântica do DOM para mobile. Não use CSS apenas para inverter
  visualmente uma ordem que ficaria incoerente para teclado ou leitor de tela.
- Conteúdo editorial pode usar container de até **1140 px**.
- Texto corrido deve ficar entre **600 e 780 px** para preservar leitura.
- Use uma coluna no mobile e expanda progressivamente.
- Mantenha padding lateral mínimo de 16 px no mobile e 24–32 px em telas
  maiores.
- Breakpoints funcionais do produto:
  - mobile: até 767 px;
  - tablet/compacto: 768–980 px;
  - desktop: acima de 980 px.
- Não use `100vw` em containers: ele pode incluir a largura da scrollbar e
  gerar overflow.
- Nenhuma página pode criar rolagem horizontal do documento.

### 4.6 Forma, borda e elevação

- Cards padrão: raio `9px`, borda `#E7E7E4` e sombra
  `0 18px 48px rgba(0, 0, 0, 0.06)`.
- Botões principais: formato pill (`999px`) quando a ação é curta.
- Inputs: raio moderado, atualmente `6–10px`; mantenha o mesmo raio dentro de
  um fluxo.
- Cards editoriais e imagens podem usar 18–20 px quando a composição exigir
  maior presença visual.
- Evite empilhar borda, sombra forte e fundo contrastante no mesmo elemento.
- Elevação comunica hierarquia ou interação, não decoração.

### 4.7 Iconografia

- Use ícones simples, reconhecíveis e consistentes, preferencialmente em 20 ou
  24 px.
- Ícones decorativos devem ser ocultados de leitores de tela.
- Ações críticas precisam de texto ou rótulo acessível; não dependa apenas do
  ícone.
- Não misture estilos preenchidos, outline e ilustrativos no mesmo conjunto.
- Não introduza uma nova biblioteca para um único ícone.

### 4.8 Fotografia e imagens

A fotografia deve transmitir presença, ambição e autenticidade.

Prefira:

- homens profissionais em contextos urbanos reais;
- postura segura, expressão natural e styling intencional;
- composição editorial com contraste e espaço negativo;
- diversidade compatível com o público real;
- peças bem enquadradas, iluminadas e fáceis de reconhecer;
- imagens otimizadas (`AVIF` ou `WebP`) e com dimensões adequadas ao uso.

Evite:

- banco de imagem corporativo genérico;
- estética de catálogo barata ou fundo visualmente poluído;
- poses artificiais de “executivo de sucesso”;
- filtros pesados que alterem a cor das roupas;
- usar imagem apenas para preencher espaço;
- entregar miniaturas a partir do arquivo original em tamanho integral.

Toda imagem informativa deve ter texto alternativo contextual. Imagens
decorativas devem usar `alt=""`.

### 4.9 Movimento

Movimento deve confirmar ação e orientar atenção.

- Microinterações: 150–250 ms.
- Entrada editorial: até 600 ms; o sistema já usa
  `cubic-bezier(0.22, 1, 0.36, 1)` para reveal.
- Use transformação e opacidade; evite animar propriedades que provoquem
  reflow contínuo.
- Não use movimento em loop para chamar atenção.
- Respeite `prefers-reduced-motion: reduce` e mantenha toda ação compreensível
  sem animação.

---

## 5. Temas claro e escuro

O tema claro comunica papel, precisão e leveza. O tema escuro comunica presença
e foco. Ambos são expressões da mesma marca monocromática.

Regras:

- Use classes semânticas (`bg-white-off`, `text-grey-dark`,
  `border-grey-light`) em vez de valores literais.
- Não assuma que “branco” é sempre branco: as classes existentes são mapeadas
  para tokens e mudam no dark mode.
- Verifique estados hover, foco, disabled, erro e placeholder nos dois temas.
- Controles nativos, especialmente `select`, devem declarar `color-scheme`
  quando necessário.
- Imagens não devem desaparecer em fundos escuros; aplique superfície ou borda
  apenas quando houver necessidade funcional.

---

## 6. Sistema de componentes

Antes de criar um componente, procure em `src/components/common/` e componha a
partir do que já existe.

### 6.1 Button

Componente: `src/components/common/Button.jsx`.

Variantes:

- `primary`: ação principal de uma área.
- `outline`: ação secundária relevante.
- `text`: ação terciária ou navegação contextual.
- `accent`: compatibilidade legada; atualmente colapsa para o sistema
  monocromático e não representa uma nova cor.

Regras:

- Uma área deve ter apenas uma ação visualmente primária.
- Altura mínima de toque: 44 px.
- Rótulos devem começar com verbo: “Adicionar peça”, “Gerar look”, “Salvar”.
- Use `isLoading` para impedir acionamento duplicado.
- A ação desabilitada deve ter uma explicação próxima quando o motivo não for
  óbvio.
- Ações destrutivas exigem confirmação quando a perda não puder ser desfeita.

### 6.2 Card

Componente: `src/components/common/Card.jsx`.

- Use para agrupar um objeto ou uma decisão, não para envolver cada bloco da
  tela.
- Cards clicáveis devem funcionar por teclado e expor papel interativo.
- Imagens de peças usam proporção 3:4 e `object-cover`.
- Título, subtítulo e ação devem preservar uma ordem de leitura clara.
- Evite cards aninhados.

### 6.3 Input

Componente: `src/components/common/Input.jsx`.

- Todo campo deve ter label visível; placeholder não substitui label.
- Associe erro ao controle com `aria-describedby` quando houver mensagem.
- Informe formato, limite ou requisito antes do erro ocorrer.
- Em mobile, use `inputMode`, `autoComplete`, capitalização e tipo de teclado
  adequados.
- Valide arquivos no momento da seleção: tipo, tamanho e compatibilidade.
- Mensagens de erro devem dizer o que aconteceu e como resolver.

### 6.4 Modal e confirmação

Componentes: `Modal.jsx` e `ConfirmDialog.jsx`.

- Modais exigem título claro, foco inicial, trap de foco, Escape para fechar e
  restauração do foco ao acionador.
- Clique no backdrop pode fechar apenas quando não houver risco de perda de
  dados.
- Em mobile, fluxos curtos devem preferir bottom sheet; fluxos longos,
  full-screen. O modal flutuante atual é uma solução transitória para mobile.
- Nunca esconda uma ação primária abaixo do teclado virtual.

### 6.5 Loading, toast e estados vazios

- Loading deve aparecer no local que está aguardando, não bloquear a página
  inteira sem necessidade.
- Acima de aproximadamente 1 segundo, indique o que está acontecendo.
- Uploads longos devem evoluir para progresso, cancelamento e timeout.
- Toast confirma ações breves; não deve carregar informação que o usuário
  precisará consultar depois.
- Estado vazio deve explicar o benefício da primeira ação e oferecer um CTA.
- Diferencie claramente: vazio, carregando, erro, sem conexão e sem resultado.

### 6.6 Navegação e cabeçalho

- A navegação principal deve manter linguagem e ordem consistentes entre telas.
- O menu da conta deve concentrar identidade, preferências e saída.
- Em mobile, priorize destinos frequentes e ergonomia de polegar.
- Indique a seção atual sem depender apenas de cor.
- Logotipo leva à home; voltar deve preservar a expectativa do navegador.

---

## 7. Padrões de página

### 7.1 Marketing e conteúdo

Landing, Empresas, Assinatura e Blog podem usar composição editorial mais
expressiva: grandes títulos, alternância entre seções claras e escuras,
fotografia, espaço negativo e CTAs fortes.

Ainda assim:

- compartilham as mesmas fontes e identidade monocromática;
- devem usar os mesmos padrões de formulário e acessibilidade;
- não devem duplicar novos tokens em CSS de página;
- precisam manter navegação e rodapé coerentes.

### 7.2 Aplicação autenticada

Dashboard, Guarda-roupa, Chat, Prova virtual, Galeria e Histórico priorizam
clareza operacional.

- Uma intenção principal por tela.
- Resumo primeiro, detalhes sob demanda.
- Ação recorrente ao alcance do polegar no mobile.
- Dados importantes com rótulo, valor e contexto.
- Recomendações sempre acompanhadas de próxima ação.

### 7.3 IA conversacional

- Mensagens de John devem ser fáceis de escanear.
- Separe recomendação, justificativa e ação.
- Não exponha raciocínio interno, prompts ou detalhes técnicos desnecessários.
- Quando houver incerteza, diga claramente e peça o mínimo de informação
  adicional.
- Nunca trate uma sugestão estética como regra objetiva ou critique o corpo do
  usuário.

### 7.4 Formulários comerciais

- Explique por que os dados são pedidos.
- Colete apenas o necessário.
- Mostre confirmação persistente após o envio.
- Falhas de integração não devem expor configuração, fornecedor ou segredo.
- O CTA deve descrever o próximo passo real; evite “Enviar” quando for possível
  usar “Solicitar contato” ou “Quero conhecer o serviço”.

---

## 8. Tom de voz e conteúdo

### 8.1 Voz Fleek Authority

Direta, inteligente e provocativa, com sofisticação e um toque controlado de
sarcasmo. Deve sempre preservar respeito e utilidade.

### 8.2 Voz de John Styles

John é o **Chief Stylist Officer** e a voz digital da marca: confiante, perspicaz
e eficiente. A referência “Dr. House encontra James Bond” significa presença e
agilidade verbal, não arrogância, flerte, cinismo ou humilhação.

John deve:

- dar uma recomendação clara;
- explicar brevemente o impacto;
- antecipar contexto quando os dados permitirem;
- encerrar com uma ação útil;
- adaptar a linguagem ao idioma e ao nível de familiaridade do usuário.

John não deve:

- envergonhar o usuário pela aparência, corpo, renda ou guarda-roupa;
- prometer resultados profissionais ou sociais garantidos;
- usar sarcasmo em erros, cobrança, privacidade ou suporte;
- transformar toda mensagem em slogan;
- escrever parágrafos longos quando uma decisão curta resolve.

### 8.3 Tom por contexto

| Contexto | Tom | Exemplo de direção |
|---|---|---|
| Marketing | Provocativo e aspiracional | “Seu estilo fala antes de você.” |
| Recomendação | Confiante e explicativo | “Este blazer aumenta a formalidade sem pesar o look.” |
| Onboarding | Direto e encorajador | “Conte onde você quer chegar. John cuida do resto.” |
| Ação concluída | Breve e positivo | “Peça adicionada. Seu próximo look ficou mais inteligente.” |
| Erro | Calmo e acionável | “Não foi possível enviar a foto. Tente uma imagem JPG ou PNG menor.” |
| Privacidade | Sóbrio e transparente | Explique dado, finalidade, retenção e controle sem humor. |

### 8.4 Microcopy

- Prefira voz ativa.
- Use frases curtas.
- Nomeie a ação e o resultado.
- Evite jargão técnico e anglicismo sem necessidade.
- Não use “Oops”, “algo deu errado” ou “erro desconhecido” sem orientação.
- Não use pontuação excessiva, emoji decorativo ou urgência artificial.
- Preserve paridade de sentido entre português, inglês e espanhol.

---

## 9. Responsividade e interação mobile

Projete e implemente primeiro em 360 px. Só depois valide a expansão em 768,
1024 e 1440 px. A ordem de revisão também é mobile primeiro: um problema em
360 px bloqueia a aprovação mesmo quando a experiência desktop está correta.

### Sequência obrigatória de trabalho

1. Estruture conteúdo e HTML semântico para 360 px.
2. Garanta a conclusão do fluxo com toque e uma mão.
3. Teste campos com teclado virtual aberto, mensagens de erro e estados de
   loading, vazio, sucesso e indisponibilidade.
4. Verifique 320 px como largura mínima suportada, sem perda de conteúdo ou
   rolagem horizontal.
5. Expanda progressivamente para 768, 1024 e 1440 px sem duplicar conteúdo ou
   criar uma experiência paralela.

### Requisitos mínimos

- Alvos de toque de pelo menos 44 × 44 px.
- Sem texto funcional abaixo de 14 px.
- Inputs com 16 px em mobile.
- Sem hover como única forma de descobrir informação.
- Gestos têm alternativa visível quando não forem convencionais.
- Carrosséis aceitam swipe e não colocam setas sobre itens tocáveis no mobile.
- Regiões roláveis aninhadas devem ser evitadas.
- Conteúdo e CTA permanecem visíveis com teclado virtual aberto.
- Considere safe areas em aparelhos com notch e barra inferior.
- Teste orientação vertical; horizontal apenas quando o fluxo depender dela.
- Não esconda no mobile uma funcionalidade necessária para concluir o fluxo.
- A ação principal deve aparecer cedo, permanecer alcançável e não competir
  com navegação, banners ou controles secundários.
- Menus, drawers e bottom sheets devem fechar por ação explícita, Escape quando
  houver teclado físico e retorno previsível do foco.

---

## 10. Acessibilidade

O mínimo esperado é WCAG 2.2 AA.

### Checklist obrigatório

- Contraste de texto normal de pelo menos 4,5:1.
- Contraste de texto grande e componentes essenciais de pelo menos 3:1.
- Foco visível em links, botões, campos e itens interativos.
- Navegação completa por teclado.
- Ordem de foco coerente com a ordem visual.
- Link global “Pular para o conteúdo” apontando para `#main-content` em todas as
  rotas, inclusive estados de carregamento.
- Labels programáticos em todos os campos, filtros e buscas.
- `h1` único por página e hierarquia de headings sem saltos arbitrários.
- Texto alternativo contextual para imagens informativas.
- Ícones decorativos ocultos de tecnologia assistiva.
- Mensagens de erro associadas ao campo e anunciadas quando necessário.
- Diálogos com nome acessível, foco contido e Escape.
- Conteúdo compreensível sem cor, movimento, hover ou áudio.
- Suporte a `prefers-reduced-motion`.
- Idioma correto no documento e nas mudanças de idioma.

---

## 11. Performance percebida

Performance faz parte da experiência premium.

- Entregue imagens no tamanho em que serão exibidas.
- Use `AVIF` ou `WebP` quando possível.
- Carregue rotas e recursos pesados sob demanda.
- Reserve dimensões de imagens para evitar layout shift.
- Use feedback imediato após toque ou clique.
- Não refaça leituras e uploads quando o dado já estiver disponível localmente.
- Em listas longas, pagine, use “carregar mais” ou virtualize.
- Em conexão lenta, preserve progresso e permita tentar novamente.

---

## 12. Privacidade, confiança e segurança visual

- Explique permissões no momento em que forem necessárias.
- Diferencie conteúdo público, privado e administrativo.
- Não exponha nomes de variáveis, caminhos, stack traces ou configuração em
  mensagens ao usuário.
- Ações destrutivas devem indicar o que será removido e se pode ser recuperado.
- Não use padrões enganosos para consentimento, assinatura ou cancelamento.
- Preço, recorrência, limites e próximo passo devem aparecer antes da
  confirmação.
- Não use urgência falsa, contagem regressiva artificial ou opção pré-marcada.

---

## 13. Regras de implementação

### Faça

- Implemente o estilo base para mobile e use `min-width` para aprimoramentos.
- Use tokens semânticos e classes mapeadas no Tailwind.
- Reutilize `Button`, `Card`, `Input`, `Modal`, `ConfirmDialog`, `Loading` e
  padrões existentes.
- Crie variantes explícitas quando a diferença representar um papel recorrente.
- Mantenha estilos próximos ao sistema e comportamento próximo ao componente.
- Escreva teste para comportamento, acessibilidade ou regressão relevante.
- Verifique tema claro, escuro, teclado e mobile.

### Não faça

- Não trate mobile como redução posterior do layout desktop.
- Não mantenha duas árvores de conteúdo — uma mobile e outra desktop — salvo
  necessidade técnica documentada e acessível.
- Não use cores literais em JSX.
- Não crie um botão ou input isolado com estilo próprio se o componente comum
  puder ser estendido.
- Não copie centenas de linhas de CSS entre páginas.
- Não adicione um token com nome visual como `brown-2`; nomeie pelo papel.
- Não use `!important` para resolver arquitetura de estilo.
- Não dependa de `title` tooltip em interfaces touch.
- Não introduza outra biblioteca de componentes ou ícones sem decisão
  arquitetural.
- Não altere a identidade da aplicação para acompanhar uma tendência local de
  uma única tela.

### Criação de um token

Um novo token é justificável quando:

1. representa um papel semântico ainda não coberto;
2. aparece ou aparecerá em mais de um componente;
3. funciona nos temas claro e escuro;
4. tem contraste validado;
5. recebe documentação neste arquivo.

---

## 14. Processo para novas interfaces

### Antes de desenvolver

1. Defina usuário, contexto, problema e ação principal.
2. Identifique o padrão de página mais próximo.
3. Liste componentes e tokens reutilizáveis.
4. Esboce primeiro o estado mobile em 360 px, incluindo teclado virtual e ação
   principal ao alcance do polegar.
5. Defina estados vazio, loading, erro, sucesso e indisponibilidade.
6. Revise riscos de privacidade, dados e ações irreversíveis.

### Durante o desenvolvimento

1. Construa e valide primeiro o fluxo mobile com componentes comuns.
2. Use conteúdo realista nos três idiomas quando o fluxo for traduzido.
3. Preserve HTML semântico antes de adicionar ARIA.
4. Teste teclado, foco, toque e dark mode durante a implementação.
5. Meça imagens e bundles quando adicionar mídia ou dependências.

### Definition of Done visual

- [ ] A ação principal é evidente em até cinco segundos.
- [ ] O fluxo principal foi concluído primeiro em 360 px por toque.
- [ ] A tela preserva conteúdo e funcionalidade entre 320 e 359 px.
- [ ] A tela funciona em 360, 768, 1024 e 1440 px.
- [ ] Não há overflow horizontal.
- [ ] Temas claro e escuro foram verificados.
- [ ] Loading, vazio, erro, sucesso e disabled foram considerados.
- [ ] Contraste, foco, labels e teclado foram verificados.
- [ ] Alvos de toque têm pelo menos 44 × 44 px.
- [ ] Formulários foram testados com teclado virtual e tipo de teclado adequado.
- [ ] A ação principal respeita ergonomia de uma mão e safe areas.
- [ ] Texto e imagens seguem a marca.
- [ ] Não há novo valor visual hardcoded sem justificativa.
- [ ] Componentes comuns foram usados ou evoluídos.
- [ ] Testes relevantes, lint e build foram executados.
- [ ] A experiência foi revisada em navegador real, sem erros de console.

---

## 15. Dívidas conhecidas do sistema

Estas diferenças existem hoje, mas não devem ser replicadas:

- `BusinessPage.css` e `SubscriptionPage.css` possuem paletas quentes e muitos
  valores literais duplicados; devem convergir para tokens compartilhados.
- Algumas páginas de marketing definem seus próprios raios, espaçamentos e
  estados de formulário.
- A variante `accent` e classes legadas `brand-gold` permanecem por
  compatibilidade, mas atualmente são monocromáticas.
- O modal comum ainda não implementa um bottom sheet mobile completo.
- A biblioteca de ícones é maior do que a necessidade real e deve ser reduzida
  sem mudar a linguagem visual.

Ao trabalhar numa área com dívida conhecida, corrija o trecho tocado quando isso
for seguro e proporcional; não amplie o escopo para uma migração total sem
planejamento.

---

## 16. Governança

- PRs de interface devem descrever como o fluxo foi resolvido e verificado no
  mobile; captura apenas de desktop não é evidência suficiente.
- Mudanças neste sistema devem passar por PR dedicado ou estar claramente
  descritas no PR da funcionalidade.
- Alterações de token exigem busca de impacto em toda a aplicação.
- Novos componentes comuns devem incluir estados, acessibilidade e exemplo de
  uso no próprio código ou em testes.
- Uma exceção visual deve explicar contexto, duração e caminho de convergência.
- Decisões de marca que alterem propósito, público, voz ou identidade precisam
  ser confirmadas com a liderança da Fleek Authority antes da implementação.
- Este arquivo deve ser atualizado no mesmo PR que introduzir um novo padrão
  reutilizável.

### Fontes deste sistema

- **Brand Strategy FLEEK AUTHORITY — Round #1:** propósito, público, arquétipo,
  personalidade, identidade visual, tom de voz e John Styles.
- `src/assets/styles/global.css`: tokens semânticos e regras globais.
- `tailwind.config.js`: tipografia, cores, espaçamento, radius, sombra e motion.
- `src/components/common/`: componentes fundamentais.
- `BACKLOG.md`: auditorias, decisões e dívidas conhecidas.
- Landing, Empresas e Assinatura: expressão editorial já implementada.
