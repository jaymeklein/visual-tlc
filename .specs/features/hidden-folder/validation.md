# Hidden Folder Validation

## Validation: hidden-folder - PASS ✅

Aprovada na iteração 3. O Fix 2 fez o que o relatório pediu. O teste novo (`test/integration/suite.cjs:1425-1456`) usa duas pastas com specs: `.specs`, com tudo oculto, e `side/.specs`, com uma spec aberta à vista. Com o olho fechado, a raiz tem só `side/.specs` (`:1440`), com "1 feature(s)" (`:1441`). Com o olho aberto, a raiz tem as duas (`:1445`): `.specs` com "N feature(s) · oculta" e `side/.specs` com "1 feature(s)" (`:1446-1449`). M8 morre em `:1440`. M10, que aplica a mesma regra global ao sufixo e que a iteração 2 não rodou, morre em `:1446`. M6 continua morto em `:708`. O gate em 56d5bab passa: typecheck ok, 68 unit e 68 + 1 + 1 de integração. O código não mudou desde fc47aec.

**Date**: 2026-09-30
**Spec**: `.specs/features/hidden-folder/spec.md`
**Diff range**: `35a9118..56d5bab` (branch `feat/hidden-specs`): spec em c440a87, implementação e testes em fc47aec, README em b50c9d7, validação da iteração 1 em 2c26515, Fix 1 em 21d91d4, validação da iteração 2 em e656890, Fix 2 em 56d5bab. Linhas citadas em 56d5bab, salvo onde diz outro commit
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b50c9d7 | Reprovada | 8/8 requisitos com evidência que bate com a spec. 0 gaps de precisão. 6/7 mortas. Viva: M6 (Fix 1). 6 execuções do VS Code |
| 2 | 21d91d4 | Reprovada | Fix 1 conferido: só teste, como prescrito, e mata M6 em `suite.cjs:708`. 0 gaps de precisão. 2/3 mortas (M6, M9). Viva: M8, a regra global no lugar da regra por pasta (Fix 2). 4 execuções do VS Code |
| 3 | 56d5bab | Aprovada | Fix 2 conferido: só teste, com uma pasta própria (`side/.specs`), que a prescrição permitia. 0 gaps de precisão. 3/3 mortas: M8 em `suite.cjs:1440`, M10 em `:1446` e M6 em `:708`. 3 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `design.md` nem `tasks.md`. As tasks ficam implícitas nos commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Regra da pasta na árvore Features | ✅ Done | fc47aec. `src/ui/featuresTree.ts:101-104` (`allHidden`), `:110` (filtro da raiz), `:161` (descrição com "· oculta") |
| Testes | ✅ Done | fc47aec. `test/integration/suite.cjs:638-697` (3 testes) e `:1404-1423` (HFD-08). O teste do SFP-10/HID-16 saiu no mesmo commit |
| Notas nas specs substituídas | ✅ Done | fc47aec. `.specs/features/specs-folder-paths/spec.md:89`, `.specs/features/hidden-specs/spec.md:105-106` |
| README | ✅ Done | b50c9d7. `README.md:12`, `:86` |
| Fix 1: pasta à vista por uma concluída mantida à vista | ✅ Done | 21d91d4. `test/integration/suite.cjs:699-719`. Nenhum código mudou |
| Fix 2: regra por pasta com duas pastas com specs | ✅ Done | 56d5bab. `test/integration/suite.cjs:1425-1456`. `idOf` e `setHiddenIn` subiram do HFD-08 para o módulo (`:1401-1402`), sem mudança. Nenhum código mudou. O commit também voltou o HFD-01 para Implementing em `spec.md:74` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| HFD-01 WHILE o olho de Features está fechado, a árvore deixa fora toda pasta com ao menos uma spec e todas ocultas | a raiz não tem o nó da pasta; a pasta com spec à vista fica | `test/integration/suite.cjs:643-644` - oculta as abertas (as concluídas já são ocultas), `deepEqual(api.featuresTree.getChildren(), [])`. `:706-709` - com uma concluída mantida à vista pelo olho, `deepEqual(getChildren().map((n) => n.kind), ['root'])` e `deepEqual(treeNames(), ['billing-invoices'])`. Duas pastas com specs (Fix 2): `:1434` - `deepEqual(featuresOf('side/.specs'), ['side-one'])`. `:1437` oculta as abertas de `.specs`. `:1440` - `deepEqual(closed.map((n) => n.loaded.project.id), [sideId])`. Pasta ao lado sem spec: `:1416` - `[idOf('bare/.specs')]` | ✅ PASS (nota 1) |
| HFD-02 WHEN o usuário oculta pelo olho da linha a última spec à vista THEN a árvore tira o nó da pasta | raiz vazia depois do olho da linha | `suite.cjs:667` - precondição `treeNames()` = `['csv-export']`. `:668` - `executeCommand('tlcSpecs.hideFeature', await featureNode(last))`, o comando do olho inline com o nó. `:669` - `deepEqual(api.featuresTree.getChildren(), [])` | ✅ PASS |
| HFD-03 WHEN o usuário desoculta pelo card uma spec de uma pasta fora da árvore THEN o nó volta, com essa spec dentro | raiz `['root']`, filhos só com a spec desocultada | `suite.cjs:671` - `setHidden(api.dashboardMessage, last, false)`, a mensagem do card no host. `:673` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:674` - filhos `[last]` | ✅ PASS (nota 3) |
| HFD-04 WHILE olho fechado e nenhuma pasta com spec à vista, lista vazia com "T feature(s) · D concluída(s) · H oculta(s)", sem boas-vindas | `[]`; mensagem com H = T; sem tela de boas-vindas | `suite.cjs:644` - `[]`. `:645` - `` equal(api.featuresViewMessage(), `${features.length} feature(s) · ${done} concluída(s) · ${features.length} oculta(s)`) ``. `:647-650` - `viewsWelcome` de Features só com `!tlcSpecs.hasSpecs` | ✅ PASS (nota 4) |
| HFD-05 WHILE olho aberto, a pasta com todas as specs ocultas tem "N feature(s) · oculta", N o total | nó presente, descrição exata | `suite.cjs:687` - `showHidden`. `:689` - oculta as abertas. `:690` - `deepEqual(...getChildren().map((n) => n.kind), ['root'])`. `:691` - `` equal(folderRow().description, `${base} · oculta`) ``, com `base` = `` `${features.length} feature(s)` `` (`:684`). Com outra pasta à vista (Fix 2): `:1443` - `showHidden`. `:1445` - `deepEqual(shown.map((n) => n.loaded.project.id), [specsId, sideId])`. `:1446-1449` - `` deepEqual(shown.map((n) => getTreeItem(n).description), [`${total} feature(s) · oculta`, '1 feature(s)']) ``, com `total` o número de specs de `.specs` (`:1435`) | ✅ PASS (nota 1) |
| HFD-06 WHILE a pasta tem ao menos uma spec à vista, "N feature(s)" sem "· oculta", olho aberto ou fechado | descrição exata, sem o sufixo, nos dois estados do olho | Spec aberta à vista: `suite.cjs:686` (olho fechado), `:688` (aberto), `:696` (fechado de novo), todas `equal(folderRow().description, base)`. Só uma concluída mantida à vista (Fix 1): `:710` - olho fechado, `equal(folderRow().description, base)`. `:711-712` - `showHidden`, depois a mesma descrição. Ao lado de uma pasta toda oculta (Fix 2): `:1441` - olho fechado, `equal(getTreeItem(closed[0]).description, '1 feature(s)')`. `:1446-1449` - olho aberto, o segundo item é `'1 feature(s)'` | ✅ PASS (notas 1 e 2) |
| HFD-07 WHILE todas as specs de uma pasta estão ocultas, a árvore Projeto mostra o nó, com Handoff, decisões e lições | raiz `['root']` com as três seções | `suite.cjs:651-652` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:653-654` - `ok(sections.includes(kind))` para `handoff`, `decisions`, `lessons`, com tudo oculto | ✅ PASS |
| HFD-08 IF uma pasta de specs não tem spec THEN Features mostra o nó com "0 feature(s)", com o olho fechado | nó presente, descrição exata | `suite.cjs:1412` - `deepEqual(featuresOf('bare/.specs'), [])`. `:1416` - só `bare/.specs` na raiz. `:1417` - `equal(api.featuresTree.getTreeItem(nodes[0]).description, '0 feature(s)')` | ✅ PASS |

