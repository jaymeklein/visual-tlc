# Sidebar Dashboard Validation

## Validation: sidebar-dashboard - PASS ✅

Os 11 requisitos batem com a spec e os gates passam no VS Code instalado (1.120.0) e no mínimo que o manifesto aceita (1.90.0). O gap do SIDE-03 fechou: o teste agora estreita a barra lateral até 250px ou menos e mede o quadro e os detalhes. Ficam dois mutantes vivos no diff (M4, M5): duas regras do stylesheet estreito que podem sair sem que nada role nas larguras medidas. Não bloqueiam a entrega e viram follow-up.

**Date**: 2026-09-29
**Spec**: `.specs/features/sidebar-dashboard/spec.md`
**Diff range**: cadcb11..0ab4657 (iteração 3: 90a54c3..0ab4657, branch `feat/sidebar-dashboard`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 65a6be7 | Reprovada | 10 mutantes vivos no diff, 6 de produto (S4, C2, S5, S6, C3, P4). SIDE-02, 03, 04 e 09 com gap. SIDE-05 sem precisão. Lições L-008 a L-014, L-006 promovida |
| 2 | 90a54c3 | Reprovada | T9 a T15 fecham os gaps da iteração 1. Achado novo: o quadro estreito rola na horizontal a 255px (VS Code 1.90.0). Lição L-015 |
| 3 | 0ab4657 | Aprovada | T16 corrige o stylesheet e mede a view até 250px ou menos. T17 firma os testes novos. Suíte completa no VS Code 1.90.0. M4 e M5 vivos, sem efeito nas larguras medidas |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Marcar as etapas vazias do quadro | ✅ Done | 40fe2d8 |
| T2 Relatar o que a webview renderizou | ✅ Done | 0349606 |
| T3 Criar a view Painel na barra lateral | ✅ Done | c4d2041 |
| T4 Abrir a feature na view lateral | ✅ Done | 8ec2010, completada pela T10 e pela T12 |
| T5 Layout estreito | ✅ Done | cc85728, completada pela T16 |
| T6 Voltar da view oculta e atualizar as duas superfícies | ✅ Done | e5f8fad |
| T7 Cliques dentro da view lateral | ✅ Done | 2e75194 |
| T8 Documentar o painel lateral | ✅ Done | 65a6be7 |
| T9 Relatar só os cartões visíveis | ✅ Done | af6665b |
| T10 Provar o botão da notificação | ✅ Done | ea38828 |
| T11 Fixar o limite de 700px | ✅ Done | 8994f8b |
| T12 Provar a feature aberta na aba e a rolagem medida | ✅ Done | 50bcd2f |
| T13 Provar as entradas do manifesto | ✅ Done | 1ee93b6 |
| T14 Provar o clique com a barra lateral fechada | ✅ Done | 8fa7057 |
| T15 Nomear os eventos do SIDE-05 | ✅ Done | 90a54c3 |
| T16 Caber até 250px | ✅ Done | 32a3d5b. M1, M2, M3, M6 e M7 morrem. M4 e M5 vivem |
| T17 Firmar os testes novos | ✅ Done | 0ab4657 |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SIDE-01 A extensão oferece a view "Painel" no contêiner TLC Specs, com os mesmos projetos do painel em aba | view `tlcSpecs.panel`, nome "Painel", última do contêiner `tlcSpecs`; mesmos projetos e cartões da aba | `test/integration/suite.cjs:617-620` - `deepEqual(views.map((v) => v.id), ['tlcSpecs.features', 'tlcSpecs.project', 'tlcSpecs.panel'])`. `:621` - `deepEqual(views[2], { type: 'webview', id: 'tlcSpecs.panel', name: 'Painel' })`. `:625` - `deepEqual(side.projects, projectIds())`. `:626` - cartões iguais às features do modelo. `:628-629` - `deepEqual(side.projects, tab.projects)` e `deepEqual(side.cards, tab.cards)` | ✅ PASS |
| SIDE-02 WHEN o usuário aciona "Abrir feature no painel" THEN mostra a view Painel nos detalhes da feature, sem abrir nem fechar abas | detalhe da feature na view lateral; abas, editor ativo e grupos iguais aos de antes. Vale para o comando, a barra de status e a notificação | **Título:** `test/integration/suite.cjs:744` - `title === 'Abrir feature no painel'`. **Comando:** `:753` - espera `r.detail === 'notifications'`. `:754-757` - abas iguais. `:758` - editor ativo igual. `:759` - `assert.equal(vscode.window.tabGroups.all.length, 1)`. **Notificação:** `:850` - espera `r.detail === 'side-notified'`. `:852` - `assert.match(toast.message, /Nova spec detectada: side-notified/)`. `:853` - `deepEqual(toast.items, ['Abrir painel'])`. `:854` - `assert.equal(dashboardTab(), undefined)`. **Barra lateral fechada:** `:872` - espera `r.detail === 'billing-invoices'`. `:873` - `deepEqual(report.projects, projectIds())`. `:874-879` - abas, editor e grupos iguais | ✅ PASS |
| SIDE-03 WHILE a view tem menos de 700px THEN etapas em uma coluna, sem rolagem horizontal | 1 coluna e nenhuma rolagem abaixo de 700px. A spec dá a faixa usual da barra lateral: 250 a 500px | **Largura padrão:** `test/integration/suite.cjs:689` - `assert.ok(board.width < 700)`. `:690` - `assert.equal(board.columns, 1)`. `:692` - `assert.equal(board.overflow, false)`. **Estreitando:** `:715-727` - laço até 250px ou menos; a cada passo `:723` - `assert.equal(narrow.columns, 1)` e `:725` - `assert.equal(narrow.overflow, false)`. `:728` - `assert.ok(narrow.width <= 250)`. **Detalhes:** `:729` e `:737` - três features na menor largura e na largura restaurada, `:700` - `assert.equal(detail.overflow, false)`. **Limite:** `test/unit/webview.test.ts:172-176` - bloco `@media (max-width: 699px)` único, com a regra de uma coluna. `:178` - `h3 { flex-wrap: wrap; }` no bloco | ✅ PASS |
| SIDE-04 WHILE a view tem menos de 700px THEN oculta as etapas sem features | etapas vazias ocultas; etapas com features visíveis | `test/integration/suite.cjs:691` - `assert.equal(board.emptyStages, 0)`. `:693` - cartões exibidos iguais às features do modelo. `:724` e `:726` - as mesmas duas asserções a cada largura do laço. `test/unit/webview.test.ts:177` - `.column.is-empty { display: none; }` dentro do bloco. `:181` - regra ausente fora dele. `test/unit/webview.test.ts:160-165` - `is-empty` só nas colunas sem cartões | ✅ PASS |
| SIDE-05 WHEN um artefato é criado, alterado ou removido THEN a view mostra as features atuais, cada uma na sua fase atual | todo cartão com a fase igual à do modelo, depois de cada evento | `test/integration/suite.cjs:635-636` - pares "feature: fase" da tela e do modelo. **Criado:** `:645` - cartões iguais ao modelo. `:647` - `deepEqual(onCards(created), inModel())`. `:651` - o mesmo depois de criar `tasks.md`. **Alterado:** `:655` - espera a fase `'Aguardando verificação'`. `:657` - fase diferente da anterior. `:658` - `deepEqual(onCards(changed), inModel())`. **Removido:** `:662-663` - cartão some. `:664` - `deepEqual(onCards(removed), inModel())` | ✅ PASS |
| SIDE-06 WHEN a view volta a ficar visível THEN mostra os projetos atuais e a feature selecionada | projetos da configuração atual e a mesma feature em detalhe | `test/integration/suite.cjs:794-796` - seleciona, fecha a barra lateral e espera o relatório sumir. `:800` - nada renderizado com a view oculta. `:804` - `deepEqual(report.projects, projectIds())`. `:805` - `assert.equal(report.detail, 'user-auth')` | ✅ PASS |
| SIDE-07 WHEN o usuário clica em um artefato na view Painel THEN abre o preview do markdown | aba de preview do arquivo, sem editor de texto e sem aba do painel | `test/integration/suite.cjs:835-836` - `sidePanelMessage({ type: 'previewFile', ... })` + `expectPreviewOf('design.md')` (`:146-150`). `:837` - `assert.equal(dashboardTab(), undefined)`. Renderer: `test/unit/webview.test.ts:44-53`, `:74-76` | ✅ PASS (resíduo: limite da API) |
| SIDE-08 WHEN o usuário executa "Abrir painel em aba" THEN abre uma aba chamada "TLC Specs" | comando com o título "Abrir painel em aba"; aba `TLC Specs` | `test/integration/suite.cjs:771` - título `'Abrir painel em aba'`. `:772-775` - `view/title` com `when` igual a `'view == tlcSpecs.features || view == tlcSpecs.panel'`. `:780` - espera a aba `TLC Specs`. `:782` - `deepEqual(report.projects, projectIds())`. `:783` - `assert.equal(report.detail, null)`. `:789` - aba nova aberta numa feature mostra `detail === 'billing-invoices'`. Aba já aberta: `:72` e `:74` | ✅ PASS |
| SIDE-09 WHILE o painel em aba tem 700px ou mais THEN seis etapas lado a lado | 6 colunas a partir de 700px | `test/integration/suite.cjs:580-581` - `width >= 700` e `assert.equal(report.columns, 6)`. `:595-596` - a mesma aba ao lado da barra lateral, `width >= 700` e 6 colunas. `:583` e `:597` - `overflow === (width < 1298)`. `:584` e `:598` - etapas vazias visíveis iguais às do modelo. `test/unit/webview.test.ts:172-175` - o limite é 699 e só existe um bloco estreito. `:180` - regra de 6 colunas fora do bloco | ✅ PASS |
| SIDE-10 WHEN a view e a aba estão abertas THEN atualiza as duas | as duas superfícies com os projetos novos | `test/integration/suite.cjs:822-823` - espera os ids novos na aba e na view. `:824-825` - `deepEqual` dos cartões das duas com as features do modelo | ✅ PASS |
| SIDE-11 IF o workspace não tem pasta de specs THEN a view mostra "Nenhuma spec encontrada" | texto exato "Nenhuma spec encontrada" | `test/integration/suite.cjs:673` - `assert.equal(report.emptyMessage, 'Nenhuma spec encontrada')`. `:674-676` - sem projetos, sem cartões, 0 colunas. `:681-682` - projetos voltam e a mensagem some | ✅ PASS |

**Status**: ✅ All ACs covered. 11 de 11 requisitos batem com o resultado da spec. Nenhum gap de precisão.

### SIDE-03: o que foi medido

| Ambiente | Larguras da view | Resultado |
| -------- | ---------------- | --------- |
| VS Code 1.120.0 (instalado) | 299px e 239px | quadro em 1 coluna, sem rolagem. Detalhes de 3 features sem rolagem nas duas larguras |
| VS Code 1.90.0 (mínimo do manifesto) | 255px e um passo abaixo | suíte completa: 46/46 + 1 + 1. Na iteração 2 este mesmo teste falhava |

- **O achado da iteração 2 está confirmado e fechado.** Tirar `h3 { flex-wrap: wrap; }` faz o teste falhar com "the board scrolls sideways at 239px" no VS Code 1.120 (M1). A causa era a largura, não a versão.
- **O laço mede de verdade.** Uma falha que cabe a 299px e estoura a 239px morre no quadro (M7) e nos detalhes (M6).
- **Limite da prova.** O laço para na primeira largura de 250px ou menos. No VS Code 1.120 isso dá duas larguras. O VS Code deixa a barra lateral chegar a uns 170px, e essa faixa não entra na suíte. O autor relata medição manual a 179px; eu não repeti.
- **No VS Code 1.90.0** a largura do passo estreito não fica no log de uma execução que passa. Registro só que a suíte passou.

### O relatório lê a tela ou espelha o estado?

Sem mudança no código desde a iteração 2 (`src/` não mudou em 90a54c3..0ab4657).

| Campo | Origem (`src/webview/main.ts`) | Julgamento |
| ----- | ------------------------------ | ---------- |
| `projects` | `:60` - `projects.map((p) => p.id)` | Espelho do estado, documentado em `src/core/protocol.ts:8-10` |
| `cards` | `:61` - `shown('.card-name')` | Só elementos exibidos (`offsetParent !== null`, `:57`) |
| `phases` | `:62` - `shown('.card-phase')` | Só elementos exibidos, na ordem dos cartões |
| `detail` | `:63` - `.detail-title .mono` | Lido do DOM |
| `columns` | `:64` - `gridTemplateColumns` calculado | Layout real. Mede só o primeiro quadro |
| `emptyStages` | `:65` - `shown('.column.is-empty')` | Layout real |
| `emptyMessage` | `:66` - `.empty-state h1` | Lido do DOM |
| `width` | `:67` - `window.innerWidth` | Medida real |
| `overflow` | `:68` - `scrollWidth > clientWidth` | Medida real, conferida nos dois sentidos |

### Julgamento dos mutantes vivos

- **M4 e M5 (novos)**: sem as regras `.sub-head, .phase-head { flex-wrap: wrap; }` e `.crumb-actions { min-width: 0; }` nada rola a 299px nem a 239px nas três features que o teste abre. Não sei se elas importam abaixo de 239px ou nas outras cinco features da fixture. Não classifiquei: isso pede uma varredura de larguras, e o coordenador pediu que eu não iniciasse varreduras por conta própria. Não bloqueiam porque a prova do SIDE-03 não depende delas: com ou sem as duas regras, as larguras medidas não rolam.
- **H3b e H4 (guarda `live`)**: aceitos desde a iteração 2 como equivalentes no VS Code 1.120. A medição no VS Code 1.90 continua pendente.
- **H5, N4 e N5**: só instrumentação.
- **X1**: clique real dentro da webview, limite da API.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-side3 HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`. Toda execução que abre o VS Code passou pelo lançador de desktop oculto, uma por vez, em primeiro plano. Foram 9 execuções, do limite de 10.

### Iteração 3 (HEAD 0ab4657)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `media/dashboard.css:308` | Layout estreito sem `h3 { flex-wrap: wrap; }` | ✅ Killed (unit do stylesheet; SIDE-03/04: "the board scrolls sideways at 239px") |
| M2 | `media/dashboard.css:326` | Layout estreito sem `.rows li > .grow { ... }` | ✅ Killed (SIDE-03/04: "user-auth scrolls sideways at 239px") |
| M3 | `media/dashboard.css:318` | Layout estreito sem `.feature-actions { ... }` | ✅ Killed (SIDE-03/04: "user-auth scrolls sideways at 239px") |
| M4 | `media/dashboard.css:319` | Layout estreito sem `.sub-head, .phase-head { flex-wrap: wrap; }` | ❌ Survived. Sem efeito nas larguras medidas, ver Follow-up 1 |
| M5 | `media/dashboard.css:317` | Layout estreito sem `.crumb-actions { min-width: 0; }` | ❌ Survived. Sem efeito nas larguras medidas, ver Follow-up 1 |
| M6 | `media/dashboard.css:323` | Título do detalhe com `min-width` de 250px (cabe a 299px, não a 239px) | ✅ Killed (SIDE-03/04: "user-auth scrolls sideways at 239px") |
| M7 | `media/dashboard.css:311` | Blocos do resumo com `min-width` de 120px (cabem a 299px, não a 239px) | ✅ Killed (SIDE-03/04: "the board scrolls sideways at 239px") |

Pelos testes unitários, só M1 morre. M2 a M7 dependem da medição na suíte de integração.

Execuções que abriram o VS Code:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | real | 46/46 + 1 + 1 |
| 2 | M1 | scratch | 45/46, SIDE-03/04 falha |
| 3 | M6 | scratch | 45/46, SIDE-03/04 falha |
| 4 | M7 | scratch | 45/46, SIDE-03/04 falha |
| 5 | M2 | scratch | 45/46, SIDE-03/04 falha |
| 6 | M3 | scratch | 45/46, SIDE-03/04 falha |
| 7 | Sem mutação, VS Code 1.90.0 | scratch | 46/46 + 1 + 1 |
| 8 | M4 | scratch | 46/46 + 1 + 1 |
| 9 | M5 | scratch | 46/46 + 1 + 1 |

Os resultados das iterações 1 e 2 valem para o que não mudou. `src/`, `package.json` e o resto do stylesheet são os mesmos de 90a54c3. Os testes que a T17 mexeu ficaram iguais ou mais fortes, então as mortes anteriores continuam valendo. Não reexecutei mutações antigas.

**Sensor depth**: direcionado ao código da iteração 3 (7 mutações no diff), com o histórico das iterações 1 e 2
**Result**: 5/7 killed - PASS ✅. Os 2 vivos (M4, M5) não têm efeito nas larguras medidas e viram follow-up

### Iteração 2 (HEAD 90a54c3), histórico

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| S4 | `media/dashboard.css:313` | Layout estreito oculta todas as etapas | ✅ Killed |
| S5 | `media/dashboard.css:305` | Layout estreito começa abaixo de 500px | ✅ Killed (unit do stylesheet) |
| S6 | `media/dashboard.css:305` | Layout estreito começa abaixo de 900px | ✅ Killed |
| S7 | `media/dashboard.css:305` | Limite em 700px (erro de um) | ✅ Killed (unit do stylesheet) |
| C2 | `src/extension.ts:47` | Botão da notificação abre a aba | ✅ Killed |
| C3 | `src/extension.ts:57` | `openDashboard` ignora a feature recebida | ✅ Killed |
| P4 | `package.json:120` | Botão de abrir em aba some do título da view | ✅ Killed |
| W2 | `src/webview/main.ts:68` | Relatório fixa `overflow: false` | ✅ Killed |
| W2b | `src/webview/main.ts:68` | Relatório fixa `overflow: true` | ✅ Killed |
| N1 | `src/webview/main.ts:57` | `shown()` não filtra | ✅ Killed |
| N2 | `src/webview/main.ts:57` | `shown()` com o filtro invertido | ✅ Killed |
| N3 | `src/webview/main.ts:62` | `phases` com valor fixo | ✅ Killed |
| N6 | `src/webview/main.ts:62` | `phases` na ordem inversa dos cartões | ✅ Killed |
| N7 | `src/webview/main.ts:62` | `phases` congelado no primeiro relatório | ✅ Killed |
| N5+S4 | `src/webview/main.ts:61` + `media/dashboard.css:313` | T9 desfeita junto com todas as etapas ocultas | ✅ Killed |
| N4 | `src/webview/main.ts:62` | `phases` lê também os cartões ocultos | ❌ Survived (só instrumentação) |
| N5 | `src/webview/main.ts:61` | `cards` lê também os cartões ocultos | ❌ Survived (só instrumentação) |
| H3b | `src/ui/dashboard.ts:58` | Superfície oculta continua `live` | ❌ Survived (equivalente no VS Code 1.120) |
| H4 | `src/ui/dashboard.ts:115` | `select` enviado antes de a webview ficar pronta | ❌ Survived (equivalente no VS Code 1.120) |
| H5 | `src/ui/dashboard.ts:81` | Relatório gravado com a superfície fora do ar | ❌ Survived (só instrumentação) |
| H1, H2, H3, C1, S1, S2, S3, W1, W3 | regressão | As mesmas da iteração 1 | ✅ Killed (9/9) |
| P3 (sonda) | `package.json:83` | `showFeature` perde o título | ✅ Killed |
| X1 (sonda) | `src/webview/main.ts:84` | Webview ignora cliques | ❌ Survived (limite da API) |

Placar da iteração 2: 24 de 29 mortas no diff, 5 vivas aceitas.

### Iteração 1 (HEAD 65a6be7), histórico

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H1 | `src/ui/dashboard.ts:189` | `showSide` abre a aba do editor | ✅ Killed |
| H2 | `src/ui/dashboard.ts:159` | View lateral não recebe o estado | ✅ Killed |
| H3 | `src/ui/dashboard.ts:196` | Mudança de visibilidade não é tratada | ✅ Killed |
| H3b | `src/ui/dashboard.ts:54` | Superfície oculta continua `live` | ❌ Survived (aceito na iteração 2) |
| H4 | `src/ui/dashboard.ts:111` | `select` enviado antes de a webview ficar pronta | ❌ Survived (aceito na iteração 2) |
| H5 | `src/ui/dashboard.ts:77` | Relatório gravado com a superfície fora do ar | ❌ Survived (só instrumentação) |
| C1 | `src/extension.ts:58` | `showFeature` abre a aba | ✅ Killed |
| C2 | `src/extension.ts:47` | Botão da notificação abre a aba | ❌ Survived (fechado na iteração 2) |
| C3 | `src/extension.ts:57` | `openDashboard` ignora a feature recebida | ❌ Survived (fechado na iteração 2) |
| P1 | `package.json:50` | View sem `type: webview` | ✅ Killed |
| P2 | `package.json:77` | Título antigo "Abrir painel" | ✅ Killed |
| P4 | `package.json:120` | Botão some do título da view Painel | ❌ Survived (fechado na iteração 2) |
| W1 | `src/webview/main.ts:49` | Webview nunca manda o relatório | ✅ Killed |
| W2 | `src/webview/main.ts:65` | Relatório fixa `overflow: false` | ❌ Survived (fechado na iteração 2) |
| W3 | `src/webview/main.ts:62` | Relatório fixa `emptyStages: 0` | ✅ Killed |
| R1 | `src/webview/render.ts:174` | `is-empty` nunca é marcado | ✅ Killed |
| R2 | `src/webview/render.ts:174` | `is-empty` sempre é marcado | ✅ Killed |
| S1 | `media/dashboard.css:311` | Layout estreito sem a regra de uma coluna | ✅ Killed |
| S2 | `media/dashboard.css:313` | Etapas vazias deixam de ser ocultas | ✅ Killed |
| S3 | `media/dashboard.css:319` | Título do detalhe com `min-width` de 280px | ✅ Killed |
| S3b | `media/dashboard.css:311` | Coluna do quadro com `min-width` de 720px | ✅ Killed |
| S4 | `media/dashboard.css:313` | Layout estreito oculta todas as etapas | ❌ Survived (fechado na iteração 2) |
| S5 | `media/dashboard.css:305` | Layout estreito começa abaixo de 500px | ❌ Survived (fechado na iteração 2) |
| S6 | `media/dashboard.css:305` | Layout estreito começa abaixo de 900px | ❌ Survived (fechado na iteração 2) |
| P3 (sonda) | `package.json:83` | `showFeature` perde o título | ❌ Survived (fechado na iteração 2) |
| X1 (sonda) | `src/webview/main.ts:81` | Webview ignora cliques | ❌ Survived (limite da API) |
| X2 (sonda) | `src/ui/dashboard.ts:91` | `previewFile` abre o editor de texto | ✅ Killed |

Placar da iteração 1: 14 de 24 mortas no diff.

**Isolamento (iteração 3)**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor. Junction removida com `rmdir` sem recursão. `node_modules` real com 129 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 0ab4657. O VS Code 1.90.0 foi baixado dentro do scratch e saiu junto com ele. Nenhum processo do scratch ficou rodando.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. A feature tem interface, então o UAT fica para o orquestrador.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ⚠️ Duas das cinco regras novas do stylesheet não têm teste que falhe sem elas (M4, M5) |
| Surgical changes | ✅ A iteração 3 soma 5 linhas no bloco estreito e não toca em `src/` |
| No scope creep | ✅ |
| Matches patterns | ✅ O laço de estreitamento usa o mesmo relatório e a mesma espera dos outros testes |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Renderer 1:1 com os critérios. Host com caminho feliz, borda (barra lateral fechada, view oculta, duas superfícies, largura estreita) e vazio (sem specs) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (90a54c3..0ab4657)**: `test/integration/suite.cjs` tem 54 inserções e 10 remoções. `test/unit/webview.test.ts` tem 1 inserção. As 10 linhas removidas:

- SIDE-09 (3 linhas): o comentário e as duas asserções de rolagem. O valor esperado passou de `width < 1250` para `width < 1298` (`:583`, `:597`). É correção, não afrouxamento: seis colunas de 200px, cinco espaços de 10px e 48px de margem da página somam 1298px.
- SIDE-03/SIDE-04 (5 linhas): o laço dos detalhes virou a função `details()` (`:695-702`), com as mesmas asserções, chamada duas vezes.
- Barra lateral fechada (2 linhas): o detalhe pedido passou da asserção para a condição da espera (`:872`), e o teste ganhou a asserção dos projetos (`:873`). A espera falha por tempo se o detalhe não aparecer.

Nenhuma asserção saiu ou ficou mais fraca. A contagem de testes não mudou: 39 unit, 46 + 1 + 1 integration.

---

## Edge Cases

- [x] SIDE-10 As duas superfícies abertas atualizam juntas: `test/integration/suite.cjs:822-825`
- [x] SIDE-11 Sem pasta de specs a view mostra "Nenhuma spec encontrada": `test/integration/suite.cjs:673-676`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 39 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 46/46 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0), no VS Code 1.120.0, pelo desktop oculto
- **Integration no VS Code 1.90.0**: 46/46 + 1/1 + 1/1 (exit 0), no scratch
- **Test count before feature**: 37 unit + 36 integration (contados em cadcb11)
- **Test count after feature**: 39 unit + 48 integration
- **Delta**: +2 unit, +12 integration. Na iteração 3: nenhum teste novo, só asserções
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

Nenhum gap bloqueia a entrega. Ficam dois follow-ups e dois limites aceitos.

### Follow-up 1 (não bloqueia): duas regras do stylesheet sem prova (M4, M5)

- **Root cause**: `media/dashboard.css:317` e `:319` podem sair sem que nenhum teste falhe. O teste mede 299px e 239px e abre três das oito features da fixture.
- **Fix task**: levar o laço de `test/integration/suite.cjs:715` até a menor largura que a barra lateral aceita e abrir todas as features da fixture em `details()` (`:696`). Se M4 e M5 continuarem vivos, tirar as duas regras.
- **Done when**: M4 e M5 morrem, ou as regras saem.
- **Priority**: Minor

### Follow-up 2 (não bloqueia): medir a guarda `live` no VS Code 1.90

- **Root cause**: H3b e H4 são equivalentes no VS Code 1.120. Nas versões de 1.90 a 1.119 ninguém mediu.
- **Fix task**: rodar a suíte no VS Code 1.90.0 com a guarda removida de `src/ui/dashboard.ts:115`. Se o teste da barra lateral fechada falhar, a guarda tem prova. Se passar, a guarda pode sair.
- **Priority**: Minor

### Limite aceito: clique real dentro da webview (X1)

O extension host não clica dentro de uma webview. O listener em `src/webview/main.ts:81-85` é anterior à feature. Sem fix task.

### Limite aceito: limite de 700px provado pelo stylesheet (S5, S7)

Nenhuma superfície é medida entre 500 e 700px. O extension host não põe uma webview numa largura exata. O teste que lê o stylesheet fixa o valor 699.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SIDE-01 | Implementing | ✅ Verified |
| SIDE-02 | Implementing | ✅ Verified |
| SIDE-03 | Implementing | ✅ Verified |
| SIDE-04 | Implementing | ✅ Verified |
| SIDE-05 | Implementing | ✅ Verified |
| SIDE-06 | Implementing | ✅ Verified |
| SIDE-07 | Implementing | ✅ Verified |
| SIDE-08 | Implementing | ✅ Verified |
| SIDE-09 | Implementing | ✅ Verified |
| SIDE-10 | Implementing | ✅ Verified |
| SIDE-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: iteração 3 com 5/7 mortas. 2 vivas sem efeito nas larguras medidas (M4, M5). Das iterações anteriores ficam 5 vivas aceitas: 2 equivalentes no VS Code 1.120 (H3b, H4) e 3 só de instrumentação (H5, N4, N5). Sonda X1 viva, limite da API
**Gate**: typecheck ok, 39 unit, 46 + 1 + 1 integration, 0 falhas, no VS Code 1.120.0 e no 1.90.0

**What works**: view Painel no contêiner TLC Specs. `showFeature`, barra de status e notificação abrem o detalhe na lateral sem mexer nas abas, também com a barra lateral fechada. Quadro em uma coluna e sem rolagem a 299px e a 239px, com as etapas vazias ocultas. Detalhes de feature sem rolagem nas duas larguras. Limite de 700px fixado. Criar, alterar e remover artefato atualizam todos os cartões e fases. Volta da view oculta. Preview a partir da view. Comando "Abrir painel em aba", também numa feature. Atualização das duas superfícies. Mensagem "Nenhuma spec encontrada".

**Issues found**: nenhum gap bloqueante. M4 e M5 ficam como follow-up. A guarda `live` continua sem medição no VS Code 1.90.

**Next steps**: UAT interativo com o usuário e atualização dos status em `spec.md`. Os dois follow-ups podem entrar como tasks depois da entrega.
