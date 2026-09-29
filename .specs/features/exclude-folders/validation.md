# Exclude Folders Validation

## Validation: exclude-folders - FAIL ❌

Os 9 requisitos batem com a spec e os gates passam. O Fix 1 da iteração 1 fechou onde foi feito. A decisão do aviso virou a função pura `pendingWarnings`, e o `npm test` mata a chave sem a configuração (K1) e o `warned` que nunca esquece (K2). O sensor achou um mutante vivo novo na fiação do `store.ts` (H7). A entrada inválida de `tlcSpecs.specsFolders` pode sair com o nome `tlcSpecs.exclude`, e nenhum teste falha. Com H7, a mesma entrada nas duas configurações volta a gerar um aviso só: é a falha da iteração 1 por outro caminho. É gap de teste, de prioridade Minor. O produto em 96161f2 se comporta certo, com uma ressalva cosmética no texto do aviso de `specsFolders` (Fix 2).

**Date**: 2026-09-29
**Spec**: `.specs/features/exclude-folders/spec.md`
**Diff range**: 4df4e6a..96161f2 (iteração 2: 8794d3a..96161f2, branch `feat/exclude-folders`). O branch está em cb68481, que só muda `.specs`.
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

Este relatório substitui o que cb68481 gravou. Aquele relatório saiu de outro verificador, que rodou em paralelo e aprovou sem executar H7.

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 8794d3a | Reprovada | 9/9 critérios batem. H6 vivo: a chave do aviso sem o nome da configuração. Follow-ups: contagem fixa em `multiroot.cjs` e entrada com vírgula. Lição L-016. 7 execuções do VS Code |
| 2 | 96161f2 | Reprovada | `pendingWarnings` coberta por unit: K1 e K2 morrem. Vírgula rejeitada em `tlcSpecs.exclude`. `multiroot.cjs` com dois casos e contagem real. H7 vivo na fiação de `src/ui/store.ts:102`. K7 vivo, fora dos critérios (L-017). 4 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `tasks.md`. Os passos são os commits do diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Especificar exclude-folders | ✅ Done | 534d377. Regra da entrada inválida apertada em 300ad82 |
| Interpretar as pastas excluídas (`parseExclude`) | ✅ Done | a8ebfc9. Vírgula em 0b2752a |
| Tirar as pastas excluídas da listagem (`store.ts`, manifesto) | ✅ Done | 11f76e4 |
| Cobrir a exclusão por pasta em multi-root | ✅ Done | 7b125a2. Dividido em dois casos em b4e11ea |
| Documentar a configuração no README | ✅ Done | 8794d3a, 96161f2 |
| Fix 1 da iteração 1: avisar as entradas de cada configuração à parte | ⚠️ Partial | 0b2752a. K1 e K2 morrem no unit. H7 vivo: o nome que `store.ts:102` dá às entradas de `specsFolders` não tem teste |
| Follow-up da iteração 1: contagem real em `multiroot.cjs` | ✅ Done | b4e11ea |
| Follow-up da iteração 1: entrada com vírgula | ✅ Done | 300ad82 na spec, 0b2752a no código. K3, K8 e K9 morrem no unit |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EXC-01 A extensão oferece `tlcSpecs.exclude` como lista de caminhos relativos, com padrão `["node_modules"]` | lista de textos, padrão `["node_modules"]`, escopo `resource` (tabela de decisões da spec) | `test/integration/suite.cjs:890` - `assert.deepEqual(declared.default, ['node_modules'])`. `:891` - `deepEqual(declared.type, ['array', 'string'])`. `:892` - `deepEqual(declared.items, { type: 'string' })`. `:893` - `assert.equal(declared.scope, 'resource')`. `:894` - valor efetivo `['node_modules']`. Efeito do padrão: `:903` cria `node_modules/pkg/.specs` e `:904`, `:922` esperam a listagem sem ela | ✅ PASS |
| EXC-02 WHEN a lista tem uma pasta THEN toda pasta de specs dentro dela sai da listagem, em qualquer profundidade | `test/nested/.specs` e `packages/api/test/.specs` fora; as demais ficam | `test/integration/suite.cjs:907-908` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['.specs', 'tests/.specs', 'tools/.specs'])`, com as pastas criadas em `:900-901`. `test/unit/folders.test.ts:84` - `deepEqual(parseExclude(['test']), { glob: '**/test/**', invalid: [] })`. `:85` - três entradas em `{...}`. `:89` - entradas normalizadas e sem repetição | ✅ PASS |
| EXC-03 WHEN `tlcSpecs.exclude` muda THEN projetos, árvores e diagnósticos atualizam sem recarregar a janela | as três superfícies com o estado novo, na mesma janela | **Projetos:** `test/integration/suite.cjs:908` e, na volta, `:922`. **Árvores:** `:910-913` - `deepEqual(api.featuresTree.getChildren().map(...), projectIds())`. `:914-917` - o mesmo para `api.projectTree`. **Diagnósticos:** `:905` espera os de `test/nested` antes. `:918` espera sumirem os de `/test/`. `:919` - `assert.ok(... includes('/tests/.specs/'))` | ✅ PASS (ver nota 1) |
| EXC-04 IF o valor é um texto THEN é usado como glob de exclusão | o texto vale como glob, sem conversão | `test/integration/suite.cjs:936-937` - `setExclude('{**/node_modules/**,**/tools/**}')` + listagem sem `tools/.specs`. `:938-939` - `setExclude('**/test/**')` + listagem com `node_modules/pkg/.specs` e sem as de `test`. `test/unit/folders.test.ts:93-95` - glob devolvido igual ao texto, `''` vira `null` | ✅ PASS |
| EXC-05 WHERE o workspace tem mais de uma pasta THEN cada pasta usa a lista configurada nela | `b` exclui `legacy`; `a` não exclui | `test/integration/multiroot.cjs:27-30` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }, { path: 'a/legacy/docs/specs', features: ['a-legacy'] }])`. `:31-34` - `deepEqual(listed('b').map((p) => p.path), ['b/.specs'])`. Configuração em `test/fixtures/multi-root/b/.vscode/settings.json:2` | ✅ PASS |
| EXC-06 IF a lista está vazia THEN lista todas as pastas, inclusive as de `node_modules` | nenhuma exclusão | `test/integration/suite.cjs:943-944` - `setExclude([])` + listagem com `node_modules/pkg/.specs`. `test/unit/folders.test.ts:99` - `deepEqual(parseExclude([]), { glob: null, invalid: [] })` | ✅ PASS |
| EXC-07 IF uma entrada é absoluta, contém `..`, vírgula ou glob THEN é ignorada, com aviso que traz o nome dela e o da configuração `tlcSpecs.exclude` | entrada sem efeito; aviso com o nome da entrada e `tlcSpecs.exclude` | **Rejeição:** `test/unit/folders.test.ts:103-105` - oito entradas inválidas relatadas como escritas. `:109` - `deepEqual(parseExclude(['docs,old', 'test']), { glob: '**/test/**', invalid: ['docs,old'] })`. `:110` - vírgula entre três entradas. **Aviso:** `test/integration/suite.cjs:955-956` - `['../fora', '**/tools/**', 'test']` exclui só `test`. `:958-961` - `deepEqual([...shown].sort(), [...])` com o texto exato, `de tlcSpecs.exclude` nos dois. `:963` - `assert.equal(shown.length, 2)` depois do refresh. **Uma vez por configuração:** `test/unit/folders.test.ts:115-116` - `deepEqual(first.show, [fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude')])`. `:118-124` - sem repetição, e de novo quando a entrada volta | ✅ PASS (H7 vivo, ver Fix 1) |
| EXC-08 WHEN uma pasta tem o nome da entrada como parte do nome THEN continua na listagem | `tests` fica com a entrada `test` | `test/integration/suite.cjs:908` - `tests/.specs` na listagem. `:909` - `deepEqual(featuresOf('tests/.specs'), ['in-tests'])`. `:919` - diagnósticos de `tests/.specs` mantidos | ✅ PASS |
| EXC-09 WHEN uma pasta está em `specsFolders` e dentro de uma entrada de `exclude` THEN fica fora | a exclusão vence | `test/integration/suite.cjs:927-928` - `test/docs/specs` aparece sem a exclusão. `:929-930` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` | ✅ PASS |

**Status**: ✅ All ACs covered. 9 de 9 requisitos batem com o resultado da spec. Nenhum gap de precisão nos critérios. ❌ Gap de discriminação no aviso (H7).

### Notas

1. **EXC-03, árvores.** `getChildren()` lê `store.projects`, a mesma fonte de `projectIds()`. A asserção prova que o provider mostra os projetos novos. O evento de recarga da árvore é medido no SF-03 (`test/integration/suite.cjs:452` - `assert.ok(fired > 0)`), pelo mesmo caminho `affectsConfiguration('tlcSpecs')`. O código das árvores não mudou. Aceito.
2. **EXC-07, vírgula no host.** A vírgula só tem teste unitário. O host não tem caminho próprio para ela: `src/ui/store.ts:103` transforma em aviso toda entrada que `parseExclude` devolve em `invalid`, e `suite.cjs:958-961` prova esse caminho com o texto exato. Uma mutação que só afete a vírgula mora em `parseExclude` e morre no unit (K3, K8, K9). Aceito.
3. **A vírgula só vale para `tlcSpecs.exclude`.** No código, sim: só `parseExclude` passa a checagem (`src/core/folders.ts:41`); `parseSpecsFolders` (`:32`) usa o padrão de `accepts`, que aceita tudo. Na spec, a borda (`spec.md:66`) nomeia só `tlcSpecs.exclude`. A linha de decisão (`spec.md:36`) justifica a regra com "Mesma regra de `tlcSpecs.specsFolders`", o que deixou de valer para a vírgula. Nenhum teste prova que `specsFolders` continua aceitando vírgula (K7). Ver Follow-up 3.
4. **Texto do aviso.** A mensagem (`src/ui/store.ts:119`) é a mesma para as duas configurações e diz `sem vírgula`. `tlcSpecs.specsFolders` aceita vírgula. Para uma entrada de `specsFolders`, o aviso dá uma regra que essa configuração não tem. Não é desvio de spec: nenhuma das duas specs define a orientação do aviso (o EXC-07 pede o nome da entrada e o da configuração; o SF-09, o nome da entrada). É defeito de texto, Cosmetic. Ver Fix 2.
5. **L-002 e L-006 aplicadas.** Listagem, árvores, diagnósticos e aviso são lidos na superfície que o usuário vê. A spec não tem critério de watcher, e o gatilho do EXC-03 é a mudança de configuração.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-exc2-vb 96161f2`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`. Toda execução que abre o VS Code passou pelo lançador de desktop oculto, uma por vez, em primeiro plano. Foram 4 execuções, do limite de 4.

### Iteração 2 (HEAD 96161f2), executadas

Núcleo (`npm test`, não abre nada):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| K1 | `src/core/folders.ts:60` | Chave do aviso sem o nome da configuração (`const key = item.entry`): o H6 no lugar novo | ✅ Killed (`test/unit/folders.test.ts:116`) |
| K2 | `src/core/folders.ts:64` | `warned` nunca esquece (`new Set([...warned, ...seen])`) | ✅ Killed (`:124`) |
| K3 | `src/core/folders.ts:41` | `parseExclude` sem a checagem da vírgula | ✅ Killed (`:109`) |
| K4 | `src/core/folders.ts:61` | Avisos anteriores ignorados: cada carga avisa de novo | ✅ Killed (`:119`) |
| K5 | `src/core/folders.ts:61` | Repetição na mesma chamada avisada duas vezes | ✅ Killed (`:116`) |
| K6 | `src/core/folders.ts:64` | `warned` sempre vazio | ✅ Killed (`:119`) |
| K7 | `src/core/folders.ts:67` | Padrão de `accepts` rejeita vírgula: a regra vaza para `tlcSpecs.specsFolders` | ❌ Survived (46/46). Fora dos critérios, ver Follow-up 3 |
| K8 | `src/core/folders.ts:41` | Vírgula rejeitada só no início (`startsWith`) | ✅ Killed (`:109`) |
| K9 | `src/core/folders.ts:71` | `accepts` nunca consultado | ✅ Killed (`:109`) |
| K10 | `src/core/folders.ts:62` | Entrada já avisada sai do estado seguinte: avisa de novo na carga seguinte | ✅ Killed (`:122`) |

Host (suíte de integração, desktop oculto):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H7 | `src/ui/store.ts:102` | Entradas de `specsFolders` avisadas com o nome `tlcSpecs.exclude` | ❌ Survived (52/52 + 1/1 + 2/2). Falha de produto, ver Fix 1 |
| H8 | `src/ui/store.ts:121` | `warn` descarta o `warned` que `pendingWarnings` devolve | ✅ Killed (`suite.cjs:537` SF-09 e `:963` EXC-07: "the warning was repeated on refresh". 50/52) |
| H9 | `src/ui/store.ts:118` | `warn` avisa todo `invalid` e ignora `show` | ✅ Killed (`suite.cjs:537` e `:963`, mesma mensagem. 50/52) |

O bundle da execução de H7 foi conferido: `dist/extension.cjs` do scratch tinha `setting: "tlcSpecs.exclude"` duas vezes e nenhuma vez `tlcSpecs.specsFolders`, e o log mostra a extensão carregada do scratch.

Execuções que abriram o VS Code:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | real (cb68481, código de 96161f2) | 52/52 + 1/1 + 2/2 |
| 2 | H7 | scratch | 52/52 + 1/1 + 2/2 |
| 3 | H9 | scratch | 50/52 + 1/1 + 2/2 |
| 4 | H8 | scratch | 50/52 + 1/1 + 2/2 |

### Julgamento dos mutantes vivos

- **H7, falha de produto, bloqueia.** `src/ui/store.ts:102` é o único lugar que dá nome às entradas de `specsFolders`. Com o nome trocado, `"tlcSpecs.specsFolders": ["../specs"]` avisa `a entrada "../specs" de tlcSpecs.exclude foi ignorada`, e o usuário vai corrigir a configuração errada. Com a mesma entrada nas duas configurações, as chaves coincidem e sai um aviso só, que é o efeito do H6 da iteração 1. O unit (`test/unit/folders.test.ts:113-125`) monta os nomes à mão e não passa pelo `store.ts`. O SF-09 (`test/integration/suite.cjs:533-534`) só confere `includes('"../fora"')`. O espelho, H3 (`:103`), morre em `suite.cjs:958` porque o EXC-07 compara o texto inteiro. A linha 102 é código deste diff (11f76e4), a spec pede o aviso com a entrada e a configuração (`spec.md:36`), e um teste de integração mede o efeito.
- **K7, falha de produto fora dos critérios, não bloqueia.** Com a vírgula rejeitada no padrão de `accepts`, `tlcSpecs.specsFolders` passa a ignorar `docs,old` com aviso. Afeta só nomes de pasta com vírgula, e o usuário vê o aviso. A spec de specs-folders não diz que a vírgula vale, só lista o que é inválido. Nenhum teste de specs-folders usou vírgula, nem antes deste diff. A lição L-017 já registra esse sinal.

### Não executadas

- **Troca dos dois nomes em `src/ui/store.ts:102-103`.** Dominada por H3 (iteração 1, morta em `suite.cjs:958`). O EXC-07 roda com `specsFolders` no padrão, então a troca aparece ali igual a H3.
- **`this.warned = new Set([...this.warned, ...warned])` em `src/ui/store.ts:121`** (o store que nunca esquece). Sobrevive por construção: nenhum teste de integração tira uma entrada inválida e a põe de volta na mesma configuração. Não conta no placar. A regra mora em `pendingWarnings` (K2 morta), e o store só guarda o que recebe (H8 morta). Nenhuma das duas specs pede o aviso de novo quando a entrada volta. Resíduo, não bloqueia.
- **C1 a C14 e H1 a H5 da iteração 1.** Carregadas, não reexecutadas. O código delas não mudou em 0b2752a, fora o parâmetro `accepts`, e os testes que as mataram não mudaram. A exceção é `multiroot.cjs`, reescrito em b4e11ea. Pela leitura, as asserções novas falham nos mesmos sentidos: H2 faz `b/legacy/.specs` aparecer e quebra `multiroot.cjs:22` e `:31-34`; H5 tira `a/legacy/docs/specs` e quebra `:18-21` e `:27-30`.

### Iteração 1 (HEAD 8794d3a), histórico

Linhas de 8794d3a.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/folders.ts:41` | Glob sem o prefixo `**/` | ✅ Killed |
| C2 | `src/core/folders.ts:41` | Glob sem o sufixo `/**` | ✅ Killed |
| C3 | `src/core/folders.ts:42` | Várias entradas unidas sem chaves | ✅ Killed |
| C4 | `src/core/folders.ts:59` | Entrada com glob deixa de ser rejeitada | ✅ Killed |
| C5 | `src/core/folders.ts:61` | Entrada com `..` deixa de ser rejeitada | ✅ Killed |
| C6 | `src/core/folders.ts:59` | Entrada absoluta deixa de ser rejeitada | ✅ Killed |
| C7 | `src/core/folders.ts:39` | Texto tratado como nome de pasta | ✅ Killed |
| C8 | `src/core/folders.ts:42` | Lista vazia devolve o glob padrão | ✅ Killed |
| C9 | `src/core/folders.ts:51` | Entradas repetidas não são unificadas | ✅ Killed |
| C10 | `src/core/folders.ts:39` | Texto vazio devolve `''` em vez de `null` | ✅ Killed |
| C11 | `src/core/folders.ts:42` | Só a primeira de duas entradas vale | ✅ Killed |
| C12 | `src/core/folders.ts:42` | Entradas inválidas somem do relato de `parseExclude` | ✅ Killed |
| C13 | `src/core/folders.ts:50` | Entrada inválida relatada normalizada, não como escrita | ✅ Killed |
| C14 | `src/core/folders.ts:51` | Fallback `.specs` vaza para a lista de exclusão | ✅ Killed |
| H1 | `src/ui/store.ts:153` | Glob de exclusão nunca chega ao `findFiles` | ✅ Killed |
| H2 | `src/ui/store.ts:139` | `tlcSpecs.exclude` lida sem a pasta do workspace | ✅ Killed |
| H3 | `src/ui/store.ts:103` | Entrada inválida de `exclude` avisada com o nome `tlcSpecs.specsFolders` | ✅ Killed |
| H4 | `src/ui/store.ts:36` | Mudança de `tlcSpecs.exclude` não recarrega | ✅ Killed |
| H5 | `src/ui/store.ts:152` | A lista da última pasta do workspace vale para todas | ✅ Killed |
| H6 | `src/ui/store.ts:119` | Chave do aviso sem o nome da configuração | ❌ Survived. Na iteração 2 virou K1, morta |

