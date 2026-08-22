# Taxonomia de peças — pesquisa e plano de implementação

**Status:** aprovada e implementada na branch; aguardando revisão
**Branch:** `feat/garment-taxonomy`
**Data:** 2026-08-22
**Dependência:** esta branch parte do PR #19. Antes do PR final, atualizar a base para a `main` depois da resolução dos PRs #18 e #19.

## 1. Decisão executiva proposta

A V1 usa seis categorias amplas. Cinco preservam a lógica existente e uma representa peças compostas:

- `tops`: peças superiores;
- `bottoms`: peças inferiores;
- `shoes`: calçados;
- `outerwear`: sobreposições;
- `sets`: conjuntos;
- `accessories`: acessórios.

Cada peça passa a ter um único campo canônico `type`. A aplicação deriva `category` exclusivamente desse tipo e persiste os dois campos. O usuário escolhe apenas o tipo; não escolhe separadamente uma categoria que possa entrar em conflito.

```js
{
  type: 'polo',
  category: 'tops',
  taxonomyVersion: 1
}
```

Essa separação tem duas funções:

- `type` descreve **o que a peça é** e aparece para o usuário;
- `category` descreve **a família usada para organização e filtros**;
- `occupiedCategories` é derivado do tipo e descreve **quais espaços a peça ocupa no look**. Por exemplo, um terno ocupa `bottoms` + `outerwear`, mas continua armazenado em `sets`.

## 2. Objetivo e limites

### Objetivos

- tornar a classificação compreensível para o usuário;
- dar granularidade suficiente para resumo, recomendações e futura integração com a loja;
- eliminar a solução provisória `subcategory`, hoje limitada a camisa, polo e camiseta;
- evitar divergências entre tipo e categoria;
- preservar todas as peças já cadastradas, sem migração destrutiva;
- manter chaves internas estáveis e rótulos traduzidos em português, inglês e espanhol.

### Fora do escopo desta entrega

- tamanho, modelagem, material, estampa e comprimento de manga;
- classificação por ocasião ou formalidade — isso continua em `styles` e `occasions`;
- migração em lote do Firestore;
- categorias femininas, infantis, roupa íntima, pijama e vestuário técnico;
- associação entre peças separadas que o usuário deseje vincular como um conjunto;
- integração comercial com o catálogo da Fleek Authority.

## 3. Pesquisa e critérios utilizados

### Shopify Standard Product Taxonomy

A taxonomia pública da Shopify é global, versionada e separa categorias, atributos e valores. Ela reconhece famílias como tops, calças, shorts, sobreposições, calçados e acessórios, com tipos específicos como camisetas, camisas, jeans, chinos, tênis, botas e blazers.

**Aplicação no John Styles:** aproveitar o vocabulário estável e a distinção entre tipo e atributo, mas reduzir a árvore para evitar dezenas de escolhas irrelevantes ao guarda-roupa pessoal.

### Google Product Taxonomy

O Google recomenda uma categoria única, baseada na função principal do produto, usando o nível mais específico adequado. Cor, material, gênero e tamanho são atributos separados da categoria.

**Aplicação no John Styles:** não criar tipos como `camisa_social_azul`, `camisa_manga_longa` ou `jaqueta_de_couro`. O tipo deve ser `shirt` ou `jacket`; formalidade, cor, manga e material pertencem a outros campos.

### DeepFashion2

O benchmark de visão computacional possui 13 classes baseadas principalmente na forma visível da peça, como top de manga curta, top de manga longa, sobreposição e calça. Ele é adequado para detecção e segmentação, mas não cobre bem calçados e acessórios nem usa o vocabulário cotidiano de um guarda-roupa.

**Aplicação no John Styles:** usar a separação visual entre parte superior, inferior e sobreposição como sinal para a IA, sem adotar essas 13 classes como modelo de produto.

### Auditoria do código atual

- a aplicação já depende das cinco categorias amplas em looks, filtros e insights;
- `subcategory` só existe para `tops` e aceita `shirt`, `polo` e `tshirt`;
- peças como moletom são atualmente forçadas para `tshirt`;
- `mapCategory()` usa `tops` como fallback silencioso, criando classificação incorreta quando não há certeza;
- o resumo mostra seis blocos fixos, inclusive tipos que o usuário não possui;
- o Gemini retorna `category` e uma `subcategory` parcial;
- o produto e as recomendações comerciais atuais são explicitamente voltados à moda masculina adulta.

