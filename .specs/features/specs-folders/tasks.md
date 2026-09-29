# Specs Folders Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (escopo Medium, sem `design.md`)
**Status**: In Progress

Design inline: `src/core/folders.ts` concentra a lógica pura (normalizar entradas, achar raízes, rotular). `src/ui/store.ts` lê a configuração por pasta do workspace, busca arquivos, recria os watchers e mostra os avisos.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core`) | unit | Todos os ramos; 1:1 com os ACs; um teste por edge case listado | `test/unit/*.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `package.json` contributes) | integration | Cada AC verificado no resultado visível (projetos, árvore, diagnósticos, aviso) | `test/integration/*.cjs` | `npm run test:integration` |
| Docs (`README.md`) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run typecheck && npm test` |
| Full | After tasks with integration tests | `npm run typecheck && npm test && npm run test:integration` |
| Build | After phase completion or docs-only tasks | `npm run typecheck && npm test && npm run test:integration` |

---

## Execution Plan

### Phase 1: Core

```
T1 → T2 → T3
```

### Phase 2: Extension host

```
T3 → T4 → T5 → T6 → T7
```

### Phase 3: Docs

```
T7 → T8
```

### Phase 4: Correções do Verifier (iteração 1)

```
T8 → T9 → T10 → T11
```

---

## Task Breakdown

### T1: Normalizar e validar as entradas

**What**: `parseSpecsFolders(raw)` devolve as entradas válidas normalizadas e as inválidas
**Where**: `src/core/folders.ts`
**Depends on**: None
**Reuses**: estilo dos módulos de `src/core`
**Requirement**: SF-08, SF-09, SF-10, SF-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Lista vazia ou ausente devolve `['.specs']`
- [x] Entrada absoluta, com `..` ou com glob sai em `invalid` e fica fora de `entries`
- [x] `docs\specs` e `docs/specs/` viram `docs/specs`
- [x] Entradas repetidas depois de normalizadas aparecem uma vez
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 25 existentes + novos passam

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): parse the configured specs folders`

---

### T2: Achar as raízes de specs

**What**: `findSpecsRoots(files, entries)` devolve as pastas de specs entre os arquivos de uma pasta do workspace
**Where**: `src/core/folders.ts` (modify)
**Depends on**: T1
**Reuses**: regra de descoberta de `src/ui/store.ts`
**Requirement**: SF-02, SF-05, SF-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Acha a entrada na raiz e em subpastas
- [x] Pasta de nome diferente de `.specs` sem artefato da skill fica de fora
- [x] Pasta `.specs` aparece com qualquer arquivo
- [x] Pasta alcançada por duas entradas aparece uma vez
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: nenhum teste removido

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): find specs roots among workspace files`

---

### T3: Rotular as raízes

**What**: `rootLabel(root, all, folderName)` devolve o rótulo do grupo, com o caminho da pasta quando o projeto tem mais de uma
**Where**: `src/core/folders.ts` (modify)
**Depends on**: T2
**Reuses**: formato de `labelFor` em `src/ui/store.ts`
**Requirement**: SF-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Projeto com uma pasta mantém o rótulo atual (`api`, `ws/packages/api`)
- [x] Projeto com duas pastas rotula `projeto · caminho` em cada grupo
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: nenhum teste removido

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): label specs roots by project and folder`

---

### T4: Descobrir e observar as pastas configuradas

**What**: o store lê `tlcSpecs.specsFolders` por pasta do workspace, descobre as raízes e recria os watchers quando a configuração muda
**Where**: `src/ui/store.ts` (modify)
**Depends on**: T3
**Reuses**: `parseSpecsFolders`, `findSpecsRoots`
**Requirement**: SF-01, SF-02, SF-03, SF-04, SF-05, SF-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `package.json` declara `tlcSpecs.specsFolders` com padrão `[".specs"]` e escopo `resource`
- [x] Com `["docs/specs"]`, as features de `docs/specs` aparecem em projetos, árvore e diagnósticos sem recarregar a janela
- [x] Arquivo novo dentro de `docs/specs` atualiza a visão
- [x] Pasta `docs/specs` sem artefato não vira projeto
- [x] Duas entradas para a mesma pasta geram um projeto
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 24 testes de integração existentes + novos passam

**Tests**: integration
**Gate**: full

**Commit**: `feat(store): discover and watch the configured specs folders`

---

### T5: Avisar sobre entrada inválida

**What**: o store mostra um aviso que nomeia cada entrada inválida, uma vez por entrada
**Where**: `src/ui/store.ts` (modify)
**Depends on**: T4
**Reuses**: `parseSpecsFolders`
**Requirement**: SF-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Entrada `../fora` gera um aviso com o texto `../fora` e não vira projeto
- [x] As entradas válidas da mesma lista continuam funcionando
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(store): warn about invalid specs folder entries`

---

### T6: Rotular os grupos na árvore

**What**: o store usa `rootLabel` para o rótulo de cada projeto
**Where**: `src/ui/store.ts` (modify)
**Depends on**: T5
**Reuses**: `rootLabel`
**Requirement**: SF-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Com `[".specs", "docs/specs"]` a árvore Features mostra dois grupos, `ws · .specs` e `ws · docs/specs`
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): label groups by project and specs folder`

---

### T7: Ativar ao iniciar

**What**: a extensão ativa com `onStartupFinished`, verificado num workspace que só tem `docs/specs`
**Where**: `package.json` (modify)
**Depends on**: T6
**Reuses**: `test/integration/run.mjs`
**Requirement**: SF-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Num workspace sem `.specs` e com `tlcSpecs.specsFolders = ["docs/specs"]`, a extensão fica ativa sem chamada a `activate()` e lista as features
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(extension): activate on startup for custom specs folders`

---

### T8: Documentar a configuração

**What**: README e textos de boas-vindas descrevem `tlcSpecs.specsFolders`
**Where**: `README.md` (modify)
**Depends on**: T7
**Reuses**: tabela de configurações existente
**Requirement**: SF-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Tabela de configurações lista `tlcSpecs.specsFolders` com padrão e regras das entradas
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the specs folders setting`

---

### T9: Provar a configuração por pasta do workspace

**What**: suíte de integração num workspace multi-root em que cada pasta tem a sua lista
**Where**: `test/integration/multiroot.cjs`
**Depends on**: T8
**Reuses**: `test/integration/startup.cjs`, `test/integration/run.mjs`
**Requirement**: SF-01, SF-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Pasta `a` com `["docs/specs"]` mostra só `a/docs/specs`; pasta `b` sem configuração mostra só `b/.specs`
- [x] O teste do SF-01 confere o escopo `resource` da configuração
- [x] Mutantes H7 e H12 do Verifier morrem
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(store): cover per-folder specs folders in a multi-root workspace`

---

### T10: Provar painel e barra de status no SF-03

**What**: a API de teste expõe o texto da barra de status e os projetos do último estado enviado ao painel
**Where**: `src/extension.ts` (modify)
**Depends on**: T9
**Reuses**: `dashboardHealth` em `src/extension.ts`
**Requirement**: SF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Depois da troca de configuração, a barra de status nomeia uma feature de `docs/specs`
- [ ] Depois da troca de configuração, o último estado enviado ao painel tem os mesmos projetos de `getProjects()`
- [ ] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [ ] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover panel and status bar on configuration change`

---

### T11: Provar alteração e remoção de arquivo no SF-04

**What**: o teste do SF-04 cobre arquivo criado, alterado e removido numa pasta configurada
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T10
**Reuses**: teste `SF-04` existente
**Requirement**: SF-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A spec nomeia os três eventos no SF-04
- [ ] Alterar `spec.md` em `docs/specs` muda os avisos da feature
- [ ] Remover a pasta da feature em `docs/specs` tira a feature da visão
- [ ] Mutante H16 do Verifier morre
- [ ] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [ ] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(store): cover file change and removal in configured folders`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ------→ T2 ------→ T3
Phase 2:  T4 ------→ T5 ------→ T6 ------→ T7
Phase 3:  T8
Phase 4:  T9 ------→ T10 ------→ T11
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Normalizar e validar as entradas | 1 função | ✅ Granular |
| T2: Achar as raízes de specs | 1 função | ✅ Granular |
| T3: Rotular as raízes | 1 função | ✅ Granular |
| T4: Descobrir e observar as pastas configuradas | 1 classe (store) + contribuição de configuração | ✅ Coeso |
| T5: Avisar sobre entrada inválida | 1 comportamento no store | ✅ Granular |
| T6: Rotular os grupos na árvore | 1 chamada no store | ✅ Granular |
| T7: Ativar ao iniciar | 1 evento de ativação | ✅ Granular |
| T8: Documentar a configuração | 1 arquivo | ✅ Granular |
| T9: Provar a configuração por pasta do workspace | 1 suíte + fixture | ✅ Granular |
| T10: Provar painel e barra de status no SF-03 | 2 leituras de teste na API | ✅ Coeso |
| T11: Provar alteração e remoção de arquivo no SF-04 | 1 teste | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 | ✅ Match |
| T3 | T2 | T2 | ✅ Match |
| T4 | T3 | T3 | ✅ Match |
| T5 | T4 | T4 | ✅ Match |
| T6 | T5 | T5 | ✅ Match |
| T7 | T6 | T6 | ✅ Match |
| T8 | T7 | T7 | ✅ Match |
| T9 | T8 | T8 | ✅ Match |
| T10 | T9 | T9 | ✅ Match |
| T11 | T10 | T10 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Core | unit | unit | ✅ OK |
| T2 | Core | unit | unit | ✅ OK |
| T3 | Core | unit | unit | ✅ OK |
| T4 | Extension host | integration | integration | ✅ OK |
| T5 | Extension host | integration | integration | ✅ OK |
| T6 | Extension host | integration | integration | ✅ OK |
| T7 | Extension host | integration | integration | ✅ OK |
| T8 | Docs | none | none | ✅ OK |
| T9 | Extension host | integration | integration | ✅ OK |
| T10 | Extension host | integration | integration | ✅ OK |
| T11 | Extension host | integration | integration | ✅ OK |
