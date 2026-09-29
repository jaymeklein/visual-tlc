# Sidebar Dashboard Validation

## Validation: sidebar-dashboard - FAIL ❌

Os gaps da iteração 1 fecharam: os 7 mutantes de produto que viviam agora morrem, e os gates passam no VS Code instalado (1.120). A reprovação vem de um achado novo no SIDE-03. No VS Code 1.90.0, versão mínima que o manifesto aceita, a view lateral abre com 255px e o quadro rola 2px na horizontal. O teste `SIDE-03/SIDE-04` falha ali, em 2 de 2 execuções. A suíte só mede a view a 299px, largura padrão do VS Code instalado.

**Date**: 2026-09-29
**Spec**: `.specs/features/sidebar-dashboard/spec.md`
**Diff range**: cadcb11..90a54c3 (iteração 2: 65a6be7..90a54c3, branch `feat/sidebar-dashboard`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 65a6be7 | Reprovada | 10 mutantes vivos no diff, 6 de produto (S4, C2, S5, S6, C3, P4). SIDE-02, 03, 04 e 09 com gap. SIDE-05 sem precisão. Lições L-008 a L-014, L-006 promovida |
| 2 | 90a54c3 | Reprovada | T9 a T15 fecham os 8 gaps da iteração 1. Nenhum mutante de produto vive. Achado novo: o quadro estreito rola na horizontal a 255px (VS Code 1.90.0). Lição L-015 |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Marcar as etapas vazias do quadro | ✅ Done | 40fe2d8 |
| T2 Relatar o que a webview renderizou | ✅ Done | 0349606 |
| T3 Criar a view Painel na barra lateral | ✅ Done | c4d2041 |
| T4 Abrir a feature na view lateral | ✅ Done | 8ec2010, completada pela T10 e pela T12 |
| T5 Layout estreito | ⚠️ Partial | cc85728. Sem rolagem a 299px. Com rolagem a 255px (Fix 1) |
| T6 Voltar da view oculta e atualizar as duas superfícies | ✅ Done | e5f8fad |
| T7 Cliques dentro da view lateral | ✅ Done | 2e75194 |
| T8 Documentar o painel lateral | ✅ Done | 65a6be7 |
| T9 Relatar só os cartões visíveis | ✅ Done | af6665b. S4 morre |
| T10 Provar o botão da notificação | ✅ Done | ea38828. C2 morre |
| T11 Fixar o limite de 700px | ✅ Done | 8994f8b. S5, S6 e S7 morrem |
| T12 Provar a feature aberta na aba e a rolagem medida | ✅ Done | 50bcd2f. C3, W2 e W2b morrem |
| T13 Provar as entradas do manifesto | ✅ Done | 1ee93b6. P3 e P4 morrem |
| T14 Provar o clique com a barra lateral fechada | ✅ Done | 8fa7057. A guarda `live` fica, com o comentário corrigido |
| T15 Nomear os eventos do SIDE-05 | ✅ Done | 90a54c3. N3, N6 e N7 morrem |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SIDE-01 A extensão oferece a view "Painel" no contêiner TLC Specs, com os mesmos projetos do painel em aba | view `tlcSpecs.panel`, nome "Painel", última do contêiner `tlcSpecs`; mesmos projetos e cartões da aba | `test/integration/suite.cjs:617-620` - `deepEqual(views.map((v) => v.id), ['tlcSpecs.features', 'tlcSpecs.project', 'tlcSpecs.panel'])`. `:621` - `deepEqual(views[2], { type: 'webview', id: 'tlcSpecs.panel', name: 'Painel' })`. `:625` - `deepEqual(side.projects, projectIds())`. `:626` - cartões iguais às features do modelo. `:628-629` - `deepEqual(side.projects, tab.projects)` e `deepEqual(side.cards, tab.cards)` | ✅ PASS |
| SIDE-02 WHEN o usuário aciona "Abrir feature no painel" THEN mostra a view Painel nos detalhes da feature, sem abrir nem fechar abas | detalhe da feature na view lateral; abas, editor ativo e grupos iguais aos de antes. Vale para o comando, a barra de status e a notificação | **Título:** `test/integration/suite.cjs:700` - `assert.equal(commands.find(...showFeature).title, 'Abrir feature no painel')`. **Comando:** `:708-709` - espera `r.detail === 'notifications'`. `:710-713` - abas iguais. `:714` - editor ativo igual. `:715` - `assert.equal(vscode.window.tabGroups.all.length, 1)`. **Notificação:** `:802` - responde com o primeiro botão. `:806` - espera `r.detail === 'side-notified'`. `:808` - `assert.match(toast.message, /Nova spec detectada: side-notified/)`. `:809` - `deepEqual(toast.items, ['Abrir painel'])`. `:810` - `assert.equal(dashboardTab(), undefined)`. `:811-814` - nenhuma aba. **Barra lateral fechada:** `:824-825` - fecha e espera a view sumir. `:829` - `assert.equal(report.detail, 'billing-invoices')`. `:830-835` - abas, editor e grupos iguais | ✅ PASS |
| SIDE-03 WHILE a view tem menos de 700px THEN etapas em uma coluna, sem rolagem horizontal | 1 coluna e nenhuma rolagem em qualquer largura abaixo de 700px | `test/integration/suite.cjs:682` - `assert.ok(board.width < 700)`. `:683` - `assert.equal(board.columns, 1)`. `:685` - `assert.equal(board.overflow, false)`. `:688-693` - detalhes de 3 features sem rolagem. `test/unit/webview.test.ts:172-176` - bloco `@media (max-width: 699px)` único, com a regra de uma coluna. **Falha:** no VS Code 1.90.0 a view tem 255px e `:685` dá `true !== false`. A página mede 240px contra 238px visíveis | ❌ GAP |
| SIDE-04 WHILE a view tem menos de 700px THEN oculta as etapas sem features | etapas vazias ocultas; etapas com features visíveis | `test/integration/suite.cjs:684` - `assert.equal(board.emptyStages, 0)`. `:686` - cartões exibidos iguais às features do modelo (`src/webview/main.ts:57` filtra por `offsetParent`). `test/unit/webview.test.ts:177` - `.column.is-empty { display: none; }` dentro do bloco. `:180` - regra ausente fora dele. `test/unit/webview.test.ts:160-165` - `is-empty` só nas colunas sem cartões | ✅ PASS |
| SIDE-05 WHEN um artefato é criado, alterado ou removido THEN a view mostra as features atuais, cada uma na sua fase atual | cartões iguais às features do modelo depois de cada evento; fase do cartão igual à fase do modelo | **Criado:** `test/integration/suite.cjs:641-642` - cartão `side-new` presente e `deepEqual` dos cartões com o modelo. `:643` - fase do cartão igual a `feature('side-new').phaseLabel`. `:645-646` - `tasks.md` criado, fase muda e bate com o modelo. **Alterado:** `:650` - espera a fase `'Aguardando verificação'`. `:651` - modelo com a mesma fase. `:652` - fase diferente da anterior. **Removido:** `:656-657` - cartão some e `deepEqual` com o modelo | ✅ PASS |
| SIDE-06 WHEN a view volta a ficar visível THEN mostra os projetos atuais e a feature selecionada | projetos da configuração atual e a mesma feature em detalhe | `test/integration/suite.cjs:751-752` - fecha a barra lateral e espera o relatório sumir. `:754-756` - muda as pastas com a view oculta. `:760` - `deepEqual(report.projects, projectIds())`. `:761` - `assert.equal(report.detail, 'user-auth')` | ✅ PASS |
| SIDE-07 WHEN o usuário clica em um artefato na view Painel THEN abre o preview do markdown | aba de preview do arquivo, sem editor de texto e sem aba do painel | `test/integration/suite.cjs:791-792` - `sidePanelMessage({ type: 'previewFile', ... })` + `expectPreviewOf('design.md')` (`:146-150`). `:793` - `assert.equal(dashboardTab(), undefined)`. Renderer: `test/unit/webview.test.ts:44-53`, `:74-76` | ✅ PASS (resíduo: limite da API) |
| SIDE-08 WHEN o usuário executa "Abrir painel em aba" THEN abre uma aba chamada "TLC Specs" | comando com o título "Abrir painel em aba"; aba `TLC Specs` | `test/integration/suite.cjs:727` - título `'Abrir painel em aba'`. `:728-731` - `view/title` com `when` igual a `'view == tlcSpecs.features || view == tlcSpecs.panel'`. `:736` - espera a aba com `t.label === 'TLC Specs'` (`:696`). `:738` - `deepEqual(report.projects, projectIds())`. `:739` - `assert.equal(report.detail, null)`. `:743-745` - aba nova aberta numa feature mostra `detail === 'billing-invoices'`. Aba já aberta: `:72` e `:74` | ✅ PASS |
| SIDE-09 WHILE o painel em aba tem 700px ou mais THEN seis etapas lado a lado | 6 colunas a partir de 700px | `test/integration/suite.cjs:580-581` - `width >= 700` e `assert.equal(report.columns, 6)`, medido a 1092px. `:595-596` - a mesma aba ao lado da barra lateral, `width >= 700` e 6 colunas, medido a 792px. `:584` e `:598` - etapas vazias visíveis iguais às do modelo. `test/unit/webview.test.ts:172-175` - o limite é 699 e só existe um bloco estreito. `:179` - regra de 6 colunas fora do bloco | ✅ PASS |
| SIDE-10 WHEN a view e a aba estão abertas THEN atualiza as duas | as duas superfícies com os projetos novos | `test/integration/suite.cjs:778-779` - espera os ids novos na aba e na view. `:780-781` - `deepEqual` dos cartões das duas com as features do modelo | ✅ PASS |
| SIDE-11 IF o workspace não tem pasta de specs THEN a view mostra "Nenhuma spec encontrada" | texto exato "Nenhuma spec encontrada" | `test/integration/suite.cjs:666` - `assert.equal(report.emptyMessage, 'Nenhuma spec encontrada')`. `:667-669` - sem projetos, sem cartões, 0 colunas. `:674-675` - projetos voltam e a mensagem some | ✅ PASS |

**Status**: ❌ Gaps present. 10 de 11 batem com a spec. SIDE-03 tem gap. Nenhum gap de precisão.

### SIDE-03: o que foi medido e o que não foi

| Ambiente | Largura da view | Página (scroll/visível) | `overflow` | Teste |
| -------- | --------------- | ----------------------- | ---------- | ----- |
| VS Code 1.120.0 (instalado) | 299px | 284/284 | `false` | passa |
| VS Code 1.90.0 (mínimo do manifesto) | 255px | 240/238 | `true` | falha em `suite.cjs:685`, 2 de 2 execuções |

- **O que transborda**: o título "Lições confirmadas" do bloco de lições (`src/webview/render.ts:271`). O `h3` é uma linha flex sem quebra (`media/dashboard.css:38`). A 255px ele precisa de 213px e tem 184px. O trecho "· N candidata(s) em observação" termina em 239,7px, numa área visível de 238px.
- **Causa provável**: a largura, não a versão. A 299px sobram 230px para o mesmo título, que cabe. A conta indica rolagem abaixo de uns 283px em qualquer versão.
- **Não medido**: a varredura de larguras no VS Code 1.120 não foi executada. O coordenador mandou parar de abrir o VS Code, porque as janelas de teste atrapalhavam quem usa a máquina. A rolagem abaixo de 283px no VS Code 1.120 é inferência.
- **Por que conta como gap**: o critério vale para qualquer largura abaixo de 700px. A própria spec diz que a barra lateral costuma ter de 250 a 500px. O manifesto aceita o VS Code 1.90 (`package.json:11`), e lá a view abre a 255px.

### O relatório lê a tela ou espelha o estado?

| Campo | Origem (`src/webview/main.ts`) | Julgamento |
| ----- | ------------------------------ | ---------- |
| `projects` | `:60` - `projects.map((p) => p.id)` | Espelho do estado. O comentário em `src/core/protocol.ts:8-10` agora diz isso |
| `cards` | `:61` - `shown('.card-name')` | Só elementos exibidos (`offsetParent !== null`, `:57`) |
| `phases` | `:62` - `shown('.card-phase')` | Só elementos exibidos, na ordem dos cartões. N3, N6 e N7 morrem |
| `detail` | `:63` - `.detail-title .mono` | Lido do DOM |
| `columns` | `:64` - `gridTemplateColumns` calculado | Layout real. Mede só o primeiro quadro |
| `emptyStages` | `:65` - `shown('.column.is-empty')` | Layout real. N1 e W3 morrem |
| `emptyMessage` | `:66` - `.empty-state h1` | Lido do DOM |
| `width` | `:67` - `window.innerWidth` | Medida real |
| `overflow` | `:68` - `scrollWidth > clientWidth` | Medida real, conferida nos dois sentidos: `true` na aba (W2 morre) e `false` na view (W2b morre) |

### Julgamento da guarda `live` (H3b, H4)

Aceito H3b e H4 como mutantes equivalentes no VS Code 1.120. Não são gap.

- O cenário da barra lateral fechada está na suíte (`suite.cjs:820-836`) e passa com e sem a guarda. No VS Code 1.120 nenhum comportamento visível depende dela.
- O motivo para manter é válido. Em cadcb11 a aba nova já esperava o "ready" antes de mandar a seleção. Tirar a guarda mudaria esse comportamento.
- O comentário em `src/ui/dashboard.ts:15-19` diz o que foi medido e o que não foi.
- **Pendência**: as versões de 1.90 a 1.119 continuam sem medição. Eu ia rodar H3b e H4 no VS Code 1.90.0 e não rodei, pelo mesmo motivo da varredura de larguras.

### Julgamento do SIDE-07

Sem mudança desde a iteração 1. O resultado é conferido na tela. O caminho da webview real até o tratador está provado pelo relatório, que chega pelo mesmo canal. O clique real no DOM não pode ser acionado pelo extension host (X1 vivo, código anterior à feature). Limite da API.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-side2 HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`. Linha de base no scratch: 39 unit, 46 + 1 + 1 integration. VS Code 1.120.0.

### Iteração 2 (HEAD 90a54c3)

Sobreviventes da iteração 1, reinjetados:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| S4 | `media/dashboard.css:313` | Layout estreito oculta todas as etapas | ✅ Killed (unit do stylesheet; SIDE-01, SIDE-03/04, SIDE-05, SIDE-10) |
| S5 | `media/dashboard.css:305` | Layout estreito começa abaixo de 500px | ✅ Killed (unit do stylesheet). A integração passa |
| S6 | `media/dashboard.css:305` | Layout estreito começa abaixo de 900px | ✅ Killed (unit do stylesheet; SIDE-09 a 792px) |
| C2 | `src/extension.ts:47` | Botão da notificação abre a aba | ✅ Killed (SIDE-02 notificação) |
| C3 | `src/extension.ts:57` | `openDashboard` ignora a feature recebida | ✅ Killed (`opens the dashboard webview`, SIDE-08) |
| P4 | `package.json:120` | Botão de abrir em aba some do título da view | ✅ Killed (SIDE-08) |
| W2 | `src/webview/main.ts:68` | Relatório fixa `overflow: false` | ✅ Killed (SIDE-09) |
| H3b | `src/ui/dashboard.ts:58` | Superfície oculta continua `live` | ❌ Survived. Equivalente no VS Code 1.120, aceito |
| H4 | `src/ui/dashboard.ts:115` | `select` enviado antes de a webview ficar pronta | ❌ Survived. Equivalente no VS Code 1.120, aceito |
| H5 | `src/ui/dashboard.ts:81` | Relatório gravado com a superfície fora do ar | ❌ Survived. Só instrumentação |

Mutações novas contra o código da iteração 2:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| S7 | `media/dashboard.css:305` | Limite em 700px (erro de um) | ✅ Killed (unit do stylesheet). A integração passa |
| W2b | `src/webview/main.ts:68` | Relatório fixa `overflow: true` | ✅ Killed (SIDE-03/04) |
| N1 | `src/webview/main.ts:57` | `shown()` não filtra | ✅ Killed (SIDE-03/04) |
| N2 | `src/webview/main.ts:57` | `shown()` com o filtro invertido | ✅ Killed (SIDE-01, SIDE-03/04, SIDE-05, SIDE-09, SIDE-10) |
| N3 | `src/webview/main.ts:62` | `phases` com valor fixo | ✅ Killed (SIDE-05) |
| N6 | `src/webview/main.ts:62` | `phases` na ordem inversa dos cartões | ✅ Killed (SIDE-05) |
| N7 | `src/webview/main.ts:62` | `phases` congelado no primeiro relatório | ✅ Killed (SIDE-05) |
| N4 | `src/webview/main.ts:62` | `phases` lê também os cartões ocultos | ❌ Survived. Só instrumentação |
| N5 | `src/webview/main.ts:61` | `cards` lê também os cartões ocultos (T9 desfeita) | ❌ Survived. Só instrumentação |
| N5+S4 | `src/webview/main.ts:61` + `media/dashboard.css:313` | T9 desfeita junto com todas as etapas ocultas | ✅ Killed (SIDE-05) |

Regressão (amostra das mortas da iteração 1):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H1 | `src/ui/dashboard.ts:193` | `showSide` abre a aba do editor | ✅ Killed (5 testes) |
| H2 | `src/ui/dashboard.ts:163` | View lateral não recebe o estado | ✅ Killed (5 testes) |
| H3 | `src/ui/dashboard.ts:200` | Mudança de visibilidade não é tratada | ✅ Killed (SIDE-06, SIDE-02 barra fechada) |
| C1 | `src/extension.ts:58` | `showFeature` abre a aba | ✅ Killed (4 testes) |
| S1 | `media/dashboard.css:311` | Layout estreito sem a regra de uma coluna | ✅ Killed (unit do stylesheet; SIDE-03/04) |
| S2 | `media/dashboard.css:313` | Etapas vazias deixam de ser ocultas | ✅ Killed (unit do stylesheet; SIDE-03/04) |
| S3 | `media/dashboard.css:319` | Título do detalhe volta ao `min-width` de 280px | ✅ Killed (SIDE-03/04) |
| W1 | `src/webview/main.ts:49` | Webview nunca manda o relatório | ✅ Killed (13 testes) |
| W3 | `src/webview/main.ts:65` | Relatório fixa `emptyStages: 0` | ✅ Killed (SIDE-09) |

Sondas fora do diff (não contam no placar):

| Probe | File:line | Description | Killed? |
| ----- | --------- | ----------- | ------- |
| P3 | `package.json:83` | `showFeature` perde o título | ✅ Killed (SIDE-02) |
| X1 | `src/webview/main.ts:84` | Webview ignora cliques | ❌ Survived. Limite da API |

Classificação dos sobreviventes no diff:

| Mutation | Classe | Motivo |
| -------- | ------ | ------ |
| H3b, H4 | Equivalente no VS Code 1.120 | O teste da barra lateral fechada passa com e sem a guarda |
| H5 | Só instrumentação | Protege o gancho de teste contra um relatório atrasado |
| N4, N5 | Só instrumentação | Com o stylesheet entregue nenhum cartão fica oculto. Quando fica, a suíte percebe (N5+S4 morre) |

Execuções fora do placar, no scratch:

| Run | O que fez | Resultado |
| --- | --------- | --------- |
| V90-B0 | Suíte sem mutação no VS Code 1.90.0 | 45/46 + 1 + 1. Falha `SIDE-03/SIDE-04` em `suite.cjs:685` |
| D-old | Mesma suíte no 1.90.0, com diagnóstico do que transborda | 45/46. View com 255px, página 240/238 |
| D-new | Mesmo diagnóstico no VS Code 1.120.0 | 46/46. View com 299px, página 284/284 |
| Varredura de larguras | Não executada | Interrompida a pedido do coordenador |
| H3b, H4 e H5 no 1.90.0 | Não executadas | Interrompidas a pedido do coordenador |

**Sensor depth**: P0-full manual (29 mutações no diff: 10 reinjetadas, 10 novas, 9 de regressão)
**Result**: 24/29 killed. Os 5 vivos são aceitos: 2 equivalentes e 3 de instrumentação. Nenhuma falha de produto viva

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

**Isolamento (iteração 2)**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor. Junction removida com `rmdir` sem recursão. `node_modules` real com 129 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 90a54c3. O VS Code 1.90.0 foi baixado dentro do scratch e saiu junto com ele. Nenhum processo do scratch ficou rodando.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O UAT fica para o orquestrador, depois do Fix 1.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ A iteração 2 muda 5 linhas em `src/webview/main.ts` e um comentário em `src/ui/dashboard.ts`. A guarda `live` fica por decisão registrada |
| Surgical changes | ✅ `shown()` serve aos três campos que dependem de visibilidade |
| No scope creep | ✅ `phases` existe para provar o SIDE-05 |
| Matches patterns | ✅ Os testes novos seguem o formato da suíte. O teste da notificação repete a troca de função do SF-09 |
| Spec-anchored outcome check (asserted values match spec) | ❌ SIDE-03 falha a 255px |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ O layout estreito é medido numa largura só |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (65a6be7..90a54c3)**: `test/integration/suite.cjs` tem 98 inserções e 6 remoções. `test/unit/webview.test.ts` tem 17 inserções e nenhuma remoção. As 6 linhas removidas continuam na suíte em forma igual ou mais forte:

- SIDE-05 (3 linhas): título do teste, `const report` e `deepEqual` dos cartões. As asserções estão em `:641-642`.
- SIDE-08 (2 linhas): a asserção do título está em `:727`.
- `showSidePanel` (1 linha): só mudou o espaçamento, `=() =>` em `:601`.

Dois testes existentes ganharam asserções: `opens the dashboard webview` (`:72`, `:74`) e `SIDE-09` (`:583`, `:589-598`). Nenhuma asserção ficou mais fraca. `startup.cjs`, `multiroot.cjs` e as fixtures não mudaram.

**Observações que não bloqueiam**:

- `test/integration/suite.cjs:583` e `:597` esperam rolagem quando `width < 1250`. O quadro rola até 1297px, porque o `body` tem 24px de cada lado (`media/dashboard.css:27`). A T12 em `tasks.md` cita 1298px. Numa janela com a aba entre 1250 e 1297px o teste falha sem defeito no produto.
- `test/integration/suite.cjs:828-829` aceita o primeiro relatório com projetos e depois confere o detalhe. Se o relatório do estado restaurado chegar antes da seleção, o teste falha. Nesta iteração ele só falhou sob mutações que o atingem (H1, H3, C1, W1). Esperar por `r.detail === 'billing-invoices'` tira a dependência de ordem.
- A fase é conferida só no cartão de `side-new`. Comparar todos os pares cartão e fase com o modelo cobre o "cada uma" do critério por inteiro.
- S5 e S7 morrem só pelo teste que lê o stylesheet. Nenhuma superfície é medida entre 500 e 700px. O extension host não põe uma webview numa largura exata, então aceito a prova estática.

---

## Edge Cases

- [x] SIDE-10 As duas superfícies abertas atualizam juntas: `test/integration/suite.cjs:778-781`
- [x] SIDE-11 Sem pasta de specs a view mostra "Nenhuma spec encontrada": `test/integration/suite.cjs:666-669`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 39 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 46/46 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0), três aberturas de VS Code 1.120.0
- **Test count before feature**: 37 unit + 36 integration (contados em cadcb11)
- **Test count after feature**: 39 unit + 48 integration
- **Delta**: +2 unit, +12 integration. Na iteração 2: +1 unit, +2 integration
- **Skipped tests**: nenhum
- **Failures**: nenhuma no VS Code instalado

Os números do autor conferem. Fora do gate: no VS Code 1.90.0 a suíte dá 45/46 (ver SIDE-03).

---

## Fix Plans (if issues found)

### Fix 1: o quadro estreito rola na horizontal a 255px (SIDE-03)

- **Root cause**: o `h3` dos blocos é uma linha flex sem quebra (`media/dashboard.css:38`). O título "Lições confirmadas" com o contador e o trecho "· N candidata(s) em observação" (`src/webview/render.ts:271`) precisa de 213px. A 255px de view sobram 184px. O bloco `@media (max-width: 699px)` não trata esse título.
- **Fix task**: no bloco estreito de `media/dashboard.css`, deixar o `h3` quebrar linha (`flex-wrap: wrap`) e o texto encolher (`min-width: 0` nos filhos). Medir a view em mais de uma largura no teste `SIDE-03/SIDE-04`: focar a view, estreitar a barra lateral com `workbench.action.decreaseViewWidth`, chamar `api.refresh()` e conferir `columns === 1` e `overflow === false` a cada passo, no quadro e no detalhe.
- **Done when**: o teste passa na largura mínima que a barra lateral aceita e na largura padrão. A suíte passa no VS Code 1.90.0.
- **Requirement**: SIDE-03
- **Priority**: Major
- **Aviso**: o comando `workbench.action.decreaseViewWidth` e a correção do CSS não foram experimentados pelo Verifier. A varredura foi interrompida antes de rodar.

### Fix 2 (não bloqueia): medir a guarda `live` no VS Code 1.90

- **Root cause**: H3b e H4 são equivalentes no VS Code 1.120. Nas versões de 1.90 a 1.119 ninguém mediu.
- **Fix task**: rodar a suíte no VS Code 1.90.0 com a guarda removida de `src/ui/dashboard.ts:115`. O `@vscode/test-electron` baixa a versão com `version: '1.90.0'`. Se o teste da barra lateral fechada falhar, a guarda tem prova e o comentário muda. Se passar, a guarda pode sair.
- **Priority**: Minor

### Fix 3 (não bloqueia): fragilidade dos testes novos

- **Fix task**: trocar `width < 1250` por `width < 1298` em `test/integration/suite.cjs:583` e `:597`. Esperar por `r.detail === 'billing-invoices'` em `:828`. Conferir a fase de todos os cartões no SIDE-05.
- **Priority**: Minor

### Limite aceito: clique real dentro da webview (X1)

O extension host não clica dentro de uma webview. O listener em `src/webview/main.ts:81-85` é anterior à feature. Sem fix task.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SIDE-01 | Implementing | ✅ Verified |
| SIDE-02 | Implementing | ✅ Verified |
| SIDE-03 | Implementing | ❌ Needs Fix (Fix 1) |
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

**Overall**: ❌ Not Ready

**Spec-anchored check**: 10/11 requisitos batem com a spec. SIDE-03 com gap. 0 gaps de precisão
**Sensor**: 24/29 mutações do diff mortas. 5 vivas e aceitas: 2 equivalentes no VS Code 1.120 (H3b, H4), 3 só de instrumentação (H5, N4, N5). Sondas fora do diff: 1 morta (P3), 1 viva (X1, limite da API)
**Gate**: typecheck ok, 39 unit, 46 + 1 + 1 integration, 0 falhas no VS Code 1.120.0

**What works**: tudo o que a iteração 1 aprovou, mais os 8 gaps fechados. O relatório conta só o que está na tela. A notificação abre a view lateral. O limite de 700px está fixado por teste e medido a 792px e a 1092px. A aba aberta numa feature mostra a feature. As entradas do manifesto têm asserção. O clique com a barra lateral fechada tem teste. O SIDE-05 cobre criar, alterar e remover.

**Issues found**: o quadro estreito rola 2px na horizontal com a view a 255px, largura padrão do VS Code 1.90.0 (Fix 1).

**Next steps**: executar o Fix 1 e verificar de novo (iteração 3 de 3). Combinar com quem usa a máquina um horário para as execuções que abrem o VS Code.
