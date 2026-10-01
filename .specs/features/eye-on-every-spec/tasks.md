# Eye On Every Spec Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (sem `design.md`)
**Status**: Done

Design inline: cada spec tem uma escolha, `'hidden'`, `'shown'` ou nenhuma. `isHidden(f, choice)` vale `choice === 'hidden'`, ou a spec concluída sem `'shown'`. `HiddenSpecs` guarda as ocultas na lista que já existe (`tlcSpecs.hidden`) e as concluídas à vista numa lista nova (`tlcSpecs.shown`). `set(ref, hidden, complete)` grava só a escolha que difere do padrão da spec e apaga a outra. A mensagem `state` leva as duas listas à webview. O host descobre se a spec está concluída pelo store, no `setHidden` do painel e nos comandos da árvore. A linha da árvore fica `feature` ou `feature.hidden`, sem `feature.done`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Estilo de `test/unit/hidden.test.ts`, `test/unit/webview.test.ts` e `test/integration/suite.cjs`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core/hidden.ts`) | unit | Todos os ramos; 1:1 com os ACs; um teste por edge case listado | `test/unit/hidden.test.ts` | `npm test` |
| Webview (`src/webview/render.ts`) | unit | Cada AC do painel no HTML e em `actionFor` | `test/unit/webview.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `src/webview/main.ts`, `package.json`) | integration | Cada AC no resultado visível: filhos da árvore, `contextValue`, descrição, mensagem, cards e colunas do painel. Os dois gatilhos: linha da árvore e mensagem da webview | `test/integration/suite.cjs` | `npm run test:integration` |
| Docs (`README.md`, specs) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. A integração roda num desktop oculto do Windows.

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
T1 → T2
```

### Phase 3: Host e árvore

```
T2 → T3
```

### Phase 4: Docs

```
T3 → T4
```

---

## Task Breakdown

### T1: Escolha por spec: oculta, à vista ou nenhuma

**What**: `HiddenSpecs` guarda também as concluídas à vista, `set` recebe se a spec está concluída e grava só a escolha diferente do padrão, e `isHidden` recebe a escolha
**Where**: `src/core/hidden.ts` (e as quatro chamadas de `set` e `isHidden`, cada uma na mesma linha, para compilar: `render.ts`, `featuresTree.ts`, `dashboard.ts`, `extension.ts`)
**Depends on**: None
**Reuses**: `HiddenSpecs`, `hiddenKey`, a lista `tlcSpecs.hidden` já gravada
**Requirement**: EYE-04, EYE-05, EYE-06, EYE-09, EYE-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Concluída sem escolha é oculta. Concluída com `'shown'` fica à vista. Não concluída com `'hidden'` é oculta (EYE-04, EYE-05, EYE-06)
- [x] `set(ref, false, true)` grava a concluída em `tlcSpecs.shown`, e uma instância nova a lê (EYE-05, EYE-09)
- [x] `set(ref, true, true)` numa concluída à vista apaga a escolha das duas listas (EYE-10)
- [x] As marcas antigas de `tlcSpecs.hidden` continuam valendo
- [x] Os testes do hidden-specs passam a chamar `set` com o terceiro argumento, sem perder asserção
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): let the eye of a spec keep a completed one in view`

---

### T2: Olho em todo card

**What**: `renderApp` desenha o olho em todo card, esmaece toda spec oculta com o olho geral aberto e mostra a coluna Concluídas com o olho fechado quando há concluída à vista
**Where**: `src/webview/render.ts` (e `shown` vazio em `src/webview/main.ts`, para compilar até o T3)
**Depends on**: T1
**Reuses**: `eyeButton`, `projectSection`, `cardsOf`, `cardEyes`, `board`
**Requirement**: EYE-01, EYE-02, EYE-03, EYE-05, EYE-07, EYE-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Card concluído oculto: olho fechado "Desocultar spec". Concluído à vista: olho aberto "Ocultar spec" (EYE-01, EYE-02, EYE-03)
- [x] Olho geral fechado com uma concluída à vista: ela na coluna Concluídas, seis etapas, e o número de ocultas cai um (EYE-05, EYE-07)
- [x] Olho geral fechado sem concluída à vista: cinco etapas, como no PNL-03
- [x] Olho geral aberto: toda spec oculta tem `is-hidden`, concluída ou não; a concluída à vista não tem (EYE-08)
- [x] Os testes do HID-09/10 e do HID-14 que diziam "concluída sem olho" e "concluída sem esmaecido" passam à regra nova
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(dashboard): draw the eye on every card`

---

### T3: Host e árvore com a escolha

**What**: A mensagem `state` leva as concluídas à vista. O `setHidden` do painel e os comandos da linha usam o store para saber se a spec está concluída. A linha da árvore fica `feature` ou `feature.hidden`, com "· oculta" em toda oculta
**Where**: `src/core/protocol.ts`, `src/webview/main.ts`, `src/ui/dashboard.ts`, `src/ui/featuresTree.ts`, `src/extension.ts`, `package.json`
**Depends on**: T2
**Reuses**: `Surface.onMessage`, `featureItem`, `toRef`, `store.findFeature`
**Requirement**: EYE-01, EYE-02, EYE-03, EYE-04, EYE-05, EYE-08, EYE-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Linha concluída: `contextValue` `feature.hidden` e o olho fechado. Pelo `unhideFeature`, ela fica à vista na árvore com o olho do título fechado, com `contextValue` `feature` (EYE-01, EYE-02, EYE-03, EYE-05)
- [x] O mesmo `setHidden` vindo do painel deixa a concluída à vista na aba: cards e seis colunas com o olho fechado, e o número de ocultas cai um (EYE-05, EYE-07)
- [x] `hideFeature` numa concluída à vista a esconde de novo, na árvore e no painel (EYE-04, EYE-10)
- [x] Olho do título aberto: toda linha oculta termina em "· oculta", e a concluída à vista não (EYE-08)
- [x] Os botões da linha valem para `feature` e `feature.hidden`
- [x] Os testes de integração do HID-09/10 e do HID-14 passam à regra nova
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): give every spec row its eye`

---

### T4: Documentar o olho em toda spec

**What**: README diz que toda spec tem olho e como a concluída fica à vista. A spec hidden-specs ganha notas no HID-09, HID-10 e HID-14
**Where**: `README.md`
**Depends on**: T3
**Reuses**: seções de Features e do Painel no README
**Requirement**: EYE-01, EYE-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README descreve o olho em toda spec e a concluída à vista
- [x] Notas no HID-10 (cobre o HID-09 e o HID-10) e no HID-14
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the eye on every spec`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2
Phase 3:  T3
Phase 4:  T4
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: escolha por spec | 1 módulo | ✅ Granular |
| T2: olho em todo card | 1 arquivo | ✅ Granular |
| T3: host e árvore | protocolo, webview, host, árvore, manifesto | ⚠️ Coeso: a escolha atravessa a mensagem e o comando, e só se testa inteira |
| T4: docs | README e notas | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | início | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Core | unit | unit | ✅ OK |
| T2 | Webview | unit | unit | ✅ OK |
| T3 | Extension host | integration | integration | ✅ OK |
| T4 | Docs | none | none | ✅ OK |
