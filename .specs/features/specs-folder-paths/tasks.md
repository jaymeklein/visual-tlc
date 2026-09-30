# Specs Folder Paths Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (sem `design.md`)
**Status**: In Progress

Design inline: `src/core/folders.ts` continua puro. `findSpecsRoots` passa a aceitar só arquivos que começam no caminho da entrada, e `rootLabel` rotula pela pasta do workspace e, quando ela tem mais de uma pasta de specs, pelo caminho da entrada. `parseExclude` sai. `src/ui/store.ts` procura e observa `<entrada>/**` a partir da raiz de cada pasta do workspace, sem exclusão. As árvores Features e Projeto deixam de pular o nó quando há um projeto só.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Estilo de `test/unit/folders.test.ts` e `test/integration/*.cjs`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core/folders.ts`) | unit | Todos os ramos; 1:1 com os ACs; um teste por edge case listado | `test/unit/folders.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `package.json` contributes) | integration | Cada AC no resultado visível: projetos, filhos das árvores, painel, barra de status, diagnósticos, aviso | `test/integration/*.cjs` | `npm run test:integration` |
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

### Phase 2: Extension host

```
T1 → T2 → T3
```

### Phase 3: Docs

```
T3 → T4
```

### Phase 4: Correções do Verifier (iteração 1)

```
T4 → T5 → T6
```

---

## Task Breakdown

### T1: Achar as pastas pelo caminho exato

