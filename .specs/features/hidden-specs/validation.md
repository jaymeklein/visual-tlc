# Hidden Specs Validation

## Validation: hidden-specs - PASS ✅

Aprovada na iteração 2. Os 16 requisitos batem com a spec, sem gap de precisão. As três correções da iteração 1 fecharam, só com testes. Os cinco mutantes que viviam agora morrem nas asserções novas. M8 morre em `test/unit/webview.test.ts:303` ("0 ocultas"). M11 morre em `:331` (concluída marcada sem olho no card). M12 morre em `:352` (concluída sem esmaecido). H3 morre em `test/integration/suite.cjs:518` (linha da concluída marcada com `feature.done`). H4 morre em `:563` (linha da concluída sem "· oculta"). O código de produção não mudou desde a iteração 1. O gate segue verde: 67 unit, 63 + 1 + 2 integration. Resta vivo só H5, a ligação de `HiddenSpecs` ao `workspaceState`. Fica aceito, como o design escolheu, porque nenhum teste reabre o VS Code (Follow-up 1, opcional, para o usuário).

**Date**: 2026-09-29
**Spec**: `.specs/features/hidden-specs/spec.md`
**Diff range**: 2fb5f23..2c7b475 (branch `feat/hidden-specs`). Correções em 9de95ea..2c7b475, só em `test/unit/webview.test.ts`, `test/integration/suite.cjs` e `tasks.md`
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b556327 | Reprovada | 16/16 requisitos com evidência, 0 gaps de precisão. 25/31 mortas. Vivas: M8, M11, M12, H3, H4 (Fix 1 a Fix 3) e H5, aceita (Follow-up 1). 4 execuções do VS Code |
| 2 | 2c7b475 | Aprovada | 16/16 requisitos batem, 0 gaps de precisão. Fix 1 a Fix 3 fechados: M8 em `webview.test.ts:303`, M11 em `:331`, M12 em `:352`, H3 em `suite.cjs:518`, H4 em `:563`. 30/31 mortas. Só H5 vive, aceita. 2 execuções do VS Code |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Guardar as specs marcadas | ✅ Done | 8d7753f. `src/core/hidden.ts`, 6 testes em `test/unit/hidden.test.ts` |
| T2 Olho no topo e olho no card | ✅ Done | fb6ec29. `src/webview/render.ts:143-158`, `:178-188`, `:248-254`, `:265`, `:619-623` |
| T3 Estilo do olho e do card esmaecido | ✅ Done | 281d733. `media/dashboard.css:82-83`, `:150-151`. A regra `.check`, órfã, saiu |
| T4 Marcas ao painel e olho do card ao host | ✅ Done | 5642d4e. `src/ui/dashboard.ts:96-98`, `:117`, `:164-172`. `src/webview/main.ts:30`, `:60`, `:73`. O listener de `change` saiu |
| T5 Olho no título de Features | ✅ Done | 474dec9. `src/ui/featuresTree.ts:85-98`, `:267`. `src/extension.ts:61-62`, `:89-94`. `package.json:141-151`, `:225-233` |
| T6 Olho na linha da spec | ✅ Done | da9f85c. `src/ui/featuresTree.ts:274-278`. `src/extension.ts:63-64`. `package.json` `view/item/context` e paleta |
| T7 Documentar o olho | ✅ Done | b556327. `README.md`, nota em `.specs/features/panel-in-progress/spec.md:60` e em `.specs/features/sidebar-dashboard/spec.md:79` |
| T8 Fix 1: concluída marcada sem olho | ✅ Done | 102a86a. `test/unit/webview.test.ts:330-331`. `test/integration/suite.cjs:516-518`, desmarca em `:522` |
| T9 Fix 2: esmaecido e "· oculta" só na marcada | ✅ Done | 86d277e. `test/unit/webview.test.ts:352`. `test/integration/suite.cjs:563` |
| T10 Fix 3: o texto do zero | ✅ Done | 2c7b475. `test/unit/webview.test.ts:299-303` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| HID-01 WHEN o painel abre, na aba ou na barra lateral, THEN no lugar da caixa, olho fechado, título "Mostrar as specs ocultas", texto "N ocultas" | botão com olho fechado, esse título e o número de ocultas, nas duas superfícies; "0 ocultas", "1 oculta", "3 ocultas" (`spec.md:35`) | **Render:** `test/unit/webview.test.ts:282` - `assert.ok(!html.includes('type="checkbox"'))`. `:284` - `glyph === 'eye-closed'`. `:285` - `title === 'Mostrar as specs ocultas'`. `:286-287` - `aria-pressed` false, `data-show` true. `:289` - `text === '1 oculta'`. `:296-298` - "2 ocultas", "2 ocultas" (concluída marcada conta uma vez), "3 ocultas". `:303` - `equal(eyeToggle(none).text, '0 ocultas')`. **VS Code:** `test/integration/suite.cjs:893` - `deepEqual(side.toggle, { title: 'Mostrar as specs ocultas', text: ocultas(n) })` na lateral. `:898` - o mesmo numa aba nova | ✅ PASS |
| HID-02 WHILE o olho do painel está fechado, fora do quadro as concluídas, as marcadas e a coluna Concluídas | cards = não concluídas e não marcadas, cinco etapas | **Render:** `test/unit/webview.test.ts:235` - `deepEqual(b.cards, b.open)`. `:236` - cinco rótulos sem Concluídas. `:243` - `deepEqual(b.cards, b.open.filter((n) => n !== 'csv-export'))`. **Regra:** `test/unit/hidden.test.ts:73-76`, tabela verdade de `isHidden`. **VS Code:** `test/integration/suite.cjs:758`, `:763` (aba). `:910-911` - marcada fora da aba e da lateral | ✅ PASS |
| HID-03 WHEN clica no olho fechado THEN as ocultas voltam, cada uma na sua coluna, com Concluídas, e o botão vira olho aberto "Esconder as specs ocultas" | `showHidden: true`; seis colunas; olho aberto | **Gatilho:** `test/unit/webview.test.ts:287` - o olho fechado leva `data-show="true"`. `:320` - `deepEqual(actionFor({ action: 'toggle-hidden', show: 'true' }), { view: { showHidden: true } })`. **Resultado:** `:249` - `deepEqual(b.doneCards, b.complete)`. `:250`, `:258` - todos os cards. `:259` - marcada em Execução. `:251-252` - seis colunas, a última Concluídas. `:262-265` - `eye-open`, "Esconder as specs ocultas", `aria-pressed` true, `data-show` false | ✅ PASS (nota 1) |
| HID-04 WHEN clica no olho aberto THEN as ocultas saem de novo e volta o olho fechado | `showHidden: false`; quadro e olho de HID-01/02 | **Gatilho:** `test/unit/webview.test.ts:265` - o olho aberto leva `data-show="false"`. `:321` - `deepEqual(actionFor({ action: 'toggle-hidden', show: 'false' }), { view: { showHidden: false } })`. **Resultado:** `:235-237`, `:284-287` | ✅ PASS (nota 1) |
| HID-05 WHEN o VS Code abre THEN Features lista só as não ocultas e o título mostra "Mostrar specs ocultas" com `eye-closed` | filhos = não ocultas; botão `showHidden` visível com a chave ainda não gravada | `test/integration/suite.cjs:433` - `deepEqual(treeNames(), modelNames((f) => f.health !== 'complete'))`. `:434` - `deepEqual(declared('tlcSpecs.showHidden'), { ..., title: 'Mostrar specs ocultas', icon: '$(eye-closed)' })`. `:436` - `when === 'view == tlcSpecs.features && !tlcSpecs.showHidden'` | ✅ PASS (nota 2) |
| HID-06 WHEN clica em "Mostrar specs ocultas" THEN lista todas e o título mostra "Esconder specs ocultas" com `eye` | todos os filhos; chave `true`; botão `hideHidden` | `test/integration/suite.cjs:445` - `deepEqual(opening, [true])` (espia o `setContext`). `:446` - `deepEqual(treeNames(), all)`. `:447` - `hideHidden` com "Esconder specs ocultas" e `$(eye)`. `:448` - `when === 'view == tlcSpecs.features && tlcSpecs.showHidden'` | ✅ PASS |
| HID-07 WHEN clica em "Esconder specs ocultas" THEN volta a listar só as não ocultas | chave `false`; filhos = não ocultas | `test/integration/suite.cjs:452` - `deepEqual(closing, [false])`. `:453` - `deepEqual(treeNames(), open)` | ✅ PASS |
| HID-08 WHILE a árvore esconde as ocultas e há ao menos uma, mensagem "T feature(s) · D concluída(s) · H oculta(s)" | texto exato; sem "oculta(s)" com o olho aberto | `test/integration/suite.cjs:460` - `` equal(api.featuresViewMessage(), `${base} · ${done} oculta(s)`) ``. `:463` - `done + 1` com uma marca. `:465` - `equal(..., base)` com o olho aberto. `:470` - de volta. `:480` - todas ocultas. `:536`, `:546` | ✅ PASS |
| HID-09 WHILE não concluída à vista e sem marca, olho aberto "Ocultar spec" na linha e no card | card: `hide`, "Ocultar spec", olho aberto. Linha: `feature` e `hideFeature` inline com `$(eye)` | **Card:** `test/unit/webview.test.ts:326` - `deepEqual(cardEyes(user-auth), [{ action: 'hide', title: 'Ocultar spec', glyph: 'eye-open' }])`. **Linha:** `test/integration/suite.cjs:498` - `hideFeature` com "Ocultar spec" e `$(eye)`. `:501` - inline só em `viewItem == feature`. `:512` - `contextValue === 'feature'`. Botões antigos nas três formas: `:503-505` | ✅ PASS |
| HID-10 WHILE não concluída marcada, olho fechado "Desocultar spec" na linha e no card | card: `unhide`, "Desocultar spec", olho fechado. Linha: `feature.hidden` e `unhideFeature` com `$(eye-closed)`. Concluída, marcada ou não, sem olho (`spec.md:36`, `:41`) | **Card:** `test/unit/webview.test.ts:327`. Concluída sem marca: `:328` - `[]`. Concluída marcada: `:331` - `deepEqual(cardEyes(both.get('billing-invoices')!.body), [])`. **Linha:** `test/integration/suite.cjs:499`, `:502`, `:513` - `contextValue === 'feature.hidden'`. Concluída sem marca: `:515` - `'feature.done'`. Concluída marcada: `:518` - `'feature.done'` | ✅ PASS |
| HID-11 WHEN clica em "Ocultar spec", na árvore ou no painel, THEN a spec sai da árvore e dos quadros com o olho fechado, e o número sobe 1 | fora da árvore, da aba e da lateral; mensagem e botão com +1 | **Gatilho árvore:** `test/integration/suite.cjs:534` - `hideFeature` com a linha. **Gatilho card:** `test/unit/webview.test.ts:339-341` - `actionFor(hide)` dá `setHidden` com `hidden: true`. Host: `suite.cjs:906` pela lateral. **Resultado:** `:535` - árvore sem csv-export. `:536` - mensagem `done + 1`. `:538-539` - aba sem o card e "N+1 ocultas". `:910-913` - aba e lateral sem o card, as duas com "N+1 ocultas". Aviso: `test/unit/hidden.test.ts:53` | ✅ PASS |
| HID-12 WHEN clica em "Desocultar spec", na árvore ou no painel, THEN a spec volta e o número desce 1 | de volta às três superfícies; número original | **Gatilho árvore:** `test/integration/suite.cjs:542-543` - olho aberto e `unhideFeature` com a linha. **Gatilho card:** `test/unit/webview.test.ts:342-344` - `hidden: false`. Host: `suite.cjs:915` pela aba. **Resultado:** `:545-549` - árvore, mensagem, aba e botão de volta. `:919-922` - aba e lateral de volta, número original | ✅ PASS |
| HID-13 WHEN o VS Code reabre o mesmo workspace THEN as marcadas seguem ocultas | uma instância nova sobre o mesmo estado vê as marcas | `test/unit/hidden.test.ts:26` - `equal(reopened.isMarked(auth), true)` numa instância nova sobre o mesmo `Memento`. `:28` - chaves gravadas. `:39` - desmarcar tira a chave do estado. `:45` - a marca é da pasta de specs. Ligação ao `workspaceState`: `src/extension.ts:44`, sem teste | ✅ PASS (nota 3; H5 aceito) |
| HID-14 WHILE o olho geral está aberto, card da marcada esmaecido e linha com "· oculta" | classe `is-hidden` com opacidade menor e " · oculta" só na marcada; a concluída não esmaece nem ganha o sufixo (`spec.md:38`) | **Card:** `test/unit/webview.test.ts:349` - `cls === 'card h-ok is-hidden'`. `:350` - sem marca, `'card h-ok'`. `:352` - concluída, `'card h-complete'`. `:358-359` - uma regra `.card.is-hidden` com opacidade < 1. **Linha:** `test/integration/suite.cjs:559` - sem marca, `doesNotMatch(/oculta/)`. `:561` - `match(/ · oculta$/)`. `:563` - concluída, `doesNotMatch((await rowOf('billing-invoices')).description, /oculta/)` | ✅ PASS |
| HID-15 WHEN uma marcada é aberta pela árvore ou por notificação THEN mostra o detalhe com o olho fechado | detalhe da marcada com `showHidden: false` | **Render:** `test/unit/webview.test.ts:315-316` - `DEFAULT_VIEW` com csv-export marcada e selecionada mostra o título do detalhe. **VS Code:** `test/integration/suite.cjs:1125-1127` - marca, `showFeature` e `r.detail === 'csv-export'` na lateral. `:1128` - `equal(report.toggle, null)` | ✅ PASS (nota 4) |
| HID-16 IF todas as specs de um projeto único estão ocultas e a árvore as esconde THEN lista vazia, mensagem do HID-08, sem boas-vindas | `[]`; mensagem com H = T; boas-vindas só sem specs | `test/integration/suite.cjs:479` - `deepEqual(api.featuresTree.getChildren(), [])`. `:480` - `` `${T} feature(s) · ${D} concluída(s) · ${T} oculta(s)` ``. `:482-485` - `viewsWelcome` de Features só com `!tlcSpecs.hasSpecs` | ✅ PASS |

