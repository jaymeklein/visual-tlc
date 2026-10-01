# Eye On Every Spec Validation

## Validation: eye-on-every-spec - PASS ✅

Aprovada na iteração 1. Os 11 requisitos batem com a spec, e a evidência de cada um discrimina. Não há gap de precisão. O sensor rodou 24 mutações e matou as 23 que mudam comportamento. A outra, C9, é equivalente: troca o nome da lista nova, que nenhuma versão anterior gravou. Os testes do hidden-specs que diziam "concluída sem olho" e "concluída sem esmaecido" viraram a regra nova, e nenhuma outra asserção saiu. O gate em b438661 está verde: typecheck ok, 68 unit, 63 + 1 + 1 integration.

**Date**: 2026-09-30
**Spec**: `.specs/features/eye-on-every-spec/spec.md`
**Diff range**: branch `feat/hidden-specs`, commits do olho: T1 abcd78b, T2 1aa9934, T3 5767f3c, T4 0de28fe. Spec em 41821b4. Os commits c7f3046, 81406a3, 87b3b5a, 6901713 e b438661 são do specs-folder-paths, fora do escopo. Linhas citadas em b438661
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b438661 | Aprovada | 11/11 requisitos batem e discriminam. 0 gaps de precisão. 23/23 mortas, mais C9 equivalente. 4 execuções do VS Code |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Escolha por spec: oculta, à vista ou nenhuma | ✅ Done | abcd78b. `src/core/hidden.ts:13-19` (duas chaves e `Choice`), `:25` (`isHidden`), `:41-44` (`choiceOf`), `:60-71` (`set` com a regra do padrão). As quatro chamadas passam `complete` |
| T2 Olho em todo card | ✅ Done | 1aa9934. `src/webview/render.ts:94-98` (`choiceOf`, `hiddenOf`), `:187` (`withDone`), `:255-260` (`eyeButton` sem o retorno vazio), `:271` (`is-hidden` por `hiddenOf`) |
| T3 Host e árvore com a escolha | ✅ Done | 5767f3c. `src/core/protocol.ts:36`, `src/ui/dashboard.ts:97`, `:117`, `src/ui/featuresTree.ts:96-97`, `:273-277`, `src/extension.ts:46`, `:65-66`, `src/webview/main.ts:17`, `:32`, `package.json:166-221` sem `feature.done`. `isMarked` saiu |
| T4 Documentar o olho em toda spec | ✅ Done | 0de28fe. `README.md:12`, `:25-27`. Notas em `.specs/features/hidden-specs/spec.md:86` e `:92` (nota 6) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EYE-01 The extensão mostra um olho em toda spec, na linha e no card, concluída ou não | linha com `contextValue` `feature` ou `feature.hidden`, cada um com o seu olho inline; card com um botão `hide` ou `unhide` | **Linha:** `test/integration/suite.cjs:531-532` - `hideFeature` inline em `viewItem == feature`, `unhideFeature` em `viewItem == feature.hidden`. `:542` - em andamento `'feature'`. `:543` - marcada `'feature.hidden'`. `:546` - concluída sem escolha `'feature.hidden'`. `:549` - concluída à vista `'feature'`. **Card:** `test/unit/webview.test.ts:329`, `:330`, `:332`, `:335`, `:338` - um olho em cada um dos cinco casos | ✅ PASS |
| EYE-02 WHILE à vista, olho aberto "Ocultar spec" | comando `hideFeature` com `$(eye)` e "Ocultar spec"; card `{ action: 'hide', title: 'Ocultar spec', glyph: 'eye-open' }` | `suite.cjs:528` - `deepEqual(declared('tlcSpecs.hideFeature'), { ..., title: 'Ocultar spec', ..., icon: '$(eye)' })`. `:542`, `:549`, `:620` - `'feature'`. `webview.test.ts:329` (em andamento) e `:338` (concluída à vista) - `[{ action: 'hide', title: 'Ocultar spec', glyph: 'eye-open' }]` | ✅ PASS |
| EYE-03 WHILE oculta, olho fechado "Desocultar spec" | comando `unhideFeature` com `$(eye-closed)` e "Desocultar spec"; card `{ action: 'unhide', title: 'Desocultar spec', glyph: 'eye-closed' }` | `suite.cjs:529` - `title: 'Desocultar spec'`, `icon: '$(eye-closed)'`. `:543`, `:546` - `'feature.hidden'`. `webview.test.ts:330` (marcada), `:332` (concluída sem escolha), `:335` (marcada e concluída) - `[{ action: 'unhide', title: 'Desocultar spec', glyph: 'eye-closed' }]` | ✅ PASS |
| EYE-04 WHEN "Ocultar spec", na árvore ou no card, THEN sai da árvore e do quadro com o olho geral fechado e soma às ocultas, concluída ou não | fora da árvore e do quadro; número +1 | **Em andamento, linha:** `suite.cjs:566-571` - fora de Features, mensagem `done + 1`, fora da aba, `ocultas(done + 1)`. **Em andamento, card:** `:1004-1011` - fora da aba e da lateral, `ocultas(before + 1)`; `:490-491` - mensagem `done + 1`. **Concluída à vista, linha:** `:623-625` - `ok(!treeNames().includes('billing-invoices'))`, `message(done)`. **Concluída à vista, card:** `:645-649` - fora da aba, 5 colunas, `ocultas(done)`. **Core:** `test/unit/hidden.test.ts:100-101` - `set(billing, true, false)` grava `'hidden'` | ✅ PASS (nota 1) |
| EYE-05 WHEN "Desocultar spec" numa concluída THEN aparece na árvore e na coluna Concluídas com o olho geral fechado, e sai do número | na árvore, no Concluídas, número -1 | **Linha:** `suite.cjs:617-621` - `unhideFeature` com o nó, olho do título fechado, `ok(treeNames().includes('billing-invoices'))`, `'feature'`, `message(done - 1)`. **Card:** `:639-643` - na aba, `kept.columns === 6`, `ocultas(done - 1)`, título `'Mostrar as specs ocultas'` (olho fechado). **Coluna:** `webview.test.ts:366-370` - seis rótulos até `'Concluídas'`, `doneCards` = `['billing-invoices']`, `'0 ocultas'`. **Core:** `hidden.test.ts:84`, `:90-94` | ✅ PASS (nota 1) |
| EYE-06 WHILE concluída sem escolha, é tratada como oculta | oculta | `hidden.test.ts:74` - `equal(isHidden(f('complete'), undefined), true)`. `webview.test.ts:238-240` - quadro sem as concluídas, cinco etapas. `suite.cjs:546` - `'feature.hidden'`. `:595` - `' · oculta'`. `:613` - fora de Features. `:636-637` - 5 colunas, `ocultas(done)` | ✅ PASS |
| EYE-07 WHILE olho geral fechado e há concluída à vista, coluna Concluídas com ela, seis etapas | seis colunas, a última Concluídas com a concluída à vista | `webview.test.ts:366` - `['Spec', 'Design', 'Tasks', 'Execução', 'Verificação', 'Concluídas']`. `:367` - `doneCards` = `['billing-invoices']`. `:369` - `boardClass === 'board'`. `suite.cjs:641` - `kept.columns === 6`. Sem concluída à vista: `webview.test.ts:239-240`, `suite.cjs:636`, `:648` - cinco | ✅ PASS |
| EYE-08 WHILE olho geral aberto, toda oculta esmaecida no painel e com "· oculta" na árvore, concluída ou não | `is-hidden` com opacidade menor e " · oculta" em toda oculta; ausente na spec à vista | **Card:** `webview.test.ts:356` - `'card h-ok is-hidden'`. `:359` - `'card h-complete is-hidden'`. `:357` e `:361` - sem `is-hidden` à vista. `:376-378` - uma regra `.card.is-hidden` com opacidade < 1. **Linha:** `suite.cjs:593` e `:595` - `match(/ · oculta$/)`. `:591` e `:598` - `doesNotMatch(/oculta/)` à vista | ✅ PASS |
| EYE-09 WHEN o VS Code reabre o workspace THEN as escolhas continuam | uma instância nova sobre o mesmo estado lê as duas listas | `hidden.test.ts:92` - `equal(reopened.choiceOf(billing), 'shown')`. `:93-94` - `shownKeys` e `keys`. `:99` - uma marca antiga de `tlcSpecs.hidden` segue `'hidden'`. `:101-102` - `'hidden'` numa instância nova. Ligação ao `workspaceState`: `src/extension.ts:44`, sem mudança | ✅ PASS (nota 2) |
| EYE-10 WHEN oculta uma concluída à vista THEN apaga a escolha, e ela volta a ser oculta por ser concluída | escolha `undefined`, as duas listas vazias, oculta | `hidden.test.ts:111` - `equal(reopened.choiceOf(billing), undefined)`. `:112-113` - `keys` e `shownKeys` vazias. `:122-124` - escolha igual ao padrão não grava nem avisa. `suite.cjs:623-625` e `:647-649` - oculta de novo | ✅ PASS |
| EYE-11 WHEN uma oculta à mão é aberta pela árvore ou por notificação THEN mostra o detalhe, como no HID-15 | detalhe da spec com o olho fechado | `webview.test.ts:318-319` - `DEFAULT_VIEW` com csv-export marcada e selecionada mostra o título do detalhe. `suite.cjs:1223-1226` - marca, `showFeature`, `r.detail === 'csv-export'`, `toggle === null` | ✅ PASS (nota 3) |