## 4. Princípios da taxonomia

1. **Um produto fotografado por item.** Um terno ou conjunto fotografado e usado como unidade é um item composto em `sets`; peças avulsas continuam cadastradas separadamente.
2. **Um tipo por peça.** O tipo representa a identidade principal, não todos os usos possíveis.
3. **Categoria sempre derivada.** Nunca aceitar `type: 'polo'` com `category: 'shoes'`.
4. **Atributos não viram tipos.** Cor, material, estampa, manga e formalidade continuam separados.
5. **Chaves internas em inglês e `snake_case`.** Rótulos são traduzidos pelo i18n.
6. **Sem fallback silencioso para `tops`.** Se a IA não souber, o formulário pede confirmação ao usuário.
7. **Extensível sem renomear chaves existentes.** Novos tipos podem ser adicionados mantendo `taxonomyVersion`.
8. **Opções residuais por categoria.** `other_top`, `other_shoes` etc. preservam a derivação correta.
9. **Compostos declaram seus espaços.** A montagem de looks usa `occupiedCategories`, não apenas a categoria de armazenamento.

## 5. Taxonomia V1 recomendada

### Peças superiores — `tops`

| Chave | Rótulo PT-BR | Escopo e exemplos |
|---|---|---|
| `tshirt` | Camiseta | camiseta básica, estampada ou oversized |
| `polo` | Polo | camisa polo |
| `shirt` | Camisa | social, casual, oxford, flanela; formalidade fica em `styles` |
| `tank_top` | Regata | regata e camiseta sem mangas |
| `other_top` | Outra peça superior | fallback explícito |

### Peças inferiores — `bottoms`

| Chave | Rótulo PT-BR | Escopo e exemplos |
|---|---|---|
| `jeans` | Jeans | qualquer calça jeans |
| `chinos` | Chino | sarja/chino de construção casual ou smart casual |
| `trousers` | Calça de alfaiataria | calça social, de terno ou alfaiataria |
| `casual_pants` | Calça casual | peças casuais que não sejam jeans, chino, cargo ou jogger |
| `cargo_pants` | Calça cargo | calça com bolsos cargo |
| `joggers` | Jogger | jogger e moletom estruturado |
| `shorts` | Bermuda ou shorts | bermuda e shorts casuais |
| `other_bottom` | Outra peça inferior | fallback explícito |

### Calçados — `shoes`

| Chave | Rótulo PT-BR | Escopo e exemplos |
|---|---|---|
| `sneakers` | Tênis | casual ou esportivo; o estilo diferencia o uso |
| `dress_shoes` | Sapato social | oxford, derby e monk strap |
| `loafers` | Mocassim | loafer e driver |
| `boots` | Bota | chelsea, coturno e outras botas |
| `sandals` | Sandália ou chinelo | sandália, slide e chinelo |
| `other_shoes` | Outro calçado | fallback explícito |

### Sobreposições — `outerwear`

| Chave | Rótulo PT-BR | Escopo e exemplos |
|---|---|---|
| `blazer` | Blazer | blazer e paletó avulso |
| `jacket` | Jaqueta | jeans, couro, bomber, trucker e corta-vento |
| `coat` | Casaco | sobretudo, trench coat e parka |
| `sweater` | Suéter ou tricô | suéter, gola alta e cardigan |
| `hoodie` | Moletom com capuz | hoodie |
| `sweatshirt` | Moletom sem capuz | sweatshirt |
| `vest` | Colete | colete casual, acolchoado ou social |
| `other_outerwear` | Outra sobreposição | fallback explícito |

### Conjuntos — `sets`

| Chave | Rótulo PT-BR | Escopo e espaços ocupados |
|---|---|---|
| `suit` | Terno | conjunto social; ocupa `bottoms` + `outerwear` e permite camisa |
| `tuxedo` | Smoking | traje black tie; ocupa `bottoms` + `outerwear` e permite camisa |
| `matching_set` | Conjunto coordenado | parte superior e inferior combinadas; ocupa `tops` + `bottoms` |
| `other_set` | Outro conjunto | fallback composto; ocupa `tops` + `bottoms` |

### Acessórios — `accessories`