**Sensor depth**: iteração 2 com 10 mutações de núcleo e 3 de host no código novo e na fiação dele. 20 mutações da iteração 1 carregadas
**Result**: iteração 2 com 11/13 mortas - FAIL ❌. 1 viva de produto que bloqueia (H7), 1 viva fora dos critérios (K7)

**Isolamento**: `git status --porcelain` da árvore real vazio no início (96161f2). Durante a leitura, outro verificador gravou `validation.md` e a lição L-017, e o orquestrador fez o commit cb68481. A limpeza desse verificador apagou meu primeiro scratch (`wt-exc2`, mesmo caminho) antes da primeira mutação, e o `node_modules` real seguiu íntegro (`npm ls` exit 0). Refiz o scratch como `wt-exc2-vb`. Base do sensor: porcelain vazio em cb68481. Depois do sensor: vazio. Junction removida com `rmdir` sem recursão. `node_modules` real com 129 entradas (131 com as ocultas) antes e depois, `npm ls --depth=0` exit 0. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em cb68481, branch `feat/exclude-folders`. Nenhum VS Code de teste ficou rodando.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`["node_modules", "test"]` neste repositório) fica para o orquestrador.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `pendingWarnings` tem 9 linhas e `warn` ficou com 5. `accepts` é um parâmetro com padrão, usado por um chamador |
| Surgical changes | ✅ A iteração 2 muda `parseExclude`, `parseEntries`, `warn`, o texto do aviso e os testes |
| No scope creep | ✅ A vírgula entrou na spec (300ad82) antes do código (0b2752a) |
| Matches patterns | ✅ `multiroot.cjs` usa o mesmo runner de `suite.cjs`. `pendingWarnings` segue o núcleo puro de `folders.ts` |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Núcleo 1:1 com os critérios, inclusive vírgula e aviso por configuração. No host, o nome da configuração só é conferido no aviso de `exclude`. O aviso de `specsFolders` é conferido por trecho (H7) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ O caso "until it leaves that setting" (`folders.test.ts:121-124`) vem do Done-when do Fix 1 da iteração 1 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (8794d3a..96161f2)**:

- `test/integration/suite.cjs`: 1 linha trocada. O texto esperado em `:960` ganhou `sem vírgula`, e a comparação continua exata. Mesma força.
- `test/unit/folders.test.ts`: 20 inserções, 1 remoção (o `import`, que ganhou `pendingWarnings`). 44 para 46 testes.
- `test/integration/multiroot.cjs`: um caso com duas `deepEqual` sobre todos os projetos virou dois casos com quatro `deepEqual`: caminhos de `a` (`:18-21`), `b` com caminho e features (`:22`), `a` com caminhos e features (`:27-30`), caminhos de `b` (`:31-34`). `listed` (`:10-14`) filtra por `a/` e `b/`, e `asRelativePath(..., true)` põe o nome da pasta na frente de todo projeto, então o filtro não descarta nada. Todos os caminhos e todas as features seguem conferidos. Só a ordem entre as duas pastas deixou de ser conferida, e nenhum critério fala dela. A contagem vem dos casos que passaram (`:51`). Nada ficou mais fraco.

Observações que não bloqueiam:

- `package.json:240` (descrição da configuração na tela de Settings) ainda lista "absolutas, com `..` ou com glob". O README (`README.md:96`) já cita a vírgula e o aviso. Ver Follow-up 4.
- Os casos de exclude-folders em `suite.cjs` dependem do estado deixado pelo caso anterior. É o padrão que a suíte já usava.

