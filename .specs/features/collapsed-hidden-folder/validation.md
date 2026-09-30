# Collapsed Hidden Folder Validation

## Validation: collapsed-hidden-folder - FAIL ❌

Reprovada na iteração 1, por um mutante vivo e só em teste. O código faz o que a spec pede. Com o olho aberto, a pasta com todas as specs ocultas volta recolhida, e a pasta à vista continua expandida. Os testes observam o que o VS Code mostra, e a observação é sólida. Três dos quatro mutantes morreram. MD sobreviveu: nele, só a regra do estado recolhido ignora o olho de uma spec concluída mantida à vista. Nenhum teste tem uma pasta à vista só por uma concluída mantida à vista (CHF-02, L-020). Uma sonda no scratch mostrou que um teste assim passa com a regra real e mata MD no VS Code (Fix 1). Também fica um gap de precisão no CHF-02, que pede decisão sobre a spec (Fix 2).

**Date**: 2026-09-30
**Spec**: `.specs/features/collapsed-hidden-folder/spec.md`
**Diff range**: `54153ce..cec9614` (branch `feat/hidden-specs`): spec em 3b9c8dd, implementação e testes em 57b317f (que também mudou a spec: CHF-04 novo, edge case virou CHF-05, duas premissas medidas), README em cec9614. Linhas citadas em cec9614
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Task Completion

Escopo pequeno, sem `design.md` nem `tasks.md`. As tasks ficam implícitas nos commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Estado recolhido da pasta oculta | ✅ Done | 57b317f. `src/ui/featuresTree.ts:159` (`const hidden = this.allHidden(...)`), `:163` (`hidden ? C.Collapsed : C.Expanded`), `:165` (a descrição reusa `hidden`, sem mudar o texto), `:166` (`id` igual ao de antes) |
| Testes | ⚠️ Partial | 57b317f. `test/integration/suite.cjs:721-816` (helpers e 2 testes) e `:1555-1582` (duas pastas). Falta a concluída mantida à vista (Fix 1) |
| README | ✅ Done | cec9614. `README.md:12` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| CHF-01 WHEN o usuário abre o olho de Features THEN mostra recolhido, sem listar as specs, o nó de toda pasta com todas as specs ocultas | o VS Code não pede as specs da pasta; estado dado `Collapsed` | `test/integration/suite.cjs:765-766` - oculta as abertas pelo card, com o olho fechado, e `deepEqual(getChildren(), [])`. `:768` espera a árvore assentar. `:769` - `deepEqual(await expandedWhile(openEye), [])`. `:770` - `equal(folderRow().collapsibleState, Collapsed)`. Duas pastas: `:1569` - `deepEqual(await expandedWhile(openEye), [sideId])`, sem `.specs`. `:1572-1575` - `deepEqual(nodes.map(... collapsibleState), [Collapsed, Expanded])` | ✅ PASS (MA morre em `:769`) |
| CHF-02 WHEN o usuário abre o olho THEN mostra expandido, com as specs listadas, o nó de toda pasta com alguma spec à vista | o VS Code pede as specs da pasta; estado dado `Expanded` | Specs abertas à vista: `suite.cjs:761` - `deepEqual(await expandedWhile(openEye), [id])`. `:762` - `equal(folderRow().collapsibleState, Expanded)`. Duas pastas: `:1569` - `[sideId]`, `:1572-1575` - `side/.specs` com `Expanded`. Pasta à vista só por uma concluída mantida à vista pelo olho (EYE-05): nenhum teste | ❌ GAP (MD viva, Fix 1) e ⚠️ Spec-precision gap (Fix 2) |
| CHF-03 WHEN o usuário expande o nó recolhido de uma pasta oculta THEN lista todas as specs, cada uma com a descrição terminada em "· oculta" | todas as specs da pasta; sufixo exato no fim | `suite.cjs:771-772` - `deepEqual(specs.map((n) => n.feature.name).sort(), modelNames(() => true))`. `:773` - `match(getTreeItem(n).description, / · oculta$/)` para cada uma. `:776` - `deepEqual(await expandedWhile(expandFirstRow), [id])`: expandir pelo teclado faz o VS Code pedir essas specs | ✅ PASS (nota 3) |
| CHF-04 WHILE o olho está aberto, WHEN o usuário oculta ou desoculta uma spec, mantém o nó da pasta aberto ou fechado como estava | expandida continua expandida ao ocultar a última à vista; recolhida continua recolhida ao desocultar | `suite.cjs:800` - controle `[id]`. `:801` oculta as outras pelo olho da linha. `:804` - `deepEqual(await expandedWhile(() => executeCommand('tlcSpecs.hideFeature', last)), [id])`. `:805` - `match(folderRow().description, / · oculta$/)`: o estado dado virou `Collapsed`, e o VS Code manteve a pasta aberta. `:810` - `[]`, a pasta volta recolhida. `:811` - `deepEqual(await expandedWhile(() => setHidden(api.dashboardMessage, open[0], false)), [])`. `:812` - `doesNotMatch(folderRow().description, /oculta/)` | ✅ PASS (MC morre em `:804`) |
| CHF-05 WHEN o usuário fecha e abre de novo o olho THEN mostra recolhido outra vez o nó da pasta com todas as specs ocultas | recolhida de novo, mesmo depois de o usuário a abrir | `suite.cjs:776` - o usuário abre a pasta (`[id]`). `:777-778` fecha o olho e espera. `:779` - `deepEqual(await expandedWhile(openEye), [])`. `:780` - `equal(folderRow().collapsibleState, Collapsed)` | ✅ PASS (nota 2) |