**Status**: ✅ All ACs covered. 11/11 batem com a spec e discriminam. 0 gaps de precisão.

### Notas

1. **EYE-04/EYE-05, os dois gatilhos.** Cada gatilho da concluída é afirmado nas suas superfícies: a linha na árvore e na mensagem (`suite.cjs:617-625`), o card na aba e no número (`:639-649`). O cruzamento (linha → painel, card → árvore) passa pelo mesmo `HiddenSpecs` e pelo `onDidChange`, que o HID-11/12 prova nos dois sentidos para a spec em andamento (`:566-571`, `:1004-1011`, `:490-491`). O que é próprio da concluída é o `complete` vindo do store, e ele morre nos dois lados: H6 em `:619` (linha), H4 em `:598` e `:640` (card). Aceito. O teste na aba conta colunas e cards, não a coluna de cada card. A coluna vem de `columnOf` (`render.ts:108`), que não mudou, e o unit a fixa (`webview.test.ts:367`).
2. **EYE-09, a ligação ao `workspaceState`.** Mesmo caso do HID-13 no hidden-specs (nota 3 de lá): o unit prova as duas listas com um `Memento` falso lido por uma instância nova. C8, que não grava `tlcSpecs.shown`, morre em `:92`. C7, que troca a chave antiga, morre em `:99`. A ligação é a linha `new HiddenSpecs(context.workspaceState)` (`src/extension.ts:44`), que este feature não mudou. Nenhum teste recarrega o VS Code. Aceito pela mesma razão. O critério de sucesso "continua à vista depois de recarregar a janela" fica para o UAT.
3. **EYE-11.** O caso é o do HID-15, sem código novo aqui: `detail()` não olha a escolha. As provas do hidden-specs seguem valendo, e a notificação usa o mesmo `dashboard.showSide`. Nenhum mutante novo rodou nele.
4. **Premissas "n" da spec.** Concluída à vista que volta a falhar segue à vista: `hidden.test.ts:85`. Oculta à mão e depois concluída segue oculta: `hidden.test.ts:76`, `webview.test.ts:335`. Número de ocultas conta uma vez: `webview.test.ts:300`, `:371`. Escolha igual ao padrão não é gravada: `hidden.test.ts:116-125`. Sem concluída à vista, cinco etapas: `webview.test.ts:239-240`.
5. **Lições conferidas.** L-002: o painel é afirmado nos cards, colunas e no botão do topo; a árvore nos filhos, no `TreeItem` e na mensagem. L-009: esconder e mostrar a concluída passam pela linha (comando com o nó, `suite.cjs:617`, `:623`) e pelo card (mensagem do host, `:548`, `:639`, `:645`). L-006 e L-014 não se aplicam. As candidatas valem: L-020 na concluída marcada (`webview.test.ts:335`) e na conta com uma marcada e uma à vista (`:371`); L-021 na ausência de `is-hidden` e de "· oculta" à vista (`:357`, `:361`, `suite.cjs:591`, `:598`); L-022 no zero (`webview.test.ts:370`); L-024 na escolha igual ao padrão sozinha (`hidden.test.ts:116-125`). Nenhuma lição confirmada se repetiu.
6. **Nota no hidden-specs.** A nota do HID-09/10 (`.specs/features/hidden-specs/spec.md:86`) fica entre os itens 10 e 11, sem linha em branco antes do 11. O parser da extensão lê os itens por linha (`src/core/spec.ts:27`) e não se afeta. O `marked` 18 do projeto separa a citação da lista. No CommonMark, um item que não começa em 1 não interrompe parágrafo, então no preview do VS Code os itens 11 a 14 podem cair dentro da citação. Cosmético. Correção: uma linha em branco depois da nota, ou a nota depois do item 14, como a do HID-14 (`:92`).
7. **A precondição do EYE-05/07 na aba.** `suite.cjs:635` aceita o primeiro relatório sem billing-invoices, sem esperar o número. Na execução 2 do sensor, os dois testes anteriores caíram cedo, e o teste leu um relatório velho, com csv-export ainda oculta: `'2 ocultas'` em `:637`. Sem mutante, o teste anterior demora o bastante, e o gate passa. Sugestão, não gap: pôr `r.toggle?.text === ocultas(done)` no predicado de `:635`.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-eye b438661`, com junction de `node_modules` para o real. Cada mutante é uma troca de texto com uma ocorrência exigida, aplicada por script e desfeita com `git checkout -- .` no scratch. `git status --porcelain` do scratch vazio depois de cada reversão. Sem `git stash`. O unit rodou uma mutação por vez, com `npm run typecheck` e `npm test`: todas compilam. A integração rodou em três lotes, e cada mutante do lote falha num ponto só dele.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/hidden.ts:25` | `isHidden` sem `choice !== 'shown'`: concluída sempre oculta | ✅ Killed (`test/unit/hidden.test.ts:84`; `webview.test.ts:338`, `:361`, `:366`) |
| C2 | `src/core/hidden.ts:25` | `isHidden` sem `choice === 'hidden'`: a marcada em andamento fica à vista | ✅ Killed (`hidden.test.ts:75`; 6 testes do webview, a começar por `:246`) |
| C3 | `src/core/hidden.ts:43` | `choiceOf` ignora a lista das à vista | ✅ Killed (`hidden.test.ts:92`, `:113`) |
| C4 | `src/core/hidden.ts:61` | `set` grava sempre a escolha, sem a regra do padrão | ✅ Killed (`hidden.test.ts:37`, `:111`, `:122`) |
| C5 | `src/core/hidden.ts:64` | `set` não tira a spec da lista das ocultas | ✅ Killed (`hidden.test.ts:37`, `:59`) |
| C6 | `src/core/hidden.ts:65` | `set` não tira a spec da lista das à vista | ✅ Killed (`hidden.test.ts:111`) |
| C7 | `src/core/hidden.ts:14` | Chave antiga `tlcSpecs.hidden` trocada: as marcas gravadas se perdem | ✅ Killed (`hidden.test.ts:99`) |
| C8 | `src/core/hidden.ts:69` | `set` não grava `tlcSpecs.shown` | ✅ Killed (`hidden.test.ts:92`) |
| C10 | `src/core/hidden.ts:62` | `set` sem o retorno quando nada muda: avisa sempre | ✅ Killed (`hidden.test.ts:55`, `:122`) |
| R1 | `src/webview/render.ts:96` | `choiceOf` do painel ignora `ctx.shown` | ✅ Killed (`webview.test.ts:338`, `:361`, `:366`) |
| R2 | `src/webview/render.ts:187` | `withDone` volta a ser só o olho geral | ✅ Killed (`webview.test.ts:366`) |
| R3 | `src/webview/render.ts:187` | `withDone` sem o olho geral: com o filtro sem concluída, cinco etapas com o olho aberto | ✅ Killed (`webview.test.ts:163`, SIDE-04) |
| R4 | `src/webview/render.ts:257` | O olho do card volta a olhar só a marca | ✅ Killed (`webview.test.ts:332`) |
| R5 | `src/webview/render.ts:255` | Volta `if (f.health === 'complete') return ''` | ✅ Killed (`webview.test.ts:332`) |
| R6 | `src/webview/render.ts:271` | `is-hidden` só na marcada | ✅ Killed (`webview.test.ts:359`) |
| R7 | `src/webview/render.ts:271` | `is-hidden` em toda concluída | ✅ Killed (`webview.test.ts:361`) |
| H1 | `src/ui/featuresTree.ts:275` | Volta `feature.done` na concluída | ✅ Killed (`test/integration/suite.cjs:546`, `'feature.done'` no lugar de `'feature.hidden'`) |
| H2 | `src/ui/featuresTree.ts:277` | "· oculta" só na marcada | ✅ Killed (`suite.cjs:595`, `'Concluída · 100%'`) |
| H3 | `src/ui/featuresTree.ts:97` | `isHidden` da árvore ignora a escolha à vista | ✅ Killed (`suite.cjs:549`, `:598`, `:619`) |
| H4 | `src/ui/dashboard.ts:97` | `setHidden` do painel sempre com `complete = false` | ✅ Killed (`suite.cjs:598`; `:640`, "timed out waiting for: billing-invoices to show in the tab") |
| H5 | `src/ui/dashboard.ts:117` | Mensagem `state` com `shown: []` | ✅ Killed na execução 4 (`suite.cjs:640`, timeout). Na execução 2 caiu antes, em `:637`, por relatório velho (nota 7): não contou |
| H6 | `src/extension.ts:46` | `setHidden` dos comandos da linha sempre com `complete = false` | ✅ Killed (`suite.cjs:619`, "billing-invoices left Features") |
| M1 | `package.json:186` | Olho fechado inline em `viewItem == feature.done`: a linha oculta perde o olho | ✅ Killed (`suite.cjs:532`) |

