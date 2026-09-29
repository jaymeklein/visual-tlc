# Specs Folders Validation

## Validation: specs-folders - PASS ✅

Os 11 requisitos batem com a spec, todos os gates passam e as 27 mutações injetadas no código da feature morrem. Os gaps das iterações 1 e 2 fecharam. Ficam três sondas vivas, todas em código anterior à feature: duas são limite da API do VS Code (N5, N5b) e uma é um resíduo que dá para fechar depois (R1). Nenhuma bloqueia a entrega.

**Date**: 2026-09-29
**Spec**: `.specs/features/specs-folders/spec.md`
**Diff range**: de01d0d..0ef11e1 (iteração 3: 50b67ff..0ef11e1, branch `feat/specs-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | a5516e7 | Reprovada | 3 mutantes vivos (H7, H12, H16), SF-03 sem painel nem barra de status, SF-04 sem precisão. Lições L-003 a L-006 |
| 2 | 50b67ff | Reprovada | T9 e T11 fecham H7, H12 e H16. T10 prova a barra de status, mas prova o painel num espelho gravado antes do envio: N2 e N8 vivos. L-002 promovida, L-007 criada |
| 3 | 0ef11e1 | Aprovada | T12 troca o espelho pela confirmação da webview. T13 cobre a configuração que não acha nada. N2, N8, N4 e N6 morrem |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Normalizar e validar as entradas | ✅ Done | dfdfd35 |
| T2 Achar as raízes de specs | ✅ Done | 06200dc |
| T3 Rotular as raízes | ✅ Done | 9bc10f3 |
| T4 Descobrir e observar as pastas configuradas | ✅ Done | 5bb4d65 |
| T5 Avisar sobre entrada inválida | ✅ Done | 7529957 |
| T6 Rotular os grupos na árvore | ✅ Done | dea7ca9 |
| T7 Ativar ao iniciar | ✅ Done | e592583 |
| T8 Documentar a configuração | ✅ Done | a5516e7 |
| T9 Provar a configuração por pasta do workspace | ✅ Done | 070fd79 |
| T10 Provar painel e barra de status no SF-03 | ✅ Done | 3577fec, completada pela T12 |
| T11 Provar alteração e remoção de arquivo no SF-04 | ✅ Done | 50b67ff |
| T12 Provar o painel pelo que ele renderizou | ✅ Done | 7ffbd03. N2, N6 e N8 morrem |
| T13 Provar a barra de status sem projetos | ✅ Done | 0ef11e1. N4 morre |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SF-01 A extensão oferece `tlcSpecs.specsFolders` | lista de caminhos relativos, padrão `[".specs"]`, escopo `resource` (decisão confirmada) | `test/integration/suite.cjs:417` - `assert.deepEqual(setting.defaultValue, ['.specs'])`. `:419` - `assert.equal(declared.scope, 'resource')`. `:420` - `get('specsFolders')` igual a `['.specs']`. Comportamento por pasta: `test/integration/multiroot.cjs:11-14` - `deepEqual(roots, ['a/docs/specs', 'b/.specs'])` | ✅ PASS |
| SF-02 WHEN a configuração lista pastas THEN cada pasta que corresponda a qualquer entrada vira projeto, em qualquer profundidade | projetos `docs/specs` e `packages/api/docs/specs` com `["docs/specs"]`; com duas entradas, as pastas das duas; em multi-root, cada pasta usa a sua lista | `test/integration/suite.cjs:428` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` (igualdade exata, `:409`). `:429-430` - features `['custom-one']` e `['nested-one']`. `:433` - três raízes com duas entradas. `test/integration/multiroot.cjs:11-14` e `:15-18` - features `[['a-custom'], ['b-default']]`. Unit: `test/unit/folders.test.ts:31-34` e `:39-42` | ✅ PASS |
| SF-03 WHEN a configuração muda THEN recarrega árvores, painel, barra de status e diagnósticos sem recarregar a janela | as 4 superfícies refletem a nova lista na mesma janela | **Árvores:** `test/integration/suite.cjs:450` - `assert.ok(fired > 0)`. `:455` - `['root','root']`. `:456-459` - features `[['custom-one'], ['nested-one']]`. `:460-463` - árvore Projeto com os ids de `getProjects()`. `:475` - `deepEqual(featuresTree.getChildren(), [])` sem projetos. **Painel:** `:440` - gancho `undefined` com o painel fechado. `:442-443` - primeiro estado confirmado, `deepEqual(before, [projectId()])`. `:451-452` - depois da troca, espera a lista confirmada pela webview ser igual aos ids de `getProjects()`. `:476` - espera `[]` sem projetos. O valor vem da mensagem `rendered`, enviada pela webview depois de `render()` (`src/webview/main.ts:30-31`) e gravada só em `src/ui/dashboard.ts:64`. **Barra de status:** `:444` - antes, `/user-auth/`. `:453` - depois, `assert.match(api.statusBarText(), /^\$\(tasklist\) (custom-one\|nested-one) · /)`. `:474` - `assert.equal(api.statusBarText(), undefined)` sem projetos. **Diagnósticos:** `:464-467` - todo diagnóstico `TLC Specs` sob `/docs/specs/`. `:468-470` - "sem SHALL" em `custom-one/spec.md`. `:477` - nenhum diagnóstico `TLC Specs` sem projetos | ✅ PASS |
| SF-04 WHEN um arquivo é criado, alterado ou removido dentro de qualquer pasta configurada THEN atualiza a visão dessa pasta | a visão de `docs/specs` reflete os três eventos | Criar: `test/integration/suite.cjs:490-493` - `deepEqual(featuresOf('docs/specs'), ['custom-one','custom-two'])` e `assert.equal(withoutShall(customTwo()), 1)`. Alterar: `:495-496` - regrava o `spec.md` com SHALL e espera `withoutShall(customTwo()) === 0`. Remover: `:498-500` - apaga a pasta, espera `!customTwo()` e `deepEqual(featuresOf('docs/specs'), ['custom-one'])`. Outra pasta intacta: `:492` | ✅ PASS |
| SF-05 IF pasta de nome diferente de `.specs` casa com a entrada mas não tem artefato THEN é ignorada | `notes/specs` sem artefato fica de fora; `tools/.specs` sem artefato aparece; `notes/specs` aparece depois de ganhar `lessons.json` | `test/integration/suite.cjs:508` - `waitForRoots(['.specs', 'tools/.specs'])`. `:511` - `waitForRoots(['.specs', 'notes/specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:47-52` e `:56-57` | ✅ PASS |
| SF-06 WHEN o workspace abre com pasta configurada de outro nome THEN ativa sem abrir a barra lateral | extensão ativa sem `activate()` e lista as features | `test/integration/startup.cjs:19` - `waitFor(() => ext.isActive)`. `:21-24` - `deepEqual(roots, ['docs/specs'])`. `:25-28` - `deepEqual(features, ['startup-one'])` | ✅ PASS |
| SF-07 WHEN duas pastas de specs são do mesmo projeto THEN a árvore rotula cada grupo com projeto e caminho | `projeto · caminho` (ex.: `api · docs/specs`); com uma pasta, só o projeto | `test/integration/suite.cjs:547` - `deepEqual(groupLabels(), [ws + ' · .specs', ws + ' · docs/specs', ws + '/packages/api', ws + '/tools'])`. `:551` - `[ws, ws + '/packages/api']`. Unit: `test/unit/folders.test.ts:75-78` e `:67-70` | ✅ PASS |
| SF-08 IF a lista está vazia THEN usa `.specs` | `[]` se comporta como `[".specs"]` | `test/integration/suite.cjs:555-556` - `setFolders([])` + `waitForRoots(['.specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:6-7` e `:16` | ✅ PASS |
| SF-09 IF entrada absoluta, com `..` ou com glob THEN ignora e mostra aviso com o nome dela | entrada fora dos projetos; um aviso por entrada, com o texto da entrada | `test/integration/suite.cjs:530` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])`. `:532-533` - um aviso com `"../fora"` e um com `"docs/*"`. `:535` - `assert.equal(shown.length, 2)` depois de `refresh()`. Unit: `test/unit/folders.test.ts:11-12` | ✅ PASS |
| SF-10 WHEN duas entradas levam à mesma pasta THEN aparece uma vez | um projeto por pasta | `test/integration/suite.cjs:516` - `waitForRoots` com `['docs/specs', 'docs\\specs\\', 'specs']`. `:518` - `deepEqual(ids, [...new Set(ids)])`. Unit: `test/unit/folders.test.ts:26` e `:62` | ✅ PASS |
| SF-11 WHEN a entrada usa `\` ou termina com `/` THEN é o mesmo caminho normalizado | `docs\specs`, `docs/specs/` e `docs\specs\` viram `docs/specs` | `test/unit/folders.test.ts:20-22`. Host: `test/integration/suite.cjs:515-516` | ✅ PASS |

**Status**: ✅ All ACs covered. 11 de 11 requisitos batem com o resultado da spec. Nenhum gap de precisão.

### Julgamento do SF-03 nesta iteração

- **Painel**: a prova saiu do host e foi para a webview. O valor lido pelo teste só existe se o estado chegou à webview, foi aplicado e `render()` terminou sem erro. Sete falhas diferentes no caminho morrem: estado não enviado (N2b), enviado vazio (N8b), assinatura do store removida (P2), confirmação ausente (M1), confirmação vazia (M2), mensagem descartada no host (M4), estado não aplicado na webview (R2).
- **Resíduo (R1)**: a confirmação leva a lista que a webview guarda, não uma leitura do DOM. Se a chamada `render()` sumir de `src/webview/main.ts:30`, a confirmação ainda sai e o teste passa. Essa linha é anterior à feature, e `renderApp` tem testes próprios em `test/unit/webview.test.ts`. Classifico como resíduo fora do diff, não como gap deste requisito.
- **Painel fechado** (`suite.cjs:440`): a espera só termina se o gancho for limpo no descarte do painel. Isso garante que o primeiro estado lido em `:442` é do painel novo.
- **Configuração que não acha nada** (`suite.cjs:472-477`): cobre o caminho de esvaziar as quatro superfícies. Mata N4, M3 e D1.
- **Barra de status**: texto provado. Visibilidade não pode ser lida pela API do VS Code (N5, N5b).

---

## Discrimination Sensor

Scratch nas três iterações: `git worktree add --detach <scratchpad>/wt HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`.

### Iteração 3 (HEAD 0ef11e1)

Sobreviventes da iteração 2, adaptados ao código novo:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| N2b | `src/ui/dashboard.ts:94` | Estado nunca é enviado ao painel | ✅ Killed (SF-03) |
| N8b | `src/ui/dashboard.ts:94` | Estado enviado ao painel sem projetos | ✅ Killed (SF-03) |
| N4 | `src/ui/statusBar.ts:25` | Gancho da barra não é limpo quando o item some | ✅ Killed (SF-03) |
| N6b | `src/ui/dashboard.ts:44` | Gancho do painel não é limpo no descarte | ✅ Killed (SF-03) |

Mutações novas contra o código da iteração 3:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/webview/main.ts:31` | Webview nunca confirma o que renderizou | ✅ Killed (SF-03) |
| M2 | `src/webview/main.ts:31` | Webview confirma uma lista vazia | ✅ Killed (SF-03) |
| M4 | `src/ui/dashboard.ts:64` | Host descarta a mensagem `rendered` | ✅ Killed (SF-03) |

