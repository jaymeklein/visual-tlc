# Panel In Progress Validation

## Validation: panel-in-progress - FAIL ❌

O padrão novo está certo e bem medido. O painel abre com "Ocultar concluídas" marcada, sem os cards concluídos e sem a coluna Concluídas, em cinco etapas, na aba e na barra lateral. Quatro dos cinco requisitos batem com a spec, e 12 das 13 mutações executadas morrem. O que reprova é o gatilho do PNL-04. "WHEN o usuário desmarca a opção" depende só de `setView({ hideDone: el.checked })` em `src/webview/main.ts:108`, e nenhum teste passa por essa linha. Com a linha invertida (U10), a suíte inteira passa: 52 unit e 53 + 1 + 2 de integração. Com o padrão novo, essa linha é o único caminho de volta às concluídas no quadro, que é a meta 2 da spec. O resto são observações que não bloqueiam.

**Date**: 2026-09-29
**Spec**: `.specs/features/panel-in-progress/spec.md`
**Diff range**: c7cb8dc..af81a85 (branch `feat/panel-in-progress`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | af81a85 | Reprovada | 4/5 requisitos batem. PNL-04 sem evidência do gatilho: U10 vivo em `src/webview/main.ts:108`. 12/13 mortas. Overflow do SIDE-09 medido só do lado com rolagem (Follow-up 1). 5 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `tasks.md`. Os passos são os commits do diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Especificar panel-in-progress | ✅ Done | c05b7b5. Nota no SIDE-09 em `.specs/features/sidebar-dashboard/spec.md:79` |
| Dividir o quadro em cinco etapas sem Concluídas | ✅ Done | 8b4c2ef. Classe `five-stages` em `src/webview/render.ts:173`, regra em `media/dashboard.css:131` |
| Ocultar as concluídas por padrão | ✅ Done | 398f29c. `DEFAULT_VIEW` em `src/webview/render.ts:24`, usado em `src/webview/main.ts:16`. `boardWidth` em `src/core/protocol.ts:27` e `src/webview/main.ts:68` |
| Descrever o painel no README | ✅ Done | af81a85. `README.md:26` |
| Evidência do gatilho do PNL-04 | ❌ Pendente | Fix 1 |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PNL-01 WHEN o painel abre, na aba ou na barra lateral, THEN mostra "Ocultar concluídas" marcada | caixa marcada ao abrir, com o efeito dela no quadro | **Render:** `test/unit/webview.test.ts:230` renderiza `DEFAULT_VIEW`. `:232` - `assert.equal(toggle.length, 1)`. `:233` - `assert.ok('checked' in toggle[0].attrs)`. `:235` - cards iguais às abertas. `:236` - `assert.ok(!html.includes('aria-label="Concluídas"'))`. **Aba no VS Code:** `test/integration/suite.cjs:584` - `assert.equal(report.columns, 5)`. `:589` - `deepEqual([...report.cards].sort(), boardNames(...))`, com `:583` exigindo uma concluída no fixture. **Barra lateral:** `:630` (SIDE-01) e `:698` (SIDE-03/04), cards iguais a `boardNames` | ✅ PASS (nota 1) |
| PNL-02 WHILE a opção está marcada, fora do quadro os cards das verificadas com PASS e a coluna Concluídas | cards = features não concluídas, sem coluna Concluídas | **Render:** `test/unit/webview.test.ts:203` exige concluída no sample. `:204` - `deepEqual(b.cards, b.open)`. `:205` - `deepEqual(b.labels, ['Spec', 'Design', 'Tasks', 'Execução', 'Verificação'])`. **VS Code:** `test/integration/suite.cjs:589`. `:588` - `assert.equal(report.emptyStages, emptyStagesOf(...))`, contado em cinco etapas. Barra lateral: `:630`, `:650`, `:652` - `deepEqual(onCards(created), inModel())`, `:656`, `:663`, `:668-669`, `:698`, `:731`. Aba e barra lateral em `docs/specs`: `:829-830` | ✅ PASS |
| PNL-03 WHILE a opção está marcada e o painel tem 700px ou mais, cinco etapas lado a lado, sem espaço reservado à Concluídas | grid de 5 trilhas a partir de 700px | **VS Code:** `test/integration/suite.cjs:582` - `report.width >= 700`. `:584` - `assert.equal(report.columns, 5)` a 1092px. `:599-600` - 5 a 792px. `columns` conta as trilhas de `gridTemplateColumns` computado (`src/webview/main.ts:64`): sem a regra nova, o grid teria 6 trilhas. **Render:** `test/unit/webview.test.ts:206` - `assert.equal(b.boardClass, 'board five-stages')`. **Folha de estilo:** `:221-223` - `repeat(5, minmax(200px, 1fr))` depois da regra base. `:225` - antes da regra estreita | ✅ PASS (nota 3) |
| PNL-04 WHEN o usuário desmarca a opção THEN mostra a coluna Concluídas com os cards PASS, e as seis etapas lado a lado | 6 colunas, Concluídas com as concluídas | **Resultado:** `test/unit/webview.test.ts:211` - `deepEqual(b.doneCards, b.complete)`. `:212` - todos os cards. `:213` - `assert.equal(b.labels.length, 6)`. `:214` - `assert.equal(b.labels[5], 'Concluídas')`. `:215` - `assert.equal(b.boardClass, 'board')`. Regra base de 6 trilhas: `:180` e `:220`. **Gatilho:** sem evidência. `src/webview/main.ts:106-109` não roda em teste nenhum, e U10 sobrevive | ❌ GAP (parcial): o gatilho não tem evidência |
| PNL-05 WHEN uma feature concluída é aberta pela árvore Features ou por uma notificação THEN mostra o detalhe dela, mesmo com a opção marcada | detalhe da concluída com `hideDone: true` | **Render:** `test/unit/webview.test.ts:242` - `DEFAULT_VIEW` com a concluída selecionada. `:243` - `assert.ok(html.includes('<div class="detail-title">…<span class="mono">${done.name}</span>'))`. **VS Code:** `test/integration/suite.cjs:876` - `assert.equal(feature('billing-invoices').health, 'complete')`. `:877-878` - `showFeature` e `r.detail === 'billing-invoices'` na barra lateral | ✅ PASS (nota 4) |

**Status**: ❌ Gaps present. 4 de 5 batem com a spec. O PNL-04 tem o resultado coberto e o gatilho sem evidência. Nenhum gap de precisão.

### Notas

1. **PNL-01, a caixa marcada.** A integração não lê a caixa: o relatório `Rendered` não tem esse campo. A cadeia fecha assim. Na aba e na barra lateral, o quadro real abre com 5 colunas e sem concluídas. Só `hideDone: true` produz esses dois efeitos (`src/webview/render.ts:166`, `:173`, `:176`). O mesmo `hideDone` escreve `checked` na caixa (`render.ts:146`), e o unit fixa isso em `:233` (U9 morre). I1 prova que `main.ts:16` usa o padrão nas duas superfícies. Aceito.
2. **PNL-04, a decisão.** A spec registra que a integração não clica dentro da webview (`spec.md:37`). Isso justifica medir as seis etapas no render e na folha de estilo, e o resultado está fixado lá. Não cobre o gatilho. O mapeamento da caixa para `hideDone` está inline no listener (`src/webview/main.ts:108`), fora de `actionFor` (`src/webview/render.ts:583`), que é onde o projeto testa os outros controles da página (NAV-12, `test/unit/webview.test.ts:112-113`). A linha não mudou neste diff, mas o PNL-04 e a meta "As concluídas continuam a um clique" são deste diff. Antes, quebrar a caixa só tirava um filtro. Agora esconde as concluídas do quadro sem volta, e nenhum teste percebe. Reprovado. Ver Fix 1.
3. **SIDE-09/PNL-03, overflow.** `overflow === boardWidth < 1040` é a condição geométrica certa. `boardWidth` é o `clientWidth` do quadro (`src/webview/main.ts:68`), que não tem padding lateral. Cinco trilhas de 200px e quatro gaps de 10px somam 1040px (`media/dashboard.css:129`, `:131`). Medidas da execução 3: aba sozinha com 1092px e quadro com 1029px, overflow true. Ao lado da barra lateral, 792px e 729px, overflow true. A diferença de 63px é o padding da página (48px, `media/dashboard.css:27`) e a barra de rolagem vertical (15px). As duas medidas ficam do lado com rolagem, então a asserção vira `overflow === true` nas duas. O lado sem rolagem nunca roda. Antes da feature era igual: 1092 e 792, os dois abaixo de 1298. A asserção não perdeu força. A execução 5 testou o outro lado, só no teste: sem a barra de atividades, a aba tem 1140px, o quadro 1077px, overflow false, e a condição vale. Ver Follow-up 1. A troca da largura da página pela do quadro está certa: a primeira tentativa do autor (`width < 1088`) falhou a 1092px com overflow true, porque a página conta o padding e a barra de rolagem. I3 prova que a asserção separa as duas larguras.
4. **PNL-05, a notificação.** A spec cita árvore e notificação. A integração abre uma concluída pela árvore (`showFeature`, `test/integration/suite.cjs:877`). O aviso "foi verificada e concluída" (`src/ui/notifier.ts:32`) chama o mesmo `dashboard.showSide` que a árvore (`src/extension.ts:47`, `:58`). O botão da notificação está provado no SIDE-02 (`suite.cjs:855`). O detalhe da concluída sai do mesmo render nos dois caminhos. Aceito.
5. **Premissas sem teste com a opção marcada.** O bloco Concluídas do resumo conta todas as concluídas (`src/webview/render.ts:129`, `:155`), e a busca não acha concluídas (`:166`). O código não mudou, e nenhuma das duas é critério. Ficam registradas.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-pnl HEAD` (af81a85), com junction de `node_modules` para o real. Uma mutação por vez, aplicada por troca de texto exata e desfeita com `git checkout` no scratch antes da seguinte. `git status --porcelain` do scratch vazio depois de cada reversão. Sem `git stash`. As mutações U rodaram com `npm test`. As mutações I rodaram na suíte de integração, pelo desktop oculto, uma por vez, em primeiro plano.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| U1 | `src/webview/render.ts:24` | `DEFAULT_VIEW.hideDone` volta a `false` | ✅ Killed (`test/unit/webview.test.ts:233`) |
| U2 | `src/webview/render.ts:173` | Classe `five-stages` nunca aplicada | ✅ Killed (`:206`) |
| U3 | `src/webview/render.ts:173` | Classe `five-stages` sempre aplicada | ✅ Killed (`:215`) |
| U4 | `media/dashboard.css:131` | Regra de cinco etapas removida | ✅ Killed (`:223`) |
| U5 | `media/dashboard.css:131` | `.board.five-stages`, com especificidade maior que a regra estreita | ✅ Killed (`:223`) |
| U6 | `src/webview/render.ts:176` | Coluna Concluídas vazia volta ao quadro com a opção marcada | ✅ Killed (`:205`, `:236`) |
| U7b | `src/webview/render.ts:166`, `:176` | Cards concluídos vazam para o quadro com a opção marcada | ✅ Killed (`:204`, `:235`) |
| U8 | `src/webview/render.ts:105` | Detalhe recusa uma concluída com a opção marcada | ✅ Killed (`:243`) |
| U9 | `src/webview/render.ts:146` | Caixa nunca marcada | ✅ Killed (`:233`) |
| I1 | `src/webview/main.ts:16` | `main.ts` ignora `DEFAULT_VIEW`: o literal de antes, com `hideDone: false` | ✅ Killed (`test/integration/suite.cjs:584`, "6 !== 5". Também `:630`, `:650`, `:698`. 49/53 + 1/1 + 2/2) |
| I2 | `src/webview/main.ts:16` | Ordem invertida: `{ ...vscode.getState(), ...DEFAULT_VIEW }` | ✅ Killed (`suite.cjs:810`, SIDE-06: a barra lateral volta sem o detalhe de user-auth. 52/53 + 1/1 + 2/2) |
| I3 | `src/webview/main.ts:68` | `boardWidth` informa a largura da página | ✅ Killed (`suite.cjs:587`, "overflow with a 1092px board in a 1092px tab". 52/53 + 1/1 + 2/2) |
| U10 | `src/webview/main.ts:108` | `hideDone: !el.checked`: desmarcar não traz as concluídas | ❌ Survived (unit 52/52. A integração não alcança a linha) → Fix 1 |

**Sensor depth**: lightweight, ampliado. 9 mutações de render e folha de estilo, 3 de `main.ts` na integração, 1 no listener da caixa
**Result**: 12/13 mortas - FAIL ❌

U10 não passou pela integração porque sobrevive por construção. `ToWebview` só leva `state` e `select` (`src/core/protocol.ts:32-34`). A API de teste só lê relatórios e manda mensagens da webview para o host (`src/extension.ts:91-93`). Nenhum caso de `test/integration/*.cjs` dispara evento de DOM na página.

Execuções que abriram o VS Code:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | scratch (af81a85) | 53/53 + 1/1 + 2/2 |
| 2 | I1 | scratch | 49/53 + 1/1 + 2/2 |
| 3 | I2, com uma linha de log das medidas do SIDE-09 | scratch | 52/53 + 1/1 + 2/2 |
| 4 | I3 | scratch | 52/53 + 1/1 + 2/2 |
| 5 | Experimento de largura, só no teste: barra de atividades oculta e restaurada | scratch (produto em af81a85) | 53/53 + 1/1 + 2/2 |

Foram 5 execuções, do limite de 5. Todos os logs mostram a extensão carregada do scratch. O bundle de cada mutação foi conferido em `dist/webview.js` do scratch. Medidas registradas: sozinha `{"width":1092,"boardWidth":1029,"overflow":true}`, sem a barra de atividades `{"width":1140,"boardWidth":1077,"overflow":false}`, ao lado da barra lateral `{"width":792,"boardWidth":729,"overflow":true}`, com 5 colunas nas três.

### Julgadas pela leitura ou equivalentes

- **U7, `src/webview/render.ts:166`.** Tirar o termo `hideDone` do filtro não muda nada visível. Uma concluída só cai na coluna `done` (`:94`), e `:176` já pula essa coluna. Mutante equivalente, em código que não mudou. Unit 52/52. U7b, com `:176` também, morre.
- **U11, `src/webview/main.ts:16`.** É I1 rodado só no unit: 52/52, porque o unit não carrega `main.ts`. Morre na integração (I1).
- **U4 e U5 na integração.** O unit já mata as duas. Pela leitura, U4 também morre em `suite.cjs:584` (6 trilhas). U5 morre no SIDE-03/04 em `:695` (`columns === 1` abaixo de 700px): o quadro da barra lateral tem `five-stages` por padrão, e `.board.five-stages` vence o `.board` do `@media` (`media/dashboard.css:314`).

**Isolamento**: `git status --porcelain` da árvore real vazio antes do sensor e vazio depois. HEAD seguiu em af81a85, branch `feat/panel-in-progress`, e nada mudou sob a verificação. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`). `git worktree remove --force` e `git worktree prune`. `git worktree list` mostra só a árvore real. `node_modules` real com 131 entradas antes e depois, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (abrir o painel em aba neste repositório e desmarcar a opção) fica para o orquestrador. Ele cobre à mão o gatilho do Fix 1.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Uma constante (`DEFAULT_VIEW`), uma classe condicional, uma regra de CSS e um campo no relatório |
| Surgical changes | ✅ `render.ts` +5 -2, `main.ts` +3 -2, `dashboard.css` +2, `protocol.ts` +2 |
| No scope creep | ✅ Nada além da spec. `boardWidth` é campo de teste, no molde de `width` e `overflow` |
| Matches patterns | ✅ `:where()` mantém a especificidade de `.board`, e o comentário diz por quê (`media/dashboard.css:130`). O teste da folha de estilo segue o do SIDE-03/04 (`test/unit/webview.test.ts:168-182`) |
| Spec-anchored outcome check (asserted values match spec) | ❌ PNL-04 sem evidência do gatilho |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Render 1:1 com PNL-01..05. Integração nas duas superfícies |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Os 5 testes novos têm o ID no título |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (c7cb8dc..af81a85)**:

- `test/integration/suite.cjs`: 53 casos antes e depois. Dois renomeados (SIDE-09 e SIDE-02), nenhum removido, nenhum pulado. 171 para 173 asserções.
  - `featureNames` virou `boardNames` (`:571`). A comparação continua exata e agora também exige que as concluídas fiquem fora do quadro, que é o PNL-02. `:583` impede que o filtro passe vazio. Mais forte.
  - `emptyStagesOf` (`:570`): de 6 para 5 etapas, com as fases das abertas. Segue PNL-02 e PNL-03 e continua calculado do modelo, sem ler o DOM.
  - `columns` de 6 para 5 (`:584`, `:600`): segue PNL-03 com o padrão. As seis etapas saíram da integração e ficaram no render e na folha de estilo (`test/unit/webview.test.ts:213`, `:180`, `:220`), como a spec registra (`spec.md:36-37`).
  - Overflow (`:587`, `:601`): a condição ficou exata. Continua medida só do lado com rolagem, como antes (nota 3).
  - `inModel` (`:641`): filtrado às abertas. A comparação continua exata e passa a exigir a ausência das concluídas.
  - SIDE-02/PNL-05 (`:876`): asserção nova, que impede o caso de passar sem uma concluída.
- `test/unit/webview.test.ts`: 8 para 13 testes, 38 para 54 asserções. Nenhuma asserção antiga mudou.

Observações que não bloqueiam:

- O Independent Test do SIDE-09 ainda diz "quadro de seis colunas" (`.specs/features/sidebar-dashboard/spec.md:81`). A nota de `:79` explica o padrão novo, mas o teste manual ficou velho. Ver Follow-up 2.
- O teste do PNL-05 compara o HTML com a indentação do template (`test/unit/webview.test.ts:243`). Uma mudança de formatação quebra o teste, mas ele falha alto.

---

## Edge Cases

- [x] PNL-05 Feature concluída aberta pela árvore ou por notificação mostra o detalhe com a opção marcada: `test/unit/webview.test.ts:242-243`, `test/integration/suite.cjs:876-878` (nota 4)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0 (scratch em af81a85)
- **Unit**: 52 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 53/53 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0, execução 1)
- **Test count before feature**: 47 unit + 56 integration (53 + 1 + 2, em c7cb8dc)
- **Test count after feature**: 52 unit + 56 integration (53 + 1 + 2)
- **Delta**: +5 unit. Integração sem caso novo, com dois renomeados
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do orquestrador em 398f29c conferem com a minha execução em af81a85, que só muda o README.

---

## Fix Plans (if issues found)

### Fix 1: gatilho do PNL-04 sem teste (U10)

- **Root cause**: o mapeamento da caixa "Ocultar concluídas" para `hideDone` está inline no listener de `change` (`src/webview/main.ts:106-109`). O unit não carrega `main.ts`, e a integração não dispara eventos na página. Com a linha invertida ou apagada, nada falha.
- **Fix task**: levar o caso `toggle-done` para `actionFor` (`src/webview/render.ts:583`), que já mapeia os cliques. O listener de `change` só repassa o estado da caixa (`el.checked`) e aplica o `view` devolvido. O clique continua ignorando `toggle-done` (`main.ts:84`). Um teste unit do PNL-04 afirma os dois sentidos: desmarcar dá `{ view: { hideDone: false } }`, marcar dá `{ view: { hideDone: true } }`, sem mensagem para o host.
- **Alternativa mais forte, opcional**: um gancho de teste que clica na caixa dentro da webview (mensagem do host para a página). A integração desmarcaria a opção e mediria as seis colunas no VS Code real. Mudaria a premissa "Medida em VS Code real" (`spec.md:37`).
- **Done when**: `npm test` falha com o mapeamento invertido em `actionFor` e passa com o certo. O gate segue verde.
- **Priority**: Major

### Follow-up 1 (não bloqueia): medir o lado sem rolagem do SIDE-09

- **Root cause**: as duas medidas do SIDE-09 têm o quadro abaixo de 1040px (1029 e 729), então `:587` e `:601` só esperam `overflow === true`.
- **Fix task**: no SIDE-09, uma terceira medida com `workbench.activityBar.location` em `'hidden'`, restaurada num `finally`, esperando `width > report.width`. No experimento da execução 5, a aba foi a 1140px e o quadro a 1077px, com overflow false, e a suíte seguiu 53/53.
- **Done when**: a asserção do overflow roda uma vez com `boardWidth >= 1040` e `overflow === false`.
- **Priority**: Minor

### Follow-up 2 (não bloqueia): Independent Test do SIDE-09

- **Root cause**: `.specs/features/sidebar-dashboard/spec.md:81` ainda descreve o quadro de seis colunas.
- **Fix task**: dizer cinco colunas com o padrão, e seis com "Ocultar concluídas" desmarcada.
- **Priority**: Cosmetic

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PNL-01 | Implementing | ✅ Verified |
| PNL-02 | Implementing | ✅ Verified |
| PNL-03 | Implementing | ✅ Verified |
| PNL-04 | Implementing | ❌ Needs Fix |
| PNL-05 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 4/5 requisitos batem com a spec. PNL-04 com o gatilho sem evidência. 0 gaps de precisão
**Sensor**: 12/13 mortas. U10 viva em `src/webview/main.ts:108`
**Gate**: typecheck ok, 52 unit, 53 + 1 + 2 integration, 0 falhas

**What works**: o painel abre com "Ocultar concluídas" marcada, na aba e na barra lateral. As concluídas e a coluna Concluídas ficam fora do quadro. O quadro tem cinco trilhas a partir de 700px e continua empilhado abaixo disso. Desmarcada, a página desenha as seis colunas com as concluídas. Uma concluída aberta pela árvore ou por notificação mostra o detalhe. `boardWidth` torna exata a condição de overflow do SIDE-09. Nenhum teste saiu, nenhuma asserção afrouxou.

**Issues found**: o gatilho do PNL-04 não tem teste, e inverter a caixa passa a suíte inteira (Fix 1). O overflow do SIDE-09 só é medido do lado com rolagem (Follow-up 1). O Independent Test do SIDE-09 ficou velho (Follow-up 2).

**Next steps**: executar o Fix 1 e verificar de novo (iteração 2). Os follow-ups podem entrar junto ou depois.
