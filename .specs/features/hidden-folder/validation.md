# Hidden Folder Validation

## Validation: hidden-folder - FAIL ❌

Reprovada na iteração 2 por um mutante vivo novo. O Fix 1 fez o que o relatório pediu. Com ele M6 morre em `test/integration/suite.cjs:708`, e o HFD-06 fica verificado. O gate em 21d91d4 passa: typecheck ok, 68 unit e 67 + 1 + 1 de integração. O sensor rodou 3 mutações e matou 2. A que sobreviveu, M8, é nova. Ela troca a regra por pasta por uma regra global: a pasta com tudo oculto só sai da árvore quando nenhuma pasta tem spec à vista. O HFD-01 fala de "toda pasta", e a spec diz "com um projeto ou com vários" (`spec.md:32`). Mas nenhum teste tem duas pastas com specs, uma com tudo oculto e outra com spec à vista. No HFD-08, a pasta ao lado não tem spec nenhuma, e aí as duas regras dão o mesmo resultado. A correção é só de teste (Fix 2).

**Date**: 2026-09-30
**Spec**: `.specs/features/hidden-folder/spec.md`
**Diff range**: `35a9118..21d91d4` (branch `feat/hidden-specs`): spec em c440a87, implementação e testes em fc47aec, README em b50c9d7, validação da iteração 1 em 2c26515, Fix 1 em 21d91d4. Linhas citadas em 21d91d4, salvo onde diz b50c9d7
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b50c9d7 | Reprovada | 8/8 requisitos com evidência que bate com a spec. 0 gaps de precisão. 6/7 mortas. Viva: M6 (Fix 1). 6 execuções do VS Code |
| 2 | 21d91d4 | Reprovada | Fix 1 conferido: só teste, como prescrito, e mata M6 em `suite.cjs:708`. 0 gaps de precisão. 2/3 mortas (M6, M9). Viva: M8, a regra global no lugar da regra por pasta (Fix 2). 4 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `design.md` nem `tasks.md`. As tasks ficam implícitas nos commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Regra da pasta na árvore Features | ✅ Done | fc47aec. `src/ui/featuresTree.ts:101-104` (`allHidden`), `:110` (filtro da raiz), `:161` (descrição com "· oculta") |
| Testes | ✅ Done | fc47aec. `test/integration/suite.cjs:638-697` (3 testes) e `:1401-1422` (HFD-08). O teste do SFP-10/HID-16 saiu no mesmo commit |
| Notas nas specs substituídas | ✅ Done | fc47aec. `.specs/features/specs-folder-paths/spec.md:89`, `.specs/features/hidden-specs/spec.md:105-106` |
| README | ✅ Done | b50c9d7. `README.md:12`, `:86` |
| Fix 1: pasta à vista por uma concluída mantida à vista | ✅ Done | 21d91d4. `test/integration/suite.cjs:699-719`. Nenhum código mudou |
| Fix 2: regra por pasta com duas pastas com specs | ❌ Aberta | Ver Fix Plans |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| HFD-01 WHILE o olho de Features está fechado, a árvore deixa fora toda pasta com ao menos uma spec e todas ocultas | a raiz não tem o nó da pasta; a pasta com spec à vista fica | `test/integration/suite.cjs:643-644` - oculta as abertas (as concluídas já são ocultas), `deepEqual(api.featuresTree.getChildren(), [])`. `:706-709` - com uma concluída mantida à vista pelo olho, `deepEqual(getChildren().map((n) => n.kind), ['root'])` e `deepEqual(treeNames(), ['billing-invoices'])`. Com duas pastas: `:1415` - `deepEqual(nodes.map((n) => n.loaded.project.id), [idOf('bare/.specs')])`, mas a pasta ao lado não tem spec | ✅ PASS (nota 1: M8 vivo, Fix 2) |
| HFD-02 WHEN o usuário oculta pelo olho da linha a última spec à vista THEN a árvore tira o nó da pasta | raiz vazia depois do olho da linha | `suite.cjs:667` - precondição `treeNames()` = `['csv-export']`. `:668` - `executeCommand('tlcSpecs.hideFeature', await featureNode(last))`, o comando do olho inline com o nó. `:669` - `deepEqual(api.featuresTree.getChildren(), [])` | ✅ PASS |
| HFD-03 WHEN o usuário desoculta pelo card uma spec de uma pasta fora da árvore THEN o nó volta, com essa spec dentro | raiz `['root']`, filhos só com a spec desocultada | `suite.cjs:671` - `setHidden(api.dashboardMessage, last, false)`, a mensagem do card no host. `:673` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:674` - filhos `[last]` | ✅ PASS (nota 3) |
| HFD-04 WHILE olho fechado e nenhuma pasta com spec à vista, lista vazia com "T feature(s) · D concluída(s) · H oculta(s)", sem boas-vindas | `[]`; mensagem com H = T; sem tela de boas-vindas | `suite.cjs:644` - `[]`. `:645` - `` equal(api.featuresViewMessage(), `${features.length} feature(s) · ${done} concluída(s) · ${features.length} oculta(s)`) ``. `:647-650` - `viewsWelcome` de Features só com `!tlcSpecs.hasSpecs` | ✅ PASS (nota 4) |
| HFD-05 WHILE olho aberto, a pasta com todas as specs ocultas tem "N feature(s) · oculta", N o total | nó presente, descrição exata | `suite.cjs:687` - `showHidden`. `:689` - oculta as abertas. `:690` - `deepEqual(...getChildren().map((n) => n.kind), ['root'])`. `:691` - `` equal(folderRow().description, `${base} · oculta`) ``, com `base` = `` `${features.length} feature(s)` `` (`:684`) | ✅ PASS |
| HFD-06 WHILE a pasta tem ao menos uma spec à vista, "N feature(s)" sem "· oculta", olho aberto ou fechado | descrição exata, sem o sufixo, nos dois estados do olho | Spec aberta à vista: `suite.cjs:686` (olho fechado), `:688` (aberto), `:696` (fechado de novo), todas `equal(folderRow().description, base)`. Só uma concluída mantida à vista (Fix 1): `:710` - olho fechado, `equal(folderRow().description, base)`. `:711-712` - `showHidden`, depois a mesma descrição | ✅ PASS (nota 2) |
| HFD-07 WHILE todas as specs de uma pasta estão ocultas, a árvore Projeto mostra o nó, com Handoff, decisões e lições | raiz `['root']` com as três seções | `suite.cjs:651-652` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:653-654` - `ok(sections.includes(kind))` para `handoff`, `decisions`, `lessons`, com tudo oculto | ✅ PASS |
| HFD-08 IF uma pasta de specs não tem spec THEN Features mostra o nó com "0 feature(s)", com o olho fechado | nó presente, descrição exata | `suite.cjs:1411` - `deepEqual(featuresOf('bare/.specs'), [])`. `:1415` - só `bare/.specs` na raiz. `:1416` - `equal(api.featuresTree.getTreeItem(nodes[0]).description, '0 feature(s)')` | ✅ PASS |

