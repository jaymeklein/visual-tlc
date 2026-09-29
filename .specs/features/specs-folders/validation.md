# Specs Folders Validation

## Validation: specs-folders - FAIL ❌

Os três gaps da iteração 1 fecharam: H7, H12 e H16 morrem, e a barra de status do SF-03 está provada. Resta um gap: o SF-03 prova o painel num espelho gravado antes do envio. O teste passa mesmo quando o painel não recebe nenhum estado (N2) ou recebe um estado vazio (N8). Todos os gates passam e não há defeito de implementação conhecido.

**Date**: 2026-09-29
**Spec**: `.specs/features/specs-folders/spec.md`
**Diff range**: de01d0d..50b67ff (iteração 2: a5516e7..50b67ff, branch `feat/specs-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | a5516e7 | Reprovada: 3 mutantes vivos, 1 gap de AC, 1 gap de precisão | H7 e H12 (configuração por pasta do workspace sem teste), H16 (remoção de arquivo sem teste), SF-03 sem painel nem barra de status. Lições L-003 a L-006 |
| 2 | 50b67ff | Reprovada: 1 gap de AC, 2 mutantes de produto vivos | T9 fecha H7 e H12. T11 fecha H16 e a precisão do SF-04. T10 fecha a barra de status e fecha o painel só até o espelho `posted`: N2 e N8 sobrevivem |

Nota do Verifier: o Fix 3 da iteração 1 pedia "os ids de projeto do último `state` enviado ao painel". O autor entregou o que o texto pedia. O texto permitia um espelho gravado ao lado do envio, e foi isso que o sensor derrubou. O Fix 1 abaixo corrige o pedido.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Normalizar e validar as entradas | ✅ Done | dfdfd35 |
| T2 Achar as raízes de specs | ✅ Done | 06200dc |
| T3 Rotular as raízes | ✅ Done | 9bc10f3 |
| T4 Descobrir e observar as pastas configuradas | ✅ Done | 5bb4d65. O escopo `resource` agora tem teste (T9) |
| T5 Avisar sobre entrada inválida | ✅ Done | 7529957 |
| T6 Rotular os grupos na árvore | ✅ Done | dea7ca9 |
| T7 Ativar ao iniciar | ✅ Done | e592583 |
| T8 Documentar a configuração | ✅ Done | a5516e7 |
| T9 Provar a configuração por pasta do workspace | ✅ Done | 070fd79. H7 e H12 morrem |
| T10 Provar painel e barra de status no SF-03 | ⚠️ Partial | 3577fec. Barra de status provada. Painel provado só até o espelho (N2, N8) |
| T11 Provar alteração e remoção de arquivo no SF-04 | ✅ Done | 50b67ff. H16 morre |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SF-01 A extensão oferece `tlcSpecs.specsFolders` | lista de caminhos relativos, padrão `[".specs"]`, escopo `resource` (decisão confirmada) | `test/integration/suite.cjs:417` - `assert.deepEqual(setting.defaultValue, ['.specs'])`. `:419` - `assert.equal(declared.scope, 'resource')`. `:420` - `get('specsFolders')` igual a `['.specs']`. Comportamento por pasta: `test/integration/multiroot.cjs:11-14` - `deepEqual(roots, ['a/docs/specs', 'b/.specs'])` | ✅ PASS |
| SF-02 WHEN a configuração lista pastas THEN cada pasta que corresponda a qualquer entrada vira projeto, em qualquer profundidade | projetos `docs/specs` e `packages/api/docs/specs` com `["docs/specs"]`; com duas entradas, as pastas das duas; em multi-root, cada pasta usa a sua lista | `test/integration/suite.cjs:428` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` (igualdade exata, `:409`). `:429-430` - features `['custom-one']` e `['nested-one']`. `:433` - três raízes com duas entradas. `test/integration/multiroot.cjs:11-14` e `:15-18` - features `[['a-custom'], ['b-default']]`. A fixture guarda `.specs` e `docs/specs` nas duas pastas, então o teste só passa se cada pasta ler a própria lista. Unit: `test/unit/folders.test.ts:31-34` e `:39-42` | ✅ PASS |
| SF-03 WHEN a configuração muda THEN recarrega árvores, painel, barra de status e diagnósticos sem recarregar a janela | as 4 superfícies refletem a nova lista na mesma janela | **Árvores:** `test/integration/suite.cjs:449` - `assert.ok(fired > 0)`. `:456` - `['root','root']`. `:457-460` - features `[['custom-one'], ['nested-one']]`. `:461-464` - árvore Projeto com os ids de `getProjects()`. **Diagnósticos:** `:465-468` - todo diagnóstico `TLC Specs` sob `/docs/specs/`. `:469-471` - "sem SHALL" em `custom-one/spec.md`. **Barra de status:** `:443` - antes, `assert.match(api.statusBarText(), /user-auth/)`. `:454` - depois, `assert.match(api.statusBarText(), /^\$\(tasklist\) (custom-one\|nested-one) · /)`. O gancho lê o texto de volta do item real (`src/ui/statusBar.ts:36`). **Painel:** `:441-442` e `:450-453` - `deepEqual(api.dashboardProjects(), getProjects ids)`. O valor vem de `src/ui/dashboard.ts:86`, gravado antes do envio em `:87`. A asserção passa sem envio (N2) e com envio vazio (N8) | ❌ GAP (painel) |
| SF-04 WHEN um arquivo é criado, alterado ou removido dentro de qualquer pasta configurada THEN atualiza a visão dessa pasta | a visão de `docs/specs` reflete os três eventos | Criar: `test/integration/suite.cjs:484-487` - `deepEqual(featuresOf('docs/specs'), ['custom-one','custom-two'])` e `assert.equal(withoutShall(customTwo()), 1)`. Alterar: `:489-490` - regrava o `spec.md` com SHALL e espera `withoutShall(customTwo()) === 0`. Remover: `:492-494` - apaga a pasta, espera `!customTwo()` e `deepEqual(featuresOf('docs/specs'), ['custom-one'])`. Outra pasta intacta: `:486` | ✅ PASS |
| SF-05 IF pasta de nome diferente de `.specs` casa com a entrada mas não tem artefato THEN é ignorada | `notes/specs` sem artefato fica de fora; `tools/.specs` sem artefato aparece; `notes/specs` aparece depois de ganhar `lessons.json` | `test/integration/suite.cjs:502` - `waitForRoots(['.specs', 'tools/.specs'])`. `:505` - `waitForRoots(['.specs', 'notes/specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:47-52` e `:56-57` | ✅ PASS |
| SF-06 WHEN o workspace abre com pasta configurada de outro nome THEN ativa sem abrir a barra lateral | extensão ativa sem `activate()` e lista as features | `test/integration/startup.cjs:19` - `waitFor(() => ext.isActive)`. `:21-24` - `deepEqual(roots, ['docs/specs'])`. `:25-28` - `deepEqual(features, ['startup-one'])` | ✅ PASS |
| SF-07 WHEN duas pastas de specs são do mesmo projeto THEN a árvore rotula cada grupo com projeto e caminho | `projeto · caminho` (ex.: `api · docs/specs`); com uma pasta, só o projeto | `test/integration/suite.cjs:541` - `deepEqual(groupLabels(), [ws + ' · .specs', ws + ' · docs/specs', ws + '/packages/api', ws + '/tools'])`. `:545` - `[ws, ws + '/packages/api']`. Unit: `test/unit/folders.test.ts:75-78` e `:67-70` | ✅ PASS |
| SF-08 IF a lista está vazia THEN usa `.specs` | `[]` se comporta como `[".specs"]` | `test/integration/suite.cjs:549-550` - `setFolders([])` + `waitForRoots(['.specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:6-7` e `:16` | ✅ PASS |
| SF-09 IF entrada absoluta, com `..` ou com glob THEN ignora e mostra aviso com o nome dela | entrada fora dos projetos; um aviso por entrada, com o texto da entrada | `test/integration/suite.cjs:524` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])`. `:526-527` - um aviso com `"../fora"` e um com `"docs/*"`. `:529` - `assert.equal(shown.length, 2)` depois de `refresh()`. Unit: `test/unit/folders.test.ts:11-12` | ✅ PASS |
| SF-10 WHEN duas entradas levam à mesma pasta THEN aparece uma vez | um projeto por pasta | `test/integration/suite.cjs:510` - `waitForRoots` com `['docs/specs', 'docs\\specs\\', 'specs']`. `:512` - `deepEqual(ids, [...new Set(ids)])`. Unit: `test/unit/folders.test.ts:26` e `:62` | ✅ PASS |
| SF-11 WHEN a entrada usa `\` ou termina com `/` THEN é o mesmo caminho normalizado | `docs\specs`, `docs/specs/` e `docs\specs\` viram `docs/specs` | `test/unit/folders.test.ts:20-22`. Host: `test/integration/suite.cjs:509-510` | ✅ PASS |

**Status**: ❌ Gaps present. 10 de 11 requisitos batem com o resultado da spec. SF-03 prova 3 de 4 superfícies. Nenhum gap de precisão: o SF-04 agora nomeia os três eventos.

### Julgamento das asserções novas

- **SF-01 escopo** (`suite.cjs:419`): lê o manifesto. Sozinha seria rasa, mas a suíte multi-root prova o comportamento. Juntas matam H7 por dois caminhos.
- **SF-02 multi-root** (`multiroot.cjs:11-18`): forte. A fixture tem as duas pastas de specs em `a` e em `b`, então qualquer leitura global dá `a/.specs` e falha.
- **SF-03 barra de status** (`suite.cjs:443`, `:454`): boa. O espelho copia `this.item.text` depois da atribuição, então prova o texto do item real. Limite aceito: a API do VS Code não informa se o item está visível, e `item.show()` fica sem prova (N5).
- **SF-03 painel** (`suite.cjs:450-453`): rasa. Prova que o host calculou o estado novo, não que o painel o recebeu.
- **SF-04** (`suite.cjs:489-494`): forte. A alteração é vista pelo conteúdo relido (aviso some), não só pela presença do arquivo.

---

## Discrimination Sensor

Scratch nas duas iterações: `git worktree add --detach <scratchpad>/wt HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`.

### Iteração 2 (HEAD 50b67ff)

Sobreviventes e sondas da iteração 1, reinjetados:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H7 | `package.json:220` | Escopo `resource` → `window` | ✅ Killed (SF-01 `'window' !== 'resource'` e multi-root `a/.specs`) |
| H12 | `src/ui/store.ts:129` | Configuração lida sem a pasta do workspace | ✅ Killed (multi-root: `a/.specs` no lugar de `a/docs/specs`) |
| H16 | `src/ui/store.ts:49` | Watchers ignoram remoção de arquivo | ✅ Killed (SF-04) |
| P1 | `src/ui/statusBar.ts:18` | Barra de status deixa de seguir o store | ✅ Killed (SF-03) |
| P2 | `src/ui/dashboard.ts:23` | Painel deixa de receber o estado quando o store muda | ✅ Killed (SF-03) |

Mutações novas contra o código da iteração 2:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| N1 | `src/ui/dashboard.ts:86` | Gancho do painel grava só o primeiro estado | ✅ Killed (SF-03) |
| N2 | `src/ui/dashboard.ts:87` | Estado é gravado no gancho e nunca enviado ao painel | ❌ Survived → Fix 1 |
| N8 | `src/ui/dashboard.ts:87` | Estado enviado ao painel sem projetos (`projects: []`) | ❌ Survived → Fix 1 |
| N7 | `src/ui/statusBar.ts:36` | Gancho da barra guarda o primeiro texto | ✅ Killed (SF-03) |
| N4 | `src/ui/statusBar.ts:25` | Gancho da barra não é limpo quando o item some | ❌ Survived → Fix 2 (só instrumentação, produto igual) |
| N6 | `src/ui/dashboard.ts:38` | Gancho do painel não é zerado num painel novo | ❌ Survived → Fix 1 (só instrumentação, produto igual) |

Sondas fora do diff (não contam no placar):

| Probe | File:line | Description | Killed? |
| ----- | --------- | ----------- | ------- |
| N3 | `src/ui/statusBar.ts:31` | Texto do item congela depois da primeira atualização | ✅ Killed (SF-03) |
| N5 | `src/ui/statusBar.ts:35` | Item da barra nunca é mostrado | ❌ Survived. Limite da API: a visibilidade não pode ser lida |

Regressão, conjunto completo da iteração 1 reexecutado em 50b67ff:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 a C13 | `src/core/folders.ts:22-71` | As 13 mutações do núcleo | ✅ Killed (13/13) |
| H1 | `src/ui/store.ts:36` | Mudança de configuração não recria os watchers | ✅ Killed |
| H2 | `src/ui/store.ts:117` | Aviso nunca é mostrado | ✅ Killed |
| H3 | `src/ui/store.ts:119` | Aviso repete a cada refresh | ✅ Killed |
| H4 | `package.json:26` | Remove `onStartupFinished` | ✅ Killed |
| H5 | `src/ui/store.ts:141` | Descoberta ignora as entradas configuradas | ✅ Killed |
| H6 | `src/ui/store.ts:148` | Store rotula só com o nome da pasta | ✅ Killed |
| H8 | `package.json:217` | Padrão `.specs` → `specs` | ✅ Killed |
| H9 | `src/ui/store.ts:48` | Watchers observam sempre `.specs` | ✅ Killed |
| H10 | `src/ui/store.ts:36` | Mudança de configuração não recarrega nada | ✅ Killed |
| H11 | `src/ui/store.ts:135` | Busca do host perde a exceção da `.specs` | ✅ Killed |
| H13 | `src/ui/store.ts:49` | Watchers ignoram criação | ✅ Killed |
| H14 | `src/ui/store.ts:102` | Entradas inválidas não chegam ao aviso | ✅ Killed |
| H15 | `src/ui/store.ts:49` | Watchers ignoram alteração | ✅ Killed (agora também pelo SF-04) |

**Sensor depth**: P0-full manual (35 mutações no diff: 13 núcleo, 16 host, 6 novas)
**Result**: 31/35 killed - FAIL ❌

Dos 4 sobreviventes, 2 mudam o produto (N2, N8) e sustentam o veredito. Os outros 2 (N4, N6) só mudam a instrumentação de teste.

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

Placar da iteração 1: 26/29 mortas no diff.

**Isolamento (iteração 2)**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor. Junction removida com `rmdir` sem recursão; `node_modules` real com 131 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 50b67ff.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. A feature tem interface, então o UAT fica para o orquestrador depois que o gap fechar.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ A iteração 2 soma 18 linhas em `src/`, todas ganchos de teste |
| Surgical changes | ✅ `src/extension.ts`, `src/ui/dashboard.ts` e `src/ui/statusBar.ts` só ganham os ganchos |
| No scope creep | ✅ |
| Matches patterns | ✅ Os ganchos seguem o precedente de `dashboardHealth` |
| Spec-anchored outcome check (asserted values match spec) | ⚠️ SF-03: o painel é provado num valor intermediário |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Host sem prova de entrega do estado ao painel |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (a5516e7..50b67ff)**: `test/integration/suite.cjs` tem 27 inserções e 2 remoções. As 2 remoções são os títulos dos testes SF-03 e SF-04, trocados por títulos mais completos. Nenhuma asserção saiu nem ficou mais fraca. `test/integration/run.mjs` ganhou a terceira execução e o campo `open`. `test/unit/` não mudou.

---

## Edge Cases

- [x] Lista vazia usa `.specs` (SF-08): `test/integration/suite.cjs:550`, `test/unit/folders.test.ts:6`
- [x] Entrada absoluta, com `..` ou com glob é ignorada com aviso que a nomeia (SF-09): `test/integration/suite.cjs:526-529`, `test/unit/folders.test.ts:12`
- [x] Duas entradas para a mesma pasta mostram a pasta uma vez (SF-10): `test/integration/suite.cjs:512`, `test/unit/folders.test.ts:62`
- [x] `\` e `/` final normalizam para o mesmo caminho (SF-11): `test/unit/folders.test.ts:20-22`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 37 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 34/34 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0), três aberturas de VS Code real
- **Test count before feature**: 25 unit + 24 integration (contados em de01d0d)
- **Test count after feature**: 37 unit + 36 integration
- **Delta**: +12 unit, +12 integration (+1 nesta iteração)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

### Fix 1: SF-03 prova o painel num espelho, não na entrega (N2, N8, N6)

- **Root cause**: `Dashboard.postState` grava `this.posted` em `src/ui/dashboard.ts:86`, uma linha antes de chamar `this.post` em `:87`. O teste lê o espelho. O envio pode sumir ou levar outro conteúdo sem que o teste perceba.
- **Fix task**: fazer o webview confirmar o que desenhou.
  - `src/core/protocol.ts`: acrescentar `{ type: 'rendered'; projects: string[] }` a `FromWebview`.
  - `src/webview/main.ts:26-31`: depois de `render()` no ramo `state`, enviar `{ type: 'rendered', projects: projects.map((p) => p.id) }`.
  - `src/ui/dashboard.ts`: gravar o gancho no `case 'rendered'` de `onMessage` e tirar a gravação de `postState`.
  - `test/integration/suite.cjs:450-453`: esperar com `waitFor` até `api.dashboardProjects()` ser igual aos ids de `getProjects()`, porque a confirmação chega de forma assíncrona.
- **Alternativa mínima**: gravar o gancho dentro de `post`, a partir da mensagem passada a `postMessage` e só quando a promessa resolver `true`. Mata N2 e N8, mas prova a entrega, não o desenho.
- **Done when**: N2 e N8 morrem. P2 e N1 continuam mortos.
- **Priority**: Major

### Fix 2: Estado oculto da barra de status sem prova (N4)

- **Root cause**: nenhum teste leva a extensão a um estado sem projeto, então o ramo que esconde o item (`src/ui/statusBar.ts:23-27`) não é exercitado.
- **Fix task**: no teste SF-03, trocar a configuração para uma entrada que não casa com nada (por exemplo `['nada/aqui']`), esperar `waitForRoots([])` e verificar `api.statusBarText() === undefined`.
- **Done when**: N4 morre.
- **Priority**: Minor

### Limite aceito: visibilidade do item da barra (N5)

A API do VS Code não informa se um item da barra de status está visível. `item.show()` em `src/ui/statusBar.ts:35` é código anterior à feature. Fica registrado como limite, sem fix task.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SF-01 | Implementing | ✅ Verified |
| SF-02 | Implementing | ✅ Verified |
| SF-03 | Implementing | ❌ Needs Fix (Fix 1) |
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

**Overall**: ❌ Not Ready

**Spec-anchored check**: 10/11 requisitos batem com a spec. 1 gap (SF-03, painel). 0 gaps de precisão
**Sensor**: 31/35 mutações mortas. Sobreviventes de produto: N2, N8. Sobreviventes de instrumentação: N4, N6
**Gate**: typecheck ok, 37 unit, 34 + 1 + 1 integration, 0 falhas

**What works**: tudo o que a iteração 1 já provava, mais a configuração por pasta do workspace em multi-root, os três eventos de arquivo do SF-04 e a barra de status do SF-03. Os 5 mutantes e sondas que sobreviveram na iteração 1 agora morrem.

**Issues found**:

1. SF-03 prova o painel num espelho gravado antes do envio (N2 e N8 em `src/ui/dashboard.ts:87`). Correção: Fix 1.
2. Estado oculto da barra de status sem prova (N4 em `src/ui/statusBar.ts:25`). Correção: Fix 2.

**Next steps**: encaminhar Fix 1 e Fix 2 a um implementador e validar de novo (iteração 3 de 3, a última antes de escalar ao usuário).