**Status**: ✅ All ACs covered. 16/16 batem com a spec. 0 gaps de precisão. G1, G2 e G3 da iteração 1 fechados.

### Notas

1. **HID-03/HID-04, o clique no olho.** A cadeia tem três elos. O botão leva `data-show` com o próximo estado (`src/webview/render.ts:158`), fixado nos dois sentidos (`test/unit/webview.test.ts:265`, `:287`). O clique passa pelo caminho comum de todos os botões: `closest('[data-action]')` e `activate(el)` (`src/webview/main.ts:86-89`), que chama `actionFor(el.dataset)` e aplica o `view` (`:79-84`). `actionFor` decide (`render.ts:619-620`), fixado nos dois sentidos (`:320-321`). **Juízo sobre o limite aceito no panel-in-progress:** continua valendo, e ficou mais estreito. A integração segue sem disparar eventos de DOM na página (`ToWebview` só leva `state` e `select`, `src/core/protocol.ts:34-36`). Mas a cola própria da caixa saiu: o listener de `change` e o parâmetro `data` de `activate` foram removidos, e com eles os mutantes G1 a G5 daquela validação. O olho do topo e o olho do card usam o mesmo clique de todos os controles. O que sobra sem teste é essa cola comum, a mesma já aceita para o NAV-12. A parte nova do lado da página que a integração alcança: `hidden = msg.hidden` (`main.ts:30`), sem o qual os cards de `suite.cjs:908-911` não saem, e o `toggle` do relatório (`main.ts:60`, `:73`), comparado em `suite.cjs:893` e `:898`.
2. **HID-05/HID-06, o botão do título.** A integração não lê a barra de título. A prova combina o `when` de cada botão (`suite.cjs:436`, `:448`) com o valor que a extensão grava na chave, espiado no `executeCommand` (`:445`, `:452`). Na abertura a chave nunca é gravada (`src/ui/featuresTree.ts:75`), e uma chave ausente é falsa no VS Code, então `!tlcSpecs.showHidden` vale. H1, a chave invertida, morre em `:445`, como o design previa (`design.md:124`).
3. **HID-13, a ligação ao `workspaceState`.** O unit prova a regra com um `Memento` falso lido por uma instância nova (`test/unit/hidden.test.ts:22-29`). M2b, que grava uma lista vazia, morre em `:26` e `:39`. A ligação é uma linha: `new HiddenSpecs(context.workspaceState)` (`src/extension.ts:44`). H5 troca o `workspaceState` por um estado em memória e passou em toda a suíte na iteração 1. Nenhum teste reabre o VS Code: cada suíte usa um `--user-data-dir` novo e apaga no fim (`test/integration/run.mjs:22-24`, `:30`, `:36`). O design escolheu essa prova (`design.md:133`), e o orquestrador manteve a escolha. Aceito. A leitura confirma a linha, e o Follow-up 1 registra a prova mais forte.
4. **HID-15, a notificação.** A integração abre a marcada por `showFeature` (`suite.cjs:1126`). O aviso de fase chama o mesmo `dashboard.showSide` (`src/extension.ts:51` e `:66`), e o SIDE-02 prova o botão do aviso (`suite.cjs:1090`). O host não filtra marcas no `showSide`. A regra do detalhe fica na página, fixada com o olho fechado (`test/unit/webview.test.ts:316`, M16 morre). Aceito pela mesma composição do PNL-05.
5. **Lições conferidas.** L-002: o painel é afirmado nos cards e no botão desenhados, a árvore nos filhos, no `TreeItem` e na mensagem da view. L-006: sem watcher novo, não se aplica. L-009: HID-11 e HID-12 são dirigidos pela linha da árvore (comando com o nó), pelo card (`actionFor` e mensagem do host, pela lateral e pela aba), e HID-15 pela árvore e pela notificação (nota 4). L-014: o campo novo `toggle` do relatório aparece preenchido (`suite.cjs:893`) e `null` (`:1128`). O título do olho aberto só se vê no unit (`:263`), pelo limite da nota 1. Nenhuma lição confirmada se repetiu. As três candidatas da iteração 1 (L-020, L-021, L-022) agora valem nos testes: a concluída marcada (`:331`, `suite.cjs:518`), a ausência da marca nas concluídas (`:352`, `suite.cjs:563`) e o zero (`:303`).

