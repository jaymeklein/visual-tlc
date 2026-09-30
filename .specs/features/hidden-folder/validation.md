# Hidden Folder Validation

## Validation: hidden-folder - FAIL ❌

Reprovada na iteração 1 por um mutante vivo. Cada um dos 8 requisitos tem evidência, e ela bate com o que a spec pede. Não há gap de precisão. O teste antigo do SFP-10/HID-16 foi reescrito sem perder as asserções da mensagem e da tela de boas-vindas. O gate em b50c9d7 passa: typecheck ok, 68 unit e 66 + 1 + 1 de integração. O sensor rodou 7 mutações e matou 6. A que sobreviveu, M6, faz a regra da pasta contar como oculta toda spec concluída, sem olhar o olho que a deixa à vista. Nenhum teste tem uma pasta cuja única spec à vista é uma concluída mantida à vista. É o caso real deste repositório, onde todas as specs estão concluídas. A correção é só de teste (Fix 1).

**Date**: 2026-09-30
**Spec**: `.specs/features/hidden-folder/spec.md`
**Diff range**: `35a9118..b50c9d7` (branch `feat/hidden-specs`): spec em c440a87, implementação e testes em fc47aec, README em b50c9d7. Linhas citadas em b50c9d7
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b50c9d7 | Reprovada | 8/8 requisitos com evidência que bate com a spec. 0 gaps de precisão. 6/7 mortas. Viva: M6 (Fix 1). 6 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `design.md` nem `tasks.md`. As tasks ficam implícitas nos commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Regra da pasta na árvore Features | ✅ Done | fc47aec. `src/ui/featuresTree.ts:101-104` (`allHidden`), `:110` (filtro da raiz), `:161` (descrição com "· oculta") |
| Testes | ✅ Done | fc47aec. `test/integration/suite.cjs:632-697` (3 testes) e `:1379-1400` (HFD-08). O teste do SFP-10/HID-16 saiu no mesmo commit |
| Notas nas specs substituídas | ✅ Done | fc47aec. `.specs/features/specs-folder-paths/spec.md:89`, `.specs/features/hidden-specs/spec.md:105-106` |
| README | ✅ Done | b50c9d7. `README.md:12`, `:86` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| HFD-01 WHILE o olho de Features está fechado, a árvore deixa fora toda pasta com ao menos uma spec e todas ocultas | a raiz não tem o nó da pasta | `test/integration/suite.cjs:643-644` - oculta as abertas (as concluídas já são ocultas), `deepEqual(api.featuresTree.getChildren(), [])`. Com duas pastas: `:1393` - `deepEqual(nodes.map((n) => n.loaded.project.id), [idOf('bare/.specs')])`, a pasta com tudo oculto sai e a outra fica | ✅ PASS (nota 1) |
| HFD-02 WHEN o usuário oculta pelo olho da linha a última spec à vista THEN a árvore tira o nó da pasta | raiz vazia depois do olho da linha | `suite.cjs:667` - precondição `treeNames()` = `['csv-export']`. `:668` - `executeCommand('tlcSpecs.hideFeature', await featureNode(last))`, o comando do olho inline com o nó. `:669` - `deepEqual(api.featuresTree.getChildren(), [])` | ✅ PASS |
| HFD-03 WHEN o usuário desoculta pelo card uma spec de uma pasta fora da árvore THEN o nó volta, com essa spec dentro | raiz `['root']`, filhos só com a spec desocultada | `suite.cjs:671` - `setHidden(api.dashboardMessage, last, false)`, a mensagem do card no host. `:673` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:674` - filhos `[last]` | ✅ PASS (nota 2) |
| HFD-04 WHILE olho fechado e nenhuma pasta com spec à vista, lista vazia com "T feature(s) · D concluída(s) · H oculta(s)", sem boas-vindas | `[]`; mensagem com H = T; sem tela de boas-vindas | `suite.cjs:644` - `[]`. `:645` - `` equal(api.featuresViewMessage(), `${features.length} feature(s) · ${done} concluída(s) · ${features.length} oculta(s)`) ``. `:647-650` - `viewsWelcome` de Features só com `!tlcSpecs.hasSpecs` | ✅ PASS (nota 3) |
| HFD-05 WHILE olho aberto, a pasta com todas as specs ocultas tem "N feature(s) · oculta", N o total | nó presente, descrição exata | `suite.cjs:687` - `showHidden`. `:689` - oculta as abertas. `:690` - `deepEqual(...getChildren().map((n) => n.kind), ['root'])`. `:691` - `` equal(folderRow().description, `${base} · oculta`) ``, com `base` = `` `${features.length} feature(s)` `` (`:684`) | ✅ PASS |
| HFD-06 WHILE a pasta tem ao menos uma spec à vista, "N feature(s)" sem "· oculta", olho aberto ou fechado | descrição exata, sem o sufixo, nos dois estados do olho | `suite.cjs:686` - olho fechado, `equal(folderRow().description, base)`. `:688` - olho aberto, `base`. `:696` - olho fechado de novo, `base`. A pasta tem concluídas ocultas e abertas à vista | ✅ PASS (nota 1) |
| HFD-07 WHILE todas as specs de uma pasta estão ocultas, a árvore Projeto mostra o nó, com Handoff, decisões e lições | raiz `['root']` com as três seções | `suite.cjs:651-652` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:653-654` - `ok(sections.includes(kind))` para `handoff`, `decisions`, `lessons`, com tudo oculto | ✅ PASS |
| HFD-08 IF uma pasta de specs não tem spec THEN Features mostra o nó com "0 feature(s)", com o olho fechado | nó presente, descrição exata | `suite.cjs:1389` - `deepEqual(featuresOf('bare/.specs'), [])`. `:1393` - só `bare/.specs` na raiz. `:1394` - `equal(api.featuresTree.getTreeItem(nodes[0]).description, '0 feature(s)')` | ✅ PASS |

