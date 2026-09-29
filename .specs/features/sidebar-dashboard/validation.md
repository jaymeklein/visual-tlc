# Sidebar Dashboard Validation

## Validation: sidebar-dashboard - FAIL ❌

Os gates passam e o painel lateral funciona nos caminhos testados. A reprovação vem do sensor: 10 das 24 mutações no diff sobrevivem, e 5 delas são falhas de produto ligadas a requisitos. A mais grave esconde todas as etapas do quadro estreito e a suíte continua verde, porque o relatório conta cartões que existem no DOM, não cartões que aparecem na tela. O limite de 700px e o botão da notificação também ficam sem prova.

**Date**: 2026-09-29
**Spec**: `.specs/features/sidebar-dashboard/spec.md`
**Diff range**: cadcb11..65a6be7 (commits 2b52e80..65a6be7, branch `feat/sidebar-dashboard`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Marcar as etapas vazias do quadro | ✅ Done | 40fe2d8 |
| T2 Relatar o que a webview renderizou | ✅ Done | 0349606 |
| T3 Criar a view Painel na barra lateral | ✅ Done | c4d2041 |
| T4 Abrir a feature na view lateral | ⚠️ Partial | 8ec2010. `openDashboard` aceita uma feature, mas nenhum teste confere a feature aberta (C3). A notificação não tem teste (C2) |
| T5 Layout estreito | ⚠️ Partial | cc85728. Uma coluna e rolagem provadas a 299px. Limite de 700px e etapas visíveis sem prova (S4, S5, S6) |
| T6 Voltar da view oculta e atualizar as duas superfícies | ✅ Done | e5f8fad |
| T7 Cliques dentro da view lateral | ✅ Done | 2e75194 |
| T8 Documentar o painel lateral | ✅ Done | 65a6be7 |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SIDE-01 A extensão oferece a view "Painel" no contêiner TLC Specs, com os mesmos projetos do painel em aba | view `tlcSpecs.panel`, nome "Painel", última do contêiner `tlcSpecs`; mesmos projetos e cartões da aba | `test/integration/suite.cjs:601-604` - `deepEqual(views.map((v) => v.id), ['tlcSpecs.features', 'tlcSpecs.project', 'tlcSpecs.panel'])`. `:605` - `deepEqual(views[2], { type: 'webview', id: 'tlcSpecs.panel', name: 'Painel' })`. `:609` - `deepEqual(side.projects, projectIds())`. `:610` - cartões iguais às features do modelo. `:612-613` - `deepEqual(side.projects, tab.projects)` e `deepEqual(side.cards, tab.cards)` | ✅ PASS |
| SIDE-02 WHEN o usuário aciona "Abrir feature no painel" THEN mostra a view Painel nos detalhes da feature, sem abrir nem fechar abas | detalhe da feature na view lateral; abas, editor ativo e grupos iguais aos de antes. A tabela de decisões inclui botão, menu, barra de status e notificações | `test/integration/suite.cjs:669-670` - `showFeature` + espera `r.detail === 'notifications'`. `:671-674` - `deepEqual(allTabs().map((t) => t.label), tabs)`. `:675` - editor ativo igual. `:676` - `assert.equal(vscode.window.tabGroups.all.length, 1)`. `:678-683` - segunda feature, abas iguais. **Falta:** o botão da notificação chama `dashboard.showSide` direto (`src/extension.ts:47`) e não tem teste (C2 vivo). O título "Abrir feature no painel" não é conferido (P3 vivo) | ❌ GAP (comando provado, notificação não) |
| SIDE-03 WHILE a view tem menos de 700px THEN etapas em uma coluna, sem rolagem horizontal | 1 coluna e nenhuma rolagem abaixo de 700px | `test/integration/suite.cjs:646` - `assert.ok(board.width < 700)`. `:647` - `assert.equal(board.columns, 1)`. `:649` - `assert.equal(board.overflow, false)`. `:652-657` - detalhes de 3 features sem rolagem. **Falta:** a medição acontece só a 299px. Trocar o limite para 499px ou 899px não quebra nenhum teste (S5, S6 vivos). Nada confere que as etapas aparecem (S4 vivo) | ❌ GAP |
| SIDE-04 WHILE a view tem menos de 700px THEN oculta as etapas sem features | etapas vazias ocultas; etapas com features visíveis | `test/integration/suite.cjs:648` - `assert.equal(board.emptyStages, 0)`. `test/unit/webview.test.ts:158-163` - 6 colunas, só "Execução" com cartões, `is-empty` em todas as outras. **Falta:** `:650` confere os cartões pelo DOM, e um cartão dentro de coluna com `display: none` ainda conta (S4 vivo) | ❌ GAP |
| SIDE-05 WHEN um artefato muda em uma pasta de specs THEN atualiza a view Painel | a spec não diz qual evento (criar, alterar, remover) nem o que muda na tela | `test/integration/suite.cjs:619-621` - grava `side-new/spec.md`, espera `r.cards.includes('side-new')`, depois `deepEqual` dos cartões com as features do modelo. Cobre criação | ⚠️ Spec-precision gap |
| SIDE-06 WHEN a view volta a ficar visível THEN mostra os projetos atuais e a feature selecionada | projetos da configuração atual e a mesma feature em detalhe | `test/integration/suite.cjs:701-702` - fecha a barra lateral e espera o relatório sumir. `:704-706` - muda as pastas com a view oculta. `:710` - `deepEqual(report.projects, projectIds())`. `:711` - `assert.equal(report.detail, 'user-auth')` | ✅ PASS |
| SIDE-07 WHEN o usuário clica em um artefato na view Painel THEN abre o preview do markdown | aba de preview do arquivo, sem editor de texto e sem aba do painel | `test/integration/suite.cjs:741-742` - `sidePanelMessage({ type: 'previewFile', ... 'features/user-auth/design.md' })` + `expectPreviewOf('design.md')` (`:145-147`). `:743` - `assert.equal(dashboardTab(), undefined)`. Renderer: `test/unit/webview.test.ts:42-51`, `:72-74` | ✅ PASS (resíduo: limite da API) |
| SIDE-08 WHEN o usuário executa "Abrir painel em aba" THEN abre uma aba chamada "TLC Specs" | comando com o título "Abrir painel em aba"; aba `TLC Specs` | `test/integration/suite.cjs:688` - `assert.equal(declared.title, 'Abrir painel em aba')`. `:693` - espera a aba com `t.label === 'TLC Specs'` (`:660`). `:695` - `deepEqual(report.projects, projectIds())` | ✅ PASS |
| SIDE-09 WHILE o painel em aba tem 700px ou mais THEN seis etapas lado a lado | 6 colunas a partir de 700px | `test/integration/suite.cjs:578` - `assert.ok(report.width >= 700)`. `:579` - `assert.equal(report.columns, 6)`. `:580` - etapas vazias visíveis iguais às do modelo. `:581-582` - cartões e `detail === null`. **Falta:** a aba é medida acima de 900px. Entre 700 e 899px nada é conferido (S6 vivo) | ❌ GAP (limite) |
| SIDE-10 WHEN a view e a aba estão abertas THEN atualiza as duas | as duas superfícies com os projetos novos | `test/integration/suite.cjs:728-729` - espera os ids novos na aba e na view. `:730-731` - `deepEqual` dos cartões das duas com as features do modelo | ✅ PASS |
| SIDE-11 IF o workspace não tem pasta de specs THEN a view mostra "Nenhuma spec encontrada" | texto exato "Nenhuma spec encontrada" | `test/integration/suite.cjs:630` - `assert.equal(report.emptyMessage, 'Nenhuma spec encontrada')`. `:631-633` - sem projetos, sem cartões, 0 colunas. `:638-639` - projetos voltam e a mensagem some | ✅ PASS |

**Status**: ❌ Gaps present. 6 de 11 batem com a spec (SIDE-01, 06, 07, 08, 10, 11). 4 têm gap (SIDE-02, 03, 04, 09). 1 tem gap de precisão na spec (SIDE-05).

### O relatório lê a tela ou espelha o estado?

| Campo | Origem (`src/webview/main.ts`) | Julgamento |
| ----- | ------------------------------ | ---------- |
| `projects` | `:58` - `projects.map((p) => p.id)` | Espelho do estado da webview, não do DOM. O comentário de `Rendered` em `src/core/protocol.ts:8` diz "read back from its DOM" e não vale para este campo. Falhas do host aparecem nele (H2 e W1 morrem). Falhas entre o estado e o DOM não |
| `cards` | `:59` - `querySelectorAll('.card-name')` | Lido do DOM, mas conta presença, não visibilidade. É a causa do S4 |
| `detail` | `:60` - `.detail-title .mono` | Lido do DOM |
| `columns` | `:61` - `getComputedStyle(boards[0]).gridTemplateColumns` | Layout real. Mede só o primeiro quadro |
| `emptyStages` | `:62` - `getComputedStyle(el).display` | Layout real. Tem controle positivo na suíte (SIDE-09 espera valor maior que zero, W3 morre) |
| `emptyMessage` | `:63` - `.empty-state h1` | Lido do DOM |
| `width` | `:64` - `window.innerWidth` | Medida real. 299px na view lateral |
| `overflow` | `:65` - `scrollWidth > clientWidth` | Medida real: S3 e S3b morrem. A suíte nunca vê o valor `true`, então um relatório que sempre diz `false` passa (W2 vivo) |

### Julgamento do SIDE-07

O teste entrega a mensagem direto ao tratador da view lateral e confere o resultado na tela: a aba de preview existe, não há editor de texto e a aba do painel não abriu. O caminho da webview real até o tratador está provado por outra via: o relatório `rendered` chega pelo mesmo `onDidReceiveMessage` (`src/ui/dashboard.ts:44`), e W1 e P1 morrem. O renderer marca os artefatos com `preview-file` e `actionFor` devolve a mensagem certa (`test/unit/webview.test.ts:72-74`).

Falta um elo: o clique real no DOM até o `postMessage` (`src/webview/main.ts:78-82`). A sonda X1 desliga esse listener e a suíte continua verde. O código é anterior à feature, vale para as duas superfícies, e o extension host não consegue clicar dentro de uma webview. Classifico como limite da API do VS Code. Não bloqueia.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-side HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`. Linha de base no scratch: 44 + 1 + 1. VS Code 1.120.0.

### Mutações no diff

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H1 | `src/ui/dashboard.ts:189` | `showSide` abre a aba do editor | ✅ Killed (SIDE-02, SIDE-03/04, SIDE-06) |
| H2 | `src/ui/dashboard.ts:159` | View lateral não recebe o estado quando o store muda | ✅ Killed (SIDE-05, SIDE-10, SIDE-11, SIDE-03/04) |
| H3 | `src/ui/dashboard.ts:196` | Mudança de visibilidade não é tratada | ✅ Killed (SIDE-06, na espera "the side panel to hide") |
| H3b | `src/ui/dashboard.ts:54` | Superfície oculta continua `live` | ❌ Survived. Equivalente no VS Code 1.120, ver Fix 6 |
| H4 | `src/ui/dashboard.ts:111` | `select` enviado antes de a webview ficar pronta | ❌ Survived. Equivalente no VS Code 1.120, ver Fix 6 |
| H5 | `src/ui/dashboard.ts:77` | Relatório gravado com a superfície fora do ar | ❌ Survived. Só instrumentação |
| C1 | `src/extension.ts:58` | `showFeature` abre a aba | ✅ Killed (SIDE-02, SIDE-03/04, SIDE-06) |
| C2 | `src/extension.ts:47` | Botão da notificação abre a aba | ❌ Survived. Falha de produto, ver Fix 2 |
| C3 | `src/extension.ts:57` | `openDashboard` ignora a feature recebida | ❌ Survived. Falha de produto, ver Fix 4 |
| P1 | `package.json:50` | View `tlcSpecs.panel` sem `type: webview` | ✅ Killed (SIDE-01 e mais 6) |
| P2 | `package.json:77` | Título antigo "Abrir painel" | ✅ Killed (SIDE-08) |
| P4 | `package.json:120` | Botão de abrir em aba some do título da view Painel | ❌ Survived. Falha de produto sem critério na spec, ver Fix 5 |
| W1 | `src/webview/main.ts:49` | Webview nunca manda o relatório | ✅ Killed (10 testes) |
| W2 | `src/webview/main.ts:65` | Relatório fixa `overflow: false` | ❌ Survived. Só instrumentação, ver Fix 7 |
| W3 | `src/webview/main.ts:62` | Relatório fixa `emptyStages: 0` | ✅ Killed (SIDE-09) |
| R1 | `src/webview/render.ts:174` | `is-empty` nunca é marcado | ✅ Killed (unit SIDE-04) |
| R2 | `src/webview/render.ts:174` | `is-empty` sempre é marcado | ✅ Killed (unit SIDE-04) |
| S1 | `media/dashboard.css:311` | Layout estreito sem a regra de uma coluna | ✅ Killed (SIDE-03/04) |
| S2 | `media/dashboard.css:313` | Etapas vazias deixam de ser ocultas | ✅ Killed (SIDE-03/04) |
| S3 | `media/dashboard.css:319` | Título do detalhe volta ao `min-width` de 280px | ✅ Killed (SIDE-03/04) |
| S3b | `media/dashboard.css:311` | Coluna do quadro com `min-width` de 720px | ✅ Killed (SIDE-03/04) |
| S4 | `media/dashboard.css:313` | Layout estreito oculta todas as etapas | ❌ Survived. Falha de produto, ver Fix 1 |
| S5 | `media/dashboard.css:305` | Layout estreito começa abaixo de 500px | ❌ Survived. Falha de produto, ver Fix 3 |
| S6 | `media/dashboard.css:305` | Layout estreito começa abaixo de 900px | ❌ Survived. Falha de produto, ver Fix 3 |

### Classificação dos sobreviventes

| Mutation | Classe | Motivo |
| -------- | ------ | ------ |
| S4 | Falha de produto | Com todas as etapas ocultas, o quadro estreito não mostra nenhuma feature |
| C2 | Falha de produto | A notificação abriria uma aba e tiraria o código de vista |
| S5, S6 | Falha de produto | O limite de 700px da spec pode mudar sem que um teste perceba |
| C3 | Falha de produto | "Abrir painel em aba" numa feature abriria o quadro, não a feature |
| P4 | Falha de produto, sem critério | O README promete o ícone no topo do Painel |
| H3b, H4 | Equivalente no VS Code instalado | As sondas PROBE-A e PROBE-B passam com e sem a mutação: o VS Code 1.120 entrega a mensagem quando a webview carrega. A guarda `live` não tem prova de que é necessária |
| H5, W2 | Só instrumentação | Mexem no gancho de teste, não no que o usuário vê |

### Sondas fora do diff (não contam no placar)

| Probe | File:line | Description | Killed? |
| ----- | --------- | ----------- | ------- |
| P3 | `package.json:83` | `showFeature` perde o título "Abrir feature no painel" | ❌ Survived. Ver Fix 5 |
| X1 | `src/webview/main.ts:81` | Webview ignora cliques | ❌ Survived. Limite da API |
| X2 | `src/ui/dashboard.ts:91` | `previewFile` abre o editor de texto | ✅ Killed (NAV-10 host, SIDE-07) |

### Sondas de confirmação (testes e correções que só existem no scratch)

| Probe | O que faz | Código original | Com a mutação |
| ----- | --------- | --------------- | ------------- |
| PROBE-A | Fecha a barra lateral, chama `showFeature` e espera o detalhe da feature | passa | H3b: passa. H4: passa |
| PROBE-B | Fecha a aba, chama `openDashboard` com uma feature e espera o detalhe na aba | passa | C3: falha. H4: passa |
| PROBE-C | Responde "Abrir painel" na notificação de uma feature nova e espera o detalhe na view lateral, sem aba | passa | C2: falha |
| V0, V1 | `cards` conta só cartões com `offsetParent !== null` | 44/44 | S4: falha em 4 testes |

Larguras medidas: view lateral 299px. Aba com a barra lateral aberta 792px.

**Sensor depth**: P0-full manual (24 mutações no diff: 6 do host, 3 dos comandos, 3 do manifesto, 3 da webview, 2 do renderer, 7 do stylesheet)
**Result**: 14/24 killed - FAIL ❌

**Isolamento**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor. Junction removida com `rmdir` sem recursão. `node_modules` real com 129 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 65a6be7.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. A feature tem interface, então o UAT fica para o orquestrador, depois das correções.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ⚠️ A guarda `live` em `src/ui/dashboard.ts:16` não tem teste que falhe sem ela (H3b, H4, H5 vivos). O comentário diz que mensagens se perdem, e as sondas mostram que o VS Code 1.120 as entrega |
| Surgical changes | ✅ `Surface` separa as duas superfícies sem duplicar HTML, script ou tratador |
| No scope creep | ⚠️ Menor. `body.side` troca as cores de fundo (`media/dashboard.css:304`) e o ícone do comando mudou. Nenhum dos dois está na spec. A classe `tab` não é usada |
| Matches patterns | ✅ `rendered` segue as outras mensagens. Os testes seguem o formato da suíte |
| Spec-anchored outcome check (asserted values match spec) | ❌ SIDE-02, 03, 04 e 09 com gap. SIDE-05 com gap de precisão |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ❌ A notificação e o limite de 700px ficam de fora |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Os 10 testes novos de integração e o unit novo levam o id do requisito |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (cadcb11..65a6be7)**: `test/integration/suite.cjs` tem 184 inserções e 2 remoções. As duas remoções são linhas trocadas em `opens the dashboard webview` (`:66` e `:72`): `tlcSpecs.showFeature` virou `tlcSpecs.openDashboard`, com as mesmas asserções (`:70`, `:71`, `:75`). A troca segue a decisão do usuário registrada na spec. Nenhuma asserção saiu ou ficou mais fraca. `test/unit/webview.test.ts` só ganha o teste SIDE-04. `startup.cjs`, `multiroot.cjs` e as fixtures não mudaram. Esse teste já passava uma feature sem conferir a feature aberta, antes e depois da troca (C3).

---

## Edge Cases

- [x] SIDE-10 As duas superfícies abertas atualizam juntas: `test/integration/suite.cjs:728-731`
- [x] SIDE-11 Sem pasta de specs a view mostra "Nenhuma spec encontrada": `test/integration/suite.cjs:630-633`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 38 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 44/44 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0), três aberturas de VS Code real
- **Test count before feature**: 37 unit + 36 integration (contados em cadcb11)
- **Test count after feature**: 38 unit + 46 integration
- **Delta**: +1 unit, +10 integration
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

### Fix 1: o relatório conta cartões ocultos (S4)

- **Root cause**: `src/webview/main.ts:59` lê `.card-name` com `querySelectorAll`, que inclui elementos dentro de colunas com `display: none`. `test/integration/suite.cjs:650` passa mesmo sem nenhuma etapa na tela.
- **Fix task**: contar só os cartões exibidos, por exemplo `filter((el) => el.offsetParent !== null)`. Nenhum teste precisa mudar.
- **Done when**: S4 morre. Validado no scratch: com o filtro a suíte original dá 44/44 e o S4 falha em 4 testes (SIDE-01, SIDE-03/04, SIDE-05, SIDE-10).
- **Requirement**: SIDE-03, SIDE-04
- **Priority**: Major

### Fix 2: o botão da notificação não tem teste (C2)

- **Root cause**: `PhaseNotifier` recebe `dashboard.showSide` por callback (`src/extension.ts:47`) e não passa pelo comando `tlcSpecs.showFeature`. Os testes só acionam o comando.
- **Fix task**: teste de integração que troca `vscode.window.showInformationMessage` por uma função que devolve o primeiro botão, grava uma feature nova e espera `sidePanelReport().detail` igual ao nome dela, com `dashboardTab()` indefinido. O `SF-09` já troca `showWarningMessage` do mesmo jeito (`test/integration/suite.cjs:523-527`).
- **Done when**: C2 morre. Validado no scratch com a PROBE-C.
- **Requirement**: SIDE-02
- **Priority**: Major

### Fix 3: o limite de 700px não é conferido (S5, S6)

- **Root cause**: a view lateral é medida a 299px e a aba acima de 900px. Qualquer limite entre esses valores passa. O extension host não consegue pôr uma webview numa largura exata.
- **Fix task**: duas partes. (a) Teste unitário que lê `media/dashboard.css` e confere que o bloco `@media (max-width: 699px)` existe e contém a regra de uma coluna do `.board` e a regra `.column.is-empty { display: none; }`. (b) No SIDE-09, medir a aba também com a barra lateral aberta (792px neste ambiente) e conferir 6 colunas.
- **Done when**: S5 e S6 morrem. A parte (a) mata os dois. A parte (b) mata o S6 por medição.
- **Requirement**: SIDE-03, SIDE-09
- **Priority**: Major

### Fix 4: `openDashboard` com feature não é conferido (C3)

- **Root cause**: `opens the dashboard webview` passa uma feature em `test/integration/suite.cjs:66` e `:72` e só confere a aba e a lista de erros.
- **Fix task**: depois de `:72`, esperar `api.dashboardReport().detail === 'notifications'`. Cobrir também a aba nova: fechar a aba, chamar `openDashboard` com a feature e esperar o detalhe.
- **Done when**: C3 morre. Validado no scratch com a PROBE-B.
- **Requirement**: T4 (Done when), sem critério na spec
- **Priority**: Minor

### Fix 5: contribuições do manifesto sem asserção (P4, P3)

- **Root cause**: o `when` novo do menu `view/title` (`package.json:120`) e o título de `tlcSpecs.showFeature` (`package.json:83`) não aparecem em nenhum teste.
- **Fix task**: no SIDE-08, conferir que `menus['view/title']` tem `tlcSpecs.openDashboard` com `when` contendo `view == tlcSpecs.panel`. No SIDE-02, conferir `title === 'Abrir feature no painel'`, como o SIDE-08 já faz em `test/integration/suite.cjs:688`.
- **Done when**: P4 e P3 morrem.
- **Priority**: Minor

### Fix 6: a guarda `live` não tem prova (H3b, H4)

- **Root cause**: `src/ui/dashboard.ts:111` segura o `select` até o "ready" e `:54` desliga `live` na view oculta. Com o VS Code 1.120 a mensagem chega mesmo sem a guarda.
- **Fix task**: decidir entre duas saídas. (a) Tirar `live` de `flushSelect` e manter só o que o relatório precisa. (b) Manter a guarda e registrar no comentário a versão do VS Code em que a mensagem se perde. Nos dois casos, incluir a PROBE-A na suíte: ela cobre o Independent Test da spec com a barra lateral fechada, cenário que hoje não tem teste.
- **Done when**: a decisão está no código e a PROBE-A está na suíte.
- **Priority**: Minor

### Fix 7: `overflow` sem controle positivo (W2, H5)

- **Root cause**: nenhum teste espera `overflow: true`, então o instrumento pode parar de medir sem que a suíte perceba.
- **Fix task**: opcional. Incluir uma medição que espera `true`, por exemplo a aba a 792px com o quadro de seis colunas, onde o `.board` rola na horizontal.
- **Priority**: Cosmetic

### Fix 8: precisão do SIDE-05 na spec

- **Root cause**: "um artefato muda" e "atualizar a view Painel" não dizem o evento nem o resultado.
- **Fix task**: reescrever o critério com os eventos (criar, alterar, remover) e o que a view mostra depois de cada um. Cobrir alterar e remover no teste, como o SF-04 faz.
- **Priority**: Minor

### Limite aceito: clique real dentro da webview (X1)

O extension host não clica dentro de uma webview. O listener em `src/webview/main.ts:78-82` é anterior à feature. Sem fix task.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SIDE-01 | Implementing | ✅ Verified |
| SIDE-02 | Implementing | ❌ Needs Fix (Fix 2, Fix 5) |
| SIDE-03 | Implementing | ❌ Needs Fix (Fix 1, Fix 3) |
| SIDE-04 | Implementing | ❌ Needs Fix (Fix 1) |
| SIDE-05 | Implementing | ⚠️ Verified para criação. Spec a precisar (Fix 8) |
| SIDE-06 | Implementing | ✅ Verified |
| SIDE-07 | Implementing | ✅ Verified |
| SIDE-08 | Implementing | ✅ Verified |
| SIDE-09 | Implementing | ❌ Needs Fix (Fix 3) |
| SIDE-10 | Implementing | ✅ Verified |
| SIDE-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 6/11 requisitos batem com a spec. 4 com gap (SIDE-02, 03, 04, 09). 1 gap de precisão (SIDE-05)
**Sensor**: 14/24 mutações do diff mortas. 10 vivas: 6 falhas de produto (S4, C2, S5, S6, C3, P4), 2 equivalentes no VS Code 1.120 (H3b, H4), 2 só de instrumentação (H5, W2). Sondas fora do diff: 1 morta (X2), 2 vivas (P3, X1)
**Gate**: typecheck ok, 38 unit, 44 + 1 + 1 integration, 0 falhas

**What works**: view Painel no contêiner TLC Specs, `showFeature` abrindo o detalhe na lateral sem mexer nas abas, uma coluna e nenhuma rolagem a 299px, etapas vazias ocultas, atualização da view quando uma feature nova é gravada, volta da view oculta com os projetos atuais e a feature selecionada, preview a partir da view lateral, comando "Abrir painel em aba", atualização das duas superfícies juntas, mensagem "Nenhuma spec encontrada".

**Issues found**: o relatório conta cartões ocultos (Fix 1). A notificação não tem teste (Fix 2). O limite de 700px não é conferido (Fix 3). `openDashboard` com feature, o botão no título da view e o título de `showFeature` não têm asserção (Fix 4, Fix 5). A guarda `live` não tem prova (Fix 6).

**Next steps**: executar os Fix 1 a 5 e decidir o Fix 6. Depois, nova verificação (iteração 2 de 3) e UAT com o usuário.
