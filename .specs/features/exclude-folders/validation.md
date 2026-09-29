# Exclude Folders Validation

## Validation: exclude-folders - FAIL ❌

Os 9 requisitos batem com a spec e os gates passam. O sensor deixou um mutante vivo no código novo (H6): o aviso de entrada inválida pode perder o nome da configuração na chave e nenhum teste falha. Com essa falha, a mesma entrada inválida em `tlcSpecs.specsFolders` e em `tlcSpecs.exclude` gera um aviso só, e a entrada de `tlcSpecs.exclude` fica ignorada sem aviso próprio. É um gap de teste, de prioridade Minor. O produto em 8794d3a se comporta certo.

**Date**: 2026-09-29
**Spec**: `.specs/features/exclude-folders/spec.md`
**Diff range**: 4df4e6a..8794d3a (commits 534d377..8794d3a, branch `feat/exclude-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Task Completion

Escopo Medium, sem `tasks.md`. Os passos são os commits do diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Especificar exclude-folders | ✅ Done | 534d377 |
| Interpretar as pastas excluídas (`parseExclude`) | ✅ Done | a8ebfc9 |
| Tirar as pastas excluídas da listagem (`store.ts`, manifesto) | ✅ Done | 11f76e4. H6 vivo no `warn` |
| Cobrir a exclusão por pasta em multi-root | ✅ Done | 7b125a2 |
| Documentar a configuração no README | ✅ Done | 8794d3a |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EXC-01 A extensão oferece `tlcSpecs.exclude` como lista de caminhos relativos, com padrão `["node_modules"]` | lista de textos, padrão `["node_modules"]`, escopo `resource` (tabela de decisões da spec) | `test/integration/suite.cjs:890` - `assert.deepEqual(declared.default, ['node_modules'])`. `:891` - `deepEqual(declared.type, ['array', 'string'])`. `:892` - `deepEqual(declared.items, { type: 'string' })`. `:893` - `assert.equal(declared.scope, 'resource')`. `:894` - valor efetivo `['node_modules']`. Efeito do padrão: `:903` cria `node_modules/pkg/.specs` e `:904`, `:922` esperam a listagem sem ela | ✅ PASS |
| EXC-02 WHEN a lista tem uma pasta THEN toda pasta de specs dentro dela sai da listagem, em qualquer profundidade | `test/nested/.specs` e `packages/api/test/.specs` fora; as demais ficam | `test/integration/suite.cjs:907-908` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['.specs', 'tests/.specs', 'tools/.specs'])`, com as pastas criadas em `:900-901`. `test/unit/folders.test.ts:84` - `deepEqual(parseExclude(['test']), { glob: '**/test/**', invalid: [] })`. `:85` - três entradas em `{...}`. `:89` - entradas normalizadas e sem repetição | ✅ PASS |
| EXC-03 WHEN `tlcSpecs.exclude` muda THEN projetos, árvores e diagnósticos atualizam sem recarregar a janela | as três superfícies com o estado novo, na mesma janela | **Projetos:** `test/integration/suite.cjs:908` e, na volta, `:922`. **Árvores:** `:910-913` - `deepEqual(api.featuresTree.getChildren().map(...), projectIds())`. `:914-917` - o mesmo para `api.projectTree`. **Diagnósticos:** `:905` espera os de `test/nested` antes. `:918` espera sumirem os de `/test/`. `:919` - `assert.ok(... includes('/tests/.specs/'))` | ✅ PASS (ver nota 1) |
| EXC-04 IF o valor é um texto THEN é usado como glob de exclusão | o texto vale como glob, sem conversão | `test/integration/suite.cjs:936-937` - `setExclude('{**/node_modules/**,**/tools/**}')` + listagem sem `tools/.specs`. `:938-939` - `setExclude('**/test/**')` + listagem com `node_modules/pkg/.specs` e sem as de `test`. `test/unit/folders.test.ts:93-95` - glob devolvido igual ao texto, `''` vira `null` | ✅ PASS |
| EXC-05 WHERE o workspace tem mais de uma pasta THEN cada pasta usa a lista configurada nela | `b` exclui `legacy`; `a` não exclui | `test/integration/multiroot.cjs:13-16` - `deepEqual(..., ['a/docs/specs', 'a/legacy/docs/specs', 'b/.specs'])`. `:17-20` - `[['a-custom'], ['a-legacy'], ['b-default']]`. Configuração em `test/fixtures/multi-root/b/.vscode/settings.json:2` | ✅ PASS |
| EXC-06 IF a lista está vazia THEN lista todas as pastas, inclusive as de `node_modules` | nenhuma exclusão | `test/integration/suite.cjs:943-944` - `setExclude([])` + listagem com `node_modules/pkg/.specs`. `test/unit/folders.test.ts:99` - `deepEqual(parseExclude([]), { glob: null, invalid: [] })` | ✅ PASS |
| EXC-07 IF uma entrada é absoluta, tem `..` ou glob THEN é ignorada, com aviso que traz o nome dela | entrada sem efeito; aviso com o nome da entrada | `test/integration/suite.cjs:955-956` - `['../fora', '**/tools/**', 'test']` exclui só `test`. `:958-961` - `deepEqual([...shown].sort(), [...])` com o texto exato dos dois avisos. `:963` - `assert.equal(shown.length, 2)` depois do refresh. `test/unit/folders.test.ts:103-105` - oito entradas inválidas relatadas como escritas | ✅ PASS (H6 vivo, ver Fix 1) |
| EXC-08 WHEN uma pasta tem o nome da entrada como parte do nome THEN continua na listagem | `tests` fica com a entrada `test` | `test/integration/suite.cjs:908` - `tests/.specs` na listagem. `:909` - `deepEqual(featuresOf('tests/.specs'), ['in-tests'])`. `:919` - diagnósticos de `tests/.specs` mantidos | ✅ PASS |
| EXC-09 WHEN uma pasta está em `specsFolders` e dentro de uma entrada de `exclude` THEN fica fora | a exclusão vence | `test/integration/suite.cjs:927-928` - `test/docs/specs` aparece sem a exclusão. `:929-930` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` | ✅ PASS |

**Status**: ✅ All ACs covered. 9 de 9 requisitos batem com o resultado da spec. Nenhum gap de precisão. ❌ Gap de discriminação no aviso (H6).

### Notas

1. **EXC-03, árvores.** `getChildren()` lê `store.projects`, a mesma fonte de `projectIds()`. A asserção prova que o provider mostra os projetos novos. O evento de recarga da árvore (`onDidChangeTreeData`) não é medido aqui. Ele é medido no SF-03 (`test/integration/suite.cjs:452` - `assert.ok(fired > 0)`), que usa o mesmo caminho `affectsConfiguration('tlcSpecs')`. O código das árvores não mudou neste diff. Aceito.
2. **L-002 aplicada.** Listagem, árvores, diagnósticos e aviso são lidos na superfície que o usuário vê: projetos da API, provider das árvores, coleção de diagnósticos e texto do `showWarningMessage`.
3. **L-006 aplicada.** A spec não tem critério de watcher. O gatilho do EXC-03 é a mudança de configuração, e o teste cobre lista, texto, lista vazia e volta ao padrão. Nenhum teste cria um arquivo dentro de uma pasta já excluída. O caminho de código é o mesmo (`findFiles` com o glob), então não abri gap.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-exc HEAD`, com junction para `node_modules`. Uma mutação por vez, revertida antes da seguinte. Sem `git stash`. Toda execução que abre o VS Code passou pelo lançador de desktop oculto, uma por vez, em primeiro plano. Foram 7 execuções, do limite de 8.

### Núcleo (`npm test`, não abre nada)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/folders.ts:41` | Glob sem o prefixo `**/` | ✅ Killed (EXC-02, EXC-07 unit) |
| C2 | `src/core/folders.ts:41` | Glob sem o sufixo `/**` | ✅ Killed (EXC-02, EXC-07 unit) |
| C3 | `src/core/folders.ts:42` | Várias entradas unidas sem chaves | ✅ Killed (EXC-02 unit) |
| C4 | `src/core/folders.ts:59` | Entrada com glob deixa de ser rejeitada | ✅ Killed (EXC-07, SF-09 unit) |
| C5 | `src/core/folders.ts:61` | Entrada com `..` deixa de ser rejeitada | ✅ Killed (EXC-07, SF-08/SF-09 unit) |
| C6 | `src/core/folders.ts:59` | Entrada absoluta deixa de ser rejeitada | ✅ Killed (EXC-07, SF-09 unit) |
| C7 | `src/core/folders.ts:39` | Texto tratado como nome de pasta | ✅ Killed (EXC-04 unit) |
| C8 | `src/core/folders.ts:42` | Lista vazia devolve o glob padrão | ✅ Killed (EXC-06, EXC-07 unit) |
| C9 | `src/core/folders.ts:51` | Entradas repetidas não são unificadas | ✅ Killed (EXC-02, SF-10 unit) |
| C10 | `src/core/folders.ts:39` | Texto vazio devolve `''` em vez de `null` | ✅ Killed (EXC-04 unit) |
| C11 | `src/core/folders.ts:42` | Só a primeira de duas entradas vale | ✅ Killed (EXC-02 unit) |
| C12 | `src/core/folders.ts:42` | Entradas inválidas somem do relato de `parseExclude` | ✅ Killed (EXC-07 unit) |
| C13 | `src/core/folders.ts:50` | Entrada inválida relatada normalizada, não como escrita | ✅ Killed (EXC-07, SF-09 unit) |
| C14 | `src/core/folders.ts:51` | Fallback `.specs` vaza para a lista de exclusão | ✅ Killed (EXC-06, EXC-07 unit) |

### Host (suíte de integração, desktop oculto)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H1 | `src/ui/store.ts:153` | Glob de exclusão nunca chega ao `findFiles` | ✅ Killed (47/52: EXC-02/03/08 e, em cascata, EXC-09, 04, 06, 07. `multiroot.cjs:13` também falha) |
| H2 | `src/ui/store.ts:139` | `tlcSpecs.exclude` lida sem a pasta do workspace | ✅ Killed (`multiroot.cjs:13`: `b/legacy/.specs` aparece. `suite.cjs` 52/52) |
| H3 | `src/ui/store.ts:103` | Entrada inválida de `exclude` avisada com o nome `tlcSpecs.specsFolders` | ✅ Killed (`suite.cjs:958`, EXC-07) |
| H4 | `src/ui/store.ts:36` | Mudança de `tlcSpecs.exclude` não recarrega | ✅ Killed (`suite.cjs:908` expira; 47/52) |
| H5 | `src/ui/store.ts:152` | A lista da última pasta do workspace vale para todas | ✅ Killed (`multiroot.cjs:13`: `a/legacy/docs/specs` some. `suite.cjs` 52/52) |
| H6 | `src/ui/store.ts:119` | Chave do aviso sem o nome da configuração (`const key = entry`) | ❌ Survived (52/52 + 1 + 2). Falha de produto, ver Fix 1 |

Execuções que abriram o VS Code:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | real | 52/52 + 1/1 + 2/2 |
| 2 | H1 | scratch | 47/52 + 1/1 + multiroot falha |
| 3 | H2 | scratch | 52/52 + 1/1 + multiroot falha |
| 4 | H3 | scratch | 51/52 + 1/1 + 2/2 |
| 5 | H4 | scratch | 47/52 + 1/1 + 2/2 |
| 6 | H5 | scratch | 52/52 + 1/1 + multiroot falha |
| 7 | H6 | scratch | 52/52 + 1/1 + 2/2 |

### Julgamento do mutante vivo

- **H6, falha de produto.** O `warn` foi reescrito neste diff para servir às duas configurações. A chave `configuração: entrada` separa os avisos de cada uma. Sem o nome da configuração na chave, `"../fora"` em `specsFolders` e em `exclude` gera um aviso só, com o nome de `specsFolders`. Se o usuário corrige `specsFolders`, a entrada de `exclude` continua ignorada e nunca é avisada. Nenhum teste põe a mesma entrada inválida nas duas configurações: o SF-09 (`test/integration/suite.cjs:531`) e o EXC-07 (`:955`) rodam com a outra configuração limpa.
- Não é só instrumentação, não é equivalente e não é limite da API: o efeito chega ao usuário e um teste de integração consegue medir.

### Não executadas

- Manifesto com outro padrão ou outro escopo: `suite.cjs:890` e `:893` comparam os valores do manifesto. Não gastei execução.
- Aviso de `exclude` nunca emitido: dominada por H3. `suite.cjs:957` espera dois avisos.
- `this.warned` que nunca esquece (`src/ui/store.ts:125`): pela leitura, sobrevive. Nenhum teste tira uma entrada inválida e a põe de volta. Não executei, então não conta no placar. Entra no Fix 1 para fechar junto.

**Sensor depth**: 14 mutações de núcleo e 6 de host, todas no código do diff ou no caminho de recarga que ele usa
**Result**: 19/20 killed - FAIL ❌. 1 viva de produto (H6)

**Isolamento**: `git status --porcelain` da árvore real vazio antes e vazio depois do sensor (arquivos comparados byte a byte). Junction removida com `rmdir` sem recursão. `node_modules` real com 129 entradas antes e depois. `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real em 8794d3a, branch `feat/exclude-folders`. Nenhum processo do scratch ficou rodando.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`["node_modules", "test"]` neste repositório) fica para o orquestrador.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `parseEntries` serve às duas configurações. `parseExclude` tem 5 linhas |
| Surgical changes | ✅ `store.ts` muda só a leitura da configuração, a busca e o aviso |
| No scope creep | ✅ Nenhum item de Out of Scope entrou |
| Matches patterns | ✅ Mesmos helpers e o mesmo formato dos testes de specs-folders |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ⚠️ Núcleo 1:1 com os critérios. Host com caminho feliz, bordas e erro. Falta a mesma entrada inválida nas duas configurações (H6) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (4df4e6a..8794d3a)**:

- `test/integration/suite.cjs`: 89 inserções, 0 remoções.
- `test/unit/folders.test.ts`: 28 inserções, 1 remoção (a linha do `import`, que ganhou `parseExclude`).
- `test/integration/multiroot.cjs`: 8 inserções, 5 remoções. Saíram 2 linhas de comentário, as 2 listas esperadas e a linha da contagem. As listas novas contêm as antigas: `['a/docs/specs', 'b/.specs']` virou `['a/docs/specs', 'a/legacy/docs/specs', 'b/.specs']`. O SF-01/SF-02 continua provado: `a/.specs` e `b/docs/specs` existem na fixture e seguem fora da listagem. Nada ficou mais fraco.

Observações que não bloqueiam:

- `test/integration/multiroot.cjs:23` imprime `2/2` fixo. O arquivo tem uma função e duas asserções, e as duas linhas de ✔ (`:21`, `:22`) valem para as mesmas asserções. A contagem real é 1 caso.
- `test/integration/multiroot.cjs:1-2` diz que as duas pastas têm `.specs` e `docs/specs` dentro de `legacy`. A fixture tem só `a/legacy/docs/specs` e `b/legacy/.specs`.
- Os casos de exclude-folders dependem do estado deixado pelo caso anterior. Em H1 e H4 uma falha só derrubou cinco casos. É o padrão que a suíte já usava.
- Uma entrada com vírgula (`docs,old`) passa por `normalize` (`src/core/folders.ts:59`). Com duas ou mais entradas, a vírgula parte o grupo `{...}` em `src/core/folders.ts:42` e o glob exclui outra coisa. A spec não cobre esse caso.

---

## Edge Cases

- [x] EXC-06 Lista vazia lista tudo, inclusive `node_modules`: `test/integration/suite.cjs:943-944`
- [x] EXC-07 Entrada inválida ignorada, com aviso que traz o nome dela: `test/integration/suite.cjs:955-963`
- [x] EXC-08 `tests` fica na listagem com a entrada `test`: `test/integration/suite.cjs:908-909`
- [x] EXC-09 Pasta incluída e excluída fica fora: `test/integration/suite.cjs:929-930`
- [ ] Mesma entrada inválida em `specsFolders` e em `exclude`: o código trata, nenhum teste prova (H6)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0
- **Unit**: 44 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 52/52 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0)
- **Test count before feature**: 39 unit + 48 integration (46 + 1 + 1, contados em 4df4e6a)
- **Test count after feature**: 44 unit + 55 integration pela contagem impressa (52 + 1 + 2)
- **Delta**: +5 unit, +6 casos em `suite.cjs`. Em `multiroot.cjs` o caso é o mesmo, com as asserções ampliadas
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem, com a ressalva da contagem fixa em `multiroot.cjs:23`.

---

## Fix Plans (if issues found)

### Fix 1: aviso da mesma entrada inválida nas duas configurações sem teste (H6)

- **Root cause**: `src/ui/store.ts:116-126` decide o que avisar pela chave `configuração: entrada` e esquece o que saiu da configuração. Os testes só põem entradas inválidas em uma configuração por vez e nunca repetem uma entrada.
- **Fix task**: novo caso em `test/integration/suite.cjs`, depois do EXC-07 (`:969`), com o `showWarningMessage` trocado como em `:948-953`:
  1. `setFolders(['../fora', '.specs'])` e `setExclude(['../fora', 'node_modules'])`. Esperar dois avisos. `deepEqual([...shown].sort(), [...])` com `a entrada "../fora" de tlcSpecs.exclude foi ignorada` e `a entrada "../fora" de tlcSpecs.specsFolders foi ignorada`.
  2. `setExclude(['node_modules'])`, esperar a recarga, `setExclude(['../fora', 'node_modules'])`. Esperar o terceiro aviso, de `tlcSpecs.exclude`.
  3. Restaurar as duas configurações no `finally`.
- **Alternativa sem VS Code**: levar a decisão do `warn` para uma função pura em `src/core/folders.ts` (avisados antes + inválidas agora → avisos novos) e cobrir os dois cenários em `test/unit/folders.test.ts`. O `npm test` passa a julgar H6.
- **Done when**: a suíte falha com `const key = entry` em `src/ui/store.ts:119` e com um `this.warned` que nunca esquece em `:125`.
- **Spec**: acrescentar ao EXC-07 que o aviso traz também o nome da configuração, e que cada configuração avisa as suas entradas.
- **Priority**: Minor

### Follow-up (não bloqueia): contagem fixa em `multiroot.cjs`

- **Root cause**: `test/integration/multiroot.cjs:21-23` imprime dois ✔ e `2/2` para uma função só.
- **Fix task**: separar em dois casos com asserções próprias (SF-01/SF-02: `a/.specs` e `b/docs/specs` fora; EXC-05: `a/legacy/docs/specs` dentro e `b/legacy/.specs` fora) e contar os que passaram.
- **Priority**: Cosmetic

### Follow-up (não bloqueia): entrada com vírgula

- **Root cause**: `src/core/folders.ts:59` aceita vírgula e `:42` monta o grupo `{a,b}` separado por vírgula.
- **Fix task**: decidir na spec. Rejeitar a entrada com vírgula, com aviso, é a saída mais simples.
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
| EXC-07 | Implementing | ❌ Needs Fix (só teste, Fix 1) |
| EXC-08 | Implementing | ✅ Verified |
| EXC-09 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ⚠️ Issues

**Spec-anchored check**: 9/9 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: 19/20 mortas. 1 viva de produto (H6)
**Gate**: typecheck ok, 44 unit, 52 + 1 + 2 integration, 0 falhas

**What works**: `tlcSpecs.exclude` como lista, com padrão `["node_modules"]` e escopo `resource`. Pasta listada sai da listagem em qualquer profundidade. Mudança de configuração atualiza projetos, árvores e diagnósticos. Texto continua valendo como glob. Cada pasta do multi-root usa a sua lista, nos dois sentidos. Lista vazia não exclui nada. Entrada inválida é ignorada e avisada com o nome dela e o da configuração. `tests` fica com a entrada `test`. A exclusão vence a inclusão.

**Issues found**: a separação dos avisos por configuração não tem teste (H6). Fix 1 descreve o caso que falta.

**Next steps**: executar o Fix 1 e verificar de novo. A nova verificação precisa de H6 e da mutação do `this.warned`. Se o fix for pela função pura, o `npm test` julga as duas e só o gate abre o VS Code.
