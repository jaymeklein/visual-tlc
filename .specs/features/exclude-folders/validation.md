# Exclude Folders Validation

## Validation: exclude-folders - PASS ✅

Os 9 requisitos batem com a spec e os gates passam. O gap da iteração 1 fechou: a decisão do aviso virou a função pura `pendingWarnings`, e o `npm test` agora mata a mutação H6 (K1) e o `warned` que nunca esquece (K2). A vírgula passou a ser rejeitada em `tlcSpecs.exclude` (K3). Fica um mutante vivo fora dos critérios da feature (K7): a rejeição da vírgula pode vazar para `tlcSpecs.specsFolders` sem que nada falhe. Os testes de specs-folders nunca usaram vírgula, então a fraqueza é anterior a este diff. Vira follow-up, não bloqueia.

**Date**: 2026-09-29
**Spec**: `.specs/features/exclude-folders/spec.md`
**Diff range**: 4df4e6a..96161f2 (iteração 2: 8794d3a..96161f2, branch `feat/exclude-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 8794d3a | Reprovada | 9/9 critérios batem. H6 vivo: chave do aviso sem o nome da configuração. Lição L-016. 7 execuções do VS Code |
| 2 | 96161f2 | Aprovada | `pendingWarnings` em `src/core/folders.ts`, coberta por unit. K1 e K2 morrem no `npm test`. Vírgula rejeitada. `multiroot.cjs` com dois casos e contagem real. K7 vivo, fora dos critérios. 2 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `tasks.md`. Os passos são os commits do diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Especificar exclude-folders | ✅ Done | 534d377. Regra da entrada inválida apertada em 300ad82 |
| Interpretar as pastas excluídas (`parseExclude`) | ✅ Done | a8ebfc9 |
| Tirar as pastas excluídas da listagem (`store.ts`, manifesto) | ✅ Done | 11f76e4 |
| Cobrir a exclusão por pasta em multi-root | ✅ Done | 7b125a2, refeito em b4e11ea |
| Documentar a configuração no README | ✅ Done | 8794d3a, 96161f2 |
| Fix 1 da iteração 1: avisar as entradas de cada configuração à parte | ✅ Done | 0b2752a. K1, K2, K4, K5, K6 morrem no unit; W1 morre na integração |
| Follow-up da iteração 1: contagem real em `multiroot.cjs` | ✅ Done | b4e11ea |
| Follow-up da iteração 1: entrada com vírgula | ✅ Done | 0b2752a. K3 e K8 morrem no unit |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EXC-01 A extensão oferece `tlcSpecs.exclude` como lista de caminhos relativos, com padrão `["node_modules"]` | lista de textos, padrão `["node_modules"]`, escopo `resource` (tabela de decisões da spec) | `test/integration/suite.cjs:890` - `assert.deepEqual(declared.default, ['node_modules'])`. `:891` - `deepEqual(declared.type, ['array', 'string'])`. `:892` - `deepEqual(declared.items, { type: 'string' })`. `:893` - `assert.equal(declared.scope, 'resource')`. `:894` - valor efetivo `['node_modules']`. Efeito do padrão: `:903` cria `node_modules/pkg/.specs` e `:904`, `:922` esperam a listagem sem ela | ✅ PASS |
| EXC-02 WHEN a lista tem uma pasta THEN toda pasta de specs dentro dela sai da listagem, em qualquer profundidade | `test/nested/.specs` e `packages/api/test/.specs` fora; as demais ficam | `test/integration/suite.cjs:907-908` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['.specs', 'tests/.specs', 'tools/.specs'])`, com as pastas criadas em `:900-901`. `test/unit/folders.test.ts:84` - `deepEqual(parseExclude(['test']), { glob: '**/test/**', invalid: [] })`. `:85` - três entradas em `{...}`. `:89` - entradas normalizadas e sem repetição | ✅ PASS |
| EXC-03 WHEN `tlcSpecs.exclude` muda THEN projetos, árvores e diagnósticos atualizam sem recarregar a janela | as três superfícies com o estado novo, na mesma janela | **Projetos:** `test/integration/suite.cjs:908` e, na volta, `:922`. **Árvores:** `:910-913` - `deepEqual(api.featuresTree.getChildren().map(...), projectIds())`. `:914-917` - o mesmo para `api.projectTree`. **Diagnósticos:** `:905` espera os de `test/nested` antes. `:918` espera sumirem os de `/test/`. `:919` - `assert.ok(... includes('/tests/.specs/'))` | ✅ PASS (ver nota 1) |
| EXC-04 IF o valor é um texto THEN é usado como glob de exclusão | o texto vale como glob, sem conversão | `test/integration/suite.cjs:936-937` - `setExclude('{**/node_modules/**,**/tools/**}')` + listagem sem `tools/.specs`. `:938-939` - `setExclude('**/test/**')` + listagem com `node_modules/pkg/.specs` e sem as de `test`. `test/unit/folders.test.ts:93-95` - glob devolvido igual ao texto, `''` vira `null` | ✅ PASS |
| EXC-05 WHERE o workspace tem mais de uma pasta THEN cada pasta usa a lista configurada nela | `b` exclui `legacy`; `a` não exclui | `test/integration/multiroot.cjs:27-30` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }, { path: 'a/legacy/docs/specs', features: ['a-legacy'] }])`. `:31-34` - `deepEqual(listed('b').map((p) => p.path), ['b/.specs'])`. Configuração em `test/fixtures/multi-root/b/.vscode/settings.json:2`. Os dois sentidos falham com dados errados (ver "Asserções do multi-root") | ✅ PASS |
| EXC-06 IF a lista está vazia THEN lista todas as pastas, inclusive as de `node_modules` | nenhuma exclusão | `test/integration/suite.cjs:943-944` - `setExclude([])` + listagem com `node_modules/pkg/.specs`. `test/unit/folders.test.ts:99` - `deepEqual(parseExclude([]), { glob: null, invalid: [] })` | ✅ PASS |
| EXC-07 IF uma entrada é absoluta, tem `..`, vírgula ou glob THEN é ignorada, com aviso que traz o nome dela e o da configuração `tlcSpecs.exclude` | entrada sem efeito; um aviso por entrada com o nome dela e `tlcSpecs.exclude` | **Rejeição:** `test/unit/folders.test.ts:103-105` - oito entradas inválidas relatadas como escritas. `:109` - `deepEqual(parseExclude(['docs,old', 'test']), { glob: '**/test/**', invalid: ['docs,old'] })`. `:110` - vírgula no meio de três entradas. **Aviso:** `test/integration/suite.cjs:955-956` - `['../fora', '**/tools/**', 'test']` exclui só `test`. `:958-961` - `deepEqual([...shown].sort(), [...])` com o texto exato, `de tlcSpecs.exclude` nos dois. `:963` - `assert.equal(shown.length, 2)` depois do refresh. **Uma vez por configuração:** `test/unit/folders.test.ts:115-116` - a mesma entrada nas duas configurações e repetida na mesma chamada: `deepEqual(first.show, [fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude')])`. `:118-119` - `deepEqual(again.show, [])`. `:121-124` - a entrada volta depois de sair: `deepEqual(back.show, [fora('tlcSpecs.exclude')])` | ✅ PASS |
| EXC-08 WHEN uma pasta tem o nome da entrada como parte do nome THEN continua na listagem | `tests` fica com a entrada `test` | `test/integration/suite.cjs:908` - `tests/.specs` na listagem. `:909` - `deepEqual(featuresOf('tests/.specs'), ['in-tests'])`. `:919` - diagnósticos de `tests/.specs` mantidos | ✅ PASS |
| EXC-09 WHEN uma pasta está em `specsFolders` e dentro de uma entrada de `exclude` THEN fica fora | a exclusão vence | `test/integration/suite.cjs:927-928` - `test/docs/specs` aparece sem a exclusão. `:929-930` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` | ✅ PASS |

**Status**: ✅ All ACs covered. 9 de 9 requisitos batem com o resultado da spec. Nenhum gap de precisão.

### Notas

1. **EXC-03, árvores.** `getChildren()` lê `store.projects`, a mesma fonte de `projectIds()`. A asserção prova que o provider mostra os projetos novos. O evento de recarga da árvore é medido no SF-03 (`test/integration/suite.cjs:452` - `assert.ok(fired > 0)`), pelo mesmo caminho `affectsConfiguration('tlcSpecs')`. O código das árvores não mudou. Aceito.
2. **EXC-07, vírgula no host.** A vírgula só tem teste unitário. O host não tem caminho próprio: `parseExclude` devolve a entrada em `invalid` e `warn` a trata como qualquer outra. Os mutantes K3 e K8 morrem no unit.
3. **L-002 aplicada.** Listagem, árvores, diagnósticos e aviso são lidos na superfície que o usuário vê.
4. **L-006 aplicada.** A spec não tem critério de watcher. O gatilho do EXC-03 é a mudança de configuração, e o teste cobre lista, texto, lista vazia e volta ao padrão.

### Asserções do multi-root

`test/integration/multiroot.cjs` foi reescrito em b4e11ea. Para provar que as asserções novas falham nos dois sentidos sem abrir o VS Code, executei o arquivo com um módulo `vscode` falso (`multiroot-sim.cjs` no scratchpad, só leitura do arquivo real):

| Dados | Resultado |
| ----- | --------- |
| Listagem correta | 2/2, `run()` resolve |
| `b/legacy/.specs` a mais (`b` sem a própria lista, como H2) | 0/2: `:22` e `:31` falham. `run()` rejeita |
| `a/legacy/docs/specs` a menos (lista de `b` aplicada a `a`, como H5) | 0/2: `:18` e `:27` falham. `run()` rejeita |
| Nada excluído, `a/.specs` e `b/docs/specs` a mais (como H1) | 0/2: `:18` e `:27` falham. `run()` rejeita |

`run()` rejeitar é o que `test/integration/run.mjs` transforma em exit 1, o mesmo caminho da iteração 1. A listagem real do gate (2/2) confirma que a extensão produz os dados que o simulador espelha.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-exc2 HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`. Toda execução que abre o VS Code passou pelo lançador de desktop oculto, uma por vez, em primeiro plano. Foram 2 execuções, do limite de 3.

### Iteração 2 (HEAD 96161f2)

Núcleo, `npm test`:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| K1 | `src/core/folders.ts:60` | Chave do aviso sem o nome da configuração (H6 movida para `pendingWarnings`) | ✅ Killed (EXC-07 unit, `folders.test.ts:116`) |
| K2 | `src/core/folders.ts:64` | `warned` nunca esquece o que saiu da configuração | ✅ Killed (EXC-07 unit, `:124`) |
| K3 | `src/core/folders.ts:41` | Entrada com vírgula deixa de ser rejeitada | ✅ Killed (EXC-07 unit, `:109`) |
| K4 | `src/core/folders.ts:61` | Repetições da mesma chamada são avisadas | ✅ Killed (EXC-07 unit, `:116`) |
| K5 | `src/core/folders.ts:64` | `show` sempre vazio | ✅ Killed (EXC-07 unit) |
| K6 | `src/core/folders.ts:61` | Avisos anteriores ignorados | ✅ Killed (EXC-07 unit, `:119`) |
| K7 | `src/core/folders.ts:67` | Rejeição da vírgula vaza para `tlcSpecs.specsFolders` (padrão de `accepts`) | ❌ Survived. Fora dos critérios da feature, ver Follow-up 1 |
| K8 | `src/core/folders.ts:41` | Entrada com vírgula some sem ser relatada | ✅ Killed (EXC-07 unit, `:104`, `:109`) |
| C1 a C14 | `src/core/folders.ts` | As 14 mutações da iteração 1, reexecutadas no código novo | ✅ Killed (14/14) |

Host, suíte de integração no desktop oculto:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| W1 | `src/ui/store.ts:121` | `warn` descarta o conjunto `warned` que `pendingWarnings` devolve | ✅ Killed (`suite.cjs:963` "the warning was repeated on refresh", 4 !== 2; SF-09 `:536` também) |

Execuções que abriram o VS Code:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | real | 52/52 + 1/1 + 2/2 |
| 2 | W1 | scratch | 50/52 + 1/1 + 2/2 |

Resultados da iteração 1 que valem para o que não mudou: H1 (`store.ts:149`), H2 (`:135`), H4 (`:36`) e H5 (`:148`) mexem em linhas iguais às de 8794d3a. H1 e H4 morriam em `suite.cjs:904-908`, que não mudou. H2 e H5 morriam em `multiroot.cjs`, que foi reescrito; a simulação acima mostra que as asserções novas falham nos mesmos dois sentidos. H3 (`:103`) morria na comparação exata de `suite.cjs:958`, que só trocou o texto do aviso. Não reexecutei nenhuma delas.

### Julgamento do mutante vivo

- **K7.** Com o padrão de `accepts` rejeitando vírgula, `tlcSpecs.specsFolders` passa a ignorar uma entrada como `docs,old` com aviso. A spec de specs-folders rejeita só absoluta, `..` e glob, e o padrão de busca `**/docs,old/{STATE.md,...}` aceita a vírgula fora das chaves. É uma falha de produto na outra feature, não em EXC-01 a EXC-09. Nenhum teste de specs-folders usa vírgula, nem antes deste diff, então a fraqueza é anterior. Não bloqueia: os nove critérios desta feature ficam provados com ou sem K7.

**Sensor depth**: 8 mutações novas no núcleo, 14 reexecutadas, 1 no host
**Result**: 22/23 killed na iteração 2 - PASS ✅. 1 viva fora dos critérios (K7)

### Iteração 1 (HEAD 8794d3a), histórico

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
| H6 | `src/ui/store.ts:119` | Chave do aviso sem o nome da configuração | ❌ Survived (fechado na iteração 2 como K1) |

Placar da iteração 1: 19 de 20 mortas. 7 execuções do VS Code.

**Isolamento (iteração 2)**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor (arquivos comparados byte a byte). Junction removida com `rmdir` sem recursão. `node_modules` real com 129 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 96161f2, branch `feat/exclude-folders`. Nenhum processo do scratch ficou rodando.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`["node_modules", "test"]` neste repositório) fica para o orquestrador.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `pendingWarnings` tem 9 linhas e `warn` ficou com 5. `accepts` é um parâmetro com padrão, sem classe nem flag |
| Surgical changes | ✅ Iteração 2 muda `parseExclude`, `parseEntries`, `warn` e os testes. Nada fora disso |
| No scope creep | ✅ A vírgula entrou na spec antes de entrar no código |
| Matches patterns | ✅ `multiroot.cjs` usa o mesmo runner de `suite.cjs` |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Núcleo 1:1 com os critérios, inclusive vírgula e aviso por configuração. Host com caminho feliz, bordas e erro |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (8794d3a..96161f2)**:

- `test/integration/suite.cjs`: 1 linha trocada, o texto esperado do aviso em `:960` ganhou `sem vírgula`. Mesma força.
- `test/unit/folders.test.ts`: 20 inserções, 1 remoção (o `import`, que ganhou `pendingWarnings`).
- `test/integration/multiroot.cjs`: 45 inserções, 16 remoções. As duas `deepEqual` antigas (todos os caminhos, todas as features) viraram quatro, em dois casos: caminhos de `a` (`:18-21`), `b` com caminho e features (`:22`), `a` com caminhos e features (`:27-30`), caminhos de `b` (`:31-34`). A união cobre os mesmos caminhos e as mesmas features. A contagem passou a vir dos casos que passaram (`:51`). Nada ficou mais fraco.

**Integridade dos testes (4df4e6a..96161f2)**: só inserções nos testes, fora as linhas de `import`, a asserção do multi-root reescrita como acima e o texto do aviso.

Observações que não bloqueiam:

- O texto do aviso em `src/ui/store.ts:119` diz `sem vírgula` também para `tlcSpecs.specsFolders`, que aceita vírgula. É uma dica a mais, não uma regra errada.
- Os casos de exclude-folders em `suite.cjs` dependem do estado deixado pelo caso anterior. É o padrão que a suíte já usava.

---

## Edge Cases

- [x] EXC-06 Lista vazia lista tudo, inclusive `node_modules`: `test/integration/suite.cjs:943-944`
- [x] EXC-07 Entrada inválida ignorada, com aviso que traz o nome dela e o da configuração: `test/integration/suite.cjs:955-963`, `test/unit/folders.test.ts:103-124`
- [x] EXC-08 `tests` fica na listagem com a entrada `test`: `test/integration/suite.cjs:908-909`
- [x] EXC-09 Pasta incluída e excluída fica fora: `test/integration/suite.cjs:929-930`
- [x] Mesma entrada inválida em `specsFolders` e em `exclude`: `test/unit/folders.test.ts:115-116`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0
- **Unit**: 46 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 52/52 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0)
- **Test count before feature**: 39 unit + 48 integration (46 + 1 + 1, contados em 4df4e6a)
- **Test count after feature**: 46 unit + 55 integration (52 + 1 + 2)
- **Delta**: +7 unit, +7 integration. Na iteração 2: +2 unit e o multi-root dividido em 2 casos reais
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