Regressão no diff:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| N1b | `src/ui/dashboard.ts:64` | Gancho do painel grava só a primeira lista | ✅ Killed (SF-03) |
| N7 | `src/ui/statusBar.ts:36` | Gancho da barra guarda o primeiro texto | ✅ Killed (SF-03) |
| H3 | `src/ui/store.ts:119` | Aviso repete a cada refresh | ✅ Killed (SF-09) |
| H4 | `package.json:26` | Remove `onStartupFinished` | ✅ Killed (SF-06) |
| H7 | `package.json:220` | Escopo `resource` → `window` | ✅ Killed (SF-01, multi-root) |
| H12 | `src/ui/store.ts:129` | Configuração lida sem a pasta do workspace | ✅ Killed (multi-root) |
| H16 | `src/ui/store.ts:49` | Watchers ignoram remoção de arquivo | ✅ Killed (SF-04) |
| C1 a C13 | `src/core/folders.ts:22-71` | As 13 mutações do núcleo | ✅ Killed (13/13) |

Sondas fora do diff (não contam no placar):

| Probe | File:line | Description | Killed? |
| ----- | --------- | ----------- | ------- |
| P1 | `src/ui/statusBar.ts:18` | Barra de status deixa de seguir o store | ✅ Killed |
| P2 | `src/ui/dashboard.ts:23` | Painel deixa de receber o estado quando o store muda | ✅ Killed |
| N3 | `src/ui/statusBar.ts:31` | Texto do item congela depois da primeira atualização | ✅ Killed |
| M3 | `src/ui/store.ts:88` | Store mantém os projetos antigos quando nada casa | ✅ Killed |
| R2 | `src/webview/main.ts:27` | Webview não aplica os projetos novos | ✅ Killed |
| D1 | `src/ui/diagnostics.ts:23` | Diagnósticos não são limpos antes de atualizar | ✅ Killed |
| R1 | `src/webview/main.ts:30` | Webview pula `render()` e confirma mesmo assim | ❌ Survived. Resíduo fora do diff, ver Follow-up 1 |
| N5 | `src/ui/statusBar.ts:35` | Item da barra nunca é mostrado | ❌ Survived. Limite da API |
| N5b | `src/ui/statusBar.ts:24` | Item da barra nunca é escondido | ❌ Survived. Limite da API |