---

## Edge Cases

- [x] EXC-06 Lista vazia lista tudo, inclusive `node_modules`: `test/integration/suite.cjs:943-944`
- [x] EXC-07 Entrada inválida ignorada, com aviso que traz o nome dela e o da configuração: `test/integration/suite.cjs:955-963`, `test/unit/folders.test.ts:102-124`
- [x] EXC-08 `tests` fica na listagem com a entrada `test`: `test/integration/suite.cjs:908-909`
- [x] EXC-09 Pasta incluída e excluída fica fora: `test/integration/suite.cjs:929-930`
- [ ] Mesma entrada inválida em `specsFolders` e em `exclude`, pelo `store.ts`: a função pura prova (`test/unit/folders.test.ts:115-116`), a fiação não (H7)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0
- **Unit**: 46 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 52/52 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0)
- **Test count before feature**: 39 unit + 48 integration (46 + 1 + 1, contados em 4df4e6a)
- **Test count after feature**: 46 unit + 55 integration (52 + 1 + 2)
- **Delta**: +7 unit, +6 casos em `suite.cjs`, +1 caso em `multiroot.cjs`. Na iteração 2: +2 unit, e o multi-root passou a ter 2 casos reais
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do orquestrador conferem com a minha execução.

---

## Fix Plans (if issues found)

