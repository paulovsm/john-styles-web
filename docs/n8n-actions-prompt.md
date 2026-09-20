# Bloco `## Actions` do agente n8n

Substituição direta da seção `## Actions (optional)` do prompt do **John Styles Assistant v3**.
O resto do prompt (contexto, `stylePreference`, honestidade sobre a loja, idioma) não muda.

O que muda: `tryOn` passa a aceitar `lookDescription`, e uma resposta com vários looks emite
**uma ação por look**. Sem isso, o app manda a resposta inteira como prompt único e o gerador
de imagem recebe os três looks, as dicas e os preços de uma vez — sem saber qual renderizar.

O frontend já suporta isto; não há código a mudar do lado do app.

## Cole no lugar da seção atual

````text
## Actions (optional)

When it makes sense to offer a next step, append an actions block to the END of the reply —
normal prose first, block last. The block is NOT shown to the user; it becomes buttons.

<actions>
[{"type":"tryOn","itemIds":["<wardrobe item id>"],"lookDescription":"<the whole look in one line>","label":"Try this look"}]
</actions>

### tryOn

Offers the virtual try-on for one complete look.

- `lookDescription` (string) — the look written as ONE self-contained visual description:
  garments, colours, fabrics and fit. This text is the ONLY thing the image generator
  receives; it never sees the surrounding reply. So it must stand alone, and it must not
  carry prices, shopping links, fit tips, or "why it works" reasoning.
  Example: "Camiseta modal off-white, blazer de sarja cinza-grafite, calça chino azul-marinho
  ajustada e mocassim de couro liso preto".
  Keep it under 1500 characters. Longer descriptions get trimmed.
- `itemIds` (array) — ONLY real ids from the Wardrobe context (the `id` field of each item).
  Include the ids of the pieces in THIS look that the user already owns; the try-on uses their
  real photos. Leave it out or empty when the look uses nothing from the wardrobe.
- A `tryOn` is valid with `itemIds`, with `lookDescription`, or with both. Prefer both: the ids
  bring real photos of what the user owns, and the description covers the pieces they do not.
- `lookDescription` must describe the COMPLETE look, including the pieces referenced by
  `itemIds` — the generator reads the description as the instruction, not just the images.
- Think in outfit slots, not a fixed number of items: some garments fill more than one slot
  (a suit or a dress covers top and bottom at once). Pair footwear, and optional outerwear,
  instead of adding a separate top and bottom.

### One action per look

When the reply suggests MORE THAN ONE look, emit one `tryOn` per look, in the same order they
appear in the prose, and label each so it matches what the user just read ("Provar look 1",
"Provar look 2", ...). Never merge several looks into a single action, and never emit one
action that describes all of them.

Example — a reply presenting three options ends with:

<actions>
[{"type":"tryOn","itemIds":[],"lookDescription":"Polo em algodão Pima grafite, calça de alfaiataria azul-marinho de corte afunilado e mocassim de couro marrom","label":"Provar look 1"},
 {"type":"tryOn","itemIds":["1737050412345"],"lookDescription":"Camiseta modal off-white, blazer de sarja técnica cinza-grafite desestruturado, calça chino azul-marinho ajustada e mocassim de couro liso preto","label":"Provar look 2"},
 {"type":"tryOn","itemIds":[],"lookDescription":"Camiseta de algodão egípcio preta, calça de alfaiataria slim grafite, blazer leve marinho profundo e mocassim preto","label":"Provar look 3"}]
</actions>

### navigate

{"type":"navigate","to":"/wardrobe"} — valid routes only: /wardrobe, /gallery, /try-on,
/dashboard, /history.

### Rules

- Only include the block when it is genuinely useful. No actions? Omit the block entirely.
- Do NOT offer `tryOn` when the reply suggests no look — a clarifying question ("menswear or
  womenswear?", "which occasion?"), an acknowledgement, or a greeting gets no action.
- Keep every `label` and `lookDescription` in the SAME LANGUAGE as the reply.
````

## Por que cada regra está aí

| Regra | Motivo |
|---|---|
| Uma ação por look | O app manda só a `lookDescription` daquele botão. Três looks numa ação = gerador adivinhando. |
| Descrição autocontida | O provador recebe **apenas** esse texto, nunca a resposta ao redor. |
| Sem preços, dicas nem "por que funciona" | Vira prompt de geração de imagem; texto que não descreve roupa só atrapalha. |
| Limite de 1500 caracteres | O app corta em 2000 (`MAX_LOOK_DESCRIPTION`), agora respeitando fim de frase. A folga evita corte. |
| `itemIds` só com ids reais | Ids inventados são descartados na resolução e a peça simplesmente não aparece. |
| Descrição cobre o look completo | Quando há prompt avançado, ele é a instrução; as fotos das peças próprias entram como referência. |
| Sem ação em pergunta de alinhamento | Era a reclamação do teste: botão de provar em resposta que não sugere look. |
| Idioma igual ao da resposta | O agente responde no idioma da pergunta, não no da interface. |

## Como o app se comporta

- Cada `tryOn` vira um botão na mensagem. O clique abre `/try-on` com o modo avançado ligado, a
  `lookDescription` já no campo de prompt e as peças de `itemIds` pré-selecionadas.
- O prompt continua editável — é ponto de partida, não sentença.
- Quando o agente manda qualquer `tryOn`, o botão genérico "Provar no modo avançado" não aparece,
  para não duplicar a oferta. Sem bloco de ações, o app cai no critério próprio (a resposta
  precisa nomear ao menos duas peças da taxonomia do guarda-roupa).
- Ação inválida é descartada silenciosamente e a prosa é preservada: um bloco malformado nunca
  derruba a mensagem.

## Validado

O contrato está coberto por teste antes de qualquer mudança no n8n: `src/utils/agentActions.test.js`
verifica que três `tryOn` sobrevivem à validação com descrições distintas (inclusive um look só de
peças que o usuário não tem), e `src/components/chat/MessageItem.test.jsx` verifica que aparecem
três botões e que clicar no segundo envia **apenas** a descrição do segundo look.
