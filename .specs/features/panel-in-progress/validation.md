# Panel In Progress Validation

## Validation: panel-in-progress - PASS ✅

Aprovada. Os cinco requisitos batem com a spec. O Fix 1 fechou o gatilho do PNL-04. O mapeamento de "Ocultar concluídas" para `hideDone` agora fica em `actionFor` (`src/webview/render.ts:598-599`), e `test/unit/webview.test.ts:247-248` fixa os dois sentidos. As cinco formas novas do U10 (V1-V5) morrem ali. O Follow-up 1 também fechou. O SIDE-09 agora mede o lado sem rolagem, e o mutante I4 (quadro 40px mais largo) morre só na medida nova (`test/integration/suite.cjs:616`). A suíte da iteração 1 não o pegaria. Restam vivos cinco mutantes na cola de DOM de `src/webview/main.ts`, que nenhum teste do projeto alcança. Não bloqueiam: o Fix 1 aceitou esse limite, e a cola tem o mesmo formato já aceito para os outros controles da página. Ficam no Follow-up 3, opcional, e no teste manual da spec.

**Date**: 2026-09-29
**Spec**: `.specs/features/panel-in-progress/spec.md`
**Diff range**: c7cb8dc..c76e51f (branch `feat/panel-in-progress`). Sensor focado em 67b57da..c76e51f
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | af81a85 | Reprovada | 4/5 requisitos batem. PNL-04 sem evidência do gatilho: U10 vivo em `src/webview/main.ts:108`. 12/13 mortas. Overflow do SIDE-09 medido só do lado com rolagem (Follow-up 1). 5 execuções do VS Code |
| 2 | c76e51f | Aprovada | 5/5 requisitos batem. Fix 1 fechado: V1-V5 mortas em `test/unit/webview.test.ts:247-248`. Follow-up 1 fechado: I4 morre só em `test/integration/suite.cjs:616`. Follow-up 2 fechado. 18/24 mortas. As 6 vivas são U7 (equivalente) e 5 na cola de DOM, aceitas (Follow-up 3). 3 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `tasks.md`. Os passos são os commits do diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Especificar panel-in-progress | ✅ Done | c05b7b5. Nota no SIDE-09 em `.specs/features/sidebar-dashboard/spec.md:79` |
| Dividir o quadro em cinco etapas sem Concluídas | ✅ Done | 8b4c2ef. Classe `five-stages` em `src/webview/render.ts:173`, regra em `media/dashboard.css:131` |
| Ocultar as concluídas por padrão | ✅ Done | 398f29c. `DEFAULT_VIEW` em `src/webview/render.ts:24`, usado em `src/webview/main.ts:16`. `boardWidth` em `src/core/protocol.ts:27` e `src/webview/main.ts:68` |
| Descrever o painel no README | ✅ Done | af81a85. `README.md:26` |
| Fix 1: gatilho do PNL-04 em `actionFor` | ✅ Done | 13276d0. Caso `toggle-done` em `src/webview/render.ts:598-599`. Listener em `src/webview/main.ts:108`. Teste em `test/unit/webview.test.ts:246-249` |
| Follow-up 1: lado sem rolagem do SIDE-09 | ✅ Done | bf1386c. `test/integration/suite.cjs:604-620` |
| Follow-up 2: Independent Test do SIDE-09 | ✅ Done | c76e51f. `.specs/features/sidebar-dashboard/spec.md:81` diz cinco colunas com a opção marcada e seis com ela desmarcada |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PNL-01 WHEN o painel abre, na aba ou na barra lateral, THEN mostra "Ocultar concluídas" marcada | caixa marcada ao abrir, com o efeito dela no quadro | **Render:** `test/unit/webview.test.ts:230` renderiza `DEFAULT_VIEW`. `:232` - `assert.equal(toggle.length, 1)`. `:233` - `assert.ok('checked' in toggle[0].attrs)`. `:235` - cards iguais às abertas. `:236` - `assert.ok(!html.includes('aria-label="Concluídas"'))`. **Aba no VS Code:** `test/integration/suite.cjs:584` - `assert.equal(report.columns, 5)`. `:589` - `deepEqual([...report.cards].sort(), boardNames(...))`, com `:583` exigindo uma concluída no fixture. **Barra lateral:** `:648` (SIDE-01) e `:716` (SIDE-03/04), cards iguais a `boardNames` | ✅ PASS (nota 1) |
| PNL-02 WHILE a opção está marcada, fora do quadro os cards das verificadas com PASS e a coluna Concluídas | cards = features não concluídas, sem coluna Concluídas | **Render:** `test/unit/webview.test.ts:203` exige concluída no sample. `:204` - `deepEqual(b.cards, b.open)`. `:205` - `deepEqual(b.labels, ['Spec', 'Design', 'Tasks', 'Execução', 'Verificação'])`. **VS Code:** `test/integration/suite.cjs:589`. `:588` - `assert.equal(report.emptyStages, emptyStagesOf(...))`, contado em cinco etapas. Barra lateral: `:648`, `:668`, `:670` - `deepEqual(onCards(created), inModel())`, `:674`, `:681`, `:686-687`, `:716`, `:749`. Aba e barra lateral em `docs/specs`: `:847-848` | ✅ PASS |
| PNL-03 WHILE a opção está marcada e o painel tem 700px ou mais, cinco etapas lado a lado, sem espaço reservado à Concluídas | grid de 5 trilhas a partir de 700px | **VS Code:** `test/integration/suite.cjs:582` - `report.width >= 700`. `:584` - `assert.equal(report.columns, 5)` a 1092px. `:600` - 5 a 792px. Novo: `:614` - `assert.ok(wide.boardWidth >= 1040)`, `:615` - `assert.equal(wide.columns, 5)`, `:616` - `assert.equal(wide.overflow, false)`, a 1140px com o quadro de 1077px. As cinco trilhas cabem sem rolagem lateral. **Render:** `test/unit/webview.test.ts:206` - `assert.equal(b.boardClass, 'board five-stages')`. **Folha de estilo:** `:221-223` - `repeat(5, minmax(200px, 1fr))` depois da regra base. `:225` - antes da regra estreita | ✅ PASS (nota 3) |
| PNL-04 WHEN o usuário desmarca a opção THEN mostra a coluna Concluídas com os cards PASS, e as seis etapas lado a lado | 6 colunas, Concluídas com as concluídas | **Gatilho:** `test/unit/webview.test.ts:247` - `assert.deepEqual(actionFor({ action: 'toggle-done', checked: 'false' }), { view: { hideDone: false } })`. `:248` - marcar de novo dá `{ view: { hideDone: true } }`. Os dois sem mensagem para o host. **Resultado:** `:211` - `deepEqual(b.doneCards, b.complete)`. `:212` - todos os cards. `:213` - `assert.equal(b.labels.length, 6)`. `:214` - `assert.equal(b.labels[5], 'Concluídas')`. `:215` - `assert.equal(b.boardClass, 'board')`. Regra base de 6 trilhas: `:180` e `:220` | ✅ PASS (nota 2) |
| PNL-05 WHEN uma feature concluída é aberta pela árvore Features ou por uma notificação THEN mostra o detalhe dela, mesmo com a opção marcada | detalhe da concluída com `hideDone: true` | **Render:** `test/unit/webview.test.ts:242` - `DEFAULT_VIEW` com a concluída selecionada. `:243` - `assert.ok(html.includes('<div class="detail-title">…<span class="mono">${done.name}</span>'))`. **VS Code:** `test/integration/suite.cjs:894` - `assert.equal(feature('billing-invoices').health, 'complete')`. `:895-896` - `showFeature` e `r.detail === 'billing-invoices'` na barra lateral | ✅ PASS (nota 4) |

