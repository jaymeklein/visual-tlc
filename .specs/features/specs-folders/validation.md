# Specs Folders Validation

## Validation: specs-folders - FAIL ❌

Os 11 requisitos funcionam e todos os gates passam. O veredito é FAIL porque 3 mutantes sobreviveram no código novo e o SF-03 só prova 2 das 4 superfícies que lista. Nenhum dos gaps é defeito de implementação: são testes que faltam.

**Date**: 2026-09-29
**Spec**: `.specs/features/specs-folders/spec.md`
**Diff range**: de01d0d..a5516e7 (commits a2e0c8a..a5516e7, branch `feat/specs-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Normalizar e validar as entradas | ✅ Done | dfdfd35 |
| T2 Achar as raízes de specs | ✅ Done | 06200dc |
| T3 Rotular as raízes | ✅ Done | 9bc10f3 |
| T4 Descobrir e observar as pastas configuradas | ⚠️ Partial | 5bb4d65. O item "escopo `resource`" do Done when não tem teste (mutantes H7 e H12 sobrevivem) |
| T5 Avisar sobre entrada inválida | ✅ Done | 7529957 |
| T6 Rotular os grupos na árvore | ✅ Done | dea7ca9 |
| T7 Ativar ao iniciar | ✅ Done | e592583 |
| T8 Documentar a configuração | ✅ Done | a5516e7. Também ajusta o texto vazio em `src/webview/render.ts:114` e o `viewsWelcome` do `package.json` |

Nenhuma task bloqueada. `tasks.md` está com todas as caixas marcadas.

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SF-01 A extensão oferece `tlcSpecs.specsFolders` | lista de caminhos relativos, padrão `[".specs"]` | `test/integration/suite.cjs:415` - `assert.deepEqual(setting.defaultValue, ['.specs'])`. `:416` - `assert.deepEqual(getConfiguration('tlcSpecs', folder()).get('specsFolders'), ['.specs'])` | ✅ PASS |
| SF-02 WHEN a configuração lista pastas THEN cada pasta que corresponda a qualquer entrada vira projeto, em qualquer profundidade | projetos `docs/specs` e `packages/api/docs/specs` com `["docs/specs"]`; com duas entradas, as pastas das duas | `test/integration/suite.cjs:424` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` (igualdade exata do conjunto, `:407`). `:425-426` - `assert.deepEqual(featuresOf(...), ['custom-one'])` e `['nested-one']`. `:429` - `waitForRoots(['.specs', 'docs/specs', 'packages/api/docs/specs'])`. Unit: `test/unit/folders.test.ts:31-34` e `:39-42` | ✅ PASS |
| SF-03 WHEN a configuração muda THEN recarrega árvores, painel, barra de status e diagnósticos sem recarregar a janela | as 4 superfícies refletem a nova lista na mesma janela | **Árvores:** `test/integration/suite.cjs:440` - `assert.ok(fired > 0)`. `:442` - `deepEqual(groups.map(n => n.kind), ['root','root'])`. `:443-446` - features `[['custom-one'], ['nested-one']]`. `:447-450` - árvore Projeto com os mesmos ids de `getProjects()`. **Diagnósticos:** `:451-454` - todo diagnóstico `TLC Specs` fica sob `/docs/specs/`. `:455-457` - `custom-one/spec.md` tem "sem SHALL". **Painel:** sem evidência. **Barra de status:** sem evidência | ❌ GAP (2 de 4 superfícies) |
| SF-04 WHEN um arquivo muda dentro de qualquer pasta configurada THEN atualiza a visão dessa pasta | a visão da pasta reflete a mudança. A spec não define "muda" (criar, alterar, apagar) | Criar: `test/integration/suite.cjs:467` - `waitFor(... featuresOf('docs/specs').includes('custom-two'))`. `:468` - `deepEqual(featuresOf('docs/specs'), ['custom-one','custom-two'])`. `:469` - a outra pasta fica igual. `:480` - `waitForRoots` depois de gravar `notes/specs/lessons.json`. Alterar: só em `.specs`, `:98-99`. Apagar: sem evidência (mutante H16 sobrevive) | ⚠️ Spec-precision gap |
| SF-05 IF pasta de nome diferente de `.specs` casa com a entrada mas não tem artefato THEN é ignorada | `notes/specs` sem artefato fica de fora; `tools/.specs` sem artefato aparece; `notes/specs` aparece depois de ganhar `lessons.json` | `test/integration/suite.cjs:477` - `waitForRoots(['.specs', 'tools/.specs'])`. `:480` - `waitForRoots(['.specs', 'notes/specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:47-52` (4 artefatos aceitos, 5 caminhos recusados) e `:56-57` | ✅ PASS |
| SF-06 WHEN o workspace abre com pasta configurada de outro nome THEN ativa sem abrir a barra lateral | extensão ativa sem `activate()` e lista as features | `test/integration/startup.cjs:19` - `waitFor(() => ext.isActive)` sem chamar `activate()`. `:21-24` - `deepEqual(roots, ['docs/specs'])`. `:25-28` - `deepEqual(features, ['startup-one'])`. Fixture sem `.specs`: `test/fixtures/custom-folder/` | ✅ PASS |
| SF-07 WHEN duas pastas de specs são do mesmo projeto THEN a árvore rotula cada grupo com projeto e caminho | `projeto · caminho` (ex.: `api · docs/specs`); com uma pasta, só o projeto | `test/integration/suite.cjs:516` - `deepEqual(groupLabels(), [ws + ' · .specs', ws + ' · docs/specs', ws + '/packages/api', ws + '/tools'])`. `:520` - `[ws, ws + '/packages/api']`. Unit: `test/unit/folders.test.ts:75-78` - `'api · docs/specs'` literal. `:67-70` | ✅ PASS |
| SF-08 IF a lista está vazia THEN usa `.specs` | `[]` se comporta como `[".specs"]` | `test/integration/suite.cjs:524-525` - `setFolders([])` + `waitForRoots(['.specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:6-7` e `:16` | ✅ PASS |
| SF-09 IF entrada absoluta, com `..` ou com glob THEN ignora e mostra aviso com o nome dela | entrada fora dos projetos; um aviso por entrada, com o texto da entrada | `test/integration/suite.cjs:499` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])`. `:501` - `assert.equal(shown.filter(m => m.includes('"../fora"')).length, 1)`. `:502` - idem para `"docs/*"`. `:504` - `assert.equal(shown.length, 2)` depois de `refresh()`. Unit: `test/unit/folders.test.ts:11-12` (9 entradas: absoluta posix, drive, UNC, `..`, 4 globs) | ✅ PASS |
| SF-10 WHEN duas entradas levam à mesma pasta THEN aparece uma vez | um projeto por pasta | `test/integration/suite.cjs:485` - `waitForRoots` com `['docs/specs', 'docs\\specs\\', 'specs']`. `:487` - `deepEqual(ids, [...new Set(ids)])`. Unit: `test/unit/folders.test.ts:26` e `:62` | ✅ PASS |
| SF-11 WHEN a entrada usa `\` ou termina com `/` THEN é o mesmo caminho normalizado | `docs\specs`, `docs/specs/` e `docs\specs\` viram `docs/specs` | `test/unit/folders.test.ts:20-22` - `deepEqual(parseSpecsFolders([...]).entries, ['docs/specs'])` nas 3 formas. Host: `test/integration/suite.cjs:484-485` | ✅ PASS |
| Decisão confirmada (Assumptions) e Done when do T4: escopo `resource`, lista por pasta do workspace | em multi-root, cada pasta usa a sua lista | sem evidência. Nenhum teste lê `scope` nem abre um workspace multi-root | ❌ GAP |

**Status**: ❌ Gaps present. 9 de 11 requisitos batem com o resultado da spec. SF-03 está parcial. SF-04 tem um gap de precisão da spec. A decisão de escopo `resource` não tem teste.

### Sobre o SF-03

A API do VS Code não lê o item da barra de status nem o DOM do webview. Isso limita o teste, mas não o impede: o projeto já expõe ganchos de teste no retorno de `activate()` (`dashboardHealth`, `dashboardMessage` em `src/extension.ts:22-23`). O mesmo caminho serve para o texto da barra de status e para o último estado enviado ao painel. Por isso classifico como gap, não como limite da API.

O risco é baixo. `StatusBar` (`src/ui/statusBar.ts:16`) e `Dashboard` (`src/ui/dashboard.ts:21`) assinam o mesmo `store.onDidChange` que as árvores e os diagnósticos, e a feature não tocou nesses arquivos. As sondas P1 e P2 confirmam que nenhum teste cai quando essas assinaturas somem.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt HEAD`, com junction para `node_modules`. Cada mutação foi aplicada sozinha e revertida antes da seguinte. Sem `git stash`.