**Sensor depth**: P0-full manual (27 mutações no diff: 9 do host novo, 5 de amostra do host, 13 do núcleo)
**Result**: 27/27 killed - PASS ✅

### Iteração 2 (HEAD 50b67ff), histórico

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H7 | `package.json:220` | Escopo `resource` → `window` | ✅ Killed |
| H12 | `src/ui/store.ts:129` | Configuração lida sem a pasta do workspace | ✅ Killed |
| H16 | `src/ui/store.ts:49` | Watchers ignoram remoção de arquivo | ✅ Killed |
| P1 | `src/ui/statusBar.ts:18` | Sonda: barra de status deixa de seguir o store | ✅ Killed |
| P2 | `src/ui/dashboard.ts:23` | Sonda: painel deixa de receber o estado | ✅ Killed |
| N1 | `src/ui/dashboard.ts:86` | Gancho do painel grava só o primeiro estado | ✅ Killed |
| N2 | `src/ui/dashboard.ts:87` | Estado gravado no gancho e nunca enviado | ❌ Survived (fechado na iteração 3) |
| N8 | `src/ui/dashboard.ts:87` | Estado enviado ao painel sem projetos | ❌ Survived (fechado na iteração 3) |
| N7 | `src/ui/statusBar.ts:36` | Gancho da barra guarda o primeiro texto | ✅ Killed |
| N4 | `src/ui/statusBar.ts:25` | Gancho da barra não é limpo quando o item some | ❌ Survived (fechado na iteração 3) |
| N6 | `src/ui/dashboard.ts:38` | Gancho do painel não é zerado num painel novo | ❌ Survived (fechado na iteração 3) |
| N3 | `src/ui/statusBar.ts:31` | Sonda: texto do item congela | ✅ Killed |
| N5 | `src/ui/statusBar.ts:35` | Sonda: item da barra nunca é mostrado | ❌ Survived (limite da API) |
| C1 a C13 | `src/core/folders.ts:22-71` | As 13 mutações do núcleo | ✅ Killed |
| H1 a H6, H8 a H11, H13 a H15 | `src/ui/store.ts`, `package.json` | Conjunto do host da iteração 1 | ✅ Killed (13/13) |