**Status**: ✅ All ACs covered. 5 de 5 batem com a spec. Nenhum gap de precisão.

### Notas

1. **PNL-01, a caixa marcada.** Igual à iteração 1. A integração não lê a caixa. Na aba e na barra lateral, o quadro real abre com 5 colunas e sem concluídas, e só `hideDone: true` produz esses dois efeitos (`src/webview/render.ts:166`, `:173`, `:176`). O mesmo `hideDone` escreve `checked` na caixa (`render.ts:146`), e o unit fixa isso em `test/unit/webview.test.ts:233` (U9 morre). I1 prova que `src/webview/main.ts:16` usa o padrão nas duas superfícies. Aceito.
2. **PNL-04, o gatilho.** A cadeia agora tem três elos. O listener de `change` repassa o estado da caixa: `activate(el, { ...el.dataset, checked: String(el.checked) })` (`src/webview/main.ts:108`). `activate` passa esses dados a `actionFor` e aplica o `view` devolvido (`:75-78`). `actionFor` decide: `hideDone: d.checked === 'true'` (`src/webview/render.ts:598-599`). A decisão, que era o risco da iteração 1, está sob teste nos dois sentidos, e V1-V5 morrem. A cola que sobra só lê o DOM e chama `activate`. Tem o formato do clique, que também chega a `activate(el)` sem teste (`src/webview/main.ts:82-86`), com `actionFor` testado no lugar (NAV-12, `test/unit/webview.test.ts:112-113`). A spec registra que a integração não clica dentro da webview (`spec.md:37`). G1, G2, G3a, G4 e G5 vivem nessa cola, e G3b morre no typecheck. Aceito, como previa o Fix 1. O teste manual da spec (`spec.md:60`) cobre essa cola à mão, e o Follow-up 3 registra a opção mais forte.
3. **SIDE-09/PNL-03, overflow dos dois lados.** A iteração 1 mediu a aba só com o quadro abaixo de 1040px. Agora há três medidas. Aba sozinha: quadro de 1029px, overflow esperado true (`test/integration/suite.cjs:587`). Ao lado da barra lateral: 729px, true (`:601`). Sem a barra lateral e a barra de atividades: aba de 1140px, quadro de 1077px, overflow esperado false (`:614-616`). As medidas vêm das mensagens de falha das execuções 2 e 3. I4 muda o `gap` do quadro de 10px para 20px (`media/dashboard.css:129`). Cinco trilhas passam a pedir 1080px, e o quadro de 1077px rola de lado. `:587` e `:601` passam com I4, e só `:616` falha. O unit também deixa I4 passar, porque `test/unit/webview.test.ts:180` e `:220` fixam só o começo da regra base. Sem a medida nova, I4 sobreviveria. I5, um overflow sempre ligado, falha primeiro em `:616` e depois no SIDE-03/04 (`:715`).
4. **PNL-05, a notificação.** Igual à iteração 1. A integração abre uma concluída pela árvore (`showFeature`, `test/integration/suite.cjs:895`). O aviso "foi verificada e concluída" (`src/ui/notifier.ts:31`) chama o mesmo `dashboard.showSide` que a árvore (`src/extension.ts:47`, `:58`). O botão da notificação está provado no SIDE-02 (`suite.cjs:873`). Aceito.
5. **Premissas sem teste com a opção marcada.** Igual à iteração 1. O bloco Concluídas do resumo conta todas as concluídas (`src/webview/render.ts:129`, `:155`), e a busca não acha concluídas (`:166`). Nenhuma das duas é critério.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-pnl2 HEAD` (c76e51f), com junction de `node_modules` para o real. Uma mutação por vez, aplicada por troca de texto exata e desfeita com `git checkout` no scratch antes da seguinte. `git status --porcelain` do scratch vazio depois de cada reversão. Sem `git stash`. Cada mutação rodou com `npm run typecheck` e `npm test`. I4 e I5 passaram nos dois e foram para a integração, pelo desktop oculto, uma por vez, em primeiro plano.

### Mutações novas (67b57da..c76e51f)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| V1 | `src/webview/render.ts:599` | U10 na forma nova: `hideDone: d.checked !== 'true'` | ✅ Killed (`test/unit/webview.test.ts:247`) |
| V2 | `src/webview/render.ts:599` | `hideDone: true` fixo: desmarcar não traz as concluídas | ✅ Killed (`:247`) |
| V3 | `src/webview/render.ts:599` | `hideDone: false` fixo: marcar não esconde de novo | ✅ Killed (`:248`) |
| V4 | `src/webview/render.ts:599` | `hideDone: Boolean(d.checked)`: a string `'false'` conta como verdadeira | ✅ Killed (`:247`) |
| V5 | `src/webview/render.ts:598-599` | Caso `toggle-done` removido: cai no `default` e devolve `{}` | ✅ Killed (`:247`) |
| G3b | `src/webview/main.ts:75-76` | `activate` perde o parâmetro `data` e usa `el.dataset` | ✅ Killed (typecheck: `main.ts(108,57): error TS2554: Expected 1 arguments, but got 2`) |
| I4 | `media/dashboard.css:129` | `gap` do quadro de 10px para 20px: cinco trilhas pedem 1080px | ✅ Killed (`test/integration/suite.cjs:616`, "overflow with a 1077px board in a 1140px tab". 52/53 + 1/1 + 2/2) |
| I5 | `src/webview/main.ts:69` | Overflow sempre ligado: `root.scrollWidth >= root.clientWidth` | ✅ Killed (`suite.cjs:616`, a mesma mensagem, e `:715` no SIDE-03/04. 51/53 + 1/1 + 2/2) |
| G1 | `src/webview/main.ts:108` | `checked: String(!el.checked)`: a cola inverte a caixa | ⚠️ Survived, aceita (nota 2, Follow-up 3) |
| G2 | `src/webview/main.ts:106-109` | Listener de `change` removido: a caixa não faz nada | ⚠️ Survived, aceita |
| G3a | `src/webview/main.ts:76` | `activate` ignora `data` e lê `el.dataset`: `checked` some, e a opção nunca volta a esconder | ⚠️ Survived, aceita |
| G4 | `src/webview/main.ts:108` | O listener chama `activate(el)` sem `checked`: mesmo efeito de G3a | ⚠️ Survived, aceita |
| G5 | `src/webview/main.ts:84` | O clique deixa de ignorar `toggle-done` | ⚠️ Survived, aceita. Linha anterior à feature (c7cb8dc:83) |

### Mutações da iteração 1, rodadas de novo em c76e51f

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
| U11 | `src/webview/main.ts:16` | `main.ts` ignora `DEFAULT_VIEW` | ✅ Killed (typecheck: import órfão, TS6133). Efeito da forma da mutação. A morte que conta é I1 |
| U7 | `src/webview/render.ts:166` | Tira o termo `hideDone` do filtro | ⚠️ Survived. Equivalente, como na iteração 1: `:176` já pula a coluna `done` |

### Mutações da iteração 1 mantidas sem nova execução

O código e as asserções que as matam não mudaram. Só o número de algumas linhas do `suite.cjs`.

| Mutation | File:line | Killed? |
| -------- | --------- | ------- |
| I1 | `src/webview/main.ts:16` | ✅ Killed na iteração 1 (`test/integration/suite.cjs:584`, "6 !== 5". Também `:648`, `:668`, `:716`) |
| I2 | `src/webview/main.ts:16` | ✅ Killed na iteração 1 (`suite.cjs:828`, SIDE-06) |
| I3 | `src/webview/main.ts:68` | ✅ Killed na iteração 1 (`suite.cjs:587`) |
| U10 | `src/webview/main.ts:108` (af81a85) | Substituída. A linha mudou. As formas novas são V1-V5, em `actionFor`, e G1, na cola |

**Sensor depth**: lightweight, ampliado. 13 mutações novas no diff do fix, 11 da iteração 1 de novo, 3 da iteração 1 mantidas
**Result**: 18/24 mortas nesta iteração. As 6 vivas são U7, equivalente, e 5 na cola de DOM, aceitas pela nota 2 - PASS ✅

G1, G2, G3a, G4 e G5 sobrevivem por construção. O unit não carrega `main.ts`. A integração não dispara eventos de DOM na página: `ToWebview` só leva `state` e `select` (`src/core/protocol.ts:32-34`). Por isso não gastei execução do VS Code com elas. G5 é anterior à feature, mas fica no caminho do gatilho. Pela leitura, com G5 o clique chama `activate(el)` sem `checked` e redesenha a página antes do `change`. O `change` cai num elemento já fora do documento. A opção desmarca, mas nunca volta a marcar.

Execuções que abriram o VS Code, das 4 permitidas:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | scratch (c76e51f) | 53/53 + 1/1 + 2/2 |
| 2 | I4 | scratch | 52/53 + 1/1 + 2/2. Só o SIDE-09 falha, em `:616` |
| 3 | I5 | scratch | 51/53 + 1/1 + 2/2. SIDE-09 em `:616` e SIDE-03/04 em `:715` |

Foram 3 execuções. Todos os logs mostram a extensão carregada do scratch. O bundle de I5 foi conferido em `dist/webview.js` do scratch. I4 age na folha de estilo, que a webview lê direto de `media/` (`src/ui/dashboard.ts:123`).

**Limpeza do SIDE-09.** A medida nova muda `workbench.activityBar.location` para `hidden` no escopo Global (`test/integration/suite.cjs:607`). O `finally` restaura o valor com `undefined` e reabre a barra lateral (`:617-620`). É o mesmo estado em que o teste terminava antes: a barra lateral aberta depois de `:593`. Na execução 1 o teste passou, e os 18 casos seguintes do `suite.cjs` também. Na execução 2 o teste falhou dentro do `try`, e os casos seguintes passaram. A limpeza vale nos dois caminhos. `closeSidebar` e o `update` ficam fora do `try` (`:605`, `:607`). Se um deles falhar, nada mudou ainda. O escopo Global não vaza entre execuções: cada suíte usa um `--user-data-dir` temporário, apagado no fim (`test/integration/run.mjs:22`, `:30`, `:36`).

**Isolamento**: `git status --porcelain` da árvore real vazio antes do sensor e vazio depois. HEAD seguiu em c76e51f, branch `feat/panel-in-progress`, e nada mudou sob a verificação. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`). `git worktree remove --force` e `git worktree prune`. `git worktree list` mostra só a árvore real. `node_modules` real com 131 entradas antes e depois, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`spec.md:60`) fica para o orquestrador: abrir o painel em aba neste repositório, desmarcar "Ocultar concluídas" e marcar de novo. É a única cobertura da cola de DOM (G1-G5).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ O Fix 1 soma um caso em `actionFor` (`src/webview/render.ts:598-599`) e troca uma linha do listener. `activate` ganhou um parâmetro com padrão, então os outros chamadores não mudaram |
| Surgical changes | ✅ 13276d0: `render.ts` +3 -1, `main.ts` +3 -3, um teste. bf1386c: só o SIDE-09, +18. c76e51f: uma linha de spec |
| No scope creep | ✅ Nada além do Fix 1 e dos dois follow-ups |
| Matches patterns | ✅ O caso novo segue os outros de `actionFor`, que leem strings de `data-*` (`d.line ? Number(d.line)`, `render.ts:605`). O teste segue o NAV-12/NAV-13 (`test/unit/webview.test.ts:112`, `:138`). A medida nova segue as duas anteriores do SIDE-09, com `waitFor` e `api.refresh()` |
| Spec-anchored outcome check (asserted values match spec) | ✅ PNL-04 com os dois valores de `hideDone` fixados |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Render e `actionFor` 1:1 com PNL-01..05. Integração nas duas superfícies e dos dois lados do overflow |
| Every test maps to a spec requirement - no unclaimed tests | ✅ O teste novo tem PNL-04 no título. A medida nova fica dentro do SIDE-09/PNL-02/PNL-03 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (67b57da..c76e51f)**: nenhuma linha de teste removida. `test/integration/suite.cjs`: 53 casos, de 173 para 176 asserções. `test/unit/webview.test.ts`: de 13 para 14 testes, de 54 para 56 asserções. Nenhuma asserção antiga mudou. A análise de c7cb8dc..af81a85 da iteração 1 continua valendo: nada ficou mais fraco.