**Status**: 8/8 com evidência que bate com a spec. 0 gaps de precisão. A regra por pasta agora tem teste com duas pastas com specs, uma com tudo oculto e outra com spec à vista (nota 1).

### Notas

1. **HFD-01 e as várias pastas (Fix 2, fechado).** O teste novo (`suite.cjs:1425-1456`) escreve `side/.specs/features/side-one/spec.md` (`:1426`), uma spec sem SHALL. Depois configura `['.specs', 'side/.specs']` e espera as duas pastas (`:1430-1431`). `:1434` prova que a pasta ao lado tem a spec. `side-one` não é concluída. Se fosse, ficaria oculta por padrão, e `:1440` falharia no gate. O teste oculta as abertas de `.specs` (`:1436-1437`), e as concluídas já são ocultas. Com o olho fechado, `:1440` afirma a raiz só com `side/.specs`, e `:1441` afirma "1 feature(s)". Com o olho aberto (`:1443`), `:1445` afirma as duas pastas. `:1446-1449` afirma "N feature(s) · oculta" em `.specs` e "1 feature(s)" em `side/.specs`, sem o sufixo (L-021). Com M8, a raiz com o olho fechado tem as duas pastas, e o teste falha em `:1440` (execução 2). Com M10, `.specs` perde o "· oculta", e o teste falha em `:1446` (execução 3). A prescrição sugeria `docs/specs/custom-one`, que ficou dos testes anteriores. O autor escreveu a própria pasta, que o Fix 2 também permitia ("o teste escreve a própria spec"). Assim o teste não depende dos anteriores. O "Done when" foi cumprido: M8 morre numa asserção nova, e o gate fica verde.
2. **HFD-06 e a concluída à vista (Fix 1, fechado).** O teste (`suite.cjs:699-719`) oculta as abertas e deixa `billing-invoices` à vista pelo card (`:707`, EYE-05). `:704` prova que ela é concluída. `:708` e `:709` provam que a pasta fica, só com ela. `:710` e `:712` provam a descrição exata, sem "· oculta", com o olho fechado e aberto. No `finally` (`:713-717`), o teste fecha o olho, oculta `billing-invoices` e desoculta as abertas. Ocultar uma concluída apaga a escolha: `set` grava `undefined` quando `hidden === complete` (`src/core/hidden.ts:61`, EYE-10). `:718` confere a volta. Nas iterações 2 e 3, com M6, o teste falhou em `:708`, e os testes seguintes passaram. Então o `finally` restaura o estado mesmo quando o teste falha.
3. **HFD-03, o card.** O teste manda ao host a mensagem `setHidden` que o card envia (`api.dashboardMessage`, `src/extension.ts:104`), como no HID-11/12. O card que emite essa mensagem já é provado no unit do hidden-specs. Aceito.
4. **HFD-04, a tela de boas-vindas.** Agora a árvore fica vazia de fato, então a tela de boas-vindas depende de duas coisas. A primeira é a chave `tlcSpecs.hasSpecs`, que vale `store.projects.length > 0` (`src/extension.ts:86`), não muda com este feature e nenhum teste lê. A segunda é a regra do VS Code. No VS Code instalado, `shouldShowWelcome` da árvore exige `isTreeEmpty` e `message` vazia (`workbench.desktop.main.js`: `(this.treeView.message===void 0||this.treeView.message==="")`). O `:645` afirma a mensagem cheia, então a tela não aparece nesse estado, qualquer que seja a chave. Com o `when` do manifesto (`:647-650`), isso basta. Aceito, como no HID-16 e no SFP-10.
5. **Gatilhos (L-009).** A spec lista um gatilho para cada ação: o olho da linha para ocultar (HFD-02, `:668`) e o card para desocultar (HFD-03, `:671`). Os dois são exercitados. O Fix 2 usa a mesma mensagem do card (`setHiddenIn`, `:1402`).
6. **Critérios de sucesso.** O segundo foi cumprido. O teste antigo (`35a9118:test/integration/suite.cjs:501-520`) virou o `:638-659`. A mensagem (`:510` → `:645`), o `viewsWelcome` (`:512-515` → `:647-650`) e a volta ao estado inicial (`:519` → `:658`) seguem iguais. Só o nó sem filhos (`:508-509`) virou a raiz vazia (`:644`), e as asserções da árvore Projeto entraram (`:651-654`). O primeiro critério, e o teste independente neste repositório, ficam para o UAT.
7. **Premissas da spec.** Pasta oculta por qualquer regra do EYE-06: as três regras têm teste e mutante morto. A aberta marcada está em `:643-644`. A concluída sem escolha morre com M9 em `:644`, `:669`, `:691` e no HFD-08 (iteração 2). A concluída mantida à vista morre com M6 em `:708`. Pasta sem spec continua com "0 feature(s)": `:1417`. Todas as pastas ocultas: lista vazia, mensagem e sem boas-vindas (`:644-650`). "Com um projeto ou com vários" (`spec.md:32`): com um em `:638-719`, com vários em `:1425-1456` (nota 1) e em `:1404-1423`.
8. **Lições conferidas.** L-002: tudo é afirmado no que o usuário vê, ou seja, nos filhos da raiz, na `description` do `TreeItem` e na mensagem da view. L-009: nota 5. L-014: a flag `allHidden` tem teste esperando verdadeiro (`:644`, `:691`, `:1440`, `:1446`) e falso (`:686`, `:688`, `:708`, `:710`, `:1417`, `:1441`). L-020 é seguida em `:699-719`. L-025 agora é seguida: `:1425-1456` tem dois grupos que pedem resultados opostos ao mesmo tempo, uma pasta que sai e outra que fica. L-021 vale para o "· oculta", ausente na pasta à vista (`:686`, `:688`, `:710`, `:712`, `:1441`, `:1446-1449`). L-006 não se aplica, porque não há watcher. Das candidatas, L-013 vale para a guarda `features.length > 0`, morta por M1 no HFD-08 (iteração 1). L-024 vale para a pasta vazia, a única que fica em `:1416`.
9. **A ordem da raiz no Fix 2.** `:1445` e `:1446-1449` afirmam `.specs` antes de `side/.specs`. O store não guarda a ordem da configuração. Ele ordena as pastas pelo caminho, com `a.specsUri.path.localeCompare(b.specsUri.path)` (`src/ui/store.ts:156`). O `Promise.all` mantém essa ordem (`src/ui/store.ts:104-109`), e o filtro da raiz também (`src/ui/featuresTree.ts:110`). Os dois caminhos começam com `<ws>/`, e `.specs` vem antes de `side/.specs`, porque o ponto vem antes das letras. No Node, `'/c:/tmp/ws/.specs'.localeCompare('/c:/tmp/ws/side/.specs')` dá `-1`. A ordem configurada (`:1430`) é a mesma, então a asserção vale qualquer que seja a regra. Na execução 2, a mensagem de falha de `:1440` mostra a raiz nessa ordem.
10. **O `finally` do Fix 2.** `:1450-1454` fecha o olho (`hideHidden`), desoculta as abertas de `.specs` e roda `setFolders(undefined)`. `:1455` espera `waitForRoots(['.specs'])`. Desocultar uma aberta apaga a escolha (`src/core/hidden.ts:61`). Se o teste falha antes de `open` ser preenchido, o laço não faz nada. É o que o Fix 2 pediu. O teste é o último da suíte. `side/.specs` fica no workspace temporário, como `bare/.specs` do HFD-08. Fora da configuração, o store não lê essa pasta, e cada suíte roda numa cópia nova da fixture, com `--user-data-dir` próprio, apagada no fim (`test/integration/run.mjs:22-36`).