Nenhum gap bloqueia a entrega. Fica um follow-up.

### Follow-up 1 (não bloqueia): pinar que `tlcSpecs.specsFolders` aceita vírgula (K7)

- **Root cause**: o padrão de `accepts` em `src/core/folders.ts:67` não tem teste. Nenhum caso de specs-folders usa uma entrada com vírgula.
- **Fix task**: em `test/unit/folders.test.ts`, junto do SF-09 (`:9-17`), `assert.deepEqual(parseSpecsFolders(['docs,old']), { entries: ['docs,old'], invalid: [] })`.
- **Done when**: o `npm test` falha com o padrão de `accepts` trocado por `(entry) => !entry.includes(',')`.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| EXC-01 | Implementing | ✅ Verified |
| EXC-02 | Implementing | ✅ Verified |
| EXC-03 | Implementing | ✅ Verified |
| EXC-04 | Implementing | ✅ Verified |
| EXC-05 | Implementing | ✅ Verified |
| EXC-06 | Implementing | ✅ Verified |
| EXC-07 | Implementing | ✅ Verified |
| EXC-08 | Implementing | ✅ Verified |
| EXC-09 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 9/9 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: iteração 2 com 22/23 mortas. 1 viva fora dos critérios da feature (K7). Iteração 1: 19/20, com o H6 fechado
**Gate**: typecheck ok, 46 unit, 52 + 1 + 2 integration, 0 falhas

**What works**: `tlcSpecs.exclude` como lista, com padrão `["node_modules"]` e escopo `resource`. Pasta listada sai da listagem em qualquer profundidade. Mudança de configuração atualiza projetos, árvores e diagnósticos. Texto continua valendo como glob. Cada pasta do multi-root usa a sua lista, nos dois sentidos. Lista vazia não exclui nada. Entrada absoluta, com `..`, vírgula ou glob é ignorada, com um aviso por configuração que traz o nome dela e o da configuração, sem repetir no refresh e de novo quando a entrada volta. `tests` fica com a entrada `test`. A exclusão vence a inclusão.

**Issues found**: nenhum gap bloqueante. K7 fica como follow-up.

**Next steps**: UAT interativo com o usuário e atualização dos status em `spec.md`. O follow-up 1 é uma linha de teste e pode entrar depois da entrega.
