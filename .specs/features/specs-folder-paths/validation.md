# Specs Folder Paths Validation

## Validation: specs-folder-paths - FAIL ❌

Reprovada na iteração 1. O gate está verde e bate com o autor: 62 unit, 61 + 1 + 1 integration. Dez dos onze requisitos têm evidência que discrimina. O SFP-06 não tem. O teste passa mesmo quando a extensão só observa as pastas que já existem (HW). A causa é o tempo: a mudança da configuração agenda um recarregamento de 300 ms, e o teste cria a pasta antes dele. Esse recarregamento acha a pasta sem nenhum watcher. O sensor matou 12 de 15 mutantes. Além do HW, vivem U1 e U2 no core. O unit do SFP-01 e do SFP-02 põe a pasta aninhada ao lado da pasta da raiz, e uma regra que aceita subpastas dá o mesmo resultado. No sistema os dois ficam escondidos pelo glob enraizado do store, e nenhum usuário os vê hoje. As duas correções são só de teste (Fix 1, Fix 2). Nenhum defeito de produção apareceu.

**Date**: 2026-09-30
**Spec**: `.specs/features/specs-folder-paths/spec.md`
**Diff range**: 41821b4..1cec99c (branch `feat/hidden-specs`): T1 75a3432, T2 e1290a1, T3 2618d18, T4 1cec99c. Linhas citadas em 1cec99c. O HEAD andou para 1aa9934 durante a validação (eye-on-every-spec, fora do escopo)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 1cec99c | Reprovada | 10/11 requisitos com evidência que discrimina. SFP-06 sem (HW vive). 0 gaps de precisão. 12/15 mortas. Vivas: HW (Fix 1), U1 e U2 (Fix 2). 4 execuções do VS Code |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Achar as pastas pelo caminho exato | ✅ Done | 75a3432. `src/core/folders.ts:74-90`. `parseExclude` e `Exclude` saíram. O Done when "não acha `test/fixtures/sample/.specs`" não tem prova isolada no unit (U1, Fix 2) |
| T2 Ler só as pastas configuradas e tirar o exclude | ✅ Done | e1290a1. `src/ui/store.ts:48`, `:101`, `:128-130`, `:137-140`, `:147`. `package.json:59`, `:287-297`. Saiu `test/fixtures/multi-root/b/.vscode/settings.json`. O Done when do SFP-06 tem teste que não discrimina (HW, Fix 1) |
| T3 Nó da pasta com um projeto só | ✅ Done | 2618d18. `src/ui/featuresTree.ts:101-104`, `src/ui/projectTree.ts:36-39` |
| T4 Documentar o caminho exato | ✅ Done | 1cec99c. README sem `tlcSpecs.exclude`. Notas em `.specs/features/specs-folders/spec.md:55`, `:75`, `.specs/features/exclude-folders/spec.md:3` e `.specs/features/hidden-specs/spec.md:99` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SFP-01 WHEN `specsFolders` lista `.specs` THEN lê a `.specs` da raiz e ignora as de subpastas | projetos = só `.specs`. Fora: `lib/.specs`, `test/nested/.specs`, `b/legacy/.specs` | **Unit:** `test/unit/folders.test.ts:31` - `deepEqual(findSpecsRoots(files, ['.specs']), [{ path: '.specs', entry: '.specs' }])`, com `test/fixtures/sample/.specs` e `tools/.specs` na lista. **VS Code:** `test/integration/suite.cjs:633` - `deepEqual(roots(), ['.specs'])` com `lib/.specs` e `test/nested/.specs` no disco. `:635` - nenhuma feature delas. `test/integration/multiroot.cjs:20` - `deepEqual(listed('b'), [{ path: 'b/.specs', features: ['b-default'] }])` | ✅ PASS (nota 2; U1 e U2 → Fix 2) |
| SFP-02 WHEN lista um caminho com subpastas THEN lê a pasta nesse caminho, a partir da raiz | só a pasta do caminho. Fora: `packages/api/docs/specs` com `docs/specs`, `x/packages/api/.specs` com `packages/api/.specs` | **Unit:** `folders.test.ts:36-39` - `[docs/specs, packages/api/.specs]`, sem `x/packages/api/.specs` e sem `packages/api/docs/specs`. **VS Code:** `suite.cjs:643-644` - `waitForRoots(['docs/specs'])` e `featuresOf('docs/specs')` = `['custom-one']`, com `packages/api/docs/specs` no disco. `:647-648` - `['packages/api/docs/specs']` com `['nested-one']`. `multiroot.cjs:18` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }])`, sem `a/legacy/docs/specs` | ✅ PASS (nota 2; U1 → Fix 2) |
| SFP-03 WHILE a spec está fora das pastas configuradas, fica fora das árvores, do painel na aba e na lateral, da barra de status e do painel Problemas | ausente das seis superfícies | **Controle positivo:** `suite.cjs:1205-1210` - listada, in-test aparece nas seis. **Ausência:** `:1215` - `ok(!treeFeatures().includes('in-test'))`. `:1216` - raízes do Projeto = `projectIds()`, só `.specs`. `:1217` - aba com `same(r.projects, projectIds()) && !r.cards.includes('in-test')`. `:1218` - lateral com `same(r.projects, projectIds())`. `:1219` - `doesNotMatch(api.statusBarText(), /in-test/)`. `:1220` - os diagnósticos de `/test/nested/` somem | ✅ PASS (nota 3) |
| SFP-04 The extensão oferece `specsFolders` como única configuração de pastas, sem `tlcSpecs.exclude` | manifesto sem `tlcSpecs.exclude`; um valor antigo não muda a listagem | `suite.cjs:1225` - `ok(!('tlcSpecs.exclude' in properties))`. `:1226-1229` - chaves com folder ou exclude = `['tlcSpecs.specsFolders']`. `:1235-1238` - com `"tlcSpecs.exclude": [".specs"]` no `settings.json`, `deepEqual(roots(), ['.specs'])`. `:1239` - mesmas features de antes | ✅ PASS |
| SFP-05 IF a entrada aponta para uma pasta que não existe THEN ignora sem aviso | sem projeto; nenhum aviso | `suite.cjs:1256` - `deepEqual(roots(), ['.specs'])` com `later/.specs` configurada. `:1260` - `deepEqual(shown, [])` | ✅ PASS |
| SFP-06 WHEN a pasta de uma entrada é criada depois THEN aparece sem recarregar a janela | a criação da pasta, sozinha, faz o projeto aparecer | `suite.cjs:1257-1259` - cria `later/.specs/features/late-one/spec.md`, `waitForRoots(['.specs', 'later/.specs'])` e `featuresOf` = `['late-one']`. O valor bate, mas o teste passa sem watcher para a pasta nova (HW). Quem acha a pasta é o recarregamento agendado pela mudança da configuração em `:1254` | ❌ GAP (nota 1, Fix 1) |
| SFP-07 WHILE há uma única pasta de specs, Features mostra um nó com o nome da pasta do workspace e as specs dentro | `['root']`, rótulo = nome do workspace, filhos = specs não ocultas | `suite.cjs:442` - `deepEqual(features.map((n) => n.kind), ['root'])`. `:443` - `equal(getTreeItem(features[0]).label, ws)`. `:444-450` - filhos = `modelNames((f) => f.health !== 'complete')` | ✅ PASS |
| SFP-08 WHILE há uma única pasta de specs, Projeto mostra um nó com o nome e Handoff, decisões e lições dentro | `['root']`, rótulo `ws`, `handoff`, `decisions`, `lessons` | `suite.cjs:452` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:453` - rótulo `ws`. `:455` - `handoff`, `decisions` e `lessons` entre os filhos. NAV-03 abre o Handoff de dentro do nó (`:200`) | ✅ PASS |
| SFP-09 WHEN uma pasta do workspace tem mais de uma pasta de specs THEN rótulo "nome · caminho" | `ws · .specs` e `ws · docs/specs` nas duas árvores; `ws` com uma só | **Unit:** `folders.test.ts:72-75` - `['ws']` com duas entradas e uma pasta. `:80-83` - `['api · .specs', 'api · docs/specs', 'api · packages/api/.specs']`. **VS Code:** `suite.cjs:767-768` - Features e Projeto com `ws · .specs` e `ws · docs/specs`. `:772-773` - `ws · docs/specs` e `ws · packages/api/docs/specs` | ✅ PASS (nota 4) |
| SFP-10 WHILE o olho está fechado e todas as specs estão ocultas, o nó fica sem filhos e a mensagem conta as ocultas | `['root']`, filhos `[]`, mensagem com H = T | `suite.cjs:508` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:509` - `deepEqual(getChildren(roots[0]), [])`. `:510` - `` `${T} feature(s) · ${D} concluída(s) · ${T} oculta(s)` ``. `:512-515` - boas-vindas só com `!tlcSpecs.hasSpecs` | ✅ PASS |
| SFP-11 IF a entrada é absoluta, tem `..` ou glob THEN ignora com um aviso que cita a entrada | fora da lista; um aviso com a entrada entre aspas; sem repetir | **Unit:** `folders.test.ts:12` - nove formas inválidas em `invalid`, só `docs/specs` em `entries`. `:93-101` - um aviso por entrada, de novo só quando ela volta. **VS Code:** `suite.cjs:748` - `waitForRoots(['docs/specs'])` com `../fora` e `docs/*`. `:750-751` - uma mensagem com `"../fora"` e uma com `"docs/*"`. `:753` - `equal(shown.length, 2)` depois de `refresh` | ✅ PASS (nota 5) |

**Status**: ❌ Gaps present. 10/11 batem com a spec e discriminam. SFP-06 sem evidência que discrimina. 0 gaps de precisão.

### Notas

1. **SFP-06, o tempo.** `setFolders` (`suite.cjs:1254`) dispara `onDidChangeConfiguration`. O store refaz os watchers e agenda um recarregamento em 300 ms (`src/ui/store.ts:28-31`, `:35-37`, `:73-76`). `api.refresh()` (`suite.cjs:1255`) recarrega na hora, mas não cancela esse timer (`store.ts:79-96`). O arquivo é escrito em `:1257`, antes do timer. O recarregamento atrasado acha `later/.specs` com ou sem watcher. HW filtra os watchers para as entradas cuja pasta já existe (`store.ts:47`) e passou no SFP-05/06. Na vida real a pasta nasce minutos depois, quando a skill roda. Sem o watcher, ela só apareceria na próxima mudança de configuração ou ao recarregar a janela, que é o que o SFP-06 proíbe. SF-04 (`suite.cjs:701-719`) prova o watcher só para pastas que já existem. Nenhum outro teste cria a pasta de uma entrada depois da configuração.
2. **SFP-01/SFP-02, as duas camadas.** A regra do caminho exato está em dois lugares: o glob enraizado da busca (`store.ts:137-140`, `${entry}/**`) e o `startsWith` do core (`src/core/folders.ts:78`). Na integração, mudar só um não muda nada: o store só entrega arquivos da raiz, e o core só aceita arquivos da raiz. Por isso o sensor mudou as duas juntas (HR), e SFP-01 (`suite.cjs:633`), SFP-02 (`:643`) e o multi-root (`multiroot.cjs:18`) morreram. No unit, o `indexOf` antigo no core (U3) morre em `folders.test.ts:31` e `:36`. Mas U1 (`includes`) e U2 (`startsWith(entry)` sem a barra) vivem. Os casos negativos do unit vêm sempre ao lado do positivo: `test/fixtures/sample/.specs` junto com `.specs`, `x/packages/api/.specs` junto com `packages/api/.specs`. U1 mapeia a pasta aninhada para o caminho da entrada, e o resultado fica igual. Sozinha, `test/fixtures/sample/.specs/...` dá `[{ path: '.specs' }]` com U1, e `.specs-old/STATE.md` dá `.specs` com U2. O certo é `[]` nos dois. Hoje o glob do store esconde isso. Se a busca mudar, aparece um projeto fantasma numa pasta que não existe.
3. **SFP-03, a lateral.** A aba é afirmada nos cards (`:1217`), a lateral nos projetos (`:1218`). Os cards da lateral saem do mesmo estado que os projetos. Aceito. O controle positivo (`:1203-1210`) prova que cada sonda enxerga a spec quando ela está listada, então as ausências não são vazias.
4. **SFP-09, "configurada".** O critério diz "mais de uma pasta de specs configurada". O código conta as pastas achadas (`folders.ts:89`, com `found` em `store.ts:153`). Com `.specs` e `later/.specs` na lista e só `.specs` no disco, o rótulo é `ws`, e o unit fixa isso (`folders.test.ts:72-75`). A leitura segue a premissa "Rótulo do nó" (`spec.md:39`) e o SFP-05: uma entrada sem pasta é ignorada, então não conta. Aceito. Trocar "configurada" por "encontrada" no SFP-09 tira a dúvida.
5. **SFP-11, o texto.** O teste afirma a entrada entre aspas, que é o que SF-09 e SFP-11 pedem. O texto inteiro do aviso de `tlcSpecs.specsFolders`, com o nome da configuração e o conselho (`store.ts:116`, `:129`), só era afirmado pelo EXC-10, que saiu com o exclude. Não é requisito. Fica registrado.
6. **Lições conferidas.** L-002: as árvores são afirmadas nos nós e rótulos, o painel nos cards e projetos desenhados, a barra de status no texto. L-006: o SFP-06 nomeia a criação, e o teste cria um arquivo. Falta o teste isolar esse evento (nota 1). L-009 e L-014: não se aplicam, sem ação nem flag nova. Candidata L-021: vale no SFP-03, ausência depois da presença. A falha de U1 e U2 é parente da candidata L-013: a regra do core é uma guarda sem teste unit que falhe sem ela.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-sfp 1cec99c`, com junction de `node_modules` para o real. Mutação por troca de texto exata, com uma ocorrência exigida, aplicada por script e desfeita com `git checkout -- .` no scratch. `git status --porcelain` do scratch vazio depois de cada reversão. Sem `git stash`. No unit, uma mutação por vez com `npm run typecheck` e `npm test`. Na integração, lotes de mutantes que mudam saídas diferentes, e cada morte conferida pela linha do stack.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| U1 | `src/core/folders.ts:78` | `file.includes(`${entry}/`)` no lugar de `startsWith`: aceita a pasta em qualquer profundidade e a mapeia para a entrada | ❌ Survived. 62/62 no unit. Na integração o glob enraizado (`store.ts:139`) esconde → Fix 2 |
| U2 | `src/core/folders.ts:78` | `file.startsWith(entry)` sem a barra: `.specs-old` vira `.specs` | ❌ Survived. 62/62 no unit. Escondido pelo glob do store → Fix 2 |
| U3 | `src/core/folders.ts:78-81` | Volta a regra antiga do core: `indexOf` em qualquer profundidade, caminho aninhado | ✅ Killed (`test/unit/folders.test.ts:31`, `:36`) |
| U4 | `src/core/folders.ts:80` | Regra de artefato lê `file.slice(entry.length)`: sobra a barra | ✅ Killed (`:36`, `:44`, `:53`, `:72`, `:80`) |
| U5 | `src/core/folders.ts:89` | `rootLabel` sempre só com o nome | ✅ Killed (`:80`) |
| U6 | `src/core/folders.ts:89` | `rootLabel` sempre "nome · entrada" | ✅ Killed (`:72`) |
| U7 | `src/core/folders.ts:53` | Entrada com vírgula volta a ser inválida, como no exclude | ✅ Killed (`:87`) |
| HP | `src/ui/projectTree.ts:38` | Projeto pula o nó com um projeto só | ✅ Killed (`test/integration/suite.cjs:452`, `['handoff', 'decisions', 'lessons']` no lugar de `['root']`; NAV-03 em `:212`) |
| HF | `src/ui/featuresTree.ts:103` | Features pula o nó com um projeto só | ✅ Killed (`suite.cjs:442`, cinco `'feature'` no lugar de `['root']`; mais 15 testes, entre eles `:461` e `:508`) |
| HL | `src/ui/store.ts:153` | Rótulo calculado só com a própria pasta: nunca "nome · caminho" | ✅ Killed (`suite.cjs:767`, `['ws', 'ws']`) |
| HX | `src/ui/store.ts:147` | A busca volta a ler `tlcSpecs.exclude` | ✅ Killed (`suite.cjs:1238`, `[]` no lugar de `['.specs']`) |
| HM | `package.json:287` | `tlcSpecs.exclude` volta ao manifesto | ✅ Killed (`suite.cjs:1225`, "tlcSpecs.exclude is still contributed") |
| HN | `src/ui/store.ts:151` | Aviso para a entrada sem pasta | ✅ Killed (`suite.cjs:1260`, `['TLC Specs: later/.specs não existe']` no lugar de `[]`) |
| HW | `src/ui/store.ts:47` | Watchers só para as entradas cuja pasta já existe | ❌ Survived. SFP-05/06 passou (nota 1) → Fix 1 |
| HR | `src/ui/store.ts:139` + `src/core/folders.ts:78-81` | As duas camadas buscam em qualquer profundidade de novo | ✅ Killed (`suite.cjs:633`, `['.specs', 'lib/.specs', 'test/nested/.specs']`; `:643`; `test/integration/multiroot.cjs:18`, com `a/legacy/docs/specs`) |

Mutantes equivalentes, não rodados: o glob da busca sozinho em `**/${entry}/**` (`store.ts:139`) e o do watcher (`store.ts:48`). O core filtra a busca, e um recarregamento a mais não se vê. `rootLabel` com `all.length > 1` (`folders.ts:89`): os caminhos são únicos.

**Sensor depth**: lightweight ampliado (padrão, sem caminho P0). 7 mutações no unit, 8 no host.
**Result**: 12/15 mortas. Vivas: HW (Fix 1), U1 e U2 (Fix 2). FAIL ❌.

**Execuções que abriram o VS Code**, 4 das 4 permitidas, todas pelo desktop oculto, em primeiro plano, uma por vez:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | scratch (1cec99c) | 61/61 + 1/1 + 1/1 |
| 2 | HP + HW + HX + HL | scratch | 57/61 + 1/1 + 1/1. Falharam NAV-03 (`:212`) e SFP-07/08 (`:452`) por HP, SFP-09 (`:767`) por HL, SFP-04 (`:1238`) por HX. SFP-05/06 passou: HW vive |
| 3 | HF + HM + HN | scratch | 43/61 + 1/1 + 1/1. 16 falhas por HF (NAV, HID, SFP-07/08 em `:442`, SFP-10 em `:508`), SFP-04 (`:1225`) por HM, SFP-05/06 (`:1260`) por HN |
| 4 | HR | scratch | 46/61 + 1/1 + 0/1. SFP-01 (`:633`), SFP-02 (`:643`), os SF que esperam só as raízes e `multiroot.cjs:18` |

Os logs mostram a extensão carregada do scratch. Conferi HW e HL no `dist/extension.cjs` do scratch.

**Isolamento**: `git status --porcelain` da árvore real vazio antes e depois. O orquestrador fez dois commits no real durante a validação (abcd78b, 1aa9934, eye-on-every-spec). O scratch ficou em 1cec99c. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`), depois `git worktree remove --force` e `git worktree prune`. `git worktree list` mostra só a árvore real. `node_modules` real com 129 entradas visíveis (131 com as ocultas) antes e depois, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`spec.md:65`, `:81`) roda neste repositório e fica para o orquestrador: com o padrão, nada de `test/fixtures` na barra lateral e no painel; com `["test/fixtures/sample/.specs"]`, só as specs do fixture.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `findSpecsRoots` ficou mais simples, e `parseExclude` saiu. Sobra de forma: `SpecsRoot.path` e `.entry` são sempre iguais agora (`folders.ts:81`), e `InvalidEntry.setting` com o mapa `ADVICE` (`store.ts:128-130`) servem a uma configuração só. Inofensivo |
| Surgical changes | ✅ Só saiu o que o exclude deixou órfão. Ficou um comentário velho: `suite.cjs:406` ainda diz que a árvore lista as features no topo, o que o SFP-07 desfez |
| No scope creep | ✅ `findFiles(..., null, ...)` (`store.ts:146-147`) mantém o `files.exclude` fora, com o mesmo efeito de antes. Não é requisito e não tem teste |
| Matches patterns | ✅ O core segue puro. Os testes seguem `folders.test.ts` e `suite.cjs`, com `finally` que devolve a configuração |
| Spec-anchored outcome check (asserted values match spec) | ✅ Rótulos, raízes, features, aviso vazio e manifesto afirmados com o valor exato. SFP-06 afirma o valor certo sem isolar a causa (nota 1) |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ❌ Core: a regra do início do caminho não tem caso isolado (U1, U2). Host: o watcher da pasta criada depois não é discriminado (HW) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Todo teste tem SF ou SFP no título |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:20`) | ✅ |

Nota de forma: a nota em `.specs/features/specs-folders/spec.md:55` fica entre o critério 2 e o 3 e parte a lista numerada. Cosmético.

**Integridade dos testes (41821b4..1cec99c)**: `test/unit/folders.test.ts` foi de 20 para 15 testes. Saíram os 6 testes de `parseExclude` (EXC-02 duas vezes, EXC-04, EXC-06, EXC-07 duas vezes). O teste da vírgula e o de `pendingWarnings` ficaram, só com `tlcSpecs.specsFolders`. SF-02 em qualquer profundidade virou SFP-01 e SFP-02 (+1). SF-07 virou SFP-09. `test/integration/suite.cjs` foi de 63 para 61: saíram 7 EXC, SF-02 virou dois, e entraram SFP-07/08, SFP-03, SFP-04 e SFP-05/06. `multiroot.cjs` foi de 2 para 1: saiu EXC-05, e o SF-01/SF-02 ficou mais forte, agora com as features de "a". A remoção é o SFP-04, aprovada pelo usuário. As listas de `waitForRoots` que encolheram (SF-03 a SF-10, SIDE-06, SIDE-10, SIDE-11) perderam só as pastas aninhadas que não são mais lidas. HID-16 passou de `[]` para o nó sem filhos. Nenhuma asserção ficou mais fraca. Nenhum comportamento restante perdeu cobertura de requisito. Só o texto inteiro do aviso ficou sem teste (nota 5).

---

## Edge Cases

- [x] SFP-10 Projeto com tudo oculto: nó sem filhos e mensagem com as ocultas: `test/integration/suite.cjs:508-510`
- [x] SFP-11 Entrada absoluta, com `..` ou glob: ignorada com aviso que a cita: `test/unit/folders.test.ts:12`, `test/integration/suite.cjs:750-753`
- [ ] Premissa "Entrada que não existe: aparece quando a pasta for criada" (`spec.md:37`, SFP-06): sem prova que discrimina (HW, Fix 1)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0 (scratch em 1cec99c)
- **Unit**: 62 aprovados, 0 reprovados, 0 pulados
- **Integration**: 61/61 em `suite.cjs`, 1/1 em `startup.cjs`, 1/1 em `multiroot.cjs` (exit 0, execução 1)
- **Test count before feature**: 67 unit + 66 integration (63 + 1 + 2, em 2c7b475)
- **Test count after feature**: 62 unit + 63 integration (61 + 1 + 1)
- **Delta**: -5 unit, -3 integration. No unit saíram 6 testes de `parseExclude`, e o SF-02 em qualquer profundidade virou dois (SFP-01, SFP-02). Na integração saíram 7 EXC em `suite.cjs` e o EXC-05 em `multiroot.cjs`. O SF-02 virou dois, e entraram 4 testes SFP novos. Tudo o que saiu é do `tlcSpecs.exclude` (SFP-04)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do autor conferem.

---

## Fix Plans (if issues found)

### Fix 1: isolar o watcher da pasta criada depois (SFP-06, HW)

- **Root cause**: nota 1. O recarregamento agendado pela mudança da configuração (`store.ts:73-76`) roda depois da escrita em `suite.cjs:1257` e acha a pasta sem watcher.
- **Fix task**: em `test/integration/suite.cjs:1253-1259`, esperar os recarregamentos da mudança de configuração terminarem antes de criar a pasta. Por exemplo: contar `api.featuresTree.onDidChangeTreeData` e esperar um intervalo quieto maior que o debounce de 300 ms, e só então chamar `api.refresh()`, afirmar `['.specs']`, escrever `later/.specs/...` e esperar as raízes. Se o teste corrigido falhar no código real, o defeito está no watcher, não no teste.
- **Done when**: HW (`store.ts:47`, watchers só para entradas com pasta) falha no SFP-05/06, no `waitForRoots` depois da escrita. O gate segue verde.
- **Priority**: Major

### Fix 2: isolar a regra do início do caminho no core (U1, U2)

- **Root cause**: nota 2. Cada negativo do unit vem junto com um positivo que dá o mesmo resultado.
- **Fix task**: em `test/unit/folders.test.ts`, no SFP-01 e no SFP-02, afirmar os negativos sozinhos:
  - `assert.deepEqual(findSpecsRoots(['test/fixtures/sample/.specs/features/user-auth/spec.md', 'tools/.specs/STATE.md'], ['.specs']), [])`
  - `assert.deepEqual(findSpecsRoots(['x/packages/api/.specs/STATE.md'], ['packages/api/.specs']), [])`
  - `assert.deepEqual(findSpecsRoots(['.specs-old/STATE.md'], ['.specs']), [])`
- **Done when**: U1 falha nas duas primeiras e U2 na terceira, no `npm test`. O gate segue verde.
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SFP-01 | Implementing | ❌ Needs Fix (Fix 2, só o unit) |
| SFP-02 | Implementing | ❌ Needs Fix (Fix 2, só o unit) |
| SFP-03 | Implementing | ✅ Verified |
| SFP-04 | Implementing | ✅ Verified |
| SFP-05 | Implementing | ✅ Verified |
| SFP-06 | Implementing | ❌ Needs Fix (Fix 1) |
| SFP-07 | Implementing | ✅ Verified |
| SFP-08 | Implementing | ✅ Verified |
| SFP-09 | Implementing | ✅ Verified (nota 4) |
| SFP-10 | Implementing | ✅ Verified |
| SFP-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 10/11 requisitos batem com a spec e discriminam. SFP-06 sem evidência que discrimina. 0 gaps de precisão
**Sensor**: 12/15 mortas. Vivas: HW, U1, U2
**Gate**: typecheck ok, 62 unit, 61 + 1 + 1 integration, 0 falhas

**What works**: a extensão lê só as pastas listadas, a partir da raiz de cada pasta do workspace. `.specs` em subpastas fica fora das árvores, da aba, da lateral, da barra de status e do painel Problemas. Um caminho com subpastas lê só aquela pasta, também no multi-root. `tlcSpecs.exclude` saiu do manifesto, e um valor antigo não muda nada. Uma entrada sem pasta não gera projeto nem aviso. As duas árvores mostram o nó da pasta com um projeto só, com o nome do workspace, e "nome · caminho" com duas pastas. Com tudo oculto o nó fica sem filhos. Entradas inválidas seguem recusadas com um aviso cada.

**Issues found**: o SFP-06 passa pelo recarregamento da configuração, não pelo watcher (Fix 1). O unit do core não isola a regra do início do caminho (Fix 2). As duas correções são só de teste.

**Next steps**: rodar Fix 1 e Fix 2 como tasks de teste. Reverificar na iteração 2: HW deve morrer no SFP-05/06, U1 e U2 no `npm test`. Depois, atualizar os status do `spec.md` e rodar o teste independente com o usuário.