---

## Discrimination Sensor

### Iteração 3 (56d5bab)

Scratch: `git worktree add --detach <scratchpad>/wt3 56d5bab`, com junction de `node_modules` para o real. Cada mutante é uma troca de texto que exige uma ocorrência só, aplicada por script em `src/ui/featuresTree.ts` do scratch e desfeita com `git checkout -- .`. Depois da reversão, o `git status --porcelain` do scratch ficou vazio. Não usei `git stash`. Antes de cada execução, rodei `npm run build` no scratch e conferi o mutante no `dist/extension.cjs`. O log mostra a extensão carregada do scratch nas três suítes.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M8 (de novo) | `src/ui/featuresTree.ts:110` | Regra global no lugar da regra por pasta, igual à iteração 2: filtro `this.show \|\| !this.allHidden(loaded) \|\| this.store.projects.some((p) => p.project.features.some((f) => !this.isHidden(p, f)))`. A pasta com tudo oculto só sai quando nenhuma pasta tem spec à vista | ✅ Killed (`test/integration/suite.cjs:1440`, a raiz com `.specs` e `side/.specs` no lugar de só `side/.specs`. Só esse teste falhou, 67/68. Mutante em `dist/extension.cjs:1636`) |
| M6 (de novo) | `src/ui/featuresTree.ts:103` | Regra da pasta com `f.health === 'complete' \|\| this.isHidden(...)`: toda concluída conta como oculta, mesmo mantida à vista pelo olho | ✅ Killed (`suite.cjs:708`, `[]` no lugar de `['root']`. Mutante em `dist/extension.cjs:1632`) |
| M10 (novo) | `src/ui/featuresTree.ts:161` | A mesma regra global no sufixo: `this.allHidden(node.loaded) && !this.store.projects.some((q) => q.project.features.some((f) => !this.isHidden(q, f)))`. O "· oculta" só aparece quando nenhuma pasta tem spec à vista | ✅ Killed (`suite.cjs:1446`, `'10 feature(s)'` no lugar de `'10 feature(s) · oculta'`. Mutante em `dist/extension.cjs:1684`) |

