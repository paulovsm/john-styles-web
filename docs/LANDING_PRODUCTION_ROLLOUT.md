# Promoção da landing Fleek Authority

Data: 19/09/2026
Status: implementação da promoção visual completa em validação; publicação ainda não executada.

## Decisão confirmada

O responsável aprovou promover a landing e as páginas internas, exclusivamente
como mudança visual e de textos. O comportamento de produção é preservado:
chat mantém `experience: legacy`, onboarding mantém seu catálogo atual, assinatura
mantém o formulário e integração de captação. `isUniversal` controla aparência;
`isPreview`, `agentExperience` e `expandedOccasions` separam as responsabilidades.
O prefixo `/teste-novo-app` continua disponível com seus comportamentos de piloto.
Esta decisão substitui a recomendação inicial de promover apenas a landing.

## Validação da implementação em 19/09/2026

- 184 testes em 36 arquivos aprovados, incluindo contrato do chat, catálogo de
  onboarding, indexação/links públicos e envio simulado do formulário de assinatura.
- Lint e build de produção aprovados.
- Navegador local: home abre na raiz; CTA leva ao login; os três provedores
  continuam presentes; login e assinatura conferidos em 360 px; formulário de
  assinatura e destinos comerciais continuam acessíveis.
- Não foram alterados arquivos de regras, serviços de armazenamento, configuração
  Firebase ou rewrites da hospedagem nesta promoção.
- Pendente: fluxo autenticado real com conta de teste, geração de imagem, agenda,
  n8n e identificação do deployment de produção para reversão.
- A CLI da Vercel não tem sessão autenticada; o conector disponível retornou
  deployment não encontrado para `fleekauthority.com`. A publicação fica pendente
  do acesso ao projeto correto e da validação externa; testes locais não são
  evidência de publicação ou disponibilidade dos serviços em produção.

## Objetivo e escopo

Publicar a landing aprovada em `https://fleekauthority.com/`, mantendo contas,
dados e funcionalidades existentes. A aprovação de design foi informada pelo
responsável do projeto. A abrangência da primeira publicação precisa distinguir
landing pública de toda a experiência autenticada.

Recomendação: promover primeiro a landing, mantendo os fluxos atuais de login,
onboarding, dashboard, chat, guarda-roupa, prova virtual e assinatura. A promoção
integral pode acompanhar a publicação se essa for a escolha do responsável,
mas exige validar também o contrato universal do agente e as mudanças comerciais.

## Evidências verificadas

- Branch local e remoto: `feat/universal-stylist-experience`, commit `8dc1a01`.
- `main` remoto: `3a55b90`; consulta ao GitHub não encontrou PR para o branch.
- Piloto e aplicação atual pertencem à mesma aplicação React/Vite. O basename
  `/teste-novo-app` altera a navegação, não o projeto Firebase.
- Perfis são armazenados em `users/{uid}/data/profile`; peças em
  `users/{uid}/wardrobe`; conversas em `users/{uid}/data/chatHistory`; galeria e
  looks em subcoleções do mesmo usuário. Não há separação por experiência.
- As imagens continuam sob `users/{uid}/...` no Storage. O armazenamento local
  também não usa um namespace diferente por experiência.
- A seleção global da experiência influencia apresentação, opções de onboarding,
  assinatura e o campo `experience` enviado ao chat. Mudar apenas essa seleção
  não equivale a trocar somente a landing.
- O piloto aplica `noindex, nofollow`; a landing possui canonical fixo para
  `/teste-novo-app`. Ambos precisam ser tratados separadamente da promoção.
- `vercel.json` preserva rotas especiais de autenticação, APIs, blog e sitemap
  antes do fallback da aplicação. Esses caminhos não podem virar redirecionamentos
  genéricos para a home.
- O OAuth da agenda aceita retorno a `/dashboard` e
  `/teste-novo-app/dashboard`, incluindo parâmetros usados pelo callback.
- A documentação registra pendências de validação externa do n8n e da prova
  virtual com roupas femininas; não há evidência nova de que foram concluídas.

A inspeção foi de código e referências Git. Não foi feita leitura de dados de
clientes, nem verificação autenticada dos serviços de produção nesta etapa.

## Plano de implementação

1. Confirmar abrangência: landing primeiro ou experiência integral. Registrar
   essa escolha no PR para que revisão e testes tenham escopo inequívoco.
2. Comparar novamente o branch com a main remota antes da integração. Revisar o
   conjunto completo do branch, incluindo alterações prévias no proxy de chat e
   OAuth, pois o lançamento não contém somente os arquivos visuais da home.
3. Promover `UniversalLandingPage` à rota `/`, sem alterar o basename das rotas
   atuais para o prefixo de teste. Evitar carregar a antiga landing no pacote
   inicial por um import que já não é utilizado.
4. Diferenciar home pública de piloto na apresentação: retirar badge e aviso de
   teste apenas da home; canonical público `/`; canonical do piloto separado;
   indexação da home preservada e piloto ainda fora do índice.