---

## Discrimination Sensor

Scratch novo na iteração 2: `git worktree add --detach <scratchpad>/wt-hid HEAD` (2c7b475), com junction de `node_modules` para o real. Mutação por troca de texto exata, com uma ocorrência exigida, aplicada por script e desfeita com `git checkout -- .` no scratch. `git status --porcelain` do scratch vazio depois de cada reversão. Sem `git stash`. O código de produção não mudou desde a iteração 1, então as mesmas trocas valem. Rodei de novo no unit as 24 mutações M, para confirmar as mortes e atualizar as linhas. Na integração rodei só H3 e H4. H1, H7, H10 e H2 ficam da iteração 1: o código e as asserções que as matam não mudaram, só a linha de H10 e de H2. H5 fica aceita. Uma tabela só.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/core/hidden.ts:43` | `set` sem o retorno cedo: avisa mesmo sem mudar | ✅ Killed (`test/unit/hidden.test.ts:55`) |
| M2 | `src/core/hidden.ts:46` | `memento.update` removido | ✅ Killed (typecheck: TS6133, `memento` órfão). Efeito da forma. A morte que conta é M2b |
| M2b | `src/core/hidden.ts:46` | Grava `[]` no lugar das marcas | ✅ Killed (`hidden.test.ts:26`, `:39`) |
| M3 | `src/core/hidden.ts:29` | Lê o estado sem filtrar textos | ✅ Killed (`hidden.test.ts:67`) |
| M4 | `src/core/hidden.ts:19` | `isHidden` com `&&` no lugar de `\|\|` | ✅ Killed (`hidden.test.ts:73`; `webview.test.ts:243`, `:266`, `:289`, `:296`) |
| M5 | `src/webview/render.ts:28` | `DEFAULT_VIEW.showHidden: true` | ✅ Killed (`webview.test.ts:284`) |
| M6 | `src/webview/render.ts:178` | O filtro do quadro ignora as marcas | ✅ Killed (`:243`) |
| M7 | `src/webview/render.ts:143` | O número de ocultas ignora as marcas | ✅ Killed (`:266`, `:296`) |
| M8 | `src/webview/render.ts:158` | Plural com `hidden <= 1`: zero vira "0 oculta" | ✅ Killed na iteração 2 (`webview.test.ts:303`). Vivia na iteração 1 (G3) |
| M9 | `src/webview/render.ts:158` | `data-show="${show}"`: o olho não alterna | ✅ Killed (`:265`, `:287`) |
| M10 | `src/webview/render.ts:145` | Títulos do olho trocados | ✅ Killed (`:263`, `:285`) |
| M11 | `src/webview/render.ts:249` | Concluída marcada ganha "Desocultar spec" no card | ✅ Killed na iteração 2 (`webview.test.ts:331`). Vivia na iteração 1 (G1) |
| M12 | `src/webview/render.ts:265` | `is-hidden` por `hiddenOf`: as concluídas esmaecem | ✅ Killed na iteração 2 (`webview.test.ts:352`). Vivia na iteração 1 (G2) |
| M13 | `src/webview/render.ts:620` | `showHidden: d.show !== 'true'` | ✅ Killed (`:320`) |
| M14 | `src/webview/render.ts:623` | `hidden: d.action === 'unhide'` | ✅ Killed (`:339`) |
| M15 | `src/webview/render.ts:249` | Nenhum card tem olho | ✅ Killed (`:326`) |
| M16 | `src/webview/render.ts:114` | O detalhe recusa uma marcada com o olho fechado | ✅ Killed (`:316`) |
| M17 | `media/dashboard.css:150` | `.card.is-hidden { opacity: 1; }` | ✅ Killed (`:359`) |
| M18 | `src/webview/render.ts:185` | `five-stages` invertido | ✅ Killed (`:237`, `:253`) |
| M19 | `src/webview/render.ts:188` | Concluídas só com o olho aberto invertido | ✅ Killed (8 testes, a começar por `:162`, `:236`, `:244`, `:249`) |
| M20 | `src/webview/render.ts:158` | Ícones do olho do topo trocados | ✅ Killed (`:262`, `:284`) |
| M21 | `src/webview/render.ts:158` | `aria-pressed` invertido | ✅ Killed (`:264`, `:286`) |
| M22 | `src/webview/render.ts:253` | "Ocultar spec" com o olho fechado | ✅ Killed (`:326`) |
| M23 | `src/webview/render.ts:241` | "Visualizar" volta a usar o olho | ✅ Killed (`:335`) |
| H1 | `src/ui/featuresTree.ts:87` | Context key invertida: `!show` | ✅ Killed na iteração 1 (`test/integration/suite.cjs:445`, `[false]` no lugar de `[true]`) |
| H7 | `src/ui/featuresTree.ts:93` | `outOfTree` conta as ocultas com o olho aberto | ✅ Killed na iteração 1 (`suite.cjs:465`, "9 feature(s) · 1 concluída(s) · 2 oculta(s)" no lugar da base) |
| H10 | `src/extension.ts:63` | `hideFeature` grava `false` | ✅ Killed na iteração 1 (`suite.cjs:531` em b556327, hoje `:535`: csv-export segue na árvore) |
| H2 | `src/ui/dashboard.ts:172` | Uma marca nova só redesenha a aba, não a lateral | ✅ Killed na iteração 1 (`suite.cjs:903` em b556327, hoje `:909`: "timed out waiting for: csv-export to leave the side panel") |
| H3 | `src/ui/featuresTree.ts:276` | `contextValue` olha a marca antes da conclusão: concluída marcada ganha `unhideFeature` | ✅ Killed na iteração 2 (`suite.cjs:518`, `'feature.hidden'` no lugar de `'feature.done'`). Vivia na iteração 1 (G1) |
| H4 | `src/ui/featuresTree.ts:278` | "· oculta" por `isHidden`: as concluídas ganham o sufixo | ✅ Killed na iteração 2 (`suite.cjs:563`, a descrição de billing-invoices casa com `/oculta/`). Vivia na iteração 1 (G2) |
| H5 | `src/extension.ts:44` | `HiddenSpecs` sobre um estado em memória, fora do `workspaceState` | ⚠️ Survived, aceita (nota 3, Follow-up 1) |

**Sensor depth**: lightweight ampliado (padrão, sem caminho P0). 24 mutações no unit, todas de novo em 2c7b475. 7 no host: 2 de novo, 4 mantidas da iteração 1, 1 aceita.
**Result**: 30/31 mortas. A única viva é H5, aceita pela nota 3. PASS ✅.

**Execuções que abriram o VS Code** na iteração 2, das 3 permitidas, todas pelo desktop oculto, em primeiro plano, uma por vez:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | scratch (2c7b475) | 63/63 + 1/1 + 2/2 |
| 2 | H3 + H4 juntas | scratch | 61/63 + 1/1 + 2/2. Só HID-09/10 (`:518`) e HID-14 da árvore (`:563`) |

Foram 2 execuções. H3 só muda o `contextValue`, e H4 só muda a descrição da linha. Cada uma falha no seu teste e na asserção nova, e nenhum outro teste falhou. Conferi as duas no `dist/extension.cjs` do scratch, e os logs mostram a extensão carregada dele. A iteração 1 usou 4 execuções.

**Isolamento**: `git status --porcelain` da árvore real vazio antes do sensor e vazio depois. HEAD seguiu em 2c7b475, branch `feat/hidden-specs`. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`), depois `git worktree remove --force` e `git worktree prune`. `git worktree list` mostra só a árvore real. `node_modules` real com 131 entradas antes e depois, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`spec.md:71`, `:90`) fica para o orquestrador. Ele cobre à mão o clique dentro da página (nota 1).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `src/core/hidden.ts` tem 54 linhas. O resto são trocas pontuais. `featureActions` ganhou um parâmetro `extra` para pôr o olho no mesmo grupo de botões do card |
| Surgical changes | ✅ Só saiu o que a troca da caixa pelo olho deixou órfão: a regra `.check` do CSS, o listener de `change` e o parâmetro `data` de `activate` em `src/webview/main.ts`. As correções da iteração 2 só somam asserções a testes que já existiam |
| No scope creep | ✅ Um extra pequeno: `showHidden` e `hideHidden` também aparecem na paleta quando há specs (`package.json:226-233`). A spec não pede nem proíbe |
| Matches patterns | ✅ `HiddenSpecs` fica em `src/core` sem `vscode`, como os outros módulos puros. Os casos novos de `actionFor` seguem os antigos. Os testes seguem `webview.test.ts` e `suite.cjs`, com `finally` que desmarca, inclusive billing-invoices (`suite.cjs:522`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ Títulos, ícones, textos e mensagem afirmados com o valor exato da spec, "0 ocultas" incluído |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core e webview 1:1 com os ACs. As bordas das premissas agora têm teste: concluída marcada, concluída com o olho aberto e zero |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Todo teste novo tem HID no título, menos `hidden.test.ts:65`, que é o Done when do T1 e a linha de erro do design |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:18`) | ✅ |

Desvios do design, sem efeito no comportamento: `outOfTree()` no lugar de `hiddenCount()` e do getter `showHidden` (`design.md:74-75`). Os `when` usam a lista explícita `feature || feature.hidden || feature.done` no lugar de `viewItem =~ /^feature/` (`design.md:47`), e o teste fixa a forma explícita.

**Integridade dos testes (2fb5f23..b556327)**: nenhum teste removido. `test/unit/webview.test.ts`: de 14 para 22 testes, de 56 para 88 asserções. `test/integration/suite.cjs`: de 53 para 63 casos, de 176 para 228 asserções. `test/unit/hidden.test.ts`: novo, 6 testes, 17 asserções. Saíram 6 linhas de asserção. Quatro eram da caixa: PNL-01 (a caixa existe e está marcada) e PNL-04 (`toggle-done` nos dois sentidos). Elas viraram as do olho, com a mesma força ou mais. As outras duas são do NAV-01, só reindentadas dentro do `try`, sem mudança.

**Integridade dos testes (9de95ea..2c7b475)**: nenhum teste novo nem removido. `webview.test.ts` foi de 88 para 91 asserções, e `suite.cjs` de 228 para 230. Saiu uma linha de asserção: a do card marcado do HID-14. Ela voltou igual por uma variável (`const marked`, `webview.test.ts:348-349`), para a asserção nova ler o mesmo quadro. Nenhuma asserção ficou mais fraca.

---

## Edge Cases

- [x] HID-15 Marcada aberta pela árvore ou por notificação mostra o detalhe com o olho fechado: `test/unit/webview.test.ts:315-316`, `test/integration/suite.cjs:1125-1128` (nota 4)
- [x] HID-16 Projeto único com tudo oculto: lista vazia, mensagem do HID-08, sem boas-vindas: `test/integration/suite.cjs:479-485`
- [x] Premissa "concluída não tem olho", com a concluída marcada: `test/unit/webview.test.ts:331`, `test/integration/suite.cjs:518`
- [x] Premissa "0 ocultas": `test/unit/webview.test.ts:303`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0 (scratch em 2c7b475)
- **Unit**: 67 aprovados, 0 reprovados, 0 pulados
- **Integration**: 63/63 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0, execução 1 da iteração 2)
- **Test count before feature**: 53 unit + 56 integration (53 + 1 + 2, em 2fb5f23)
- **Test count after feature**: 67 unit + 66 integration (63 + 1 + 2)
- **Delta**: +14 unit (6 em `hidden.test.ts`, 8 em `webview.test.ts`), +10 integration (7 em Features, 3 no painel). As correções da iteração 2 só somaram asserções
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

### Fix 1: concluída marcada sem olho (G1: M11, H3) - fechado

- **Resolução**: 102a86a (T8). `test/unit/webview.test.ts:330-331` desenha o quadro com csv-export e billing-invoices marcadas e afirma `cardEyes` vazio para billing-invoices. `test/integration/suite.cjs:516-518` marca billing-invoices e afirma `contextValue === 'feature.done'`. O `finally` a desmarca (`:522`).
- **Done when conferido**: M11 falha no `npm test` em `:331`. H3 falha na integração em `suite.cjs:518`. O gate segue verde.

### Fix 2: esmaecido e "· oculta" só na marcada (G2: M12, H4) - fechado

- **Resolução**: 86d277e (T9). `test/unit/webview.test.ts:352` afirma `'card h-complete'` para billing-invoices com o olho aberto. `test/integration/suite.cjs:563` afirma que a descrição de billing-invoices não tem "oculta" com o olho aberto.
- **Done when conferido**: M12 falha no `npm test` em `:352`. H4 falha na integração em `suite.cjs:563`. O gate segue verde.

### Fix 3: o texto do zero (G3: M8) - fechado

- **Resolução**: 2c7b475 (T10). `test/unit/webview.test.ts:299-303` desenha o sample só com as não concluídas e sem marcas e afirma "0 ocultas".
- **Done when conferido**: M8 falha no `npm test` em `:303`. O gate segue verde.

### Follow-up 1 (opcional, não bloqueia): provar a ligação ao `workspaceState` (H5)

- **Root cause**: nenhum teste reabre o VS Code. O runner cria um `--user-data-dir` novo por suíte (`test/integration/run.mjs:22-24`, `:30`).
- **Fix task**: uma execução em duas fases com o mesmo `--user-data-dir` e a mesma pasta de workspace. A primeira marca csv-export pela linha da árvore. A segunda abre de novo e afirma que a árvore começa sem ela. Muda o runner, então pede decisão do usuário.
- **Done when**: H5 falha na segunda fase.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HID-01 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| HID-02 | Implementing | ✅ Verified |
| HID-03 | Implementing | ✅ Verified |
| HID-04 | Implementing | ✅ Verified |
| HID-05 | Implementing | ✅ Verified |
| HID-06 | Implementing | ✅ Verified |
| HID-07 | Implementing | ✅ Verified |
| HID-08 | Implementing | ✅ Verified |
| HID-09 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| HID-10 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| HID-11 | Implementing | ✅ Verified |
| HID-12 | Implementing | ✅ Verified |
| HID-13 | Implementing | ✅ Verified (nota 3) |
| HID-14 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| HID-15 | Implementing | ✅ Verified |
| HID-16 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 16/16 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: 30/31 mortas. A única viva é H5, aceita (nota 3, Follow-up 1)
**Gate**: typecheck ok, 67 unit, 63 + 1 + 2 integration, 0 falhas

**What works**: o painel abre com o olho fechado e o número de ocultas, na aba e na lateral, e escreve "0 ocultas" quando não há nenhuma. O quadro deixa de fora as concluídas, as marcadas e a coluna Concluídas. O olho alterna `showHidden` nos dois sentidos e traz as ocultas para a coluna delas. Features abre sem as ocultas, e o olho do título lista todas e esconde de novo, com a chave de contexto certa. A mensagem conta as ocultas só com o olho fechado. O olho da linha e o do card marcam e desmarcam, e a spec sai e volta da árvore, da aba e da lateral, com os números certos. A concluída não tem olho, nem quando está marcada. Só a marcada esmaece e ganha "· oculta". Uma marcada abre no detalhe com o olho fechado. As marcas persistem num estado novo sobre o mesmo `Memento`. Nenhum teste saiu, nenhuma asserção afrouxou.

**Issues found**: nenhum que bloqueie. A ligação ao `workspaceState` segue provada só pela leitura (Follow-up 1, opcional).

**Next steps**: atualizar os status do `spec.md` para Verified. Rodar o teste independente da spec com o usuário (UAT), que cobre o clique dentro da página. Decidir se o Follow-up 1 entra.
