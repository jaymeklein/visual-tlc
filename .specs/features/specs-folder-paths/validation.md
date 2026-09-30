# Specs Folder Paths Validation

## Validation: specs-folder-paths - PASS ✅

Aprovada na iteração 2. Os 11 requisitos batem com a spec, e a evidência de cada um discrimina. Não há gap de precisão. As duas correções da iteração 1 fecharam, só com testes. HW agora morre no SFP-05/06: o teste espera a árvore parar antes de criar a pasta, e sem watcher a pasta não aparece (`test/integration/suite.cjs:1322`). U1 morre em `test/unit/folders.test.ts:33` e `:44`, e U2 em `:35`. O sensor mata 15 de 15. O código de produção do escopo não mudou desde a iteração 1 (`src/ui/store.ts`, `src/core/folders.ts`, `src/ui/projectTree.ts` e o `getChildren` de `src/ui/featuresTree.ts`). O gate em 0de28fe está verde: 68 unit, 63 + 1 + 1 integration.

**Date**: 2026-09-30
**Spec**: `.specs/features/specs-folder-paths/spec.md`
**Diff range**: 41821b4..1cec99c (branch `feat/hidden-specs`): T1 75a3432, T2 e1290a1, T3 2618d18, T4 1cec99c. Correções em 81406a3 (T5, `suite.cjs`) e 87b3b5a (T6, `folders.test.ts`). Notas da spec em 6901713. Linhas citadas em 0de28fe, que também traz o eye-on-every-spec (fora do escopo)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 1cec99c | Reprovada | 10/11 requisitos com evidência que discrimina. SFP-06 sem (HW vive). 0 gaps de precisão. 12/15 mortas. Vivas: HW (Fix 1), U1 e U2 (Fix 2). 4 execuções do VS Code |
| 2 | 0de28fe | Aprovada | 11/11 requisitos batem e discriminam. 0 gaps de precisão. Fix 1 fechado: HW morre em `suite.cjs:1322`. Fix 2 fechado: U1 em `folders.test.ts:33` e `:44`, U2 em `:35`. 15/15 mortas. 3 execuções do VS Code |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Achar as pastas pelo caminho exato | ✅ Done | 75a3432. `src/core/folders.ts:74-90`. `parseExclude` e `Exclude` saíram. O Done when "não acha `test/fixtures/sample/.specs`" agora tem prova isolada (T6) |
| T2 Ler só as pastas configuradas e tirar o exclude | ✅ Done | e1290a1. `src/ui/store.ts:48`, `:101`, `:128-130`, `:137-140`, `:147`. `package.json:59`, `:287-297`. Saiu `test/fixtures/multi-root/b/.vscode/settings.json` |
| T3 Nó da pasta com um projeto só | ✅ Done | 2618d18. `src/ui/featuresTree.ts:101-104`, `src/ui/projectTree.ts:36-39` |
| T4 Documentar o caminho exato | ✅ Done | 1cec99c. README sem `tlcSpecs.exclude`. Notas em `.specs/features/specs-folders/spec.md:59`, `:75`, `.specs/features/exclude-folders/spec.md:3` e `.specs/features/hidden-specs/spec.md:103` |
| T5 Fix 1: o SFP-06 prova o watcher | ✅ Done | 81406a3. `treeSettled()` em `test/integration/suite.cjs:1299-1307`, chamado em `:1319` no lugar de `api.refresh()` |
| T6 Fix 2: a regra do começo do caminho sozinha | ✅ Done | 87b3b5a. `test/unit/folders.test.ts:33`, `:35`, `:44` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SFP-01 WHEN `specsFolders` lista `.specs` THEN lê a `.specs` da raiz e ignora as de subpastas | projetos = só `.specs`. Fora: `lib/.specs`, `test/nested/.specs`, `b/legacy/.specs` | **Unit:** `test/unit/folders.test.ts:31` - `[{ path: '.specs', entry: '.specs' }]` com as aninhadas na lista. `:33` - `deepEqual(findSpecsRoots(['test/fixtures/sample/.specs/features/user-auth/spec.md', 'tools/.specs/STATE.md'], ['.specs']), [])`. `:35` - `.specs-old/STATE.md` dá `[]`. **VS Code:** `test/integration/suite.cjs:685` - `deepEqual(roots(), ['.specs'])` com `lib/.specs` e `test/nested/.specs` no disco. `:687` - nenhuma feature delas. `test/integration/multiroot.cjs:20` - `deepEqual(listed('b'), [{ path: 'b/.specs', features: ['b-default'] }])` | ✅ PASS (nota 2) |
| SFP-02 WHEN lista um caminho com subpastas THEN lê a pasta nesse caminho, a partir da raiz | só a pasta do caminho. Fora: `packages/api/docs/specs` com `docs/specs`, `x/packages/api/.specs` com `packages/api/.specs` | **Unit:** `folders.test.ts:40-43` - `[docs/specs, packages/api/.specs]`. `:44` - `deepEqual(findSpecsRoots(['x/packages/api/.specs/STATE.md'], ['packages/api/.specs']), [])`. **VS Code:** `suite.cjs:695-696` - `waitForRoots(['docs/specs'])` e `featuresOf('docs/specs')` = `['custom-one']`, com `packages/api/docs/specs` no disco. `:699-700` - `['packages/api/docs/specs']` com `['nested-one']`. `multiroot.cjs:18` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }])` | ✅ PASS (nota 2) |
| SFP-03 WHILE a spec está fora das pastas configuradas, fica fora das árvores, do painel na aba e na lateral, da barra de status e do painel Problemas | ausente das seis superfícies | **Controle positivo:** `suite.cjs:1257-1262` - listada, in-test aparece nas seis. **Ausência:** `:1267` - `ok(!treeFeatures().includes('in-test'))`. `:1268` - raízes do Projeto = `projectIds()`, só `.specs`. `:1269` - aba com `same(r.projects, projectIds()) && !r.cards.includes('in-test')`. `:1270` - lateral com `same(r.projects, projectIds())`. `:1271` - `doesNotMatch(api.statusBarText(), /in-test/)`. `:1272` - os diagnósticos de `/test/nested/` somem | ✅ PASS (nota 3) |
| SFP-04 The extensão oferece `specsFolders` como única configuração de pastas, sem `tlcSpecs.exclude` | manifesto sem `tlcSpecs.exclude`; um valor antigo não muda a listagem | `suite.cjs:1277` - `ok(!('tlcSpecs.exclude' in properties))`. `:1278-1281` - chaves com folder ou exclude = `['tlcSpecs.specsFolders']`. `:1287-1290` - com `"tlcSpecs.exclude": [".specs"]` no `settings.json`, `deepEqual(roots(), ['.specs'])`. `:1291` - mesmas features de antes | ✅ PASS |
| SFP-05 IF a entrada aponta para uma pasta que não existe THEN ignora sem aviso | sem projeto; nenhum aviso | `suite.cjs:1320` - `deepEqual(roots(), ['.specs'])` com `later/.specs` configurada, depois do recarregamento da configuração. `:1324` - `deepEqual(shown, [])` | ✅ PASS (nota 1) |
| SFP-06 WHEN a pasta de uma entrada é criada depois THEN aparece sem recarregar a janela | a criação da pasta, sozinha, faz o projeto aparecer | `suite.cjs:1319` - `treeSettled()`: 1500 ms sem recarregar a árvore antes de criar a pasta. `:1321-1323` - cria `later/.specs/features/late-one/spec.md`, `waitForRoots(['.specs', 'later/.specs'])` e `featuresOf` = `['late-one']`. Sem watcher para a pasta nova (HW), `:1322` estoura: "got .specs" | ✅ PASS (nota 1) |
| SFP-07 WHILE há uma única pasta de specs, Features mostra um nó com o nome da pasta do workspace e as specs dentro | `['root']`, rótulo = nome do workspace, filhos = specs não ocultas | `suite.cjs:442` - `deepEqual(features.map((n) => n.kind), ['root'])`. `:443` - `equal(getTreeItem(features[0]).label, ws)`. `:444-450` - filhos = `modelNames((f) => f.health !== 'complete')` | ✅ PASS |
| SFP-08 WHILE há uma única pasta de specs, Projeto mostra um nó com o nome e Handoff, decisões e lições dentro | `['root']`, rótulo `ws`, `handoff`, `decisions`, `lessons` | `suite.cjs:452` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:453` - rótulo `ws`. `:455` - `handoff`, `decisions` e `lessons` entre os filhos. NAV-03 abre o Handoff de dentro do nó (`:200`) | ✅ PASS |
| SFP-09 WHEN uma pasta do workspace tem mais de uma pasta de specs encontrada THEN rótulo "nome · caminho" | `ws · .specs` e `ws · docs/specs` nas duas árvores; `ws` com uma só | **Unit:** `folders.test.ts:77-80` - `['ws']` com duas entradas e uma pasta. `:85-88` - `['api · .specs', 'api · docs/specs', 'api · packages/api/.specs']`. **VS Code:** `suite.cjs:819-820` - Features e Projeto com `ws · .specs` e `ws · docs/specs`. `:824-825` - `ws · docs/specs` e `ws · packages/api/docs/specs` | ✅ PASS (nota 4) |
| SFP-10 WHILE o olho está fechado e todas as specs estão ocultas, o nó fica sem filhos e a mensagem conta as ocultas | `['root']`, filhos `[]`, mensagem com H = T | `suite.cjs:508` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:509` - `deepEqual(getChildren(roots[0]), [])`. `:510` - `` `${T} feature(s) · ${D} concluída(s) · ${T} oculta(s)` ``. `:512-515` - boas-vindas só com `!tlcSpecs.hasSpecs` | ✅ PASS |
| SFP-11 IF a entrada é absoluta, tem `..` ou glob THEN ignora com um aviso que cita a entrada | fora da lista; um aviso com a entrada entre aspas; sem repetir | **Unit:** `folders.test.ts:12` - nove formas inválidas em `invalid`, só `docs/specs` em `entries`. `:98-106` - um aviso por entrada, de novo só quando ela volta. **VS Code:** `suite.cjs:800` - `waitForRoots(['docs/specs'])` com `../fora` e `docs/*`. `:802-803` - uma mensagem com `"../fora"` e uma com `"docs/*"`. `:805` - `equal(shown.length, 2)` depois de `refresh` | ✅ PASS (nota 5) |

**Status**: ✅ All ACs covered. 11/11 batem com a spec e discriminam. 0 gaps de precisão. G1 e G2 da iteração 1 fechados.

### Notas

1. **SFP-05/SFP-06, o tempo.** Na iteração 1 o teste passava pelo recarregamento que a mudança da configuração agenda (`src/ui/store.ts:28-31`, `:35-37`, `:73-76`), não pelo watcher. Agora `treeSettled()` (`suite.cjs:1299-1307`) espera 1500 ms sem nenhum `onDidChangeTreeData` antes de criar a pasta, bem acima do debounce de 300 ms. Depois disso, só o watcher traz a pasta. HW, com watchers só para as entradas cuja pasta já existe (`store.ts:47`), estoura em `:1322`: "timed out waiting for: projects .specs, later/.specs (got .specs)". O código real mostra a pasta: o gate está verde, então o watcher de `later/.specs/**`, criado antes da pasta existir, dispara. A troca de `api.refresh()` por `treeSettled()` não esvazia o SFP-05. HN deixou uma mensagem só em `:1324`. Logo, um recarregamento com `later/.specs` na lista rodou antes da escrita, e a asserção de `:1320` vale para a configuração nova.
2. **SFP-01/SFP-02, as duas camadas.** A regra do caminho exato está no glob enraizado da busca (`store.ts:137-140`) e no `startsWith` do core (`src/core/folders.ts:78`). A integração mata a volta das duas juntas (HR, iteração 1: SFP-01, SFP-02 e `multiroot.cjs:18`). O unit agora isola o core. Os negativos vêm sozinhos, sem pasta da raiz que dê a mesma resposta: `folders.test.ts:33` e `:44` matam U1, e `:35` mata U2.
3. **SFP-03, a lateral.** A aba é afirmada nos cards (`:1269`), a lateral nos projetos (`:1270`). Os cards da lateral saem do mesmo estado que os projetos. Aceito. O controle positivo (`:1257-1262`) prova que cada sonda enxerga a spec quando ela está listada.
4. **SFP-09, "encontrada".** A spec agora diz "encontrada" (`spec.md:79`), e bate com o código (`folders.ts:89`, com `found` em `store.ts:153`) e com o unit (`folders.test.ts:77-80`). A dúvida da iteração 1 fechou.
5. **SFP-11, o texto.** O teste afirma a entrada entre aspas, que é o que SF-09 e SFP-11 pedem. O texto inteiro do aviso (`store.ts:116`, `:129`) só era afirmado pelo EXC-10, que saiu com o exclude. Não é requisito. Fica registrado.
6. **Lições conferidas.** L-002, L-006: seguem valendo, agora com o evento de criação isolado. L-009 e L-014: não se aplicam. As candidatas da iteração 1 valem nos testes: L-023 em `treeSettled()` (`suite.cjs:1319`), L-024 nos negativos sozinhos (`folders.test.ts:33`, `:35`, `:44`). Nenhuma lição confirmada se repetiu.

---

## Discrimination Sensor

Scratch novo na iteração 2: `git worktree add --detach <scratchpad>/wt-sfp2 0de28fe`, com junction de `node_modules` para o real. As mesmas trocas de texto da iteração 1, com uma ocorrência exigida, aplicadas por script e desfeitas com `git checkout -- .` no scratch. `git status --porcelain` do scratch vazio depois de cada reversão. Sem `git stash`. O código de produção do escopo não mudou, então as trocas valem sem ajuste. No unit rodei de novo as 7 mutações, uma por vez. Na integração rodei HW, HM, HN, HX, HL e HP, em dois lotes de testes separados. HF e HR ficam da iteração 1: o código e as asserções que as matam não mudaram, só a linha de HR.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| U1 | `src/core/folders.ts:78` | `file.includes(`${entry}/`)` no lugar de `startsWith`: aceita a pasta em qualquer profundidade e a mapeia para a entrada | ✅ Killed na iteração 2 (`test/unit/folders.test.ts:33`, `:44`). Vivia na iteração 1 (Fix 2) |
| U2 | `src/core/folders.ts:78` | `file.startsWith(entry)` sem a barra: `.specs-old` vira `.specs` | ✅ Killed na iteração 2 (`:35`). Vivia na iteração 1 (Fix 2) |
| U3 | `src/core/folders.ts:78-81` | Volta a regra antiga do core: `indexOf` em qualquer profundidade, caminho aninhado | ✅ Killed (`:31`, `:40`) |
| U4 | `src/core/folders.ts:80` | Regra de artefato lê `file.slice(entry.length)`: sobra a barra | ✅ Killed (5 testes, a começar por `:40`, `:49`, `:58`) |
| U5 | `src/core/folders.ts:89` | `rootLabel` sempre só com o nome | ✅ Killed (`:85`) |
| U6 | `src/core/folders.ts:89` | `rootLabel` sempre "nome · entrada" | ✅ Killed (`:77`) |
| U7 | `src/core/folders.ts:53` | Entrada com vírgula volta a ser inválida, como no exclude | ✅ Killed (`:92`) |
| HP | `src/ui/projectTree.ts:38` | Projeto pula o nó com um projeto só | ✅ Killed (`test/integration/suite.cjs:452`, `['handoff', 'decisions', 'lessons']` no lugar de `['root']`; NAV-03 em `:212`) |
| HF | `src/ui/featuresTree.ts:103` | Features pula o nó com um projeto só | ✅ Killed na iteração 1 (`suite.cjs:442`, a mesma linha hoje) |
| HL | `src/ui/store.ts:153` | Rótulo calculado só com a própria pasta: nunca "nome · caminho" | ✅ Killed (`suite.cjs:819`, `['ws', 'ws']`) |
| HX | `src/ui/store.ts:147` | A busca volta a ler `tlcSpecs.exclude` | ✅ Killed (`suite.cjs:1290`, `[]` no lugar de `['.specs']`) |
| HM | `package.json:287` | `tlcSpecs.exclude` volta ao manifesto | ✅ Killed (`suite.cjs:1277`, "tlcSpecs.exclude is still contributed") |
| HN | `src/ui/store.ts:151` | Aviso para a entrada sem pasta | ✅ Killed (`suite.cjs:1324`, `['TLC Specs: later/.specs não existe']` no lugar de `[]`) |
| HW | `src/ui/store.ts:47` | Watchers só para as entradas cuja pasta já existe | ✅ Killed na iteração 2 (`suite.cjs:1322`, "got .specs"). Vivia na iteração 1 (Fix 1) |
| HR | `src/ui/store.ts:139` + `src/core/folders.ts:78-81` | As duas camadas buscam em qualquer profundidade de novo | ✅ Killed na iteração 1 (`suite.cjs:633` em 1cec99c, hoje `:685`; `:643`, hoje `:695`; `test/integration/multiroot.cjs:18`) |

Mutantes equivalentes, não rodados: o glob da busca sozinho em `**/${entry}/**` (`store.ts:139`) e o do watcher (`store.ts:48`). `rootLabel` com `all.length > 1` (`folders.ts:89`).

**Sensor depth**: lightweight ampliado (padrão, sem caminho P0). 7 mutações no unit, todas de novo em 0de28fe. 8 no host: 6 de novo, 2 mantidas da iteração 1.
**Result**: 15/15 mortas. PASS ✅.

**Execuções que abriram o VS Code** na iteração 2, 3 das 3 permitidas, todas pelo desktop oculto, em primeiro plano, uma por vez:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | scratch (0de28fe) | 63/63 + 1/1 + 1/1 |
| 2 | HW + HM | scratch | 61/63 + 1/1 + 1/1. Só SFP-04 (`:1277`) por HM e SFP-05/06 (`:1322`) por HW |
| 3 | HN + HX + HL + HP | scratch | 58/63 + 1/1 + 1/1. NAV-03 (`:212`) e SFP-07/08 (`:452`) por HP, SFP-09 (`:819`) por HL, SFP-04 (`:1290`) por HX, SFP-05/06 (`:1324`) por HN |

Cada mutante falhou só no seu teste. Os logs mostram a extensão carregada do scratch, e conferi HW no `dist/extension.cjs` dele. A iteração 1 usou 4 execuções.

**Isolamento**: `git status --porcelain` da árvore real vazio antes e depois. HEAD seguiu em 0de28fe. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`), depois `git worktree remove --force` e `git worktree prune`. `git worktree list` mostra só a árvore real. `node_modules` real com 129 entradas visíveis (131 com as ocultas) antes e depois, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`spec.md:65`, `:81`) roda neste repositório e fica para o orquestrador: com o padrão, nada de `test/fixtures` na barra lateral e no painel; com `["test/fixtures/sample/.specs"]`, só as specs do fixture.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `findSpecsRoots` ficou mais simples, e `parseExclude` saiu. Sobra de forma, aceita pelo orquestrador: `SpecsRoot.path` e `.entry` são sempre iguais (`folders.ts:81`), e `InvalidEntry.setting` com o mapa `ADVICE` (`store.ts:128-130`) servem a uma configuração só |
| Surgical changes | ✅ Só saiu o que o exclude deixou órfão. As correções da iteração 2 só mexem em testes. O comentário de `suite.cjs:406` foi corrigido |
| No scope creep | ✅ `findFiles(..., null, ...)` (`store.ts:146-147`) mantém o `files.exclude` fora, com o mesmo efeito de antes. Não é requisito e não tem teste |
| Matches patterns | ✅ O core segue puro. `treeSettled()` reusa `waitFor` e o evento da árvore, como os outros testes |
| Spec-anchored outcome check (asserted values match spec) | ✅ Rótulos, raízes, features, aviso vazio e manifesto afirmados com o valor exato |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core: a regra do início do caminho tem casos isolados. Host: o watcher da pasta criada depois é discriminado |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Todo teste tem SF ou SFP no título |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:20`) | ✅ |

A nota do SF-02 saiu do meio da lista numerada (`.specs/features/specs-folders/spec.md:59`).

**Integridade dos testes (41821b4..1cec99c)**: `test/unit/folders.test.ts` foi de 20 para 15 testes. Saíram os 6 testes de `parseExclude`. O teste da vírgula e o de `pendingWarnings` ficaram, só com `tlcSpecs.specsFolders`. SF-02 em qualquer profundidade virou SFP-01 e SFP-02. `test/integration/suite.cjs` foi de 63 para 61: saíram 7 EXC, SF-02 virou dois, e entraram SFP-07/08, SFP-03, SFP-04 e SFP-05/06. `multiroot.cjs` foi de 2 para 1: saiu EXC-05. A remoção é o SFP-04, aprovada pelo usuário. Nenhuma asserção ficou mais fraca, e nenhum comportamento restante perdeu cobertura de requisito. Só o texto inteiro do aviso ficou sem teste (nota 5).

**Integridade dos testes (1cec99c..0de28fe, escopo SFP)**: nenhum teste novo nem removido do SFP. `folders.test.ts` foi de 23 para 26 asserções. Em `suite.cjs`, o SFP-05/06 trocou `api.refresh()` por `treeSettled()` e manteve as quatro asserções. A troca não enfraquece o `:1320` (nota 1). Os dois testes EYE e as mudanças nos HID são do eye-on-every-spec.

---

## Edge Cases

- [x] SFP-10 Projeto com tudo oculto: nó sem filhos e mensagem com as ocultas: `test/integration/suite.cjs:508-510`
- [x] SFP-11 Entrada absoluta, com `..` ou glob: ignorada com aviso que a cita: `test/unit/folders.test.ts:12`, `test/integration/suite.cjs:802-805`
- [x] Premissa "Entrada que não existe: aparece quando a pasta for criada" (`spec.md:37`, SFP-06): `suite.cjs:1319-1323`, HW morre em `:1322`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0 (scratch em 0de28fe)
- **Unit**: 68 aprovados, 0 reprovados, 0 pulados
- **Integration**: 63/63 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1 da iteração 2)
- **Test count before feature**: 67 unit + 66 integration (63 + 1 + 2, em 2c7b475)
- **Test count after feature**: 62 unit + 63 integration (61 + 1 + 1) do SFP, em 1cec99c. Em 0de28fe: 68 unit e 63 + 1 + 1, com 6 unit e 2 integration do eye-on-every-spec
- **Delta do SFP**: -5 unit, -3 integration. No unit saíram 6 testes de `parseExclude`, e o SF-02 em qualquer profundidade virou dois. Na integração saíram 7 EXC em `suite.cjs` e o EXC-05 em `multiroot.cjs`. O SF-02 virou dois, e entraram 4 testes SFP novos. Tudo o que saiu é do `tlcSpecs.exclude` (SFP-04). As correções só somaram asserções
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

### Fix 1: isolar o watcher da pasta criada depois (SFP-06, HW) - fechado

- **Resolução**: 81406a3 (T5). `treeSettled()` (`test/integration/suite.cjs:1299-1307`) espera 1500 ms sem recarregar a árvore. O SFP-05/06 o chama logo depois de `setFolders` (`:1319`), antes de afirmar `['.specs']` e criar a pasta.
- **Done when conferido**: HW falha no SFP-05/06, no `waitForRoots` depois da escrita (`:1322`). O gate segue verde, então o watcher real mostra a pasta.

### Fix 2: isolar a regra do início do caminho no core (U1, U2) - fechado

- **Resolução**: 87b3b5a (T6). `test/unit/folders.test.ts:33` e `:44` afirmam `[]` só com pastas aninhadas. `:35` afirma `[]` para `.specs-old`.
- **Done when conferido**: U1 falha em `:33` e `:44`, U2 em `:35`, no `npm test`. O gate segue verde.

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SFP-01 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| SFP-02 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| SFP-03 | Implementing | ✅ Verified |
| SFP-04 | Implementing | ✅ Verified |
| SFP-05 | Implementing | ✅ Verified |
| SFP-06 | Implementing (a iteração 1 propôs Needs Fix) | ✅ Verified |
| SFP-07 | Implementing | ✅ Verified |
| SFP-08 | Implementing | ✅ Verified |
| SFP-09 | Implementing | ✅ Verified |
| SFP-10 | Implementing | ✅ Verified |
| SFP-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requisitos batem com a spec e discriminam. 0 gaps de precisão
**Sensor**: 15/15 mortas
**Gate**: typecheck ok, 68 unit, 63 + 1 + 1 integration, 0 falhas

**What works**: a extensão lê só as pastas listadas, a partir da raiz de cada pasta do workspace. `.specs` em subpastas fica fora das árvores, da aba, da lateral, da barra de status e do painel Problemas. Um caminho com subpastas lê só aquela pasta, também no multi-root. `tlcSpecs.exclude` saiu do manifesto, e um valor antigo não muda nada. Uma entrada sem pasta não gera projeto nem aviso. Quando a pasta nasce depois, o watcher a mostra sem recarregar a janela. As duas árvores mostram o nó da pasta com um projeto só, com o nome do workspace, e "nome · caminho" com duas pastas. Com tudo oculto o nó fica sem filhos. Entradas inválidas seguem recusadas com um aviso cada.

**Issues found**: nenhum que bloqueie. O texto inteiro do aviso segue sem teste, e não é requisito (nota 5).

**Next steps**: atualizar os status do `spec.md` para Verified. Rodar o teste independente da spec com o usuário (UAT).