**Status**: 8/8 com evidência que bate com a spec. 0 gaps de precisão. O HFD-06 fica verificado com o Fix 1. O teste do HFD-01 não distingue a regra por pasta de uma regra global quando há duas pastas com specs (M8, nota 1).

### Notas

1. **HFD-01 e as várias pastas (M8).** O HFD-01 manda tirar "toda pasta" com tudo oculto, e a premissa confirmada diz "com um projeto ou com vários" (`spec.md:32`). O código faz isso por pasta (`src/ui/featuresTree.ts:110`). Mas com uma pasta só, "esta pasta está toda oculta" e "nenhuma pasta tem spec à vista" dão o mesmo resultado. No HFD-08 (`:1415`), a pasta ao lado não tem spec nenhuma, então também dão o mesmo resultado. No SF-03 (`:793-798`) e no SFP-09 (`:884-895`), todas as pastas têm spec à vista. Por isso M8 passa em tudo (execução 3). Com M8, uma pasta com tudo oculto fica na árvore, sem filhos, ao lado de outra com spec à vista. Esse é o nó vazio que o SFP-10 deixava e que o HFD-01 tira. O código está certo. O que falta é um teste que o prenda (Fix 2).
2. **HFD-06 e a concluída à vista (Fix 1, fechado).** O teste novo (`suite.cjs:699-719`) oculta as abertas e deixa `billing-invoices` à vista pelo card (`:707`, EYE-05). `:704` prova que ela é concluída. `:708` e `:709` provam que a pasta fica, só com ela. `:710` e `:712` provam a descrição exata, sem "· oculta", com o olho fechado e aberto. No `finally` (`:713-717`), o teste fecha o olho, oculta `billing-invoices` e desoculta as abertas. Ocultar uma concluída apaga a escolha: `set` grava `undefined` quando `hidden === complete` (`src/core/hidden.ts:61`, EYE-10). `:718` confere a volta. Na execução 2, com M6, o teste falhou em `:708`, e os testes seguintes passaram. Então o `finally` restaura o estado mesmo quando o teste falha.
3. **HFD-03, o card.** O teste manda ao host a mensagem `setHidden` que o card envia (`api.dashboardMessage`, `src/extension.ts:104`), como no HID-11/12. O card que emite essa mensagem já é provado no unit do hidden-specs. Aceito.
4. **HFD-04, a tela de boas-vindas.** Agora a árvore fica vazia de fato, então a tela de boas-vindas depende de duas coisas. A primeira é a chave `tlcSpecs.hasSpecs`, que vale `store.projects.length > 0` (`src/extension.ts:86`), não muda com este feature e nenhum teste lê. A segunda é a regra do VS Code. No VS Code instalado, `shouldShowWelcome` da árvore exige `isTreeEmpty` e `message` vazia (`workbench.desktop.main.js`: `(this.treeView.message===void 0||this.treeView.message==="")`). O `:645` afirma a mensagem cheia, então a tela não aparece nesse estado, qualquer que seja a chave. Com o `when` do manifesto (`:647-650`), isso basta. Aceito, como no HID-16 e no SFP-10.
5. **Gatilhos (L-009).** A spec lista um gatilho para cada ação: o olho da linha para ocultar (HFD-02, `:668`) e o card para desocultar (HFD-03, `:671`). Os dois são exercitados.
6. **Critérios de sucesso.** O segundo foi cumprido. O teste antigo (`35a9118:test/integration/suite.cjs:501-520`) virou o `:638-659`. A mensagem (`:510` → `:645`), o `viewsWelcome` (`:512-515` → `:647-650`) e a volta ao estado inicial (`:519` → `:658`) seguem iguais. Só o nó sem filhos (`:508-509`) virou a raiz vazia (`:644`), e as asserções da árvore Projeto entraram (`:651-654`). O primeiro critério, e o teste independente neste repositório, ficam para o UAT.
7. **Premissas da spec.** Pasta oculta por qualquer regra do EYE-06: as três regras agora têm teste e mutante morto. A aberta marcada está em `:643-644`. A concluída sem escolha morre com M9 em `:644`, `:669`, `:691` e `:1415`. A concluída mantida à vista morre com M6 em `:708`. Pasta sem spec continua com "0 feature(s)": `:1416`. Todas as pastas ocultas: lista vazia, mensagem e sem boas-vindas (`:644-650`). "Com um projeto ou com vários": só com um (nota 1).
8. **Lições conferidas.** L-002: tudo é afirmado no que o usuário vê, ou seja, nos filhos da raiz, na `description` do `TreeItem` e na mensagem da view. L-009: nota 5. L-014: a flag `allHidden` tem teste esperando verdadeiro (`:644`, `:691`) e falso (`:686`, `:688`, `:708`, `:710`, `:1416`). L-020 agora é seguida: `:699-719` tem uma concluída (primeira condição) que o olho mantém à vista (segunda). L-006 não se aplica, porque não há watcher. Das candidatas, L-013 vale para a guarda `features.length > 0`, morta por M1 em `:1415` (iteração 1). L-021 vale para o "· oculta", ausente na pasta à vista (`:686`, `:688`, `:710`, `:712`). L-024 vale para a pasta vazia, a única que fica em `:1415`. L-003 pede, para settings, uma pasta com cada valor. A mesma ideia faltou aqui para a regra da pasta, e é M8.