**Status**: 4/5 com evidência que bate com a spec e sem mutante vivo. O CHF-02 tem evidência para a pasta à vista por uma spec aberta, mas não por uma concluída mantida à vista, e MD passa (Fix 1). Há 1 gap de precisão no CHF-02 (Fix 2).

### Notas

1. **A observação `expandedWhile` é sólida e não vazia.** O helper (`suite.cjs:731-746`) troca `getChildren` na instância do provider e anota o `project.id` de cada nó `root` que o VS Code pede. No VS Code instalado (1.120.0), o extension host chama `this._dataProvider.getChildren(e)` a cada busca (`extensionHostProcess.js`). O objeto é o mesmo de `api.featuresTree` (`src/extension.ts:48-50`, `:111`). Nenhum código da extensão chama `getChildren` (grep em `src/`), então só o VS Code aparece na lista. O `delete` do `finally` devolve o método do protótipo. No workbench, `collapseByDefault:p=>p.collapsibleState!==2` (`workbench.desktop.main.js`) usa o estado dado quando a árvore cria o nó. As duas direções já falharam com um mutante: MA trocou `[]` por `[id]` em `:769`, `:810` e `:1569`, e MC trocou `[id]` por `[]` em `:804`. Os controles que esperam lista cheia (`:761`, `:776`, `:800`, `:804`, `:1569`) passaram em todas as execuções que chegaram neles sem um mutante no caminho. Então a view estava na tela e respondia.
2. **As duas premissas medidas conferem.** Com o `id` fixo (`src/ui/featuresTree.ts:166`, igual ao de antes do feature), o CHF-05 passa em `:779`. O VS Code esquece a expansão de um nó que saiu da árvore. MC (o `id` segue o estado oculto) morre em `:804`. O VS Code usa o estado dado num nó de `id` novo, então o `id` fixo é o que mantém o CHF-04. Notas do autor: (a) a variante com `id` novo a cada abertura saiu, porque o `id` não mudou no diff. (b) Com o `id` fixo, o CHF-05 passou nas execuções 1, 3, 4 e 5. (c) A falha antiga do CHF-04 por poluição não foi reproduzida por mim. Tenho só o log do autor (`scratchpad/itx.log`), que mostra `[]` no controle inicial, o que bate com uma pasta que entrou recolhida. Com `restoreFolder` (`:787-792`), o controle `:800` passou nas execuções 1, 2, 3, 4 e 5. (d) As esperas (`treeSettled`) estão antes de cada passo observado (`:768`, `:778`, `:803`, `:809`, `:1567`) e dentro do `expandedWhile`.
3. **CHF-03.** A lista (`:771-773`) é afirmada no provider, que é o que o VS Code recebe. `:776` prova que o VS Code pede essa lista quando o usuário expande. O estado não muda entre as duas linhas. Aceito (L-002).
4. **MD e a sonda (Fix 1).** MD troca só a condição do estado recolhido (`:163`) por `p.features.length > 0 && p.features.every((f) => f.health === 'complete' || this.isHidden(node.loaded, f))`, e a descrição segue com a regra real. Toda concluída conta como oculta para recolher, mesmo mantida à vista pelo olho. A pasta à vista só por `billing-invoices` recebe `Collapsed`. Isso aparece para o usuário quando o VS Code acrescenta essa pasta: ao recarregar a janela, ou quando ela volta pelo card com o olho fechado. Ela fica recolhida, e continua recolhida quando o olho abre, contra o CHF-02. MD passou em tudo (execução 4). Na execução 5, pus MD atrás de uma flag e acrescentei uma sonda só no scratch, rodada uma vez sem a flag e outra com ela. Com o olho fechado, a sonda oculta as abertas, espera, desoculta `billing-invoices` pelo card, observa e abre o olho. Com a regra real, o log diz `added=[id] opened=[id] state=2`, e o teste passou. Com MD, diz `added=[] opened=[] state=1`, e o teste falhou em `expandedWhile(openEye)`, com `[]` no lugar de `[id]`. O teste do Fix 1 é esse.
5. **Gap de precisão no CHF-02 (Fix 2).** O CHF-02 diz "SHALL mostrar expandido" o nó de toda pasta com spec à vista quando o olho abre. Uma pasta à vista que o usuário recolheu à mão com o olho fechado continua na árvore. Pela premissa do CHF-04, o VS Code mantém o estado dela, então ela continua recolhida quando o olho abre. É o comportamento de antes ("como hoje", Goals), mas o texto do CHF-02 diz o contrário, e nenhuma premissa cobre o caso. Nada no código muda. O que falta é a spec dizer o que acontece com esse nó.
6. **O CHF-04 veio do autor.** Ele entrou em 57b317f, junto com duas premissas medidas, as duas com "n" em Confirmed. Ocultar a última spec à vista com o olho aberto deixa a pasta expandida com "· oculta". Desocultar uma spec numa pasta recolhida deixa a pasta recolhida. Convém o usuário confirmar no UAT.
7. **Gatilhos (L-009).** O olho do título roda `tlcSpecs.showHidden` e `tlcSpecs.hideHidden` (`package.json`, `view/title`), e os testes rodam esses comandos (`:724-725`). O CHF-04 oculta pelo olho da linha (`tlcSpecs.hideFeature`, `:801`, `:804`) e desoculta pelo card (`:811`). Todos passam por `hidden.onDidChange` (`src/ui/featuresTree.ts:81`). A spec não lista outros gatilhos.
8. **Lições conferidas.** L-002: o estado é afirmado no que o VS Code faz (pede ou não pede as specs), além do provider. L-014: o estado recolhido é esperado nos dois valores (`Collapsed` em `:770`, `:780`, `:1574`; `Expanded` em `:762`, `:1574`), e `expandedWhile` é esperado vazio e cheio. L-020 não foi seguida para a regra nova: a concluída mantida à vista, que cumpre as duas condições, falta (MD). L-006 não se aplica. L-025 ainda é candidata, mas o teste de duas pastas a segue (`:1555-1582`), e MB morre nele.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wtv cec9614`, com junction de `node_modules` para o real. Cada mutante é uma troca de texto que exige uma ocorrência só, aplicada por script (`scratchpad/chf-mutate.py`) em `src/ui/featuresTree.ts` do scratch e desfeita com `git checkout -- .`. Depois da reversão, o `git status --porcelain` do scratch ficou vazio. Não usei `git stash`. Antes de cada execução, rodei `npm run build` e conferi o mutante no `dist/extension.cjs`. O log mostra a extensão carregada do scratch nas três suítes.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| MA | `src/ui/featuresTree.ts:163` | Sempre `Expanded`, como antes do feature | ✅ Killed (`test/integration/suite.cjs:769`, `:810` e `:1569`, cada um com o `.specs` a mais na lista. 68/71. Mutante em `dist/extension.cjs:1683`) |
| MB | `src/ui/featuresTree.ts:163` | Regra global: `this.store.projects.some((q) => this.allHidden(q)) ? C.Collapsed : C.Expanded`. Toda pasta é recolhida quando alguma está toda oculta | ✅ Killed (`suite.cjs:1572`, `[1, 1]` no lugar de `[1, 2]`. `:1569` passou, porque `side/.specs` já estava expandida na árvore. Mutante em `dist/extension.cjs:1683`) |
| MC | `src/ui/featuresTree.ts:166` | O `id` segue o estado oculto: `` `root:${pid}${hidden ? ':oculta' : ''}` ``. O VS Code vê um nó novo quando a pasta fica toda oculta ou volta | ✅ Killed (`suite.cjs:804`, `[]` no lugar de `[id]`. Mutante em `dist/extension.cjs:1686`) |
| MD | `src/ui/featuresTree.ts:163` | Só o estado recolhido ignora o olho de uma concluída mantida à vista: `p.features.length > 0 && p.features.every((f) => f.health === 'complete' \|\| this.isHidden(node.loaded, f))`. A descrição segue com `hidden` | ❌ Survived → Fix 1 (71/71 + 1/1 + 1/1, exit 0. Mutante em `dist/extension.cjs:1683`) |

MB e MC rodaram juntos na execução 3, porque os pontos de falha não se cruzam. MC muda o `id` só quando a pasta que estava na árvore muda de estado oculto. Isso só acontece no CHF-04. No primeiro teste, a pasta sai e volta com o mesmo `id` a cada vez. No teste de duas pastas, `.specs` só entra depois de oculta. MB só muda alguma coisa com duas pastas, e as duas primeiras CHF têm uma pasta só. Na execução 3 falharam só esses dois testes (69/71), cada um com a assinatura do seu mutante.

Não rodei três variantes. (a) Recolher só com o olho aberto (`this.show && hidden`) é equivalente, porque com o olho fechado a pasta toda oculta não está em `getChildren` (`:110`), e o VS Code nunca pede o item dela. (b) Sempre `Collapsed` ficou fora do limite de execuções. `:762` afirma `Expanded` no provider, então ele falha ali, no máximo. (c) Trocar a regra em `hidden` (`:159`), que também muda a descrição, falha no teste do hidden-folder em `:710`, que afirma a descrição sem "· oculta" com `billing-invoices` à vista. Nenhuma das três entra na contagem.

**Sensor depth**: lightweight (padrão, sem caminho P0), com 4 mutações no código novo e uma sonda de confirmação.
**Result**: 3/4 mortas, MD viva. FAIL ❌

**Execuções que abriram o VS Code**: 5 das 5 permitidas. Todas rodaram no desktop oculto, em primeiro plano e uma por vez, no scratch.

| # | Execução | Resultado |
| - | -------- | --------- |
| 1 | Gate, sem mutação | 71/71 + 1/1 + 1/1, exit 0 |
| 2 | MA | 68/71 + 1/1 + 1/1, exit 1. Falhas só em `:769`, `:810` e `:1569` |
| 3 | MB + MC | 69/71 + 1/1 + 1/1, exit 1. Falhas só em `:804` (MC) e `:1572` (MB) |
| 4 | MD | 71/71 + 1/1 + 1/1, exit 0. MD sobreviveu |
| 5 | MD atrás de uma flag, mais a sonda (nota 4) | 72/73 + 1/1 + 1/1, exit 1. Os 71 testes da suíte passaram com a flag desligada, e a sonda também. Com a flag ligada, a sonda falhou em `expandedWhile(openEye)` |

**Instabilidade**: nenhum sinal. Os três testes CHF passaram nas execuções 1, 4 e 5, sem mutação no caminho deles. Nas execuções 2 e 3, cada falha caiu na linha prevista antes da execução, com a assinatura do mutante, e o resto ficou verde. Nenhum controle que espera lista cheia falhou sem mutante.

**Isolamento**: o `git status --porcelain` da árvore real estava vazio antes e depois, e o HEAD seguiu em cec9614. Tirei a junction com `cmd /c rmdir`, sem recursão, e depois rodei `git worktree remove --force` e `git worktree prune`. O `git worktree list` mostra só a árvore real. O `node_modules` real tinha 129 entradas visíveis antes e depois, e `npm ls --depth=0` deu exit 0.

---

## Interactive UAT Results (if performed)

Não executado, porque o Verifier roda sem usuário. O primeiro critério de sucesso (`spec.md:84`) é cumprido por `test/integration/suite.cjs:1569`: ao abrir o olho, o VS Code pede as specs de `side/.specs` e não as de `.specs`. Ficam para o orquestrador o teste independente (`spec.md:56`) e o segundo critério de sucesso (`spec.md:85`): neste repositório, abrir o olho e ver o nó `visual-tlc` recolhido, e expandir para ver as specs com "· oculta". Convém também mostrar ao usuário o CHF-04 (nota 6) e o caso do Fix 2 (nota 5).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Uma constante, um ternário e um comentário curto (`src/ui/featuresTree.ts:159-165`). A descrição reusa a constante |
| Surgical changes | ✅ Só o caso `root` de `getTreeItem`, a suíte, o README e a spec |
| No scope creep | ✅ Pastas à vista, árvore Projeto e painel não mudaram (Out of Scope) |
| Matches patterns | ✅ Mesmo formato dos outros estados em `getTreeItem` (`:174`, `:188`). Os testes seguem os helpers do hidden-folder (`setHidden`, `folderRow`, `treeSettled`, `setFolders`, `waitForRoots`) |
| Spec-anchored outcome check (asserted values match spec) | ⚠️ Estados e listas afirmados com o valor exato. Falta a concluída mantida à vista no CHF-02 (Fix 1) |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Cada AC tem teste no VS Code real. O CHF-02 não cobre as duas regras que deixam uma spec à vista |
| Every test in scope maps to a spec requirement - no unclaimed tests | ✅ Os três testes novos têm CHF no título |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes**: de `54153ce` a `cec9614`, só entraram linhas em `test/` (126, nenhuma saiu). `suite.cjs` foi de 68 para 71 testes e de 282 para 301 chamadas `assert.*`. O unit não mudou (68).

---

## Edge Cases

- [x] CHF-05 Fechar e abrir o olho de novo traz a pasta recolhida outra vez, mesmo depois de o usuário abri-la: `test/integration/suite.cjs:776-780`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração no desktop oculto, no scratch em cec9614)
- **Typecheck**: exit 0
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 71/71 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1)
- **Test count before feature**: 68 unit e 68 + 1 + 1 integration (54153ce)
- **Test count after feature**: 68 unit e 71 + 1 + 1 integration (cec9614)
- **Delta**: +3 integration (`suite.cjs:755`, `:794`, `:1555`)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

### Fix 1: CHF-02 com uma pasta à vista só por uma concluída mantida à vista

- **Root cause**: nos testes, a spec que deixa a pasta à vista é sempre aberta (`:761`, `side-one` em `:1569`). Nenhum teste distingue `isHidden` de "concluída conta como oculta" na regra do estado recolhido, então MD (`src/ui/featuresTree.ts:163`) passa.
- **Fix task**: só teste, na seção do collapsed-hidden-folder, depois do CHF-04. Com o olho fechado e a view em foco, ocultar as abertas pelo card e esperar (`treeSettled`), com a raiz vazia. Desocultar `billing-invoices` pelo card, o que traz a pasta de volta, e esperar. Depois, `assert.deepEqual(await expandedWhile(openEye), [id])` e `assert.equal(folderRow().collapsibleState, Expanded)`. No `finally`, fechar o olho e esperar, ocultar `billing-invoices` (que apaga a escolha, EYE-10) e esperar, desocultar as abertas e esperar. No fim, `treeNames()` igual às abertas. Pode afirmar também que o VS Code pede as specs quando a pasta volta pelo card (`[id]`).
- **Done when**: MD morre numa asserção nova, e o gate fica verde. Na execução 5, uma sonda com esses passos passou com a regra real e matou MD em `expandedWhile(openEye)`.
- **Priority**: Major (só teste; o código está certo)

### Fix 2: o CHF-02 e a pasta à vista que o usuário recolheu

- **Root cause**: o CHF-02 pede "expandido" para toda pasta com spec à vista quando o olho abre. Uma pasta à vista que o usuário recolheu continua recolhida, como antes do feature (nota 5).
- **Fix task**: decisão sobre a spec, com o usuário. Uma saída é uma linha nas premissas: "Pasta à vista que o usuário recolheu | Continua recolhida ao abrir o olho | O nó continua na árvore, e o VS Code mantém o estado dado pelo usuário". Outra é reescrever o CHF-02 como "...o nó de toda pasta com alguma spec à vista, aberto ou fechado como estava, expandido se o usuário não o recolheu". Nenhum código muda. Se a spec passar a exigir o caso, um teste recolhe a pasta com `list.collapse` e espera `[]` ao abrir o olho.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CHF-01 | Implementing | ✅ Verified |
| CHF-02 | Implementing | ❌ Needs Fix (Fix 1, e Fix 2 na spec) |
| CHF-03 | Implementing | ✅ Verified (nota 3) |
| CHF-04 | Implementing | ✅ Verified (nota 6: premissa ainda "n") |
| CHF-05 | Implementing | ✅ Verified (nota 2) |

Linha de cobertura proposta: "5 total, 4 verificados."

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 4/5 requisitos com evidência que bate com a spec. 1 gap de precisão (CHF-02)
**Sensor**: 3/4 mortas (MA, MB, MC). MD viva
**Gate**: typecheck ok, 68 unit, 71 + 1 + 1 integration, 0 falhas

**What works**: com o olho aberto, a pasta com todas as specs ocultas volta recolhida, sem que o VS Code peça as specs dela, com uma pasta ou com duas. A pasta com spec aberta à vista continua expandida. Expandir pelo teclado lista todas as specs com "· oculta". Fechar e abrir o olho traz a pasta recolhida de novo. Ocultar ou desocultar com o olho aberto não abre nem fecha a pasta. As duas premissas medidas conferem no VS Code 1.120.0.

**Issues found**: Fix 1 (teste da concluída mantida à vista, que mata MD) e Fix 2 (texto do CHF-02).

**Next steps**: fazer o Fix 1 e decidir o Fix 2 com o usuário, depois validar de novo (iteração 2).