### Fix 1: nome da configuração no aviso de `specsFolders` sem teste (H7)

- **Root cause**: `src/ui/store.ts:102` dá o nome às entradas de `specsFolders`, e nenhum teste passa por ali conferindo o nome. O unit do Fix 1 da iteração 1 (`test/unit/folders.test.ts:113-125`) monta `{ setting, entry }` à mão. O SF-09 (`test/integration/suite.cjs:533-534`) só confere o trecho `"../fora"`.
- **Fix task**: novo caso em `test/integration/suite.cjs`, depois do EXC-07 (`:969`), com o `showWarningMessage` trocado como em `:948-953`:
  1. `setFolders(['../fora', '.specs'])` e `setExclude(['../fora', 'node_modules'])`. Esperar dois avisos. `deepEqual([...shown].sort(), [...])` com o texto exato dos dois: um com `de tlcSpecs.specsFolders`, outro com `de tlcSpecs.exclude`.
  2. `await api.refresh()` e `assert.equal(shown.length, 2)`.
  3. Restaurar as duas configurações no `finally` e esperar a listagem padrão, como em `:966-968`.
- **Done when**: a suíte falha com `setting: 'tlcSpecs.exclude'` em `src/ui/store.ts:102`. A verificação gasta duas execuções do VS Code (gate e H7).
- **Priority**: Minor