**What**: `findSpecsRoots` aceita só arquivos que começam no caminho da entrada. `rootLabel` usa o nome da pasta do workspace, com " · entrada" quando ela tem mais de uma pasta de specs. `parseExclude` e o tipo `Exclude` saem
**Where**: `src/core/folders.ts`
**Depends on**: None
**Reuses**: `parseSpecsFolders`, `pendingWarnings`, a regra de artefato (SF-05)
**Requirement**: SFP-01, SFP-02, SFP-09, SFP-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `.specs` acha `.specs/...` e não acha `test/fixtures/sample/.specs/...` (SFP-01)
- [x] `packages/api/.specs` acha a pasta nesse caminho e não acha `x/packages/api/.specs` (SFP-02)
- [x] Rótulo: nome da pasta do workspace com uma pasta de specs; "nome · entrada" com duas (SFP-09)
- [x] Entradas inválidas continuam recusadas e citadas (SFP-11)
- [x] `parseExclude` e os testes dele ficam até a T2, que os tira junto com o store
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): find each specs folder at its exact path`

---

### T2: Ler só as pastas configuradas e tirar o exclude

**What**: A busca e os watchers usam `<entrada>/**` a partir da raiz de cada pasta do workspace, sem exclusão. `tlcSpecs.exclude` sai do `package.json`, do store e dos avisos. A tela de boas-vindas diz que o caminho parte da raiz
**Where**: `src/ui/store.ts`, `package.json`
**Depends on**: T1
**Reuses**: `discoverSpecsRoots`, `watch`, `warn`
**Requirement**: SFP-01, SFP-02, SFP-03, SFP-04, SFP-05, SFP-06, SFP-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Com o padrão, os projetos são só `.specs`, mesmo com `.specs` criadas em subpastas (SFP-01)
- [x] `packages/api/docs/specs` listada lê só essa pasta (SFP-02)
- [x] Uma spec numa pasta não configurada fica fora das árvores, do painel na aba e na lateral, da barra de status e do painel Problemas (SFP-03)
- [x] O `package.json` não declara `tlcSpecs.exclude`, e um valor dele nas configurações não muda a listagem (SFP-04)
- [x] Entrada que não existe: sem projeto e sem aviso. Ao criar a pasta, ela aparece sem recarregar a janela (SFP-05, SFP-06)
- [x] `parseExclude` e os testes EXC saem com a configuração. O teste de `pendingWarnings` passa a usar só `tlcSpecs.specsFolders`. Os SF de busca em profundidade são reescritos para o caminho exato. `multiroot.cjs` e o fixture `b` passam a usar só `specsFolders`
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: integration
**Gate**: full

**Commit**: `feat(store): read only the configured specs folders`

---

### T3: Nó da pasta com um projeto só

**What**: As árvores Features e Projeto mostram o nó da pasta mesmo quando há uma única pasta de specs
**Where**: `src/ui/featuresTree.ts`, `src/ui/projectTree.ts`
**Depends on**: T2
**Reuses**: nó `root` das duas árvores
**Requirement**: SFP-07, SFP-08, SFP-09, SFP-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Features com uma pasta: um nó `root` com o nome da pasta do workspace e as specs dentro (SFP-07)
- [x] Projeto com uma pasta: um nó `root` com Handoff, decisões e lições dentro (SFP-08)
- [x] Duas pastas de specs na mesma pasta do workspace: "nome · entrada" nas duas árvores (SFP-09)
- [x] Todas as specs ocultas: o nó continua, sem filhos, e a mensagem conta as ocultas (SFP-10)
- [x] Os testes que liam as specs no topo da árvore passam a ler dentro do nó da pasta
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): show the specs folder node with a single project`

---

### T4: Documentar o caminho exato

**What**: O README descreve `tlcSpecs.specsFolders` como caminho exato e tira a seção de `tlcSpecs.exclude`. As specs specs-folders, exclude-folders e hidden-specs ganham notas do que mudou
**Where**: `README.md`
**Depends on**: T3
**Reuses**: seção "Pastas de specs" do README
**Requirement**: SFP-01, SFP-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README sem `tlcSpecs.exclude`, com exemplos de caminho exato
- [x] Notas no SF-02 e no SF-07 (specs-folders), no topo de exclude-folders e no HID-16 (hidden-specs)
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the specs folders as exact paths`

---

### T5: Fix 1 - o SFP-06 prova o watcher

**What**: O teste do SFP-05/06 espera acabarem os recarregamentos que a troca de configuração agenda antes de criar a pasta, para que só o watcher possa mostrá-la
**Where**: `test/integration/suite.cjs`
**Depends on**: T4
**Reuses**: `waitFor`, `api.featuresTree.onDidChangeTreeData`
**Requirement**: SFP-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Antes de criar `later/.specs`, o teste espera a árvore ficar parada por mais tempo que o debounce de 300 ms (mata HW)
- [ ] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [ ] Test count: 62 unit, 61 + 1 + 1 integration tests pass

**Tests**: integration
**Gate**: full

**Commit**: `test(store): prove that the watcher shows a specs folder created later`

---

### T6: Fix 2 - a regra do começo do caminho sozinha

**What**: Os testes do SFP-01 e SFP-02 afirmam, sem nenhum caso positivo ao lado, que `.specs` em subpasta, o caminho numa subpasta e `.specs-old` não são pastas de specs
**Where**: `test/unit/folders.test.ts`
**Depends on**: T5
**Reuses**: `findSpecsRoots`
**Requirement**: SFP-01, SFP-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Só arquivos em subpastas: `findSpecsRoots` devolve `[]` para `.specs` e para `packages/api/.specs` (mata U1)
- [ ] `.specs-old/STATE.md` não conta como `.specs` (mata U2)
- [ ] Gate check passes: `npm run typecheck && npm test`
- [ ] Test count: 62 unit tests pass (asserções novas em testes existentes)

**Tests**: unit
**Gate**: quick

**Commit**: `test(core): check the start-of-path rule without a matching folder beside it`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2 ------→ T3
Phase 3:  T4
Phase 4:  T5 ------→ T6
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: caminho exato | 1 módulo | ✅ Granular |
| T2: store e manifesto | store e `package.json` | ⚠️ Coeso: a configuração removida do manifesto e do store se testa junto |
| T3: nó da pasta | duas árvores, a mesma regra | ⚠️ Coeso: uma regra nas duas árvores |
| T4: docs | README e notas | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | início | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Core | unit | unit | ✅ OK |
| T2 | Extension host | integration | integration | ✅ OK |
| T3 | Extension host | integration | integration | ✅ OK |
| T4 | Docs | none | none | ✅ OK |
| T5 | Extension host (teste) | integration | integration | ✅ OK |
| T6 | Core (teste) | unit | unit | ✅ OK |