Observações que não bloqueiam:

- A medida nova depende do tamanho da janela de teste. Ela pede uma aba de uns 1103px sem a barra de atividades: 1040px de quadro, mais 48px de padding e 15px de barra de rolagem. Nesta máquina a aba tem 1140px. Numa tela menor, `test/integration/suite.cjs:614` falha com mensagem clara, sem passar em vão.
- Os valores 1092, 1140, 1029 e 1077 vêm desta máquina. As asserções não os fixam: comparam larguras entre si e com o limite de 1040px.

---

## Edge Cases

- [x] PNL-05 Feature concluída aberta pela árvore ou por notificação mostra o detalhe com a opção marcada: `test/unit/webview.test.ts:242-243`, `test/integration/suite.cjs:894-896` (nota 4)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0 (scratch em c76e51f)
- **Unit**: 53 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 53/53 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0, execução 1)
- **Test count before feature**: 47 unit + 56 integration (53 + 1 + 2, em c7cb8dc)
- **Test count after feature**: 53 unit + 56 integration (53 + 1 + 2)
- **Delta**: +6 unit. Integração sem caso novo. O SIDE-09 ganhou uma terceira medida
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do orquestrador em bf1386c conferem com a minha execução em c76e51f, que só muda uma spec.

---

## Fix Plans (if issues found)

