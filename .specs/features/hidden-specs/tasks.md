# Hidden Specs Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/hidden-specs/design.md`
**Status**: Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Estilo tirado de `test/unit/webview.test.ts` e `test/integration/suite.cjs`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core`) | unit | Todos os ramos; 1:1 com os ACs; um teste por edge case listado | `test/unit/*.test.ts` | `npm test` |
| Webview (`src/webview/render.ts`, `media/dashboard.css`) | unit | Cada AC do painel no HTML desenhado e em `actionFor`, nos dois sentidos de cada alternância | `test/unit/webview.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `src/webview/main.ts`, `package.json` contributes) | integration | Cada AC no resultado visível: filhos da árvore, mensagem da view, cards e olho do painel. Cada gatilho listado: linha da árvore, comando e mensagem da webview | `test/integration/suite.cjs` | `npm run test:integration` |
| Docs (`README.md`, specs) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. A integração roda num desktop do Windows oculto, para não abrir janelas na tela do usuário.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run typecheck && npm test` |
| Full | After tasks with integration tests | `npm run typecheck && npm test && npm run test:integration` |
| Build | After phase completion or docs-only tasks | `npm run typecheck && npm test && npm run test:integration` |

---

## Execution Plan

### Phase 1: Core

```
T1
```

### Phase 2: Painel

```
T1 → T2 → T3 → T4
```

### Phase 3: Árvore Features

```
T4 → T5 → T6
```

### Phase 4: Docs

```
T6 → T7
```

---

## Task Breakdown

### T1: Guardar as specs marcadas

**What**: `HiddenSpecs` lê e grava as marcas num `Memento` e avisa quando mudam. `hiddenKey` e `isHidden` ficam no mesmo módulo
**Where**: `src/core/hidden.ts` (novo)
**Depends on**: None
**Reuses**: tipos `Feature` e `FeatureRef`
**Requirement**: HID-02, HID-11, HID-12, HID-13

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Uma instância nova sobre o mesmo `Memento` vê as marcas gravadas (HID-13)
- [x] `set` avisa quem ouve só quando a marca muda
- [x] Um valor gravado que não é lista de textos vira lista vazia
- [x] `isHidden` é verdadeiro para concluída, para marcada e para as duas, e falso para as outras
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 59 unit tests pass (53 antes + 6 novos)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): keep the specs marked as hidden in the workspace state`

---

### T2: Olho no topo e olho no card, no HTML do painel

**What**: `renderApp` troca a caixa pelo olho que alterna, conta as ocultas, esconde as marcadas, desenha o olho por card e esmaece a marcada. `actionFor` ganha `toggle-hidden`, `hide` e `unhide`
**Where**: `src/webview/render.ts` (e o tipo `setHidden` em `src/core/protocol.ts`, e `hidden` vazio em `src/webview/main.ts`, para compilar até o T4)
**Depends on**: T1
**Reuses**: filtro de `projectSection`, `featureActions`, `DEFAULT_VIEW`
**Requirement**: HID-01, HID-02, HID-03, HID-04, HID-09, HID-10, HID-14, HID-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `DEFAULT_VIEW` desenha o olho fechado com "Mostrar as specs ocultas" e "N ocultas", sem a caixa (HID-01)
- [x] Olho fechado: o quadro não tem concluídas, marcadas nem a coluna Concluídas (HID-02)
- [x] Olho aberto: todas as specs, seis etapas, olho aberto com "Esconder as specs ocultas" (HID-03)
- [x] `actionFor` do olho vai e volta: `{ showHidden: true }` e `{ showHidden: false }` (HID-03, HID-04)
- [x] Card à vista: olho aberto "Ocultar spec" com `data-action="hide"`. Card marcado: olho fechado "Desocultar spec" com `unhide`. Concluída sem olho (HID-09, HID-10)
- [x] `actionFor` de `hide` e `unhide` manda `setHidden` com `hidden: true` e `false`
- [x] Card marcado esmaecido só enquanto marcado (HID-14)
- [x] Detalhe de uma marcada com o olho fechado (HID-15)
- [x] "Visualizar" não usa mais o olho
- [x] Testes antigos do "Ocultar concluídas" reescritos para o olho, sem perder asserção
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 66 unit tests pass (59 antes + 7 novos)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(dashboard): toggle the hidden specs with an eye and hide a spec from its card`

---

### T3: Estilo do olho e do card esmaecido

**What**: Regras para o botão do olho no topo e para `.card.is-hidden`
**Where**: `media/dashboard.css`
**Depends on**: T2
**Reuses**: `.btn-ghost`, `.feature-actions`
**Requirement**: HID-01, HID-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `.card.is-hidden` tem opacidade menor, e o teste da folha de estilo prova a regra (HID-14)
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 67 unit tests pass (66 antes + 1 novo)

**Tests**: unit
**Gate**: quick

**Commit**: `style(dashboard): fade the specs marked as hidden`

---

### T4: Levar as marcas ao painel e o olho do card ao host

**What**: A mensagem `state` leva as marcas, o `setHidden` chega ao `HiddenSpecs`, e as duas superfícies redesenham quando uma marca muda. `main.ts` repassa as marcas, troca o `change` da caixa pelo clique e informa o olho no `Rendered`
**Where**: `src/core/protocol.ts`, `src/webview/main.ts`, `src/ui/dashboard.ts`, `src/extension.ts`
**Depends on**: T3
**Reuses**: `Surface.onMessage`, `postState`, `report()`
**Requirement**: HID-01, HID-02, HID-11, HID-12, HID-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Aba e lateral abrem com o olho "Mostrar as specs ocultas" e o número de ocultas do modelo (HID-01)
- [x] `setHidden` vindo da lateral tira a spec dos cards da aba e da lateral e soma 1 ao número. O `setHidden` de volta a devolve (HID-11, HID-12)
- [x] A marcada aberta por `showFeature` mostra o detalhe na lateral (HID-15)
- [x] Os testes que marcam desmarcam num `finally`
- [x] O olho do topo cabe na lateral estreita: o SIDE-03/04 mede a lateral sem rolagem horizontal (vindo do T3)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 56 + 1 + 2 integration tests pass (53 antes + 3 novos)

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): send the hidden marks to the panel and take its eye clicks`

---

### T5: Olho no título de Features

**What**: A árvore esconde as ocultas por padrão. `tlcSpecs.showHidden` e `tlcSpecs.hideHidden` alternam, com o context key `tlcSpecs.showHidden` e a mensagem da view
**Where**: `src/ui/featuresTree.ts`, `src/extension.ts`, `package.json`
**Depends on**: T4
**Reuses**: `featureNodes`, mensagem de `store.onDidChange` em `extension.ts`
**Requirement**: HID-05, HID-06, HID-07, HID-08, HID-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A árvore abre sem as concluídas. O título tem `showHidden` com `$(eye-closed)` enquanto `!tlcSpecs.showHidden`, que vale enquanto a chave não foi ligada (HID-05)
- [x] `showHidden` lista todas e grava o context key `true`. O título mostra `hideHidden` com `$(eye)` (HID-06)
- [x] `hideHidden` volta à lista sem as ocultas e grava `false` (HID-07)
- [x] A mensagem é "T feature(s) · D concluída(s) · H oculta(s)" com o olho fechado, e sem "oculta(s)" com ele aberto (HID-08)
- [x] Projeto único com tudo oculto: lista vazia e a mensagem com o número de ocultas (HID-16)
- [x] Os testes que leem `billing-invoices` na árvore abrem o olho antes e o fecham depois
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 60 + 1 + 2 integration tests pass (56 antes + 4 novos)

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): hide the hidden specs in Features behind an eye in the title`

---

### T6: Olho na linha da spec em Features

**What**: `tlcSpecs.hideFeature` e `tlcSpecs.unhideFeature`, inline na linha da spec. A linha ganha o `contextValue` do estado e "· oculta" na descrição quando marcada
**Where**: `src/ui/featuresTree.ts`, `src/extension.ts`, `package.json`
**Depends on**: T5
**Reuses**: `toRef`, `featureItem`
**Requirement**: HID-09, HID-10, HID-11, HID-12, HID-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Linha à vista: `contextValue` `feature` e o menu inline `hideFeature` com `$(eye)`. Marcada: `feature.hidden` e `unhideFeature` com `$(eye-closed)`. Concluída: `feature.done`, sem olho (HID-09, HID-10)
- [x] Os botões antigos da linha continuam nas três formas
- [x] `hideFeature` com a linha da árvore tira a spec da árvore e dos cards do painel e soma 1 à mensagem (HID-11)
- [x] `unhideFeature` a devolve às duas superfícies (HID-12)
- [x] Com o olho aberto, a marcada tem a descrição terminada em "· oculta", e a mesma spec sem marca não tem (HID-14)
- [x] Os comandos por spec ficam fora da paleta
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 63 + 1 + 2 integration tests pass (60 antes + 3 novos)

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): hide and unhide a spec from its row in Features`

---

### T7: Documentar o olho

**What**: README descreve o olho do painel, o olho de Features e o olho por spec. A spec panel-in-progress ganha a nota de que a caixa virou o olho
**Where**: `README.md`
**Depends on**: T6
**Reuses**: seção do painel em `README.md:26`
**Requirement**: HID-01, HID-05, HID-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README cita o olho no topo do painel, no título de Features e em cada spec, e que as marcas ficam no workspace
- [x] Nota na spec panel-in-progress, junto dos PNL-01 a PNL-04, e na nota do SIDE-09 em sidebar-dashboard
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the eye that hides and shows the specs`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2 ------→ T3 ------→ T4
Phase 3:  T5 ------→ T6
Phase 4:  T7
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: HiddenSpecs | 1 módulo novo | ✅ Granular |
| T2: HTML do painel | 1 arquivo, render e `actionFor` | ✅ Granular |
| T3: Estilo | 1 arquivo | ✅ Granular |
| T4: Protocolo, webview e host | 4 arquivos de uma só mensagem | ⚠️ Coeso: a mensagem não compila nem se testa sem as duas pontas |
| T5: Olho do título | árvore, comando e menu | ⚠️ Coeso: o comando sem o menu e a árvore não se testa |
| T6: Olho da linha | árvore, comando e menu | ⚠️ Coeso: mesmo motivo do T5 |
| T7: Docs | 1 arquivo e uma nota | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | início | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: HiddenSpecs | Core | unit | unit | ✅ OK |
| T2: HTML do painel | Webview | unit | unit | ✅ OK |
| T3: Estilo | Webview | unit | unit | ✅ OK |
| T4: Protocolo, webview e host | Extension host | integration | integration | ✅ OK |
| T5: Olho do título | Extension host | integration | integration | ✅ OK |
| T6: Olho da linha | Extension host | integration | integration | ✅ OK |
| T7: Docs | Docs | none | none | ✅ OK |