### Fix 2 (junto do Fix 1): orientação do aviso de `specsFolders`

- **Root cause**: o texto único em `src/ui/store.ts:119` diz `sem vírgula` também para `tlcSpecs.specsFolders`, que aceita vírgula (`src/core/folders.ts:32`).
- **Fix task**: decidir o texto de cada configuração. O mais simples é levar a orientação junto do nome em `src/ui/store.ts:101-104`. O caso novo do Fix 1 fixa o texto escolhido para `specsFolders`.
- **Priority**: Cosmetic

### Follow-up 3 (não bloqueia): pinar que `tlcSpecs.specsFolders` aceita vírgula (K7)

- **Root cause**: o padrão de `accepts` em `src/core/folders.ts:67` não tem teste. A linha de decisão da spec (`spec.md:36`) diz "Mesma regra de `tlcSpecs.specsFolders`", o que não vale mais para a vírgula.
- **Fix task**: em `test/unit/folders.test.ts`, junto do SF-09 (`:10-13`), `assert.deepEqual(parseSpecsFolders(['docs,old']), { entries: ['docs,old'], invalid: [] })`. Na spec, dizer na linha de decisão que a vírgula vale só para `tlcSpecs.exclude`.
- **Done when**: o `npm test` falha com o padrão de `accepts` trocado por `(e) => !e.includes(',')`.
- **Priority**: Minor