| Chave | Rótulo PT-BR | Escopo e exemplos |
|---|---|---|
| `belt` | Cinto | cinto social ou casual |
| `tie` | Gravata | gravata tradicional ou borboleta |
| `watch` | Relógio | relógio de pulso |
| `bag` | Bolsa ou mochila | mochila, pasta, tote e bolsa |
| `headwear` | Chapéu ou boné | boné, chapéu e gorro |
| `eyewear` | Óculos | óculos de sol ou de grau |
| `scarf` | Cachecol ou lenço | cachecol e lenço de pescoço |
| `jewelry` | Joia | pulseira, anel, colar e abotoadura |
| `other_accessory` | Outro acessório | fallback explícito |

Total da V1: **40 tipos**, incluindo seis opções residuais. A interface não apresenta uma lista plana: usa um único seletor de tipo agrupado pelas seis categorias.

## 6. Decisões de fronteira

| Caso ambíguo | Regra V1 |
|---|---|
| Terno completo | `suit`; ocupa `bottoms` + `outerwear`, permitindo camisa, calçado e acessórios |
| Smoking completo | `tuxedo`; segue a mesma ocupação do terno |
| Conjunto coordenado | `matching_set`; ocupa `tops` + `bottoms` |
| Paletó ou calça de terno avulsos | `blazer` ou `trousers`; somente o conjunto completo usa `suit` |
| Cardigan | `sweater`, pois funciona como tricô/sobreposição |
| Camisa social vs. casual | ambas são `shirt`; diferenciar em `styles` e `occasions` |
| Tênis esportivo vs. casual | ambos são `sneakers`; diferenciar em `styles` |
| Sapato oxford/derby/monk | `dress_shoes`; não fragmentar nesta versão |
| Gravata borboleta | `tie`; não fragmentar nesta versão |
| Abotoadura | `jewelry`; pode ganhar tipo próprio quando houver uso real |
| Peça desconhecida | pedir confirmação; nunca assumir `tops` silenciosamente |

## 7. Modelo de domínio proposto

Criar `src/utils/garmentTaxonomy.js` como fonte única de verdade:

```js
export const GARMENT_TYPES = {
  polo: { category: 'tops' },
  jeans: { category: 'bottoms' },
  blazer: { category: 'outerwear' },
  suit: { category: 'sets', occupiedCategories: ['bottoms', 'outerwear'] },
  // ...
};

export function deriveCategory(type) {}
export function normalizeGarmentType(raw) {}
export function resolveGarmentType(item) {}
export function getOccupiedCategories(itemOrType) {}
export function garmentsConflict(first, second) {}
```

Responsabilidades:

- validar chaves canônicas;
- mapear sinônimos em português, inglês e espanhol;
- derivar a categoria;
- resolver peças legadas;
- fornecer listas agrupadas para a interface;
- impedir que cada componente implemente heurísticas próprias.

### Compatibilidade com dados existentes

Ordem de resolução para leitura:

1. usar `item.type` quando for válido;
2. converter `item.subcategory` (`shirt`, `polo`, `tshirt`);
3. tentar reconhecer o nome da peça;
4. usar o `other_*` correspondente à categoria legada;
5. se nem a categoria for válida, marcar como não classificada e pedir correção ao editar.

Novas gravações devem persistir `type`, `category` derivada e `taxonomyVersion: 1`. `subcategory` deixa de ser gravado, mas continua legível durante a transição.

## 8. Plano de implementação

### Etapa 1 — Domínio e testes

- criar o registro canônico de tipos;
- implementar derivação, normalização e compatibilidade legada;
- cobrir todas as chaves e garantir que cada tipo derive exatamente uma categoria;
- testar sinônimos críticos em PT/EN/ES;
- eliminar o fallback automático para `tops` em novos itens.

### Etapa 2 — Análise por IA

- alterar o contrato de `gemini-image-analyze` para retornar `type` da lista permitida;
- manter `category` apenas como resultado derivado no servidor ou cliente;
- validar a resposta antes de preencher o formulário;
- quando não houver confiança, deixar o tipo vazio para confirmação;
- adicionar testes do contrato e de respostas inválidas.

### Etapa 3 — Cadastro e edição

- substituir os seletores separados de categoria/subcategoria por um seletor de tipo;
- agrupar opções pelas seis categorias;
- exigir um tipo válido para salvar;
- derivar e persistir `category` no `handleSubmit`;
- carregar peças antigas usando `resolveGarmentType()`.

### Etapa 4 — Exibição e resumo

- mostrar o rótulo do tipo em cartões e carrosséis;
- substituir os seis blocos fixos por total + tags somente dos tipos com contagem maior que zero;
- ordenar tags por categoria e frequência;
- manter o filtro principal por categoria nesta versão;
- fazer insights, look do dia e prova virtual respeitarem os espaços ocupados por conjuntos;
- impedir que o provador combine terno com outra calça ou sobreposição, mantendo camisa e calçado permitidos.