Mutante equivalente, rodado e fora da contagem: C9, `src/core/hidden.ts:16`, a chave nova `tlcSpecs.shown` com outro nome. Sobreviveu no `npm test`, como esperado. Nenhuma versão anterior gravou essa chave, e a spec só pede "uma segunda lista" (`spec.md:33`). Com outro nome, o teste de valor inválido em `hidden.test.ts:68` lê uma chave que ninguém usa, mas `texts()` é o mesmo das duas chaves, e a metade de `tlcSpecs.hidden` segue afirmada (`:67`). Sem fix.

Mutante não rodado: H7, `src/webview/main.ts:32` sem `shown = msg.shown`. É o mesmo cano de H5, do lado da página, e o único ponto que o vê é `suite.cjs:640`, que mata H5. Ele não cabia em nenhum lote sem dividir esse ponto com H4 ou H5.

**Sensor depth**: lightweight ampliado (padrão, sem caminho P0). 24 mutações rodadas: 17 no unit (C9 entre elas), 7 no host e no manifesto.
**Result**: 23/23 mortas, fora a equivalente C9. PASS ✅.

**Execuções que abriram o VS Code**, 4 das 4 permitidas, todas pelo desktop oculto, em primeiro plano, uma por vez:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | scratch (b438661) | 63/63 + 1/1 + 1/1 |
| 2 | H1 + H2 + H5 + H6 | scratch | 59/63 + 1/1 + 1/1. HID-09/10 (`:546`) por H1, HID-14/EYE-08 (`:595`) por H2, EYE-05/04/10 (`:619`) por H6. EYE-05/07 em `:637` por relatório velho (nota 7) |
| 3 | H4 + M1 | scratch | 60/63 + 1/1 + 1/1. HID-09/10 (`:532`) por M1, HID-14/EYE-08 (`:598`) e EYE-05/07 (`:640`) por H4. EYE-05/04/10 passou |
| 4 | H5 + H3 | scratch | 59/63 + 1/1 + 1/1. HID-09/10 (`:549`), HID-14/EYE-08 (`:598`) e EYE-05/04/10 (`:619`) por H3, EYE-05/07 (`:640`) por H5 |