---

## Discrimination Sensor

### Iteração 2 (21d91d4)

Scratch: `git worktree add --detach <scratchpad>/wt2 21d91d4`, com junction de `node_modules` para o real. Cada mutante é uma troca de texto que exige uma ocorrência só, aplicada por script em `src/ui/featuresTree.ts` do scratch e desfeita com `git checkout -- .`. Depois de cada reversão, o `git status --porcelain` do scratch ficou vazio. Não usei `git stash`. Em cada execução, conferi o mutante no `dist/extension.cjs` do scratch, e o log mostra a extensão carregada do scratch nas três suítes. Cada mutante rodou sozinho.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M6 (de novo) | `src/ui/featuresTree.ts:103` | Regra da pasta com `f.health === 'complete' \|\| this.isHidden(...)`: toda concluída conta como oculta, mesmo mantida à vista pelo olho | ✅ Killed (`test/integration/suite.cjs:708`, `[]` no lugar de `['root']`. Só esse teste falhou, 66/67. Mutante em `dist/extension.cjs:1632`) |
| M8 (novo) | `src/ui/featuresTree.ts:110` | Regra global no lugar da regra por pasta: filtro `this.show \|\| !this.allHidden(loaded) \|\| this.store.projects.some((p) => p.project.features.some((f) => !this.isHidden(p, f)))`. A pasta com tudo oculto só sai quando nenhuma pasta tem spec à vista | ❌ Survived → Fix 2 (67/67 + 1/1 + 1/1, exit 0. Mutante em `dist/extension.cjs:1636`) |
| M9 (novo) | `src/ui/featuresTree.ts:103` | Só a escolha explícita conta: `this.hidden.choiceOf(...) === 'hidden'`, e a concluída oculta por padrão não deixa a pasta oculta | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:691` HFD-05, `:1415` HFD-08. 63/67. Mutante em `dist/extension.cjs:1632`) |

M8 e M9 são novos, fora do conjunto da iteração 1. M9 é a outra metade do EYE-06, ao lado de M6. Não rodei o sufixo com a mesma regra global (`allHidden(node.loaded)` só quando nenhuma pasta tem spec à vista), por causa do limite de execuções. Pela mesma leitura da nota 1, ele também passaria, porque o "· oculta" só é afirmado com uma pasta (`:691`). O Fix 2 pede essa asserção também.

**Sensor depth**: lightweight (padrão, sem caminho P0), com 3 mutações no código novo, além das 7 da iteração 1.
**Result**: 2/3 mortas, M8 viva. FAIL ❌

**Execuções que abriram o VS Code**: 4 das 4 permitidas. Todas rodaram no desktop oculto, em primeiro plano e uma por vez, no scratch.

| # | Execução | Resultado |
| - | -------- | --------- |
| 1 | Gate, sem mutação | 67/67 + 1/1 + 1/1, exit 0 |
| 2 | M6 | 66/67 + 1/1 + 1/1, exit 1. Falha só em `:708` |
| 3 | M8 | 67/67 + 1/1 + 1/1, exit 0: sobreviveu |
| 4 | M9 | 63/67 + 1/1 + 1/1, exit 1. Falhas em `:644`, `:669`, `:691`, `:1415` |

**Isolamento**: o `git status --porcelain` da árvore real estava vazio antes e depois, e o HEAD seguiu em 21d91d4. Tirei a junction com `cmd /c rmdir`, sem recursão, e depois rodei `git worktree remove --force` e `git worktree prune`. O `git worktree list` mostra só a árvore real. O `node_modules` real tinha 131 entradas antes e depois, e `npm ls --depth=0` deu exit 0.

### Iteração 1 (b50c9d7, histórico)

Mesmo método, em `<scratchpad>/wt` em b50c9d7. Linhas desta tabela em b50c9d7. Em 21d91d4, o `:1393` do HFD-08 é o `:1415`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/ui/featuresTree.ts:103` | `allHidden` sem a guarda `features.length > 0`: a pasta sem spec conta como oculta | ✅ Killed (`test/integration/suite.cjs:1393`, `[]` no lugar de `bare/.specs`) |
| M2 | `src/ui/featuresTree.ts:110` | Filtro da raiz sem `this.show \|\|`: a pasta oculta sai também com o olho aberto | ✅ Killed (`suite.cjs:690`, `[]` no lugar de `['root']`) |
| M3 | `src/ui/featuresTree.ts:103` | `some` no lugar de `every`: basta uma spec oculta para a pasta sair | ✅ Killed (17 testes, 49/66. Entre eles SFP-07/08 em `suite.cjs:442` e HFD-06 em `:686`) |
| M4 | `src/ui/featuresTree.ts:161` | Descrição da raiz sem o sufixo "· oculta" | ✅ Killed (`suite.cjs:691`, `'9 feature(s)'` no lugar de `'9 feature(s) · oculta'`) |
| M5 | `src/ui/featuresTree.ts:161` | Sufixo invertido: "· oculta" na pasta à vista | ✅ Killed (`suite.cjs:686`, `'9 feature(s) · oculta'` no lugar de `'9 feature(s)'`) |
| M6 | `src/ui/featuresTree.ts:103` | Regra da pasta com `f.health === 'complete' \|\| this.isHidden(...)`: toda concluída conta como oculta, mesmo mantida à vista pelo olho | ❌ Survived → Fix 1 (66/66 + 1/1 + 1/1). Morto na iteração 2 |
| M7 | `src/ui/featuresTree.ts:110` | Filtro da raiz tirado (`filter(() => true)`), que é o comportamento antigo do SFP-10 | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:1393` HFD-08) |

Resultado da iteração 1: 6/7 mortas, M6 viva. Execuções: 1 gate (66/66), 2 M1 + M4, 3 M7 + M5, 4 M2, 5 M6 (sobreviveu), 6 M3. Não rodei o sufixo condicionado ao olho (`this.show && this.allHidden(...)`), porque é equivalente: com o olho fechado, a pasta oculta não aparece. Também não rodei a chave `tlcSpecs.hasSpecs` (`src/extension.ts:86`), que fica fora do diff e não mostraria a tela de boas-vindas com a mensagem cheia (nota 4).

---

## Interactive UAT Results (if performed)

Não executado, porque o Verifier roda sem usuário. O teste independente da spec (`spec.md:60`) e o primeiro critério de sucesso (`spec.md:91`) rodam neste repositório e ficam para o orquestrador. Com o olho fechado, a árvore Features fica vazia e mostra só a mensagem. Com o olho aberto, aparece o nó `visual-tlc` com "T feature(s) · oculta". Também convém conferir o caso do Fix 1: desocultar uma spec concluída pelo olho, fechar o olho do título e ver a pasta voltar com ela. O caso do Fix 2 pede duas pastas em `tlcSpecs.specsFolders`, uma com tudo oculto e outra com spec à vista. Com o olho fechado, só a segunda fica.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Um método de duas linhas (`featuresTree.ts:101-104`), um filtro na raiz (`:110`) e o sufixo na descrição (`:161`). A regra reusa `isHidden` das linhas |
| Surgical changes | ✅ Só `featuresTree.ts`, a suíte, as notas nas specs substituídas e o README. O Fix 1 mexe só na suíte |
| No scope creep | ✅ A árvore Projeto e o painel não mudaram, como a spec pede (Out of Scope) |
| Matches patterns | ✅ Filtro no mesmo formato de `featureNodes` (`:273`). O teste do Fix 1 segue o formato dos outros HFD (`try`/`finally`, `folderRow`, `treeNames`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ Raiz, filhos, descrição e mensagem afirmados com o valor exato |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Cada AC tem teste no host, mas falta a regra por pasta com duas pastas com specs (Fix 2) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Todo teste novo tem HFD no título. O do Fix 1 é HFD-01/HFD-06 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

O Fix 1 também devolveu o espaço em `exports.run = async function run()` (`test/integration/suite.cjs:1424`), o detalhe de formatação da iteração 1. O HFD-08 deixa `bare/.specs/STATE.md` no workspace temporário, como o SFP-05/06 deixa `later/.specs`. A cópia da fixture é descartada a cada execução, e o HFD-08 é o último teste. As notas nas specs substituídas não mudam o que o parser lê (conferido na iteração 1).

**Integridade dos testes**: de `35a9118` a `b50c9d7`, `suite.cjs` foi de 63 para 66 testes e de 256 para 271 chamadas `assert.*`. De `b50c9d7` a `21d91d4` (`git diff b50c9d7..21d91d4 -- test`), só `suite.cjs` mudou: 23 linhas entraram e 1 mudou (o espaço em `exports.run`). Foi de 66 para 67 testes e de 271 para 277 chamadas `assert.*`. Nenhum teste saiu e nenhuma asserção ficou mais fraca. O unit não mudou (68). `src` não mudou desde fc47aec.

---

## Edge Cases

- [x] HFD-08 Pasta sem spec fica em Features com "0 feature(s)", com o olho fechado: `test/integration/suite.cjs:1411-1416`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração no desktop oculto)
- **Typecheck**: exit 0 (scratch em 21d91d4)
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 67/67 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1 da iteração 2)
- **Test count before feature**: 68 unit e 63 + 1 + 1 integration (35a9118)
- **Test count after feature**: 68 unit e 67 + 1 + 1 integration (21d91d4)
- **Delta**: +4 integration (−1 SFP-10/HID-16, +5 HFD em `suite.cjs:638`, `:661`, `:681`, `:699`, `:1401`)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

### Fix 1: a regra da pasta com uma concluída mantida à vista (feito em 21d91d4)

- **Root cause**: nos testes da regra da pasta, a spec que deixava a pasta à vista era sempre uma aberta. Nenhum teste via a diferença entre `isHidden` e "concluída conta como oculta" (M6, `src/ui/featuresTree.ts:103`).
- **Fix task**: teste que oculta as abertas, deixa `billing-invoices` à vista pelo card e afirma a raiz, os filhos e a descrição com o olho fechado e aberto. No `finally`, oculta `billing-invoices` de novo e desoculta as abertas.
- **Resultado**: feito em `test/integration/suite.cjs:699-719`, como prescrito. M6 morre em `:708`. Gate verde.

### Fix 2: a regra por pasta com duas pastas com specs

- **Root cause**: com uma pasta só, "esta pasta está toda oculta" e "nenhuma pasta tem spec à vista" dão o mesmo resultado. O único teste com duas pastas (HFD-08) põe ao lado uma pasta sem spec, e aí também dão o mesmo resultado. Nenhum teste tem uma pasta com tudo oculto ao lado de outra com spec à vista, então M8 (`src/ui/featuresTree.ts:110`) passa.
- **Fix task**: em `test/integration/suite.cjs`, um teste HFD-01/HFD-05 depois do HFD-08 (`:1422`) que usa duas pastas com specs. Pode ser `setFolders(['.specs', 'docs/specs'])` com `waitForRoots`. A `docs/specs` já tem `custom-one` desde o SFP-02 (`:760`), à vista com o olho fechado (SF-03, `:797`). Se o autor preferir não depender da ordem, o teste escreve a própria spec. Com o olho fechado, oculta as abertas de `.specs` (as concluídas já são ocultas) e afirma que a raiz tem só `docs/specs` (`nodes.map((n) => n.loaded.project.id)`). Afirma também que a descrição dela é `'1 feature(s)'`. Com o olho aberto, afirma as duas pastas na raiz, `.specs` com `` `${N} feature(s) · oculta` `` e `docs/specs` com `'1 feature(s)'`, sem "· oculta" (L-021). No `finally`, fecha o olho, desoculta as abertas de `.specs`, roda `setFolders(undefined)` e espera `waitForRoots(['.specs'])`.
- **Done when**: M8 morre numa asserção nova, e o gate (typecheck, unit, integração) fica verde.
- **Priority**: Major. O HFD-01 e a premissa confirmada (`spec.md:32`) falam de várias pastas. Neste repositório há uma pasta só, então o caso real do UAT não muda.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HFD-01 | Implementing | ❌ Needs Fix (Fix 2) |
| HFD-02 | Verified | ✅ Verified |
| HFD-03 | Verified | ✅ Verified (nota 3) |
| HFD-04 | Verified | ✅ Verified (nota 4) |
| HFD-05 | Verified | ✅ Verified |
| HFD-06 | Implementing | ✅ Verified (Fix 1, nota 2) |
| HFD-07 | Verified | ✅ Verified |
| HFD-08 | Verified | ✅ Verified |

Linha de cobertura proposta: "8 total, 7 verificados, 1 com o Fix 2 à espera da nova validação."

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 8/8 requisitos com evidência que bate com a spec. 0 gaps de precisão
**Sensor**: iteração 2 com 2/3 mortas (M6, M9). M8 viva (Fix 2)
**Gate**: typecheck ok, 68 unit, 67 + 1 + 1 integration, 0 falhas

**What works**: o Fix 1 prende a regra da pasta quando a única spec à vista é uma concluída mantida à vista pelo olho. A pasta fica, só com ela, e a descrição não tem "· oculta", com o olho fechado ou aberto. Tudo o que funcionava na iteração 1 continua passando. As três regras do EYE-06 que deixam uma spec oculta ou à vista agora têm mutante morto.

**Issues found**: nenhum teste prende a regra por pasta quando há duas pastas com specs, uma com tudo oculto e outra com spec à vista. M8 sobrevive (Fix 2, só teste).

**Next steps**: implementar o Fix 2 e rodar o Verifier de novo (iteração 3, a última antes de escalar ao usuário).