### Etapa 5 — Dados de demonstração e i18n

- converter todas as peças de demonstração para `type`;
- adicionar `wardrobe.types.*` em `pt`, `en` e `es` com paridade;
- adicionar aliases apenas no normalizador, nunca nos dados persistidos;
- atualizar textos de ajuda do cadastro.

### Etapa 6 — Verificação

- executar lint, testes e build;
- testar criação manual, criação assistida por IA e edição;
- testar uma peça legada com apenas `category`;
- testar uma peça legada com `subcategory`;
- testar filtros, resumo, insights, look do dia e prova virtual;
- conferir o formulário em 360 px e navegação por teclado.

## 9. Critérios de aceite

- toda peça nova possui `type`, `category` derivada e `taxonomyVersion: 1`;
- é impossível persistir uma combinação tipo/categoria divergente pela interface;
- nenhum item novo é classificado como `tops` apenas por falta de informação;
- itens antigos continuam visíveis, editáveis e utilizáveis sem migração em lote;
- o usuário faz uma única escolha de tipo no formulário;
- cartões usam o tipo específico traduzido;
- o resumo mostra o total e somente tipos realmente existentes no guarda-roupa;
- filtros, insights, look do dia e prova virtual mantêm o comportamento atual;
- terno e smoking podem ser cadastrados como itens únicos e não entram em conflito com camisa ou calçado;
- conjuntos nunca são combinados com peças que ocupem os mesmos espaços do look;
- traduções PT/EN/ES têm as mesmas chaves;
- CI passa com lint, testes e build.

## 10. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| IA devolver um tipo inexistente | classificação vazia ou incorreta | allowlist + normalização + confirmação humana |
| peça legada perder o rótulo | regressão de dados | resolução em camadas e testes com fixtures antigas |
| tipo e categoria divergirem | quebra de looks e filtros | categoria derivada em uma única função |
| lista longa no celular | fricção no cadastro | seletor agrupado, busca futura se dados reais mostrarem necessidade |
| taxonomia crescer sem controle | inconsistência | versionar e exigir decisão documentada para novas chaves |
| conjunto bloquear peças compatíveis ou aceitar peças duplicadas | look incoerente | declarar espaços por tipo e testar conflitos no look do dia e no provador |
| escopo masculino limitar expansão | retrabalho futuro | chaves neutras e registro extensível; decidir expansão antes de adicionar novos públicos |

## 11. Estimativa revisada

| Entrega | Estimativa |
|---|---:|
| domínio + compatibilidade + testes | 1–1,5 h |
| IA + formulário | 1–1,5 h |
| cartões + resumo + i18n | 1–1,5 h |
| conjuntos + regras dos consumidores | 1–2 h |
| regressão e verificação | 0,5–1 h |
| **Total esperado** | **4,5–7,5 h** |

A estimativa anterior de 1–1,5 hora cobria apenas a troca básica de campos. Ela não incluía contrato da IA, compatibilidade legada, três idiomas e regressão dos consumidores de `category`.

## 12. Decisão de produto aprovada

A V1 acompanha o posicionamento atual de moda masculina adulta. Em 2026-08-22 foi aprovada a seguinte direção:

- manter o foco masculino na V1;
- tratar ternos, smokings e conjuntos coordenados como itens compostos;
- preservar chaves e registro extensíveis;
- adicionar novos tipos quando houver decisão real de ampliação do público.

Assim, vestidos, saias e outras famílias não foram adicionados nesta versão. A expansão futura deverá aumentar o registro de tipos e a versão da taxonomia sem renomear chaves existentes.

## 13. Referências

- Shopify Standard Product Taxonomy: https://shopify.github.io/product-taxonomy/releases/2026-02/
- Repositório oficial da taxonomia Shopify: https://github.com/Shopify/product-taxonomy
- Google Merchant Center — categoria de produto: https://support.google.com/merchants/answer/6324436
- Google Merchant Center — especificação de dados: https://support.google.com/merchants/answer/7052112
- DeepFashion2, CVPR 2019: https://openaccess.thecvf.com/content_CVPR_2019/papers/Ge_DeepFashion2_A_Versatile_Benchmark_for_Detection_Pose_Estimation_Segmentation_and_CVPR_2019_paper.pdf