**Status**: ✅ 8/8 com evidência que bate com a spec. 0 gaps de precisão. Os testes de HFD-01 e HFD-06 não distinguem uma spec concluída mantida à vista (M6, nota 1).

### Notas

1. **HFD-01/HFD-06 e a concluída à vista.** A spec diz que a pasta está oculta quando todas as specs estão ocultas "por qualquer regra do EYE-06" (`spec.md:33`). Pelo EYE-05, uma concluída que o usuário desoculta fica à vista. Nos testes, a spec que deixa a pasta à vista é sempre uma aberta (`suite.cjs:686`, `:688`, `:1393`). Por isso M6, que conta toda concluída como oculta na regra da pasta, passa em tudo (execução 5). Com M6, uma pasta cuja única spec à vista é uma concluída sai da árvore com o olho fechado, e com o olho aberto mostra "· oculta". Isso quebra o HFD-01 e o HFD-06. O código está certo, porque `allHidden` usa o mesmo `isHidden` das linhas (`src/ui/featuresTree.ts:103`). O que falta é um teste que o prenda (Fix 1).
2. **HFD-03, o card.** O teste manda ao host a mensagem `setHidden` que o card envia (`api.dashboardMessage`, `src/extension.ts:104`), como no HID-11/12. O card que emite essa mensagem já é provado no unit do hidden-specs. Aceito.
3. **HFD-04, a tela de boas-vindas.** Agora a árvore fica vazia de fato, então a tela de boas-vindas depende de duas coisas. A primeira é a chave `tlcSpecs.hasSpecs`, que vale `store.projects.length > 0` (`src/extension.ts:86`), não muda com este feature e nenhum teste lê. A segunda é a regra do VS Code. No VS Code instalado, `shouldShowWelcome` da árvore exige `isTreeEmpty` e `message` vazia (`workbench.desktop.main.js`: `(this.treeView.message===void 0||this.treeView.message==="")`). O `:645` afirma a mensagem cheia, então a tela não aparece nesse estado, qualquer que seja a chave. Com o `when` do manifesto (`:647-650`), isso basta. Aceito, como no HID-16 e no SFP-10.
4. **Gatilhos (L-009).** A spec lista um gatilho para cada ação: o olho da linha para ocultar (HFD-02, `:668`) e o card para desocultar (HFD-03, `:671`). Os dois são exercitados.
5. **Critérios de sucesso.** O segundo foi cumprido. O teste antigo (`35a9118:test/integration/suite.cjs:501-520`) virou o `:638-659`. A mensagem (`:510` → `:645`), o `viewsWelcome` (`:512-515` → `:647-650`) e a volta ao estado inicial (`:519` → `:658`) seguem iguais. Só o nó sem filhos (`:508-509`) virou a raiz vazia (`:644`), e as asserções da árvore Projeto entraram (`:651-654`). O primeiro critério, e o teste independente neste repositório, ficam para o UAT.
6. **Premissas "n" da spec.** Pasta oculta por qualquer regra do EYE-06: concluída sem escolha e aberta marcada estão provadas (`:643-644`), a concluída mantida à vista não (nota 1). Pasta sem spec continua com "0 feature(s)": `:1394`. Todas as pastas ocultas: lista vazia, mensagem e sem boas-vindas (`:644-650`).
7. **Lições conferidas.** L-002: tudo é afirmado no que o usuário vê, ou seja, nos filhos da raiz, na `description` do `TreeItem` e na mensagem da view. L-009: nota 4. L-014: a flag `allHidden` tem teste esperando verdadeiro (`:644`, `:691`) e falso (`:686`, `:688`, `:1394`). L-006 não se aplica, porque não há watcher. Das candidatas, L-013 vale para a guarda `features.length > 0`, morta por M1 em `:1393`. L-021 vale para o "· oculta", ausente na pasta à vista (`:686`, `:688`). L-024 vale para a pasta vazia, a única que fica em `:1393`. L-020 não foi seguida, e é M6.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt HEAD` (b50c9d7), com junction de `node_modules` para o real. Cada mutante é uma troca de texto que exige uma ocorrência só, aplicada por script em `src/ui/featuresTree.ts` do scratch e desfeita com `git checkout -- .`. Depois de cada reversão, o `git status --porcelain` do scratch ficou vazio. Não usei `git stash`. Duas execuções combinaram dois mutantes, e cada mutante do par falha num ponto só dele (explicado na tabela de execuções).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/ui/featuresTree.ts:103` | `allHidden` sem a guarda `features.length > 0`: a pasta sem spec conta como oculta | ✅ Killed (`test/integration/suite.cjs:1393`, `[]` no lugar de `bare/.specs`) |
| M2 | `src/ui/featuresTree.ts:110` | Filtro da raiz sem `this.show \|\|`: a pasta oculta sai também com o olho aberto | ✅ Killed (`suite.cjs:690`, `[]` no lugar de `['root']`) |
| M3 | `src/ui/featuresTree.ts:103` | `some` no lugar de `every`: basta uma spec oculta para a pasta sair | ✅ Killed (17 testes, 49/66. Entre eles SFP-07/08 em `suite.cjs:442` e HFD-06 em `:686`) |
| M4 | `src/ui/featuresTree.ts:161` | Descrição da raiz sem o sufixo "· oculta" | ✅ Killed (`suite.cjs:691`, `'9 feature(s)'` no lugar de `'9 feature(s) · oculta'`) |
| M5 | `src/ui/featuresTree.ts:161` | Sufixo invertido: "· oculta" na pasta à vista | ✅ Killed (`suite.cjs:686`, `'9 feature(s) · oculta'` no lugar de `'9 feature(s)'`) |
| M6 | `src/ui/featuresTree.ts:103` | Regra da pasta com `f.health === 'complete' \|\| this.isHidden(...)`: toda concluída conta como oculta, mesmo mantida à vista pelo olho | ❌ Survived → Fix 1 (66/66 + 1/1 + 1/1, mutante conferido em `dist/extension.cjs:1632` do scratch) |
| M7 | `src/ui/featuresTree.ts:110` | Filtro da raiz tirado (`filter(() => true)`), que é o comportamento antigo do SFP-10 | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:1393` HFD-08) |

Não rodei o sufixo condicionado ao olho (`this.show && this.allHidden(...)`), porque é equivalente: com o olho fechado, a pasta oculta não aparece. Também não rodei a chave `tlcSpecs.hasSpecs` (`src/extension.ts:86`), que fica fora do diff e não mostraria a tela de boas-vindas com a mensagem cheia (nota 3).

**Sensor depth**: lightweight ampliado (padrão, sem caminho P0), com 7 mutações no código novo.
**Result**: 6/7 mortas, M6 viva. FAIL ❌

**Execuções que abriram o VS Code**: 6 das 6 permitidas. Todas rodaram no desktop oculto, em primeiro plano e uma por vez, no scratch.

| # | Execução | Resultado |
| - | -------- | --------- |
| 1 | Gate, sem mutação | 66/66 + 1/1 + 1/1, exit 0 |
| 2 | M1 + M4 | 64/66 + 1/1 + 1/1. HFD-05/06 em `:691` por M4. HFD-08 em `:1393` por M1. M1 só age em pasta vazia, e M4 só na descrição, que o `:1393` não lê |
| 3 | M7 + M5 | 62/66 + 1/1 + 1/1. HFD-01 em `:644`, HFD-02/03 em `:669` e HFD-08 em `:1393` por M7. HFD-05/06 em `:686` por M5. M7 sozinho passa no HFD-05/06, e M5 não mexe nos filhos da raiz |
| 4 | M2 | 65/66 + 1/1 + 1/1. HFD-05/06 em `:690` |
| 5 | M6 | 66/66 + 1/1 + 1/1, exit 0: sobreviveu |
| 6 | M3 | 49/66 + 1/1 + 1/1 |

Em cada execução, o log mostra a extensão carregada do scratch nas três suítes.

**Isolamento**: o `git status --porcelain` da árvore real estava vazio antes e depois, e o HEAD seguiu em b50c9d7. Tirei a junction com `cmd /c rmdir`, sem recursão, e depois rodei `git worktree remove --force` e `git worktree prune`. O `git worktree list` mostra só a árvore real. O `node_modules` real tinha 131 entradas antes e depois, e `npm ls --depth=0` deu exit 0.

---

## Interactive UAT Results (if performed)

Não executado, porque o Verifier roda sem usuário. O teste independente da spec (`spec.md:60`) e o primeiro critério de sucesso (`spec.md:91`) rodam neste repositório e ficam para o orquestrador. Com o olho fechado, a árvore Features fica vazia e mostra só a mensagem. Com o olho aberto, aparece o nó `visual-tlc` com "T feature(s) · oculta". Também convém conferir o caso do Fix 1: desocultar uma spec concluída pelo olho, fechar o olho do título e ver a pasta voltar com ela.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Um método de duas linhas (`featuresTree.ts:101-104`), um filtro na raiz (`:110`) e o sufixo na descrição (`:161`). A regra reusa `isHidden` das linhas |
| Surgical changes | ✅ Só `featuresTree.ts`, a suíte, as notas nas specs substituídas e o README |
| No scope creep | ✅ A árvore Projeto e o painel não mudaram, como a spec pede (Out of Scope) |
| Matches patterns | ✅ Filtro no mesmo formato de `featureNodes` (`:273`). As linhas longas seguem o arquivo |
| Spec-anchored outcome check (asserted values match spec) | ✅ Raiz, filhos, descrição e mensagem afirmados com o valor exato |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Cada AC tem teste no host, mas falta a concluída mantida à vista na regra da pasta (Fix 1) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Todo teste novo tem HFD no título |
| Documented guidelines followed: none - strong defaults applied | ✅ |

Detalhe de formatação sem efeito: fc47aec tirou um espaço em `test/integration/suite.cjs:1402`, que ficou `exports.run =async function run()`. O HFD-08 deixa `bare/.specs/STATE.md` no workspace temporário, como o SFP-05/06 deixa `later/.specs`. A cópia da fixture é descartada a cada execução, e o HFD-08 é o último teste. As notas nas specs substituídas não mudam o que o parser lê: rodei o `loadProject` real, e o hidden-folder ficou sem aviso, com 8 requisitos e 1 edge case. O hidden-specs e o specs-folder-paths seguem com 2 edge cases cada.

**Integridade dos testes (`35a9118..b50c9d7`)**: `suite.cjs` foi de 63 para 66 testes e de 256 para 271 chamadas `assert.*`. Saiu o teste do SFP-10/HID-16 e entraram 4. Das asserções dele, só o nó sem filhos saiu, trocado pela raiz vazia da regra nova (nota 5). O unit não mudou (68). Nenhuma asserção ficou mais fraca.

---

## Edge Cases

- [x] HFD-08 Pasta sem spec fica em Features com "0 feature(s)", com o olho fechado: `test/integration/suite.cjs:1389-1394`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração no desktop oculto)
- **Typecheck**: exit 0 (scratch em b50c9d7)
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 66/66 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1)
- **Test count before feature**: 68 unit e 63 + 1 + 1 integration (35a9118)
- **Test count after feature**: 68 unit e 66 + 1 + 1 integration (b50c9d7)
- **Delta**: +3 integration (−1 SFP-10/HID-16, +4 HFD em `suite.cjs:638`, `:661`, `:681`, `:1379`)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

### Fix 1: a regra da pasta com uma concluída mantida à vista

- **Root cause**: nos testes da regra da pasta, a spec que deixa a pasta à vista é sempre uma aberta. Uma concluída desocultada pelo olho (EYE-05), que também está à vista, nunca é a única, então nenhum teste vê a diferença entre `isHidden` e "concluída conta como oculta" (M6, `src/ui/featuresTree.ts:103`).
- **Fix task**: em `test/integration/suite.cjs`, na seção hidden-folder (depois de `:697`), um teste que oculta todas as abertas e deixa `billing-invoices` à vista pelo olho. Pode ser pelo card, com `setHidden(api.dashboardMessage, 'billing-invoices', false)`, ou pela linha, com o olho do título aberto. Com o olho do título fechado, o teste afirma `getChildren().map((n) => n.kind)` = `['root']`, `treeNames()` = `['billing-invoices']` e `folderRow().description` = `` `${N} feature(s)` ``, sem "· oculta". Com o olho aberto, afirma a mesma descrição. No `finally`, oculta `billing-invoices` de novo (o que apaga a escolha, EYE-10) e desoculta as abertas.
- **Done when**: M6 morre numa asserção nova, e o gate (typecheck, unit, integração) fica verde.
- **Priority**: Major. É o caso real deste repositório, onde todas as specs estão concluídas.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HFD-01 | Implementing | ❌ Needs Fix (Fix 1) |
| HFD-02 | Implementing | ✅ Verified |
| HFD-03 | Implementing | ✅ Verified (nota 2) |
| HFD-04 | Implementing | ✅ Verified (nota 3) |
| HFD-05 | Implementing | ✅ Verified |
| HFD-06 | Implementing | ❌ Needs Fix (Fix 1) |
| HFD-07 | Implementing | ✅ Verified |
| HFD-08 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 8/8 requisitos com evidência que bate com a spec. 0 gaps de precisão
**Sensor**: 6/7 mortas. M6 viva (Fix 1)
**Gate**: typecheck ok, 68 unit, 66 + 1 + 1 integration, 0 falhas

**What works**: com o olho de Features fechado, a pasta com todas as specs ocultas sai da árvore, com uma pasta ou com várias. Ocultar pela linha a última spec à vista tira o nó. Desocultar uma spec pelo card o traz de volta, com ela dentro. Com tudo oculto, a view fica vazia, mostra a mensagem com as ocultas e não mostra a tela de boas-vindas. Com o olho aberto, a pasta volta com "N feature(s) · oculta". A pasta com spec à vista mostra "N feature(s)" com o olho aberto ou fechado. A pasta sem spec fica com "0 feature(s)". A árvore Projeto mantém o nó com Handoff, decisões e lições.

**Issues found**: nenhum teste prende a regra da pasta quando a única spec à vista é uma concluída mantida à vista pelo olho. M6 sobrevive (Fix 1, só teste).

**Next steps**: implementar o Fix 1 e rodar o Verifier de novo (iteração 2).