M6 e M10 rodaram juntos na execução 3, porque os pontos de falha não se cruzam. Sozinho, M6 só falha em `:708` (iteração 2). Ele não muda o teste novo: `side-one` não é concluída, e `.specs` já está toda oculta. M10 só muda a descrição de uma pasta toda oculta quando outra pasta tem spec à vista, e isso só acontece em `:1446`. Com uma pasta só (`:691`), a descrição não muda. No HFD-08, `bare/.specs` não tem spec. Na execução 3 falharam só esses dois testes (66/68), cada um com a assinatura do seu mutante. M8 rodou sozinho, porque com M6 ele mascara `:708`: a regra global deixa a pasta na raiz enquanto `billing-invoices` está à vista, e a falha passaria para `:710`.

**Sensor depth**: lightweight (padrão, sem caminho P0), com 3 mutações no código novo, além das 7 da iteração 1 e das 3 da iteração 2.
**Result**: 3/3 mortas. PASS ✅

**Execuções que abriram o VS Code**: 3 das 4 permitidas. Todas rodaram no desktop oculto, em primeiro plano e uma por vez, no scratch.

| # | Execução | Resultado |
| - | -------- | --------- |
| 1 | Gate, sem mutação | 68/68 + 1/1 + 1/1, exit 0 |
| 2 | M8 | 67/68 + 1/1 + 1/1, exit 1. Falha só em `:1440` |
| 3 | M6 + M10 | 66/68 + 1/1 + 1/1, exit 1. Falhas só em `:708` e `:1446` |