### Fix 1: gatilho do PNL-04 sem teste (U10) - fechado

- **Resolução**: 13276d0. `actionFor` mapeia `toggle-done` (`src/webview/render.ts:598-599`). `test/unit/webview.test.ts:247-248` afirma os dois sentidos.
- **Done when conferido**: com o mapeamento invertido em `actionFor` (V1), `npm test` falha em `:247`. Com o certo, passa. O gate segue verde.

### Follow-up 1: lado sem rolagem do SIDE-09 - fechado

- **Resolução**: bf1386c. `test/integration/suite.cjs:604-620`. A asserção do overflow roda com `boardWidth` de 1077px e espera false. I4 prova que ela separa um quadro que cabe de um que não cabe.

### Follow-up 2: Independent Test do SIDE-09 - fechado

- **Resolução**: c76e51f. `.specs/features/sidebar-dashboard/spec.md:81`.

### Follow-up 3 (opcional, não bloqueia): dirigir a caixa dentro da webview

- **Root cause**: nenhum teste dispara eventos de DOM na página. A cola de `src/webview/main.ts:82-86` e `:106-109` fica fora do alcance, e G1, G2, G3a, G4 e G5 vivem ali.
- **Fix task**: uma mensagem de teste do host para a página que clica num `[data-action]`. Ela pode ir ao lado de `api.dashboardReport()`, pela API de teste (`src/extension.ts:91-93`). O SIDE-09 clicaria em "Ocultar concluídas" e mediria seis colunas com as concluídas, e depois cinco de novo. A mesma mensagem serviria aos cliques do NAV-12. Muda a premissa "Medida em VS Code real" (`spec.md:37`), então pede decisão do usuário.
- **Done when**: G1, G4 e G5 falham na integração, e o gate segue verde.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PNL-01 | Implementing | ✅ Verified |
| PNL-02 | Implementing | ✅ Verified |
| PNL-03 | Implementing | ✅ Verified |
| PNL-04 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| PNL-05 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: 18/24 mortas nesta iteração. Vivas: U7, equivalente, e G1, G2, G3a, G4, G5, na cola de DOM, aceitas. I1-I3 da iteração 1 mantidas
**Gate**: typecheck ok, 53 unit, 53 + 1 + 2 integration, 0 falhas

**What works**: o painel abre com "Ocultar concluídas" marcada, na aba e na barra lateral. As concluídas e a coluna Concluídas ficam fora do quadro. As cinco etapas ficam lado a lado a partir de 700px e cabem sem rolagem quando o quadro tem 1040px ou mais. Abaixo de 700px o quadro continua empilhado. Desmarcar a opção dá `hideDone: false`, e a página desenha as seis colunas com as concluídas. Marcar de novo dá `hideDone: true`. Uma concluída aberta pela árvore ou por notificação mostra o detalhe. Nenhum teste saiu, nenhuma asserção afrouxou.

**Issues found**: nenhum que bloqueie. A cola de DOM da caixa segue sem teste automático (Follow-up 3, opcional).

**Next steps**: atualizar os status do `spec.md` para Verified. Rodar o teste independente da spec com o usuário (UAT), que cobre a cola à mão. Decidir se o Follow-up 3 entra.