Os logs mostram a extensão carregada do scratch nas três suítes de cada execução. Conferi H5 e H3 no `dist/extension.cjs` do scratch.

**Isolamento**: `git status --porcelain` da árvore real vazio antes e depois. HEAD seguiu em b438661. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`), depois `git worktree remove --force` e `git worktree prune`. `git worktree list` mostra só a árvore real. `node_modules` real com 129 entradas visíveis (131 com as ocultas) antes e depois, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`spec.md:66`) e os dois primeiros critérios de sucesso (`spec.md:101-102`) rodam neste repositório e ficam para o orquestrador: o olho em cada linha ao passar o mouse, a concluída desocultada que fica na árvore e no painel, e ela à vista depois de recarregar a janela.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Uma escolha de três valores, uma lista nova e a regra do padrão em uma linha (`hidden.ts:61`). `texts()` serve às duas chaves. `isMarked` saiu quando `choiceOf` o cobriu |
| Surgical changes | ✅ Só os arquivos das tasks. `feature.done` saiu do manifesto e dos testes porque nenhuma linha o usa mais |
| No scope creep | ✅ Nada além da spec. O detalhe continua sem olho |
| Matches patterns | ✅ Core sem vscode, render puro, host pelo store. A consulta "está concluída" se repete em `src/extension.ts:46` e `src/ui/dashboard.ts:97`. São dois lugares, aceito |
| Spec-anchored outcome check (asserted values match spec) | ✅ Títulos, ícones, `contextValue`, classes, colunas, rótulos e números afirmados com o valor exato |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core: um teste por AC e por edge case. Webview: cada AC do painel no HTML. Host: os dois gatilhos, linha e card, no resultado visível |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Todo teste novo tem EYE no título |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:20`) | ✅ |

