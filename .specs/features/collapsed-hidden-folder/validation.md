# Collapsed Hidden Folder Validation

## Validation: collapsed-hidden-folder - PASS ✅

Aprovada na iteração 2. O Fix 1 e o Fix 2 entraram só no teste e na spec (3d483ec), sem mudar o código. O teste novo deixa a pasta à vista só por `billing-invoices`, uma concluída mantida à vista pelo olho do card. MD, que sobreviveu na iteração 1, morre em `suite.cjs:836`. O mesmo teste recolhe a pasta à vista e espera que o olho a deixe recolhida (`:845`). Essa asserção não é vazia. O controle em `:837` e a sonda P0 dão `[id]` sem o `list.collapse`, e o mutante MF, que reabre a pasta a cada toque no olho, morre em `:845`. "Sempre Collapsed" (ME), que ficou de fora na iteração 1, morre em quatro pontos. O texto novo do CHF-02 é preciso e testável. Fica uma nota de redação que não bloqueia (nota 12).

**Date**: 2026-09-30
**Spec**: `.specs/features/collapsed-hidden-folder/spec.md`
**Diff range**: `54153ce..3d483ec` (branch `feat/hidden-specs`). Iteração 1 em `54153ce..cec9614`: spec em 3b9c8dd, código e testes em 57b317f, README em cec9614. Iteração 2 em `cec9614..3d483ec`: fe018cc só com docs e lições, e 3d483ec com o Fix 1 e o Fix 2. `git diff cec9614..3d483ec -- src` está vazio. Linhas citadas em 3d483ec. O teste de duas pastas desceu 37 linhas (`:1555` virou `:1592`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

| Iteração | Commit | Veredito | Motivo |
| -------- | ------ | -------- | ------ |
| 1 | cec9614 | Reprovada | MD viva (CHF-02) e gap de precisão no CHF-02. Fix 1 e Fix 2 |
| 2 | 3d483ec | Aprovada | MD morre em `:836`. CHF-02 reescrito e testado com a pasta recolhida pelo usuário (`:845`). 3/3 mutantes mortos |

---

## Task Completion

Escopo pequeno, sem `design.md` nem `tasks.md`. As tasks ficam implícitas nos commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Estado recolhido da pasta oculta | ✅ Done | 57b317f. `src/ui/featuresTree.ts:159` (`const hidden = this.allHidden(...)`), `:163` (`hidden ? C.Collapsed : C.Expanded`), `:165` (a descrição reusa `hidden`, sem mudar o texto), `:166` (`id` igual ao de antes). Sem mudança desde então |
| Testes | ✅ Done | 57b317f: `test/integration/suite.cjs:721-816` (helpers e 2 testes) e `:1592-1619` (duas pastas). 3d483ec: `:818-853` (Fix 1 e Fix 2) |
| README | ✅ Done | cec9614. `README.md:12` |
| Fix 1: concluída mantida à vista | ✅ Done | 3d483ec. `suite.cjs:825-838` e `:846-852` (nota 9) |
| Fix 2: texto do CHF-02 | ✅ Done | 3d483ec. `spec.md:52` e a premissa em `spec.md:31`. Teste em `suite.cjs:840-845` (nota 10) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| CHF-01 WHEN o usuário abre o olho de Features THEN mostra recolhido, sem listar as specs, o nó de toda pasta com todas as specs ocultas | o VS Code não pede as specs da pasta; estado dado `Collapsed` | `test/integration/suite.cjs:765-766` - oculta as abertas pelo card, com o olho fechado, e `deepEqual(getChildren(), [])`. `:768` espera a árvore assentar. `:769` - `deepEqual(await expandedWhile(openEye), [])`. `:770` - `equal(folderRow().collapsibleState, Collapsed)`. Duas pastas: `:1606` - `deepEqual(await expandedWhile(openEye), [sideId])`, sem `.specs`. `:1609-1612` - `deepEqual(nodes.map(... collapsibleState), [Collapsed, Expanded])` | ✅ PASS (MA morre em `:769` na iteração 1) |
| CHF-02 WHEN o usuário abre o olho THEN mantém o nó de toda pasta com alguma spec à vista como estava: expandido, com as specs listadas, ou recolhido se o usuário o recolheu | expandida: o VS Code pede as specs da pasta, estado dado `Expanded`. Recolhida pelo usuário: o VS Code não pede as specs | À vista por specs abertas: `suite.cjs:761` - `deepEqual(await expandedWhile(openEye), [id])`. `:762` - `equal(folderRow().collapsibleState, Expanded)`. Duas pastas: `:1606` - `[sideId]`, `:1609-1612` - `side/.specs` com `Expanded`. À vista só por `billing-invoices`, concluída mantida à vista (`:829` confere que é concluída, `:834` - `deepEqual(getChildren(), [])` antes): `:836` - `deepEqual(await expandedWhile(() => setHidden(api.dashboardMessage, kept, false)), [id])`. `:837` - `deepEqual(await expandedWhile(openEye), [id])`. `:838` - `equal(folderRow().collapsibleState, Expanded)`. Recolhida pelo usuário: `:841-844` fecha o olho, espera, recolhe pelo teclado (`collapseFirstRow`, `:819-823`) e espera. `:845` - `deepEqual(await expandedWhile(openEye), [])` | ✅ PASS (MD morre em `:836`, MF em `:845`, ME em `:761`, `:836` e `:1606`. Notas 9, 10 e 12) |
| CHF-03 WHEN o usuário expande o nó recolhido de uma pasta oculta THEN lista todas as specs, cada uma com a descrição terminada em "· oculta" | todas as specs da pasta; sufixo exato no fim | `suite.cjs:771-772` - `deepEqual(specs.map((n) => n.feature.name).sort(), modelNames(() => true))`. `:773` - `match(getTreeItem(n).description, / · oculta$/)` para cada uma. `:776` - `deepEqual(await expandedWhile(expandFirstRow), [id])`: expandir pelo teclado faz o VS Code pedir essas specs | ✅ PASS (nota 3) |
| CHF-04 WHILE o olho está aberto, WHEN o usuário oculta ou desoculta uma spec, mantém o nó da pasta aberto ou fechado como estava | expandida continua expandida ao ocultar a última à vista; recolhida continua recolhida ao desocultar | `suite.cjs:800` - controle `[id]`. `:801` oculta as outras pelo olho da linha. `:804` - `deepEqual(await expandedWhile(() => executeCommand('tlcSpecs.hideFeature', last)), [id])`. `:805` - `match(folderRow().description, / · oculta$/)`: o estado dado virou `Collapsed`, e o VS Code manteve a pasta aberta. `:810` - `[]`, a pasta volta recolhida. `:811` - `deepEqual(await expandedWhile(() => setHidden(api.dashboardMessage, open[0], false)), [])`. `:812` - `doesNotMatch(folderRow().description, /oculta/)` | ✅ PASS (MC morre em `:804` na iteração 1) |
| CHF-05 WHEN o usuário fecha e abre de novo o olho THEN mostra recolhido outra vez o nó da pasta com todas as specs ocultas | recolhida de novo, mesmo depois de o usuário a abrir | `suite.cjs:776` - o usuário abre a pasta (`[id]`). `:777-778` fecha o olho e espera. `:779` - `deepEqual(await expandedWhile(openEye), [])`. `:780` - `equal(folderRow().collapsibleState, Collapsed)` | ✅ PASS (nota 2) |

**Status**: 5/5 com evidência que bate com a spec, sem mutante vivo e sem gap de precisão.

### Notas da iteração 2 (linhas em 3d483ec)

9. **O Fix 1 confere com a prescrição.** Com a view em foco (`:830`), o teste oculta as abertas pelo card (`:832`), espera (`:833`) e confere a raiz vazia (`:834`). Então toda spec está oculta, e a pasta só volta porque `billing-invoices` é desocultada pelo card (`:836`). `:829` confere que ela é concluída. O VS Code pede as specs quando a pasta volta (`:836`, `[id]`), e o olho a deixa expandida (`:837`, `[id]`, e `:838`, `Expanded`). O `finally` fecha o olho e espera (`:847-848`), oculta `billing-invoices` de novo (`:849`, que apaga a escolha, EYE-10) e chama `restoreFolder` (`:850`), que fecha o olho, espera, desoculta as abertas e espera (`:787-792`). No fim, `:852` - `deepEqual(treeNames(), open)`. MD morre em `:836`. Na sonda da iteração 1, MD também falhava na abertura do olho, então `:837` o mataria sozinho.
10. **O `[]` de `:845` não é vazio.** Três provas. (a) O controle `:837`, no mesmo teste, tem o mesmo estado sem o recolher: olho fechado, pasta à vista só por `billing-invoices`, expandida. Ao abrir o olho, o VS Code pede as specs (`[id]`). (b) A sonda P0, só no scratch, repete `:830-845` com o foco e o `list.focusFirst`, mas sem o `list.collapse`. Com o código real, o log diz `added=[id] opened1=[id] opened2=[id] state=2`. Sem o recolher, a segunda abertura do olho também pede as specs. (c) MF reabre a pasta à vista a cada toque no olho e morre em `:845`, com `[id]` no lugar de `[]`. Então a view está na tela e responde naquele ponto, e o `[]` vem do `list.collapse`. O helper `collapseFirstRow` (`:819-823`) é o par de `expandFirstRow` (`:749-753`), que já prova em `:776` que `list.focusFirst` pega a linha da pasta. O teste não afirma o estado dado em `:845`. Ele continua `Expanded` porque o modelo não mudou desde `:838`, e isso não pesa no critério.
11. **Nenhum teste foi enfraquecido.** `git diff cec9614..3d483ec -- test` só acrescenta 37 linhas, o teste novo e o helper `collapseFirstRow`, e não tira nenhuma. As asserções de antes ficaram iguais.
12. **O texto novo do CHF-02 é preciso e testável.** O verbo que manda é "manter ... como estava": depois de abrir o olho, o nó tem o estado de antes. Os dois estados são observáveis (o VS Code pede ou não as specs da pasta), e os dois têm teste com o valor exato (notas 9 e 10). O texto segue L-026 e bate com "como hoje", porque antes do feature a pasta à vista que o usuário recolheu também continuava recolhida. Há uma nota de redação que não bloqueia. A lista depois dos dois-pontos só cita "recolhido se o usuário o recolheu", mas há outro caminho. O olho traz a pasta recolhida (CHF-01), e uma spec dela volta à vista pelo card com o olho aberto (CHF-04, `:811`). Depois de fechar e abrir o olho, a pasta continua recolhida sem que o usuário a tenha recolhido. O código faz o que "como estava" pede, porque o nó fica na árvore com o mesmo `id`. Quem ler a lista como completa contradiz o próprio "manter". Trocar por "ou recolhido, se estava recolhido" fecha a brecha. Os Goals (`spec.md:10`) ainda dizem "continuam expandidas, como hoje". A premissa (`spec.md:31`) segue com "n". O texto não veio do usuário, então convém confirmar no UAT.

### Notas da iteração 1 (linhas em cec9614; no teste de duas pastas, somar 37 para achar a linha em 3d483ec)

1. **A observação `expandedWhile` é sólida e não vazia.** O helper (`suite.cjs:731-746`) troca `getChildren` na instância do provider e anota o `project.id` de cada nó `root` que o VS Code pede. No VS Code instalado (1.120.0), o extension host chama `this._dataProvider.getChildren(e)` a cada busca (`extensionHostProcess.js`). O objeto é o mesmo de `api.featuresTree` (`src/extension.ts:48-50`, `:111`). Nenhum código da extensão chama `getChildren` (grep em `src/`), então só o VS Code aparece na lista. O `delete` do `finally` devolve o método do protótipo. No workbench, `collapseByDefault:p=>p.collapsibleState!==2` (`workbench.desktop.main.js`) usa o estado dado quando a árvore cria o nó. As duas direções já falharam com um mutante: MA trocou `[]` por `[id]` em `:769`, `:810` e `:1569`, e MC trocou `[id]` por `[]` em `:804`. Os controles que esperam lista cheia (`:761`, `:776`, `:800`, `:804`, `:1569`) passaram em todas as execuções que chegaram neles sem um mutante no caminho. Então a view estava na tela e respondia.
2. **As duas premissas medidas conferem.** Com o `id` fixo (`src/ui/featuresTree.ts:166`, igual ao de antes do feature), o CHF-05 passa em `:779`. O VS Code esquece a expansão de um nó que saiu da árvore. MC (o `id` segue o estado oculto) morre em `:804`. O VS Code usa o estado dado num nó de `id` novo, então o `id` fixo é o que mantém o CHF-04. Notas do autor: (a) a variante com `id` novo a cada abertura saiu, porque o `id` não mudou no diff. (b) Com o `id` fixo, o CHF-05 passou nas execuções 1, 3, 4 e 5. (c) A falha antiga do CHF-04 por poluição não foi reproduzida por mim. Tenho só o log do autor (`scratchpad/itx.log`), que mostra `[]` no controle inicial, o que bate com uma pasta que entrou recolhida. Com `restoreFolder` (`:787-792`), o controle `:800` passou nas execuções 1, 2, 3, 4 e 5. (d) As esperas (`treeSettled`) estão antes de cada passo observado (`:768`, `:778`, `:803`, `:809`, `:1567`) e dentro do `expandedWhile`.
3. **CHF-03.** A lista (`:771-773`) é afirmada no provider, que é o que o VS Code recebe. `:776` prova que o VS Code pede essa lista quando o usuário expande. O estado não muda entre as duas linhas. Aceito (L-002).
4. **MD e a sonda (Fix 1).** MD troca só a condição do estado recolhido (`:163`) por `p.features.length > 0 && p.features.every((f) => f.health === 'complete' || this.isHidden(node.loaded, f))`, e a descrição segue com a regra real. Toda concluída conta como oculta para recolher, mesmo mantida à vista pelo olho. A pasta à vista só por `billing-invoices` recebe `Collapsed`. Isso aparece para o usuário quando o VS Code acrescenta essa pasta: ao recarregar a janela, ou quando ela volta pelo card com o olho fechado. Ela fica recolhida, e continua recolhida quando o olho abre, contra o CHF-02. MD passou em tudo (execução 4). Na execução 5, pus MD atrás de uma flag e acrescentei uma sonda só no scratch, rodada uma vez sem a flag e outra com ela. Com o olho fechado, a sonda oculta as abertas, espera, desoculta `billing-invoices` pelo card, observa e abre o olho. Com a regra real, o log diz `added=[id] opened=[id] state=2`, e o teste passou. Com MD, diz `added=[] opened=[] state=1`, e o teste falhou em `expandedWhile(openEye)`, com `[]` no lugar de `[id]`. O teste do Fix 1 é esse.
5. **Gap de precisão no CHF-02 (Fix 2).** O CHF-02 dizia "SHALL mostrar expandido" o nó de toda pasta com spec à vista quando o olho abre. Uma pasta à vista que o usuário recolheu à mão com o olho fechado continua na árvore. Pela premissa do CHF-04, o VS Code mantém o estado dela, então ela continua recolhida quando o olho abre. É o comportamento de antes ("como hoje", Goals), mas o texto do CHF-02 dizia o contrário, e nenhuma premissa cobria o caso. Nada no código muda. O que faltava era a spec dizer o que acontece com esse nó. Resolvido em 3d483ec (nota 12).
6. **O CHF-04 veio do autor.** Ele entrou em 57b317f, junto com duas premissas medidas, as duas com "n" em Confirmed. Ocultar a última spec à vista com o olho aberto deixa a pasta expandida com "· oculta". Desocultar uma spec numa pasta recolhida deixa a pasta recolhida. Convém o usuário confirmar no UAT.
7. **Gatilhos (L-009).** O olho do título roda `tlcSpecs.showHidden` e `tlcSpecs.hideHidden` (`package.json`, `view/title`), e os testes rodam esses comandos (`:724-725`). O CHF-04 oculta pelo olho da linha (`tlcSpecs.hideFeature`, `:801`, `:804`) e desoculta pelo card (`:811`). Todos passam por `hidden.onDidChange` (`src/ui/featuresTree.ts:81`). A spec não lista outros gatilhos.
8. **Lições conferidas.** L-002: o estado é afirmado no que o VS Code faz (pede ou não pede as specs), além do provider. L-014: o estado recolhido é esperado nos dois valores (`Collapsed` em `:770`, `:780`, `:1574`; `Expanded` em `:762`, `:1574`), e `expandedWhile` é esperado vazio e cheio. L-020 não foi seguida para a regra nova: a concluída mantida à vista, que cumpre as duas condições, faltava (MD). L-006 não se aplica. L-025 ainda é candidata, mas o teste de duas pastas a segue (`:1555-1582`), e MB morre nele.

---

## Discrimination Sensor

### Iteração 2 (3d483ec)

Scratch: `git worktree add --detach <scratchpad>/wtv2 3d483ec`, com junction de `node_modules` para o real. Cada mutante é uma troca de texto que exige uma ocorrência só, aplicada por script (`scratchpad/chf2-mutate.py`) em `src/ui/featuresTree.ts` do scratch e desfeita com `git checkout -- .`. Depois de cada reversão, o `git status --porcelain` do scratch ficou vazio. Não usei `git stash`. Antes de cada execução, rodei `npm run build` e conferi o mutante no `dist/extension.cjs`. O log mostra a extensão carregada do scratch nas três suítes de cada execução.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| MD | `src/ui/featuresTree.ts:163` | O mesmo texto da iteração 1: só a condição do estado recolhido passa a contar toda concluída como oculta, mesmo mantida à vista pelo olho. A descrição segue com `hidden` | ✅ Killed (`test/integration/suite.cjs:836`, `[]` no lugar de `[id]`: a pasta volta pelo card recolhida. 71/72. Mutante em `dist/extension.cjs:1683`) |
| MF | `src/ui/featuresTree.ts:166` | O `id` segue o olho: `` `root:${pid}:${this.show}` ``. A cada toque no olho, o VS Code vê um nó novo em toda pasta e usa o estado dado, então a pasta à vista que o usuário recolheu volta expandida. Uma flag em `globalThis` o desliga, só durante a sonda P0 | ✅ Killed (`suite.cjs:845`, `[id]` no lugar de `[]`. 72/73 com a sonda. Mutante em `dist/extension.cjs:1686`) |
| ME | `src/ui/featuresTree.ts:163` | Sempre `Collapsed`, mesmo com spec à vista | ✅ Killed (`suite.cjs:761`, `:800`, `:836` e `:1606`, cada um com `[]` no lugar da lista cheia. 68/72. Mutante em `dist/extension.cjs:1683`) |

Sonda P0 (só no scratch, não é mutante): os passos de `:830-845`, com o foco e o `list.focusFirst`, mas sem o `list.collapse`, e com MF desligado. Ficou no fim da suíte, depois do teste de duas pastas, e passou (nota 10).

MF e P0 rodaram juntos na execução 3, porque os pontos de falha não se cruzam. O único ponto previsto para MF é `:845`, num teste que roda antes da sonda. A sonda desliga MF antes do primeiro passo e o religa no `finally`. Ela começa tirando a pasta da árvore (todas ocultas), então a troca de `id` ao desligar não deixa rastro. Na execução 3 falhou só o teste de `:825`, em `:845`. As falhas das execuções 2, 3 e 4 caíram nas linhas que previ antes de cada uma.

Não rodei um mutante que recolhe de novo, ao abrir o olho, a pasta à vista expandida (`id` com o olho e `Collapsed` com o olho aberto), porque as execuções acabaram. Pela leitura, ele cairia em `:761` e `:837`. Não entra na contagem.

**Sensor depth**: lightweight (padrão, sem caminho P0), com 3 mutações e uma sonda.
**Result**: 3/3 mortas (MD, MF, ME), e a sonda P0 passou. PASS ✅

**Execuções que abriram o VS Code**: 4 das 4 permitidas. Todas rodaram no desktop oculto, em primeiro plano e uma por vez, no scratch. Logs em `scratchpad/v2-run1-baseline.log`, `v2-run2-MD.log`, `v2-run3-MF-P0.log` e `v2-run4-ME.log`.

| # | Execução | Resultado |
| - | -------- | --------- |
| 1 | Gate, sem mutação | 72/72 + 1/1 + 1/1, exit 0 |
| 2 | MD | 71/72 + 1/1 + 1/1, exit 1. Falha só em `:836` |
| 3 | MF + sonda P0 | 72/73 + 1/1 + 1/1, exit 1. Falha só em `:845`. P0 passou |
| 4 | ME | 68/72 + 1/1 + 1/1, exit 1. Falhas só em `:761`, `:800`, `:836` e `:1606` |

**Instabilidade**: nenhum sinal. Os quatro testes CHF passaram na execução 1. Os controles que esperam lista cheia passaram em toda execução sem mutante no caminho: `:761`, `:776`, `:800`, `:804` e `:1606` nas execuções 1, 2 e 3; `:836` e `:837` nas execuções 1 e 3; e os três da sonda na execução 3. Nenhuma falha caiu fora das linhas previstas, e `startup.cjs` e `multiroot.cjs` passaram nas quatro.

**Isolamento**: o `git status --porcelain` da árvore real estava vazio antes e depois, e o HEAD seguiu em 3d483ec. Tirei a junction com `cmd /c rmdir`, sem recursão, e depois rodei `git worktree remove --force` e `git worktree prune`. O `git worktree list` mostra só a árvore real. O `node_modules` real tinha 129 entradas visíveis antes e depois, e `npm ls --depth=0` deu exit 0.

### Iteração 1 (cec9614, histórico)

Scratch: `git worktree add --detach <scratchpad>/wtv cec9614`, com junction de `node_modules` para o real. Cada mutante é uma troca de texto que exige uma ocorrência só, aplicada por script (`scratchpad/chf-mutate.py`) em `src/ui/featuresTree.ts` do scratch e desfeita com `git checkout -- .`. Depois da reversão, o `git status --porcelain` do scratch ficou vazio. Não usei `git stash`. Antes de cada execução, rodei `npm run build` e conferi o mutante no `dist/extension.cjs`. O log mostra a extensão carregada do scratch nas três suítes.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| MA | `src/ui/featuresTree.ts:163` | Sempre `Expanded`, como antes do feature | ✅ Killed (`test/integration/suite.cjs:769`, `:810` e `:1569`, cada um com o `.specs` a mais na lista. 68/71. Mutante em `dist/extension.cjs:1683`) |
| MB | `src/ui/featuresTree.ts:163` | Regra global: `this.store.projects.some((q) => this.allHidden(q)) ? C.Collapsed : C.Expanded`. Toda pasta é recolhida quando alguma está toda oculta | ✅ Killed (`suite.cjs:1572`, `[1, 1]` no lugar de `[1, 2]`. `:1569` passou, porque `side/.specs` já estava expandida na árvore. Mutante em `dist/extension.cjs:1683`) |
| MC | `src/ui/featuresTree.ts:166` | O `id` segue o estado oculto: `` `root:${pid}${hidden ? ':oculta' : ''}` ``. O VS Code vê um nó novo quando a pasta fica toda oculta ou volta | ✅ Killed (`suite.cjs:804`, `[]` no lugar de `[id]`. Mutante em `dist/extension.cjs:1686`) |
| MD | `src/ui/featuresTree.ts:163` | Só o estado recolhido ignora o olho de uma concluída mantida à vista: `p.features.length > 0 && p.features.every((f) => f.health === 'complete' \|\| this.isHidden(node.loaded, f))`. A descrição segue com `hidden` | ❌ Survived → Fix 1 (71/71 + 1/1 + 1/1, exit 0. Mutante em `dist/extension.cjs:1683`). Morta na iteração 2 |

MB e MC rodaram juntos na execução 3, porque os pontos de falha não se cruzam. MC muda o `id` só quando a pasta que estava na árvore muda de estado oculto. Isso só acontece no CHF-04. No primeiro teste, a pasta sai e volta com o mesmo `id` a cada vez. No teste de duas pastas, `.specs` só entra depois de oculta. MB só muda alguma coisa com duas pastas, e as duas primeiras CHF têm uma pasta só. Na execução 3 falharam só esses dois testes (69/71), cada um com a assinatura do seu mutante.

Não rodei três variantes. (a) Recolher só com o olho aberto (`this.show && hidden`) é equivalente, porque com o olho fechado a pasta toda oculta não está em `getChildren` (`:110`), e o VS Code nunca pede o item dela. (b) Sempre `Collapsed` ficou fora do limite de execuções. Rodou na iteração 2 como ME. (c) Trocar a regra em `hidden` (`:159`), que também muda a descrição, falha no teste do hidden-folder em `:710`, que afirma a descrição sem "· oculta" com `billing-invoices` à vista. Nenhuma das três entrou na contagem.

Placar da iteração 1: 3/4 mortas, MD viva, e por isso a iteração foi reprovada. Profundidade: lightweight, com 4 mutações no código novo e uma sonda de confirmação.

Execuções da iteração 1: 5 das 5 permitidas, todas no desktop oculto, em primeiro plano e uma por vez, no scratch.

| # | Execução | Resultado |
| - | -------- | --------- |
| 1 | Gate, sem mutação | 71/71 + 1/1 + 1/1, exit 0 |
| 2 | MA | 68/71 + 1/1 + 1/1, exit 1. Falhas só em `:769`, `:810` e `:1569` |
| 3 | MB + MC | 69/71 + 1/1 + 1/1, exit 1. Falhas só em `:804` (MC) e `:1572` (MB) |
| 4 | MD | 71/71 + 1/1 + 1/1, exit 0. MD sobreviveu |
| 5 | MD atrás de uma flag, mais a sonda (nota 4) | 72/73 + 1/1 + 1/1, exit 1. Os 71 testes da suíte passaram com a flag desligada, e a sonda também. Com a flag ligada, a sonda falhou em `expandedWhile(openEye)` |

Instabilidade na iteração 1: nenhum sinal. Os três testes CHF passaram nas execuções 1, 4 e 5, sem mutação no caminho deles. Nas execuções 2 e 3, cada falha caiu na linha prevista antes da execução, com a assinatura do mutante, e o resto ficou verde. Nenhum controle que espera lista cheia falhou sem mutante.

Isolamento na iteração 1: o `git status --porcelain` da árvore real estava vazio antes e depois, e o HEAD seguiu em cec9614. Tirei a junction com `cmd /c rmdir`, sem recursão, e depois rodei `git worktree remove --force` e `git worktree prune`. O `git worktree list` mostrava só a árvore real. O `node_modules` real tinha 129 entradas visíveis antes e depois, e `npm ls --depth=0` deu exit 0.

---

## Interactive UAT Results (if performed)

Não executado, porque o Verifier roda sem usuário. O primeiro critério de sucesso (`spec.md:84`) é cumprido por `test/integration/suite.cjs:1606`: ao abrir o olho, o VS Code pede as specs de `side/.specs` e não as de `.specs`. Ficam para o orquestrador o teste independente (`spec.md:56`) e o segundo critério de sucesso (`spec.md:85`): neste repositório, reinstalar a extensão, abrir o olho e ver o nó `visual-tlc` recolhido, e expandir para ver as specs com "· oculta". Convém também mostrar ao usuário o CHF-04 (nota 6) e o texto novo do CHF-02 (nota 12). As duas premissas seguem com "n".

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Uma constante, um ternário e um comentário curto (`src/ui/featuresTree.ts:159-165`). A descrição reusa a constante. A iteração 2 não mudou código |
| Surgical changes | ✅ Só o caso `root` de `getTreeItem`, a suíte, o README e a spec. 3d483ec só mexe em `suite.cjs` e `spec.md` |
| No scope creep | ✅ Pastas à vista, árvore Projeto e painel não mudaram (Out of Scope) |
| Matches patterns | ✅ Mesmo formato dos outros estados em `getTreeItem` (`:174`, `:188`). Os testes seguem os helpers do hidden-folder (`setHidden`, `folderRow`, `treeSettled`, `setFolders`, `waitForRoots`). `collapseFirstRow` (`suite.cjs:819-823`) é o par de `expandFirstRow` (`:749-753`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ Estados e listas afirmados com o valor exato, nos dois sentidos |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Cada AC tem teste no VS Code real. O CHF-02 cobre as duas regras que deixam uma spec à vista (aberta em `:761`, concluída mantida à vista em `:836-838`) e o estado que o usuário deu (`:845`) |
| Every test in scope maps to a spec requirement - no unclaimed tests | ✅ Os quatro testes novos têm CHF no título |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes**: de `54153ce` a `3d483ec`, só entraram linhas em `test/` (163, nenhuma saiu). De `cec9614` a `3d483ec`, entraram 37 e nenhuma saiu (nota 11). `suite.cjs` foi de 68 para 72 testes e de 282 para 308 linhas com `assert.`. O unit não mudou (68).

---

## Edge Cases

- [x] CHF-05 Fechar e abrir o olho de novo traz a pasta recolhida outra vez, mesmo depois de o usuário abri-la: `test/integration/suite.cjs:776-780`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`. Typecheck e unit na árvore real, que não gravam nada (`noEmit`). A integração rodou no desktop oculto, no scratch em 3d483ec, sem mutação
- **Typecheck**: exit 0
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 72/72 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1 da iteração 2)
- **Test count before feature**: 68 unit e 68 + 1 + 1 integration (54153ce)
- **Test count after feature**: 68 unit e 72 + 1 + 1 integration (3d483ec)
- **Delta**: +4 integration (`suite.cjs:755`, `:794`, `:825`, `:1592`)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans (if issues found)

Nenhum fix novo. Os dois da iteração 1 foram feitos em 3d483ec.

### Fix 1 (iteração 1): CHF-02 com uma pasta à vista só por uma concluída mantida à vista

- **Root cause**: nos testes, a spec que deixava a pasta à vista era sempre aberta. Nenhum teste distinguia `isHidden` de "concluída conta como oculta" na regra do estado recolhido, então MD (`src/ui/featuresTree.ts:163`) passava.
- **Fix task**: só teste, na seção do collapsed-hidden-folder, depois do CHF-04, com os passos da sonda da iteração 1.
- **Status**: ✅ Feito em 3d483ec (`suite.cjs:825-852`). MD morre em `:836`, e o gate está verde (nota 9).
- **Priority**: Major

### Fix 2 (iteração 1): o CHF-02 e a pasta à vista que o usuário recolheu

- **Root cause**: o CHF-02 pedia "expandido" para toda pasta com spec à vista quando o olho abre, e uma pasta à vista que o usuário recolheu continua recolhida.
- **Fix task**: decidir o texto na spec. Se a spec passasse a exigir o caso, um teste recolheria a pasta com `list.collapse` e esperaria `[]` ao abrir o olho.
- **Status**: ✅ Feito em 3d483ec. O CHF-02 (`spec.md:52`) e a premissa (`spec.md:31`) dizem "como estava", e o teste está em `suite.cjs:840-845` (notas 10 e 12). Troca de redação opcional na nota 12.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CHF-01 | Verified | ✅ Verified |
| CHF-02 | Implementing | ✅ Verified (premissa "n", nota 12) |
| CHF-03 | Verified | ✅ Verified (nota 3) |
| CHF-04 | Verified | ✅ Verified (premissa "n", nota 6) |
| CHF-05 | Verified | ✅ Verified (nota 2) |

Linha de cobertura proposta: "5 total, 5 verificados."

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 requisitos com evidência que bate com a spec, sem gap de precisão
**Sensor**: 3/3 mortas na iteração 2 (MD, MF, ME), e a sonda P0 passou. Somando a iteração 1, MA, MB, MC, MD, MF e ME morreram
**Gate**: typecheck ok, 68 unit, 72 + 1 + 1 integration, 0 falhas

**What works**: com o olho aberto, a pasta com todas as specs ocultas volta recolhida, sem que o VS Code peça as specs dela, com uma pasta ou com duas. A pasta com spec à vista continua como estava: expandida, seja a spec aberta ou uma concluída mantida à vista pelo olho, e recolhida se o usuário a recolheu. Expandir pelo teclado lista todas as specs com "· oculta". Fechar e abrir o olho traz a pasta oculta recolhida de novo. Ocultar ou desocultar com o olho aberto não abre nem fecha a pasta.

**Issues found**: nenhum que bloqueie. Nota de redação no CHF-02 e nos Goals (nota 12).

**Next steps**: passar a rastreabilidade da spec para "5 total, 5 verificados". No UAT, reinstalar a extensão, fazer o teste independente e o segundo critério de sucesso, e confirmar com o usuário as premissas do CHF-02 e do CHF-04.