**Isolamento**: o `git status --porcelain` da árvore real estava vazio antes e depois, e o HEAD seguiu em 56d5bab. Tirei a junction com `cmd /c rmdir`, sem recursão, e depois rodei `git worktree remove --force` e `git worktree prune`. O `git worktree list` mostra só a árvore real. O `node_modules` real tinha 129 entradas visíveis antes e depois, e `npm ls --depth=0` deu exit 0.

### Iteração 2 (21d91d4, histórico)

Mesmo método, em `<scratchpad>/wt2` em 21d91d4. Cada mutante rodou sozinho. Linhas desta tabela em 21d91d4. Em 56d5bab, o `:1415` do HFD-08 é o `:1416`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M6 (de novo) | `src/ui/featuresTree.ts:103` | Regra da pasta com `f.health === 'complete' \|\| this.isHidden(...)`: toda concluída conta como oculta, mesmo mantida à vista pelo olho | ✅ Killed (`test/integration/suite.cjs:708`, `[]` no lugar de `['root']`. Só esse teste falhou, 66/67. Mutante em `dist/extension.cjs:1632`) |
| M8 (novo) | `src/ui/featuresTree.ts:110` | Regra global no lugar da regra por pasta: filtro `this.show \|\| !this.allHidden(loaded) \|\| this.store.projects.some((p) => p.project.features.some((f) => !this.isHidden(p, f)))`. A pasta com tudo oculto só sai quando nenhuma pasta tem spec à vista | ❌ Survived → Fix 2 (67/67 + 1/1 + 1/1, exit 0. Mutante em `dist/extension.cjs:1636`). Morto na iteração 3 |
| M9 (novo) | `src/ui/featuresTree.ts:103` | Só a escolha explícita conta: `this.hidden.choiceOf(...) === 'hidden'`, e a concluída oculta por padrão não deixa a pasta oculta | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:691` HFD-05, `:1415` HFD-08. 63/67. Mutante em `dist/extension.cjs:1632`) |

Resultado da iteração 2: 2/3 mortas, M8 viva, reprovada. Execuções: 1 gate (67/67 + 1/1 + 1/1), 2 M6 (66/67, falha só em `:708`), 3 M8 (sobreviveu), 4 M9 (63/67). O sufixo com a mesma regra global ficou sem rodar, por causa do limite de execuções. Na iteração 3 ele é M10.

### Iteração 1 (b50c9d7, histórico)

Mesmo método, em `<scratchpad>/wt` em b50c9d7. Linhas desta tabela em b50c9d7. Em 56d5bab, o `:1393` do HFD-08 é o `:1416`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/ui/featuresTree.ts:103` | `allHidden` sem a guarda `features.length > 0`: a pasta sem spec conta como oculta | ✅ Killed (`test/integration/suite.cjs:1393`, `[]` no lugar de `bare/.specs`) |
| M2 | `src/ui/featuresTree.ts:110` | Filtro da raiz sem `this.show \|\|`: a pasta oculta sai também com o olho aberto | ✅ Killed (`suite.cjs:690`, `[]` no lugar de `['root']`) |
| M3 | `src/ui/featuresTree.ts:103` | `some` no lugar de `every`: basta uma spec oculta para a pasta sair | ✅ Killed (17 testes, 49/66. Entre eles SFP-07/08 em `suite.cjs:442` e HFD-06 em `:686`) |
| M4 | `src/ui/featuresTree.ts:161` | Descrição da raiz sem o sufixo "· oculta" | ✅ Killed (`suite.cjs:691`, `'9 feature(s)'` no lugar de `'9 feature(s) · oculta'`) |
| M5 | `src/ui/featuresTree.ts:161` | Sufixo invertido: "· oculta" na pasta à vista | ✅ Killed (`suite.cjs:686`, `'9 feature(s) · oculta'` no lugar de `'9 feature(s)'`) |
| M6 | `src/ui/featuresTree.ts:103` | Regra da pasta com `f.health === 'complete' \|\| this.isHidden(...)`: toda concluída conta como oculta, mesmo mantida à vista pelo olho | ❌ Survived → Fix 1 (66/66 + 1/1 + 1/1). Morto nas iterações 2 e 3 |
| M7 | `src/ui/featuresTree.ts:110` | Filtro da raiz tirado (`filter(() => true)`), que é o comportamento antigo do SFP-10 | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:1393` HFD-08) |

Resultado da iteração 1: 6/7 mortas, M6 viva. Execuções: 1 gate (66/66), 2 M1 + M4, 3 M7 + M5, 4 M2, 5 M6 (sobreviveu), 6 M3. Não rodei o sufixo condicionado ao olho (`this.show && this.allHidden(...)`), porque é equivalente: com o olho fechado, a pasta oculta não aparece. Também não rodei a chave `tlcSpecs.hasSpecs` (`src/extension.ts:86`), que fica fora do diff e não mostraria a tela de boas-vindas com a mensagem cheia (nota 4).

---

## Interactive UAT Results (if performed)

Não executado, porque o Verifier roda sem usuário. O teste independente da spec (`spec.md:60`) e o primeiro critério de sucesso (`spec.md:91`) rodam neste repositório e ficam para o orquestrador. Com o olho fechado, a árvore Features fica vazia e mostra só a mensagem. Com o olho aberto, aparece o nó `visual-tlc` com "T feature(s) · oculta". Também convém conferir o caso do Fix 1: desocultar uma spec concluída pelo olho, fechar o olho do título e ver a pasta voltar com ela. O caso do Fix 2 pede duas pastas em `tlcSpecs.specsFolders`, uma com tudo oculto e outra com spec à vista. Com o olho fechado, só a segunda fica. Com o olho aberto, as duas aparecem, e só a primeira diz "· oculta".

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Um método de duas linhas (`featuresTree.ts:101-104`), um filtro na raiz (`:110`) e o sufixo na descrição (`:161`). A regra reusa `isHidden` das linhas |
| Surgical changes | ✅ Só `featuresTree.ts`, a suíte, as notas nas specs substituídas e o README. O Fix 1 e o Fix 2 mexem só na suíte, além da linha de status em `spec.md` |
| No scope creep | ✅ A árvore Projeto e o painel não mudaram, como a spec pede (Out of Scope) |
| Matches patterns | ✅ Filtro no mesmo formato de `featureNodes` (`:273`). Os testes dos fixes seguem o formato dos outros HFD e do SFP-05/06 (`try`/`finally`, `setFolders`, `waitForRoots`, `featuresOf`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ Raiz, filhos, descrição e mensagem afirmados com o valor exato |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Cada AC tem teste no host. A regra por pasta tem uma pasta só, uma ao lado de outra sem spec e duas com specs em estados opostos |
| Every test in scope maps to a spec requirement - no unclaimed tests | ✅ Todo teste novo tem HFD no título. O do Fix 1 é HFD-01/HFD-06, o do Fix 2 é HFD-01/HFD-05/HFD-06 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

O HFD-08 deixa `bare/.specs/STATE.md` no workspace temporário, e o Fix 2 deixa `side/.specs`, como o SFP-05/06 deixa `later/.specs`. A cópia da fixture é descartada a cada execução (nota 10). As notas nas specs substituídas não mudam o que o parser lê (conferido na iteração 1).

**Integridade dos testes**: de `35a9118` a `b50c9d7`, `suite.cjs` foi de 63 para 66 testes e de 256 para 271 chamadas `assert.*`. De `b50c9d7` a `21d91d4`, foi de 66 para 67 testes e de 271 para 277 chamadas. De `21d91d4` a `56d5bab` (`git diff 21d91d4..56d5bab -- test`), só `suite.cjs` mudou: 36 linhas entraram e 2 saíram. As 2 que saíram são `idOf` e `setHiddenIn`, que voltaram iguais no nível do módulo (`:1401-1402`). Foi de 67 para 68 testes e de 277 para 282 chamadas `assert.*` (`:1434`, `:1440`, `:1441`, `:1445`, `:1446`). O HFD-08 segue com as mesmas três asserções (`:1412`, `:1416`, `:1417`), com as mesmas expressões. Nenhum teste saiu e nenhuma asserção ficou mais fraca. O unit não mudou (68). `src` não mudou desde fc47aec (`git diff fc47aec..56d5bab -- src` vazio).

---

## Edge Cases

- [x] HFD-08 Pasta sem spec fica em Features com "0 feature(s)", com o olho fechado: `test/integration/suite.cjs:1412-1417`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração no desktop oculto)
- **Typecheck**: exit 0 (scratch em 56d5bab)
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 68/68 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1 da iteração 3)
- **Test count before feature**: 68 unit e 63 + 1 + 1 integration (35a9118)
- **Test count after feature**: 68 unit e 68 + 1 + 1 integration (56d5bab)
- **Delta**: +5 integration (−1 SFP-10/HID-16, +6 HFD em `suite.cjs:638`, `:661`, `:681`, `:699`, `:1404`, `:1425`)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

### Fix 1: a regra da pasta com uma concluída mantida à vista (feito em 21d91d4)

- **Root cause**: nos testes da regra da pasta, a spec que deixava a pasta à vista era sempre uma aberta. Nenhum teste via a diferença entre `isHidden` e "concluída conta como oculta" (M6, `src/ui/featuresTree.ts:103`).
- **Fix task**: teste que oculta as abertas, deixa `billing-invoices` à vista pelo card e afirma a raiz, os filhos e a descrição com o olho fechado e aberto. No `finally`, oculta `billing-invoices` de novo e desoculta as abertas.
- **Resultado**: feito em `test/integration/suite.cjs:699-719`, como prescrito. M6 morre em `:708` nas iterações 2 e 3. Gate verde.

### Fix 2: a regra por pasta com duas pastas com specs (feito em 56d5bab)

- **Root cause**: com uma pasta só, "esta pasta está toda oculta" e "nenhuma pasta tem spec à vista" dão o mesmo resultado. O único teste com duas pastas (HFD-08) põe ao lado uma pasta sem spec, e aí também dão o mesmo resultado. Nenhum teste tinha uma pasta com tudo oculto ao lado de outra com spec à vista, então M8 (`src/ui/featuresTree.ts:110`) passava.
- **Fix task**: teste HFD-01/HFD-05 depois do HFD-08 com duas pastas com specs. Com o olho fechado, a raiz só com a pasta à vista, com "1 feature(s)". Com o olho aberto, as duas, `.specs` com "N feature(s) · oculta" e a outra com "1 feature(s)". No `finally`, fecha o olho, desoculta as abertas, roda `setFolders(undefined)` e espera `waitForRoots(['.specs'])`.
- **Resultado**: feito em `test/integration/suite.cjs:1425-1456`. No lugar de `docs/specs/custom-one`, o teste escreve `side/.specs/features/side-one/spec.md`, a alternativa que a prescrição permitia (nota 1). M8 morre em `:1440`, e M10 em `:1446`. Gate verde.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HFD-01 | Implementing | ✅ Verified (Fix 2, nota 1) |
| HFD-02 | Verified | ✅ Verified |
| HFD-03 | Verified | ✅ Verified (nota 3) |
| HFD-04 | Verified | ✅ Verified (nota 4) |
| HFD-05 | Verified | ✅ Verified |
| HFD-06 | Verified | ✅ Verified (Fix 1 e Fix 2, notas 1 e 2) |
| HFD-07 | Verified | ✅ Verified |
| HFD-08 | Verified | ✅ Verified |

Linha de cobertura proposta: "8 total, 8 verificados."

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 8/8 requisitos com evidência que bate com a spec. 0 gaps de precisão
**Sensor**: iteração 3 com 3/3 mortas (M8, M6, M10). Nenhum mutante vivo nas três iterações depois dos fixes
**Gate**: typecheck ok, 68 unit, 68 + 1 + 1 integration, 0 falhas

**What works**: com o olho fechado, a pasta com tudo oculto sai de Features, seja ela a única, seja ao lado de uma pasta sem spec ou de outra com spec à vista. Com o olho aberto, ela volta com "N feature(s) · oculta", e a pasta à vista segue com "N feature(s)". As três regras do EYE-06 que deixam uma spec oculta ou à vista têm mutante morto. A árvore Projeto, a mensagem da view e a tela de boas-vindas seguem como a spec pede.

**Issues found**: nenhum.

**Next steps**: aplicar a rastreabilidade proposta em `spec.md` e fazer o UAT neste repositório (teste independente e primeiro critério de sucesso).