Detalhes de leitura, sem efeito: o comentário de `src/core/protocol.ts:49` ainda diz "marks or unmarks". Em `src/webview/main.ts:61` a função local `shown` de `report()` esconde a variável nova `shown` de `:17`. A nota do HID-09/10 no hidden-specs pode quebrar a lista no preview (nota 6).

**Integridade dos testes (1cec99c..b438661, escopo EYE)**: `hidden.test.ts` foi de 6 para 11 testes e de 17 para 32 asserções. `webview.test.ts` de 22 para 23 testes e de 91 para 99. `suite.cjs` de 61 para 63 testes e de 242 para 256, tudo em 5767f3c (+16 -2). Saíram cinco asserções da regra antiga, todas trocadas pela nova no mesmo lugar: no card, `cardEyes(billing-invoices) = []` duas vezes virou o olho fechado (`webview.test.ts:332`, `:335`), e `'card h-complete'` virou `'card h-complete is-hidden'` (`:359`); na linha, `'feature.done'` duas vezes virou `'feature.hidden'` (`suite.cjs:546`) e `'feature'` (`:549`). O `doesNotMatch(/oculta/)` da concluída ficou e agora vale para a concluída à vista (`:598`). `ANY_ROW` perdeu `feature.done` e segue comparado por igualdade (`:534`). `isMarked` virou `choiceOf` com o mesmo valor. O caso "marcada e concluída depois" saiu da integração: pela UI, ocultar uma concluída apaga a escolha (EYE-10). Ele segue no unit (`webview.test.ts:335`, `hidden.test.ts:76`). Nenhuma asserção ficou mais fraca.