### Core (`npm test`)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/folders.ts:41` | Remove a checagem de `..` | ✅ Killed (SF-09, SF-08/SF-09) |
| C2 | `src/core/folders.ts:57` | Remove a regra do artefato | ✅ Killed (SF-05) |
| C3 | `src/core/folders.ts:56` | Remove a exceção da `.specs` (`named = false`) | ✅ Killed (SF-05) |
| C4 | `src/core/folders.ts:30` | Quebra a deduplicação das entradas | ✅ Killed (SF-10) |
| C5 | `src/core/folders.ts:71` | Rótulo nunca leva a pasta | ✅ Killed (SF-07) |
| C6 | `src/core/folders.ts:70` | Rótulo sempre leva a pasta (`shared = true`) | ✅ Killed (SF-07, 2 testes) |
| C7 | `src/core/folders.ts:32` | Remove o fallback da lista vazia | ✅ Killed (SF-08, 2 testes) |
| C8 | `src/core/folders.ts:39` | Remove a checagem de glob | ✅ Killed (SF-09) |
| C9 | `src/core/folders.ts:38` | Remove a troca de `\` por `/` | ✅ Killed (SF-09, SF-10, SF-11) |
| C10 | `src/core/folders.ts:61` | Entrada menos específica nomeia o projeto (`>` → `<`) | ✅ Killed (SF-10) |
| C11 | `src/core/folders.ts:39` | Remove a checagem de caminho absoluto posix | ✅ Killed (SF-09) |
| C12 | `src/core/folders.ts:22` | Regra do artefato aceita qualquer profundidade em `features/` | ✅ Killed (SF-05) |
| C13 | `src/core/folders.ts:69` | Rótulo ignora o caminho do projeto aninhado | ✅ Killed (SF-07, 2 testes) |

### Extension host (`npm run test:integration`)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H1 | `src/ui/store.ts:36` | Mudança de configuração não recria os watchers | ✅ Killed (SF-04, SF-05) |
| H2 | `src/ui/store.ts:117` | Aviso nunca é mostrado | ✅ Killed (SF-09) |
| H3 | `src/ui/store.ts:119` | Aviso repete a cada refresh | ✅ Killed (SF-09) |
| H4 | `package.json:26` | Remove `onStartupFinished` | ✅ Killed (SF-06, "timed out waiting for: the extension to activate on its own") |
| H5 | `src/ui/store.ts:141` | Descoberta ignora as entradas configuradas | ✅ Killed (SF-02, 03, 04, 05, 07, 09, 10/11 e SF-06) |
| H6 | `src/ui/store.ts:148` | Store rotula só com o nome da pasta do workspace | ✅ Killed (SF-07) |
| H7 | `package.json:220` | Escopo `resource` → `window` | ❌ Survived → Fix 1 |
| H8 | `package.json:217` | Padrão `.specs` → `specs` | ✅ Killed (SF-01 e mais 21 testes) |
| H9 | `src/ui/store.ts:48` | Watchers observam sempre `.specs`, não a entrada | ✅ Killed (SF-04, SF-05) |
| H10 | `src/ui/store.ts:36` | Mudança de configuração não recarrega nada | ✅ Killed (SF-02, 03, 04, 05, 07, 09, 10/11) |
| H11 | `src/ui/store.ts:135` | Busca do host perde a exceção da `.specs` | ✅ Killed (SF-05, SF-07, SF-08, SF-10/11) |
| H12 | `src/ui/store.ts:129` | Configuração lida sem a pasta do workspace | ❌ Survived → Fix 1 |
| H13 | `src/ui/store.ts:49` | Watchers ignoram criação de arquivo | ✅ Killed (SF-04, SF-05, file watcher) |
| H14 | `src/ui/store.ts:102` | Entradas inválidas não chegam ao aviso | ✅ Killed (SF-09) |
| H15 | `src/ui/store.ts:49` | Watchers ignoram alteração de arquivo | ✅ Killed ("reflects task progress when tasks.md changes") |
| H16 | `src/ui/store.ts:49` | Watchers ignoram exclusão de arquivo | ❌ Survived → Fix 2 |

### Sondas fora do diff (evidência para o SF-03, não contam no placar)

| Probe | File:line | Description | Killed? |
| ----- | --------- | ----------- | ------- |
| P1 | `src/ui/statusBar.ts:16` | Barra de status deixa de seguir o store | ❌ Survived → Fix 3 |
| P2 | `src/ui/dashboard.ts:21` | Painel deixa de receber o estado quando o store muda | ❌ Survived → Fix 3 |

**Sensor depth**: P0-full manual (29 mutações no diff, núcleo e host)
**Result**: 26/29 killed - FAIL ❌

**Isolamento**: `git status --porcelain` da árvore real vazio antes e vazio depois. Junction removida com `rmdir` (sem recursão), `node_modules` real com 131 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em a5516e7.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. A feature tem interface, então o UAT fica para o orquestrador depois que os gaps fecharem.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `src/core/folders.ts` tem 72 linhas e 3 funções puras |
| Surgical changes | ✅ `src/ui/store.ts` troca a busca fixa pela configurada; `labelFor` saiu porque ficou órfã |
| No scope creep | ✅ Sem caminhos absolutos, sem glob nas entradas, sem layout alternativo |
| Matches patterns | ✅ Mesmo estilo dos módulos de `src/core` e da suíte `.cjs` |
| Spec-anchored outcome check (asserted values match spec) | ⚠️ SF-03 parcial, SF-04 sem exclusão |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Core 1:1 com os ACs. Host sem teste para escopo por pasta, painel e barra de status |
| Every test maps to a spec requirement - no unclaimed tests | ✅ O teste `specs-folders: restores the default configuration` (`test/integration/suite.cjs:528`) é limpeza da suíte |
| Documented guidelines followed: none - strong defaults applied | ✅ |

Observação: a regra do artefato existe em dois lugares, `src/core/folders.ts:22` e `src/ui/store.ts:135`. A do host reduz a busca; a do core decide. A redundância é intencional e as duas têm mutante morto (C2, C12, H11).

---

## Edge Cases

- [x] Lista vazia usa `.specs` (SF-08): `test/integration/suite.cjs:525`, `test/unit/folders.test.ts:6`
- [x] Entrada absoluta, com `..` ou com glob é ignorada com aviso que a nomeia (SF-09): `test/integration/suite.cjs:501-504`, `test/unit/folders.test.ts:12`
- [x] Duas entradas para a mesma pasta mostram a pasta uma vez (SF-10): `test/integration/suite.cjs:487`, `test/unit/folders.test.ts:62`
- [x] `\` e `/` final normalizam para o mesmo caminho (SF-11): `test/unit/folders.test.ts:20-22`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 37 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 34/34 em `suite.cjs` e 1/1 em `startup.cjs` (exit 0), em VS Code real
- **Test count before feature**: 25 unit + 24 integration (contados em de01d0d)
- **Test count after feature**: 37 unit + 35 integration
- **Delta**: +12 unit, +11 integration
- **Skipped tests**: nenhum
- **Failures**: nenhuma
- **Test integrity**: `test/integration/suite.cjs` e `test/unit/folders.test.ts` só ganharam linhas (139 e 79 inserções, 0 remoções). `test/integration/run.mjs` virou um laço sobre duas suítes, sem perder nenhuma opção de execução

---

## Fix Plans (if issues found)

### Fix 1: Configuração por pasta do workspace sem teste (H7, H12)

- **Root cause**: as duas fixtures são single-root. Ler a configuração com ou sem `folder.uri` dá o mesmo resultado, e o escopo do `package.json` não é lido por nenhum teste.
- **Fix task**: criar `test/fixtures/multi-root/` com um `ws.code-workspace` de duas pastas. A pasta `a` tem `.vscode/settings.json` com `["docs/specs"]` e guarda `a/.specs/` e `a/docs/specs/`. A pasta `b` não tem configuração e guarda `b/.specs/` e `b/docs/specs/`. Adicionar uma terceira execução em `test/integration/run.mjs` que abre o arquivo `.code-workspace`. Verificar que os projetos são exatamente `a/docs/specs` e `b/.specs`. No teste SF-01 (`test/integration/suite.cjs:413`), verificar também `packageJSON.contributes.configuration.properties['tlcSpecs.specsFolders'].scope === 'resource'`.
- **Done when**: H7 e H12 morrem.
- **Priority**: Major

### Fix 2: Exclusão de arquivo em pasta configurada sem teste (H16, SF-04)

- **Root cause**: o SF-04 só grava arquivo novo. Nenhum teste apaga arquivo, então `watcher.onDidDelete` em `src/ui/store.ts:49` pode sumir sem aviso.
- **Fix task**: no teste SF-04 (`test/integration/suite.cjs:463`), apagar `docs/specs/features/custom-two/` depois da criação e esperar `featuresOf('docs/specs')` voltar a `['custom-one']`. Registrar na spec que "muda" cobre criar, alterar e apagar.
- **Done when**: H16 morre.
- **Priority**: Minor

### Fix 3: SF-03 não prova painel nem barra de status (P1, P2)

- **Root cause**: o teste verifica árvores e diagnósticos. Painel e barra de status não têm gancho de leitura no retorno de `activate()`.
- **Fix task**: expor no `TlcSpecsApi` (`src/extension.ts:19`) o texto atual da barra de status e os ids de projeto do último `state` enviado ao painel. No teste SF-03 (`test/integration/suite.cjs:432`), abrir o painel antes da troca e verificar, depois dela, que o texto da barra nomeia uma feature de `docs/specs` e que o estado do painel tem os mesmos ids de `getProjects()`.
- **Done when**: P1 e P2 morrem.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SF-01 | Implementing | ✅ Verified (falta ler o escopo, Fix 1) |
| SF-02 | Implementing | ✅ Verified |
| SF-03 | Implementing | ❌ Needs Fix (Fix 3) |
| SF-04 | Implementing | ❌ Needs Fix (Fix 2) |
| SF-05 | Implementing | ✅ Verified |
| SF-06 | Implementing | ✅ Verified |
| SF-07 | Implementing | ✅ Verified |
| SF-08 | Implementing | ✅ Verified |
| SF-09 | Implementing | ✅ Verified |
| SF-10 | Implementing | ✅ Verified |
| SF-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 9/11 requisitos batem com a spec. 1 gap (SF-03, 2 de 4 superfícies), 1 gap de precisão (SF-04), 1 decisão sem teste (escopo `resource`)
**Sensor**: 26/29 mutações mortas. Sobreviventes: H7, H12, H16
**Gate**: typecheck ok, 37 unit, 34 + 1 integration, 0 falhas

**What works**: descoberta por entrada em qualquer profundidade, regra do artefato, exceção da `.specs`, recarga na troca de configuração, watchers recriados por entrada, aviso único por entrada inválida, rótulos por projeto e pasta, fallback da lista vazia, ativação ao iniciar. O núcleo matou 13 de 13 mutações.

**Issues found**:

1. Configuração por pasta do workspace sem teste (H7 em `package.json:220`, H12 em `src/ui/store.ts:129`). Correção: Fix 1.
2. SF-03 não verifica painel nem barra de status (`test/integration/suite.cjs:432-461`). Correção: Fix 3.
3. SF-04 não verifica exclusão de arquivo (H16 em `src/ui/store.ts:49`). Correção: Fix 2.

**Next steps**: encaminhar Fix 1, Fix 2 e Fix 3 a um implementador e validar de novo (iteração 2 de 3).