Placar da iteração 2: 31 de 35 mortas no diff.

### Iteração 1 (HEAD a5516e7), histórico

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/folders.ts:41` | Remove a checagem de `..` | ✅ Killed |
| C2 | `src/core/folders.ts:57` | Remove a regra do artefato | ✅ Killed |
| C3 | `src/core/folders.ts:56` | Remove a exceção da `.specs` | ✅ Killed |
| C4 | `src/core/folders.ts:30` | Quebra a deduplicação das entradas | ✅ Killed |
| C5 | `src/core/folders.ts:71` | Rótulo nunca leva a pasta | ✅ Killed |
| C6 | `src/core/folders.ts:70` | Rótulo sempre leva a pasta | ✅ Killed |
| C7 | `src/core/folders.ts:32` | Remove o fallback da lista vazia | ✅ Killed |
| C8 | `src/core/folders.ts:39` | Remove a checagem de glob | ✅ Killed |
| C9 | `src/core/folders.ts:38` | Remove a troca de `\` por `/` | ✅ Killed |
| C10 | `src/core/folders.ts:61` | Entrada menos específica nomeia o projeto | ✅ Killed |
| C11 | `src/core/folders.ts:39` | Remove a checagem de caminho absoluto posix | ✅ Killed |
| C12 | `src/core/folders.ts:22` | Regra do artefato aceita qualquer profundidade | ✅ Killed |
| C13 | `src/core/folders.ts:69` | Rótulo ignora o caminho do projeto aninhado | ✅ Killed |
| H1 | `src/ui/store.ts:36` | Mudança de configuração não recria os watchers | ✅ Killed |
| H2 | `src/ui/store.ts:117` | Aviso nunca é mostrado | ✅ Killed |
| H3 | `src/ui/store.ts:119` | Aviso repete a cada refresh | ✅ Killed |
| H4 | `package.json:26` | Remove `onStartupFinished` | ✅ Killed |
| H5 | `src/ui/store.ts:141` | Descoberta ignora as entradas configuradas | ✅ Killed |
| H6 | `src/ui/store.ts:148` | Store rotula só com o nome da pasta | ✅ Killed |
| H7 | `package.json:220` | Escopo `resource` → `window` | ❌ Survived (fechado na iteração 2) |
| H8 | `package.json:217` | Padrão `.specs` → `specs` | ✅ Killed |
| H9 | `src/ui/store.ts:48` | Watchers observam sempre `.specs` | ✅ Killed |
| H10 | `src/ui/store.ts:36` | Mudança de configuração não recarrega nada | ✅ Killed |
| H11 | `src/ui/store.ts:135` | Busca do host perde a exceção da `.specs` | ✅ Killed |
| H12 | `src/ui/store.ts:129` | Configuração lida sem a pasta do workspace | ❌ Survived (fechado na iteração 2) |
| H13 | `src/ui/store.ts:49` | Watchers ignoram criação | ✅ Killed |
| H14 | `src/ui/store.ts:102` | Entradas inválidas não chegam ao aviso | ✅ Killed |
| H15 | `src/ui/store.ts:49` | Watchers ignoram alteração | ✅ Killed |
| H16 | `src/ui/store.ts:49` | Watchers ignoram remoção | ❌ Survived (fechado na iteração 2) |
| P1 | `src/ui/statusBar.ts:16` | Sonda: barra de status deixa de seguir o store | ❌ Survived (fechado na iteração 2) |
| P2 | `src/ui/dashboard.ts:21` | Sonda: painel deixa de receber o estado | ❌ Survived (fechado na iteração 2) |

Placar da iteração 1: 26 de 29 mortas no diff.

**Isolamento (iteração 3)**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor. Junction removida com `rmdir` sem recursão; `node_modules` real com 131 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 0ef11e1.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. A feature tem interface, então o UAT fica para o orquestrador.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ A iteração 3 soma 1 linha na webview, 1 tipo no protocolo e 1 `case` no host |
| Surgical changes | ✅ O espelho `posted` saiu junto com a gravação em `postState` |
| No scope creep | ✅ |
| Matches patterns | ✅ `rendered` segue o formato das mensagens `ready` e `error` |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core 1:1 com os ACs. Host com caminho feliz, borda (lista vazia, entrada sem resultado, multi-root) e erro (entrada inválida) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (50b67ff..0ef11e1)**: só `test/integration/suite.cjs` mudou, com 11 inserções e 5 remoções. As 5 remoções são a espera do primeiro estado, reescrita com outra mensagem, e o `deepEqual` do painel, trocado por uma espera com igualdade exata dos mesmos ids. A troca é necessária porque a confirmação chega de forma assíncrona. Nenhuma asserção ficou mais fraca. `test/unit/` e as fixtures não mudaram.

---

## Edge Cases

- [x] Lista vazia usa `.specs` (SF-08): `test/integration/suite.cjs:556`, `test/unit/folders.test.ts:6`
- [x] Entrada absoluta, com `..` ou com glob é ignorada com aviso que a nomeia (SF-09): `test/integration/suite.cjs:532-535`, `test/unit/folders.test.ts:12`
- [x] Duas entradas para a mesma pasta mostram a pasta uma vez (SF-10): `test/integration/suite.cjs:518`, `test/unit/folders.test.ts:62`
- [x] `\` e `/` final normalizam para o mesmo caminho (SF-11): `test/unit/folders.test.ts:20-22`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 37 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 34/34 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0), três aberturas de VS Code real
- **Test count before feature**: 25 unit + 24 integration (contados em de01d0d)
- **Test count after feature**: 37 unit + 36 integration
- **Delta**: +12 unit, +12 integration
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

Nenhum gap bloqueia a entrega. Ficam um follow-up opcional e um limite aceito.

### Follow-up 1 (não bloqueia): confirmar o painel a partir do DOM (R1)

- **Root cause**: `src/webview/main.ts:31` monta a confirmação com a variável `projects`, não com o que está no DOM. A chamada `render()` em `:30` pode sumir sem que nenhum teste perceba.
- **Por que não bloqueia**: a linha `:30` é anterior à feature e `renderApp` tem testes em `test/unit/webview.test.ts`. O requisito SF-03 pede que a troca de configuração chegue ao painel, e isso está provado.
- **Fix task**: montar a lista a partir dos elementos desenhados, por exemplo os `data-pid` dos cartões de feature (`src/webview/render.ts:241`), sem repetir ids. Um projeto sem features precisa de um marcador próprio no DOM para entrar na lista.
- **Done when**: R1 morre.
- **Priority**: Minor

### Limite aceito: visibilidade do item da barra de status (N5, N5b)

A API do VS Code não informa se um item da barra de status está visível. `item.show()` e `item.hide()` em `src/ui/statusBar.ts:35` e `:24` são anteriores à feature. O texto do item está provado. Sem fix task.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SF-01 | Implementing | ✅ Verified |
| SF-02 | Implementing | ✅ Verified |
| SF-03 | Implementing | ✅ Verified |
| SF-04 | Implementing | ✅ Verified |
| SF-05 | Implementing | ✅ Verified |
| SF-06 | Implementing | ✅ Verified |
| SF-07 | Implementing | ✅ Verified |
| SF-08 | Implementing | ✅ Verified |
| SF-09 | Implementing | ✅ Verified |
| SF-10 | Implementing | ✅ Verified |
| SF-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: 27/27 mutações do diff mortas. Sondas fora do diff: 6 mortas, 3 vivas (R1, N5, N5b)
**Gate**: typecheck ok, 37 unit, 34 + 1 + 1 integration, 0 falhas

**What works**: descoberta por entrada em qualquer profundidade, regra do artefato, exceção da `.specs`, configuração por pasta do workspace em multi-root, recarga das quatro superfícies na troca de configuração, esvaziamento das quatro superfícies quando nada casa, watchers por entrada com criar, alterar e remover, aviso único por entrada inválida, rótulos por projeto e pasta, fallback da lista vazia, ativação ao iniciar.

**Issues found**: nenhum gap bloqueante. R1 fica como follow-up opcional. N5 e N5b ficam como limite da API.

**Next steps**: UAT interativo com o usuário e atualização dos status em `spec.md`.