---

## Edge Cases

- [x] EYE-10 Ocultar uma concluída à vista apaga a escolha, e ela volta a ser oculta por ser concluída: `test/unit/hidden.test.ts:105-125`, `test/integration/suite.cjs:623-625`, `:645-649`
- [x] EYE-11 Oculta à mão aberta pela árvore ou por notificação mostra o detalhe: `test/unit/webview.test.ts:316-320`, `test/integration/suite.cjs:1221-1230` (nota 3)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0 (scratch em b438661)
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 63/63 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1)
- **Test count before feature**: 62 unit e 61 + 1 + 1 integration (1cec99c)
- **Test count after feature**: 68 unit e 63 + 1 + 1 integration (b438661)
- **Delta**: +6 unit (5 em `hidden.test.ts`, 1 em `webview.test.ts`) e +2 integration (`suite.cjs:608`, `:632`). Os commits do specs-folder-paths no meio não mudaram o número de testes
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

Nenhum. Duas sugestões sem bloqueio:

- **Nota no hidden-specs** (cosmético): linha em branco depois de `.specs/features/hidden-specs/spec.md:86`, ou a nota depois do item 14 (nota 6).
- **Precondição do EYE-05/07** (robustez do teste): `test/integration/suite.cjs:635` com `r.toggle?.text === ocultas(done)` no predicado, para esperar o estado assentar (nota 7).

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| EYE-01 | Implementing | ✅ Verified |
| EYE-02 | Implementing | ✅ Verified |
| EYE-03 | Implementing | ✅ Verified |
| EYE-04 | Implementing | ✅ Verified (nota 1) |
| EYE-05 | Implementing | ✅ Verified (nota 1) |
| EYE-06 | Implementing | ✅ Verified |
| EYE-07 | Implementing | ✅ Verified |
| EYE-08 | Implementing | ✅ Verified |
| EYE-09 | Implementing | ✅ Verified (nota 2) |
| EYE-10 | Implementing | ✅ Verified |
| EYE-11 | Implementing | ✅ Verified (nota 3) |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requisitos batem com a spec e discriminam. 0 gaps de precisão
**Sensor**: 23/23 mortas, mais C9 equivalente (sobreviveu, sem fix)
**Gate**: typecheck ok, 68 unit, 63 + 1 + 1 integration, 0 falhas

**What works**: toda spec tem o olho, na linha de Features e no card, concluída ou não. Aberto "Ocultar spec" à vista, fechado "Desocultar spec" oculta. A concluída começa oculta. Desocultada pela linha ou pelo card, ela fica na árvore e na coluna Concluídas com o olho geral fechado, e o número de ocultas cai um. Ocultá-la de novo apaga a escolha. Com o olho geral aberto, toda oculta fica esmaecida e com "· oculta". As marcas antigas de `tlcSpecs.hidden` seguem valendo, e as concluídas à vista ficam em `tlcSpecs.shown`.

**Issues found**: nenhum que bloqueie. A nota do HID-09/10 no hidden-specs pode quebrar a lista no preview (nota 6). A precondição do EYE-05/07 não espera o número (nota 7).

**Next steps**: atualizar os status do `spec.md` para Verified. Rodar o teste independente da spec com o usuário (UAT).