5. Alinhar título, descrição e imagens de compartilhamento no HTML inicial e
   nas tags geradas pela página. Isso cobre robôs que não executam JavaScript.
6. Manter `/teste-novo-app` e suas rotas durante a transição. Na primeira etapa,
   não descontinuar URLs já compartilhadas nem sessões iniciadas no piloto.
7. Preservar acesso a blog, empresas, assinatura, privacidade, loja e login na
   navegação/rodapé da nova landing. A existência da rota não basta se o acesso
   se tornar invisível ao visitante.
8. Revisar coerência da oferta: a nova landing descreve assinatura em validação,
   enquanto a rota comercial antiga pode ter oferta estabelecida. Preservar
   seus mecanismos e links, mas resolver essa divergência de mensagem antes da
   publicação, sem inventar preço, disponibilidade ou integração comercial.
9. Atualizar documentação e backlog para diferenciar o que está público do que
   continua experimental. Publicar por PR com preview e evidências de validação.

## Contratos a preservar

| Área | Invariante | Verificação para liberar |
|---|---|---|
| Contas | Mesmo Firebase, UID e provedores | Login novo, sessão existente, logout e retorno no Safari/iPhone |
| Perfil | Mesmo documento e indicador de onboarding concluído | Usuário antigo entra sem refazer cadastro; usuário novo conclui cadastro |
| Guarda-roupa | Mesmos IDs, coleções, imagens e miniaturas | Conta de teste lê peças existentes, adiciona uma peça e confirma sincronização |
| Chat | Mesmo endpoint autenticado, histórico e limites | Enviar mensagem, receber resposta e manter histórico; testar modo universal se promovido |
| Prova virtual | Mesmos uploads, geração e persistência | Gerar com conta de teste, salvar e reencontrar na galeria |
| Agenda | Mesmo callback e tokens existentes | Ler agenda conectada e confirmar retorno de uma conexão de teste |
| Blog/CMS | Mesmas URLs, conteúdo e controle de administrador | Abrir post direto, sitemap e acesso administrativo com conta autorizada |
| Comercial | Mesmos destinos e mecanismos de contato | Abrir loja, empresas e assinatura sem confirmar transações |
| Navegação | URLs atuais e prefixadas válidas | Abrir e atualizar links profundos; testar visitante sem sessão |
| SEO | Home indexável e canonical correto | Inspecionar HTML inicial, metatags após renderização e ausência de noindex na home |

Nenhuma migração de banco, recriação de conta, mudança de regras Firebase,
alteração de segredos, remoção de imagens ou limpeza de cache de usuário é
necessária para a troca da landing. Os dados continuam associados ao mesmo UID.

## Sequência de validação e publicação

- Desenvolvimento: testar regressões relevantes de rotas, links, canonical e
  status de piloto; executar testes existentes, lint e build do commit final.
- Preview: validar em 320 e 360 px primeiro, depois tablet e desktop; teclado,
  temas, idiomas, imagens, menu e CTAs. Confirmar que o ambiente de preview
  permite os provedores de login sem alterar a configuração de produção.
- Serviços: usar uma conta de teste autorizada para o ciclo autenticado da
  matriz. Testes automatizados com mocks não comprovam disponibilidade real de
  Firebase, n8n, Google Calendar ou geração de imagem.
- Liberação: registrar commit candidato, resultados e URL do deployment estável
  anterior; confirmar que o artefato publicado corresponde ao commit validado.
- Produção: integrar o PR e publicar pelo fluxo existente; conferir `/`, login,
  links profundos, APIs e blog, e executar um teste autenticado com conta de teste.
- Acompanhamento: verificar imediatamente e novamente após uma janela inicial
  de uso os erros de login, APIs, upload e geração, comparando com a situação
  anterior. Monitoramento recorrente deve ser configurado explicitamente se
  desejado; este documento não cria um monitor em segundo plano.

## Reversão

Antes da publicação, identificar e registrar o deployment de produção que está
efetivamente estável; o commit de main sozinho não comprova qual deployment está
servindo o domínio. Em regressão impeditiva de login, acesso aos dados, gravação,
chat ou rotas, restaurar esse deployment pelo mecanismo da hospedagem e registrar
a causa. Como não há migração, reverter o frontend não exige restaurar o banco
nem descartar dados criados durante a nova versão. Não usar reset destrutivo nem
rollback de dados como substituto da reversão da publicação.

## Responsáveis e checkpoints

| Etapa | Responsável | Checkpoint |
|---|---|---|
| Abrangência | Responsável do produto | Landing isolada ou experiência integral definida |
| Implementação e regressões | Codex | Commit candidato, testes e preview revisáveis |
| Validação autenticada | Codex com conta de teste autorizada / responsável do produto | Fluxos críticos demonstrados |
| Publicação | Codex pelo fluxo autorizado do projeto | Deployment e domínio conferidos |
| Aceite final | Responsável do produto | Home e serviços confirmados em produção |

Executar os checkpoints na ordem acima; não fixar uma data de lançamento antes
de verificar os serviços externos e a configuração real de publicação.