### Follow-up 4 (não bloqueia): descrição do manifesto

- **Root cause**: `package.json:240` não cita a vírgula nem o aviso. O README (`README.md:96`) cita.
- **Fix task**: alinhar a `markdownDescription` com o README.
- **Priority**: Cosmetic

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. cb68481 marcou os nove como Verified. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| EXC-01 | Verified (cb68481) | ✅ Verified |
| EXC-02 | Verified (cb68481) | ✅ Verified |
| EXC-03 | Verified (cb68481) | ✅ Verified |
| EXC-04 | Verified (cb68481) | ✅ Verified |
| EXC-05 | Verified (cb68481) | ✅ Verified |
| EXC-06 | Verified (cb68481) | ✅ Verified |
| EXC-07 | Verified (cb68481) | ❌ Needs Fix (só teste, Fix 1) |
| EXC-08 | Verified (cb68481) | ✅ Verified |
| EXC-09 | Verified (cb68481) | ✅ Verified |

---

## Summary

**Overall**: ⚠️ Issues

**Spec-anchored check**: 9/9 requisitos batem com a spec. 0 gaps de precisão nos critérios
**Sensor**: iteração 2 com 11/13 mortas. 1 viva de produto que bloqueia (H7), 1 viva fora dos critérios (K7). Iteração 1: 19/20, com H6 fechado como K1
**Gate**: typecheck ok, 46 unit, 52 + 1 + 2 integration, 0 falhas

**What works**: `tlcSpecs.exclude` como lista, com padrão `["node_modules"]` e escopo `resource`. Pasta listada sai da listagem em qualquer profundidade. Mudança de configuração atualiza projetos, árvores e diagnósticos. Texto continua valendo como glob. Cada pasta do multi-root usa a sua lista, nos dois sentidos. Lista vazia não exclui nada. Entrada absoluta, com `..`, vírgula ou glob é ignorada, com aviso que traz o nome dela e `tlcSpecs.exclude`. `pendingWarnings` avisa uma vez por configuração e entrada, e de novo quando a entrada volta. `tests` fica com a entrada `test`. A exclusão vence a inclusão.

**Issues found**: o nome que o store dá às entradas de `specsFolders` não tem teste (H7). O Fix 1 descreve o caso que falta, e o Fix 2 vai junto.

**Next steps**: executar o Fix 1 e o Fix 2 e verificar de novo. É a última iteração antes de escalar. A nova verificação precisa do gate e de H7. Os follow-ups 3 e 4 podem entrar no mesmo commit ou depois da entrega.
