# Plano — feedback de usuários (crop, provador a partir do chat, guarda-roupa no celular)

Três pedidos coletados com usuários depois da release da experiência universal (#24–#26).
Este documento registra o que já existe no código, o que falta e a sequência sugerida.
Nenhum dos três exige migração de banco.

## 1. Opção de crop nas fotos

**Pedido:** poder recortar a foto (do usuário e das peças) para dar ênfase à área de interesse.

**Onde entra:** dois pontos de seleção de arquivo, hoje sem nenhuma etapa intermediária.

| Fluxo | Arquivo | Handler |
|---|---|---|
| Peça do guarda-roupa | [AddItemModal.jsx](../src/components/wardrobe/AddItemModal.jsx) | `handleFileChange` |
| Foto do usuário (provador) | [TryOnPage.jsx](../src/pages/TryOnPage.jsx) | `handlePhotoChange` → `persistModelPhoto` |

**Estado atual:** não há biblioteca de crop nas dependências. Os dois fluxos vão direto de
`input[type=file]` para `compressImage`.

**Decisão de implementação:**

- O crop tem de rodar **entre a seleção e o `compressImage`**. Recortar depois da redução a
  1500 px joga resolução fora justamente na área que o usuário quer destacar.
- `cropImage(file, area)` pertence a [imageUtils.js](../src/utils/imageUtils.js), que já tem a
  máquina de canvas com orientação EXIF e o fallback de encoding do WebKit. Reaproveitar
  `resizeImage`/`canvasToFile` em vez de abrir um segundo caminho de canvas no projeto.
- **Atenção iOS:** o recorte precisa ser aplicado sobre o bitmap já normalizado por
  `createImageBitmap(file, { imageOrientation: 'from-image' })`. Se a área vier do preview e
  for aplicada ao arquivo cru, foto de celular com flag de EXIF sai recortada na região errada.
- UI: gesto de pinça/arraste no mobile é a parte cara. `react-easy-crop` (~15 KB gzip) resolve
  touch e roda com o resto do stack; alternativa é canvas próprio, mais código e mais risco de
  regressão de acessibilidade/touch. **Recomendação: a biblioteca.**

**Achado adjacente (não é o pedido, mas está no mesmo caminho):** o input da foto do usuário usa
`accept="image/*"` enquanto o da peça restringe a `jpg,png,webp`. Ou seja, a foto do usuário
aceita HEIC, que o Safari decodifica e o Chrome não — inconsistência latente entre plataformas
que vale resolver junto, já que o crop mexe exatamente aí.

**Esforço:** o maior dos três. **Risco:** médio (mexe no pipeline de imagem, que acabou de ser
corrigido para iOS — cobrir com teste no WebKit).

## 2. Look do chat direto no modo avançado do provador

**Pedido:** o look sugerido pelo John no chat deveria alimentar o provador — usando as peças
selecionadas e a descrição para o que não está no guarda-roupa. Hoje o usuário copia o trecho da
resposta e cola à mão no modo avançado. O modo avançado também deveria funcionar sem exigir a
escolha de uma peça.

**Estado atual — metade do caminho já existe:**

- [agentActions.js](../src/utils/agentActions.js) define o protocolo `<actions>`, em que o agente
  anexa `{ "type": "tryOn", "itemIds": [...] }` à resposta, validado contra whitelist.
- [MessageItem.jsx](../src/components/chat/MessageItem.jsx) renderiza o botão e navega para
  `/try-on` com `state: { preselect: itemIds }`.
- [TryOnPage.jsx](../src/pages/TryOnPage.jsx) resolve esses ids em peças (`preselectIds`).

O que falta é levar a **descrição** do look e soltar o gate do modo avançado.

**2a. Descrição do look — duas formas, e elas coexistem:**

1. **Sem tocar no agente n8n:** um botão "usar este look no provador" na mensagem, que leva
   `message.content` para `customPrompt` e já liga `advancedMode`. É exatamente o copia-e-cola
   que o usuário faz hoje, automatizado, e não depende de nada fora deste repo.
2. **Com mudança no agente:** estender o contrato com um campo de descrição no action `tryOn`
   (validando em `isValidAction`, seguindo a regra de whitelist que já existe ali). Resultado
   melhor, porque o agente manda um texto pensado para geração de imagem em vez da resposta
   conversacional inteira — mas exige alteração no fluxo n8n, **fora deste repositório**.

**Recomendação:** entregar (1) primeiro, que já resolve a dor relatada sozinha, e tratar (2) como
refinamento posterior. Convém que o frontend aceite o campo novo com fallback para
`message.content`, para as duas versões conviverem sem quebrar.

**2b. Modo avançado sem peça obrigatória — só frontend:**

O bloqueio está em dois lugares de [TryOnPage.jsx](../src/pages/TryOnPage.jsx): o `return`
antecipado em `handleGenerate` quando `selectedItems.length === 0`, e o `disabled` do botão de
gerar. **A API já aceita zero peças:**
[gemini-image-generate.js](../api/gemini-image-generate.js) monta `items` a partir de um array
que pode ser vazio e só valida `prompt` como obrigatório. Então é trocar a condição por
"tem foto **e** (tem peça **ou** prompt avançado preenchido)" — sem trabalho de backend.

Vale revisar também `replacePlaceholders`, cujos placeholders (`{item.name}` etc.) hoje assumem
que existe peça selecionada; com zero peças eles devem resolver para vazio sem sujar o prompt.

**Esforço:** baixo para 2b, baixo-médio para 2a(1). **Risco:** baixo.
**Maior retorno dos três** — remove um copia-e-cola manual do fluxo principal.

## 3. Protagonismo das peças no guarda-roupa (mobile)

**Pedido:** no celular, o mini-tutorial e os filtros empurram as peças muito para baixo; e ao
adicionar uma peça nova não fica claro o que aconteceu, porque exige rolar muito.

**Estado atual:** [WardrobePage.jsx](../src/pages/WardrobePage.jsx) empilha, antes da primeira
peça: bloco de cabeçalho universal (`JohnSignature` + título + descrição), linha de botões,
`WardrobeTutorial` (aberto por padrão até ser dispensado), aviso de peças de exemplo,
`WardrobeFilters`, e só então `WardrobeGrid`.

**Propostas, da mais barata para a mais cara:**

- Tutorial abre automaticamente **só quando o guarda-roupa está vazio**. Hoje abre para todo
  mundo até dispensar, e é o maior bloco acima da grade. O botão de reabrir já existe.
- Filtros colapsados atrás de um toggle no mobile, expandidos no desktop.
- Cabeçalho universal compacto no mobile (a descrição longa pode ficar só em telas maiores).
- Depois de salvar, rolar até a peça nova e destacá-la. O padrão já existe no projeto: o
  provador faz `scrollIntoView` condicionado a `window.innerWidth < 1024` em `handleGenerate`.
  Alternativa complementar: toast com ação "ver peça" (o `ToastContext` já está disponível).

**Cuidado conhecido:** qualquer mexida de layout aqui não pode introduzir `overflow-x: hidden`
em `html`/`body` — quebra todos os headers sticky do app, sem erro visível. A regra e o motivo
estão comentados em [global.css](../src/assets/styles/global.css).

**Esforço:** baixo. **Risco:** baixo, sem backend. Afeta todos os usuários de celular.

## Sequência sugerida

1. **Item 3** — mais barato, sem backend, beneficia todo usuário de celular.
2. **Item 2** (2b + 2a opção 1) — maior retorno; quase tudo é fiação sobre protocolo existente.
3. **Item 1** — maior esforço, por causa da UI de gesto; fazer junto a inconsistência do
   `accept="image/*"` na foto do usuário.

Itens 2 e 3 podem ir em PRs independentes; nenhum toca os arquivos do outro. O item 1 mexe em
`imageUtils` e nos dois modais, então convém sozinho.
