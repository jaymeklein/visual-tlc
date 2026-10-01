# Exclude Folders Validation

## Validation: exclude-folders - PASS ✅

Os 10 requisitos batem com a spec, e o gate passa. H7, o mutante vivo da iteração 2, morre agora no EXC-10 (`test/integration/suite.cjs:987`). Cada configuração tem o seu texto de orientação, e a troca dos dois textos (A1) morre no EXC-07 (`:964`). As checagens novas do painel no EXC-03 leem o que a página desenhou: os cards na aba e a lista de projetos da barra lateral. Uma barra lateral que guarda os projetos excluídos (W1) morre em `:915`. K7 morre no unit (`test/unit/folders.test.ts:114`). Nenhum mutante executado sobreviveu. Resta uma observação de higiene de teste, que não bloqueia: os casos de exclude-folders dependem do estado que o caso anterior deixa (Follow-up 1).

**Date**: 2026-09-29
**Spec**: `.specs/features/exclude-folders/spec.md`
**Diff range**: 4df4e6a..82679f4 (iteração 3: 96161f2..82679f4, branch `feat/exclude-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 8794d3a | Reprovada | 9/9 critérios batem. H6 vivo: a chave do aviso sem o nome da configuração. Follow-ups: contagem fixa em `multiroot.cjs` e entrada com vírgula. Lição L-016. 7 execuções do VS Code |
| 2 | 96161f2 | Reprovada | `pendingWarnings` coberta por unit: K1 e K2 morrem. Vírgula rejeitada em `tlcSpecs.exclude`. `multiroot.cjs` com dois casos e contagem real. H7 vivo na fiação de `src/ui/store.ts:102`. K7 vivo, fora dos critérios. Lições L-017 e L-018. 4 execuções do VS Code |
| 3 | 82679f4 | Aprovada | EXC-10 mata H7 (`suite.cjs:987`). `ADVICE` por configuração: A1 morre em `:964`. EXC-03 com o painel na aba e na barra lateral: W1 morre em `:915`. K7 morre em `folders.test.ts:114`. 6/6 mortas. 4 execuções do VS Code |

---

## Task Completion

Escopo Medium, sem `tasks.md`. Os passos são os commits do diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Especificar exclude-folders | ✅ Done | 534d377. Regra da entrada inválida em 300ad82. Painel no EXC-03, EXC-10 e texto por configuração em 5b0ce63 |
| Interpretar as pastas excluídas (`parseExclude`) | ✅ Done | a8ebfc9. Vírgula em 0b2752a |
| Tirar as pastas excluídas da listagem (`store.ts`, manifesto) | ✅ Done | 11f76e4. Descrição do manifesto em 97b8994 |
| Cobrir a exclusão por pasta em multi-root | ✅ Done | 7b125a2, dividido em dois casos em b4e11ea |
| Documentar a configuração no README | ✅ Done | 8794d3a, 96161f2 |
| Fix 1 da iteração 1: avisar as entradas de cada configuração à parte | ✅ Done | 0b2752a no núcleo. O caso de host veio em 74beb1b (EXC-10) |
| Fix 1 da iteração 2: nome da configuração no aviso de `specsFolders` (H7) | ✅ Done | 74beb1b. `test/integration/suite.cjs:977-1003`. H7 morta |
| Fix 2 da iteração 2: orientação do aviso por configuração | ✅ Done | 74beb1b. `ADVICE` em `src/ui/store.ts:130-134` |
| Follow-up 3 da iteração 2: `specsFolders` aceita vírgula (K7) | ✅ Done | 650321f no teste (`test/unit/folders.test.ts:113-115`), 5b0ce63 na spec (`spec.md:36`). K7 morta |
| Follow-up 4 da iteração 2: descrição do manifesto | ✅ Done | 97b8994. `package.json:240` |
| Painel no EXC-03, pedido do usuário | ✅ Done | 5b0ce63 na spec (`spec.md:56`), 82679f4 no teste (`suite.cjs:906-909`, `:914-915`) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EXC-01 A extensão oferece `tlcSpecs.exclude` como lista de caminhos relativos, com padrão `["node_modules"]` | lista de textos, padrão `["node_modules"]`, escopo `resource` (`spec.md:32`, `:34`) | `test/integration/suite.cjs:890` - `assert.deepEqual(declared.default, ['node_modules'])`. `:891` - `deepEqual(declared.type, ['array', 'string'])`. `:892` - `deepEqual(declared.items, { type: 'string' })`. `:893` - `assert.equal(declared.scope, 'resource')`. `:894` - valor efetivo `['node_modules']`. Efeito do padrão: `:903` cria `node_modules/pkg/.specs`, e `:904` e `:928` esperam a listagem sem ela | ✅ PASS |
| EXC-02 WHEN a lista tem uma pasta THEN toda pasta de specs dentro dela sai da listagem, em qualquer profundidade | `test/nested/.specs` e `packages/api/test/.specs` fora; as demais ficam | `test/integration/suite.cjs:911-912` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['.specs', 'tests/.specs', 'tools/.specs'])`, com as pastas criadas em `:900-901`. `test/unit/folders.test.ts:84` - `deepEqual(parseExclude(['test']), { glob: '**/test/**', invalid: [] })`. `:85` - três entradas em `{...}`. `:89` - entradas normalizadas e sem repetição | ✅ PASS |
| EXC-03 WHEN `tlcSpecs.exclude` muda THEN projetos, árvores, painel (na aba e na barra lateral) e diagnósticos atualizam sem recarregar a janela | as cinco superfícies com o estado novo, na mesma janela | **Projetos:** `test/integration/suite.cjs:912` e, na volta, `:928`. **Árvores:** `:916-919` - `deepEqual(api.featuresTree.getChildren().map(...), projectIds())`. `:920-923` - o mesmo para `api.projectTree`. **Painel na aba:** antes, `:908` - `r.detail === null && r.cards.includes('in-test') && r.cards.includes('in-tests')`. Depois, `:914` - `!r.cards.includes('in-test') && r.cards.includes('in-tests')`. **Painel na barra lateral:** antes, `:909` - `same(r.projects, projectIds())` com os cinco projetos. Depois, `:915` - `same(r.projects, projectIds())` com os três. **Diagnósticos:** `:905` espera os de `test/nested` antes. `:924` espera sumirem os de `/test/`. `:925` - `assert.ok(... includes('/tests/.specs/'))` | ✅ PASS (ver notas 1 a 3) |
| EXC-04 IF o valor é um texto THEN é usado como glob de exclusão | o texto vale como glob, sem conversão | `test/integration/suite.cjs:942-943` - `setExclude('{**/node_modules/**,**/tools/**}')` + listagem sem `tools/.specs`. `:944-945` - `setExclude('**/test/**')` + listagem com `node_modules/pkg/.specs` e sem as de `test`. `test/unit/folders.test.ts:93-95` - glob devolvido igual ao texto, `''` vira `null` | ✅ PASS |
| EXC-05 WHERE o workspace tem mais de uma pasta THEN cada pasta usa a lista configurada nela | `b` exclui `legacy`; `a` não exclui | `test/integration/multiroot.cjs:27-30` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }, { path: 'a/legacy/docs/specs', features: ['a-legacy'] }])`. `:31-34` - `deepEqual(listed('b').map((p) => p.path), ['b/.specs'])`. Configuração em `test/fixtures/multi-root/b/.vscode/settings.json:2` | ✅ PASS |
| EXC-06 IF a lista está vazia THEN lista todas as pastas, inclusive as de `node_modules` | nenhuma exclusão | `test/integration/suite.cjs:949-950` - `setExclude([])` + listagem com `node_modules/pkg/.specs`. `test/unit/folders.test.ts:99` - `deepEqual(parseExclude([]), { glob: null, invalid: [] })` | ✅ PASS |
| EXC-07 IF uma entrada é absoluta, contém `..`, vírgula ou glob THEN é ignorada, com aviso que traz o nome dela e o da configuração `tlcSpecs.exclude` | entrada sem efeito; aviso com o nome da entrada e `tlcSpecs.exclude` | **Rejeição:** `test/unit/folders.test.ts:103-105` - oito entradas inválidas relatadas como escritas. `:109` - `deepEqual(parseExclude(['docs,old', 'test']), { glob: '**/test/**', invalid: ['docs,old'] })`. `:110` - vírgula entre três entradas. **Aviso:** `test/integration/suite.cjs:961-962` - `['../fora', '**/tools/**', 'test']` exclui só `test`. `:964-967` - `deepEqual([...shown].sort(), [...])` com o texto exato, `de tlcSpecs.exclude` e `sem vírgula` nos dois. `:969` - `assert.equal(shown.length, 2)` depois do refresh. **Uma vez por configuração:** `test/unit/folders.test.ts:119-120` - `deepEqual(first.show, [fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude')])`. `:122-128` - sem repetição, e de novo quando a entrada volta | ✅ PASS |
| EXC-08 WHEN uma pasta tem o nome da entrada como parte do nome THEN continua na listagem | `tests` fica com a entrada `test` | `test/integration/suite.cjs:912` - `tests/.specs` na listagem. `:913` - `deepEqual(featuresOf('tests/.specs'), ['in-tests'])`. `:914` - card `in-tests` na aba. `:925` - diagnósticos de `tests/.specs` mantidos | ✅ PASS |
| EXC-09 WHEN uma pasta está em `specsFolders` e dentro de uma entrada de `exclude` THEN fica fora | a exclusão vence | `test/integration/suite.cjs:933-934` - `test/docs/specs` aparece sem a exclusão. `:935-936` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` | ✅ PASS |
| EXC-10 WHEN a mesma entrada inválida está em `specsFolders` e em `exclude` THEN um aviso para cada configuração, com o nome dela | dois avisos, um com `tlcSpecs.specsFolders`, outro com `tlcSpecs.exclude` | `test/integration/suite.cjs:985-986` - `setFolders(['../fora', '.specs'])` e `setExclude(['../fora', 'node_modules'])`. `:987` - espera dois avisos. `:988-994` - `deepEqual([...shown].sort(), [...])` com o texto exato dos dois: `de tlcSpecs.exclude` com `sem vírgula` (`:991`), `de tlcSpecs.specsFolders` sem vírgula (`:992`). `:996` - `assert.equal(shown.length, 2)` depois do refresh. Núcleo: `test/unit/folders.test.ts:119-120` | ✅ PASS |

**Status**: ✅ All ACs covered. 10 de 10 requisitos batem com o resultado da spec. Nenhum gap de precisão.

### Notas

1. **EXC-03, painel e L-002.** A aba é lida no DOM: `cards` vem dos `.card-name` visíveis (`src/webview/main.ts:57`, `:61`). A barra lateral é lida em `projects` (`main.ts:60`), que é a lista da página, não o DOM. Aceito por três motivos. Primeiro, a página manda `rendered` no fim de `render()` (`main.ts:41`, `:49`), então `projects` é a lista que acabou de ir para a tela, não a mensagem do host (`postState`, `src/ui/dashboard.ts:110-112`). Segundo, a aba e a barra lateral rodam o mesmo código de página, sem ramo só da barra lateral: `src/webview/main.ts` e `render.ts` não leem a classe `side`. O caminho da lista até o DOM é provado na aba, em `:914`. Terceiro, W1 prova que `:915` pega uma barra lateral que guarda os projetos excluídos. A checagem ficaria mais forte com os cards da barra lateral, como no SIDE-10 (`suite.cjs:825`). Não bloqueia.
2. **EXC-03, as checagens do painel não passam vazias.** As de antes (`:908`, `:909`) exigem `in-test` na aba e os cinco projetos na barra lateral. As de depois só passam se o painel mudou. `:914` também exige `in-tests`, então a aba não passa sem cards nem no detalhe de uma feature.
3. **EXC-03, árvores.** Mesmo julgamento da iteração 2. `getChildren()` lê `store.projects`, e o evento de recarga é medido no SF-03 (`suite.cjs:452`). O código das árvores não mudou. Aceito.
4. **Vírgula.** A spec limita a vírgula a `tlcSpecs.exclude` (`spec.md:36`). O unit fixa que `specsFolders` aceita vírgula (`test/unit/folders.test.ts:114`), e K7 morre ali. O host não tem caminho próprio para a vírgula: é o julgamento da iteração 2.
5. **Texto do aviso.** A linha de decisão (`spec.md:37`) pede que cada configuração oriente só pelas regras dela. `ADVICE` (`src/ui/store.ts:130-134`) faz isso. O texto de `specsFolders`, sem vírgula, está fixado em `suite.cjs:992`. O de `exclude`, em `:966` e `:991`. O README (`README.md:80`, `:96`) e o manifesto (`package.json:240`) dizem o mesmo.
6. **L-002 e L-006 aplicadas.** Listagem, árvores, painel, diagnósticos e aviso são lidos na superfície que o usuário vê, com a ressalva da nota 1. A spec não tem critério de watcher.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-exc3 HEAD` (82679f4), com junction de `node_modules` para o real. Uma mutação por vez, aplicada por troca de texto exata e desfeita com `git checkout` no scratch antes da seguinte. Sem `git stash`. As execuções do VS Code passaram pelo lançador de desktop oculto, uma por vez, em primeiro plano. Foram 4, do limite de 4, contando o gate.

### Iteração 3 (HEAD 82679f4), executadas

Núcleo (`npm test`, não abre nada):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| K7 | `src/core/folders.ts:67` | Padrão de `accepts` rejeita vírgula: a regra vaza para `tlcSpecs.specsFolders` | ✅ Killed (`test/unit/folders.test.ts:114`). Viva na iteração 2 |
| K1 | `src/core/folders.ts:60` | Chave do aviso sem o nome da configuração | ✅ Killed (`:120`) |
| K2 | `src/core/folders.ts:64` | `warned` nunca esquece | ✅ Killed (`:128`) |

Host (suíte de integração, desktop oculto):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H7 | `src/ui/store.ts:102` | Entradas de `specsFolders` avisadas com o nome `tlcSpecs.exclude` | ✅ Killed (`suite.cjs:987`, EXC-10: "timed out waiting for: two warnings". 52/53 + 1/1 + 2/2). Viva na iteração 2 |
| A1 | `src/ui/store.ts:132-133` | Textos de `ADVICE` trocados entre as duas configurações | ✅ Killed (`suite.cjs:964`, EXC-07. 51/53 + 1/1 + 2/2) |
| W1 | `src/webview/main.ts:27` | Só na barra lateral, a página junta a lista nova à anterior e guarda os projetos que saíram | ✅ Killed (`suite.cjs:915`: "the side panel to drop the excluded projects", com `:909` aprovado. Também SIDE-11 e SIDE-10. 45/53 + 1/1 + 2/2) |

Todos os logs mostram a extensão carregada do scratch. O bundle de H7 tinha `setting: "tlcSpecs.exclude"` duas vezes em `dist/extension.cjs`. O de W1 tinha o ramo `classList.contains("side")` em `dist/webview.js`.

Execuções que abriram o VS Code:

| # | Execução | Árvore | Resultado |
| - | -------- | ------ | --------- |
| 1 | Gate, sem mutação | real (82679f4) | 53/53 + 1/1 + 2/2 |
| 2 | H7 | scratch | 52/53 + 1/1 + 2/2 |
| 3 | A1 | scratch | 51/53 + 1/1 + 2/2 |
| 4 | W1 | scratch | 45/53 + 1/1 + 2/2 |

### Falhas em cascata

- **A1.** O EXC-10 também falhou, mas em `:987`, não em `:988`. O EXC-07 lançou em `:964`, antes do `waitForRoots` final (`:974`). O `setExclude(undefined)` do `finally` agendou um refresh, e o EXC-10 mudou a configuração antes dele rodar. O debounce (`src/ui/store.ts:73-76`) juntou tudo num refresh só, e o `warned` não esqueceu `tlcSpecs.exclude: ../fora`. A morte de A1 é a do EXC-07. Pela leitura, o EXC-10 mataria A1 sozinho em `:988`, que compara os dois textos.
- **W1.** EXC-09, EXC-04, EXC-06, EXC-07 e EXC-10 falharam em cascata. O caso EXC-02/03/08 não tem `finally` e deixou `tlcSpecs.exclude` em `['node_modules', 'test']` (`suite.cjs:911`, restauração em `:927`). O EXC-09 esperava `test/docs/specs` e recebeu a lista sem ela.

### Julgadas pela leitura, não executadas

- **Espelho de H7 (H3), `src/ui/store.ts:103`.** Entradas de `exclude` com o nome `tlcSpecs.specsFolders`. Morre em `suite.cjs:964`, que compara o texto inteiro com `de tlcSpecs.exclude`, e em `:988`. Morta na iteração 1, e a asserção não perdeu força.
- **A2, `src/ui/store.ts:132`.** O aviso de `specsFolders` volta ao texto com `sem vírgula`, o estado de antes do Fix 2. O EXC-07 passa. O EXC-10 falha em `:988`, que fixa o texto sem vírgula (`:992`).
- **A3, `src/ui/store.ts:131-134`.** Uma chave de `ADVICE` some, e o aviso termina com `undefined`. Sem `specsFolders`, falha em `:988`. Sem `exclude`, em `:964` e `:988`. O `tsc` não pega, porque `ADVICE` é `Record<string, string>`.
- **D1, `src/ui/dashboard.ts:163`.** A barra lateral não recebe o estado em `store.onDidChange`. O caso EXC-02/03/08 falha já em `:909`: os arquivos de `:900-903` chegam ao store, e a barra lateral fica com a lista anterior. Também SIDE-05 e SIDE-10 (`:823`).
- **D2, `src/ui/dashboard.ts:162`.** A aba não recebe o estado. A aba abre nova em `:907` e recebe o estado no `ready`, então `:908` passa e `:914` falha. Também SF-03 (`:454`) e SIDE-10 (`:822`).
- **H10, `src/ui/store.ts:121`.** O store que nunca esquece (`this.warned = new Set([...this.warned, ...warned])`). Na iteração 2 sobrevivia por construção. Agora morre em `:987`: SF-09 (`:531`) e EXC-07 (`:961`) já avisaram `../fora` nas duas configurações, e sem esquecer nenhum dos dois avisos volta no EXC-10. A morte depende da ordem dos casos. Não conta no placar.
- **C1 a C14, H1 a H6, H8, H9, K3 a K6, K8 a K10.** Carregadas. Nesta rodada o código mudou só em `src/ui/store.ts:119` (o texto) e `:130-134` (`ADVICE`), e nenhum teste perdeu força. H8 e H9 seguem cobertas por SF-09 (`:537`), EXC-07 (`:969`) e EXC-10 (`:996`).

### Iteração 2 (HEAD 96161f2), histórico

Linhas de 96161f2.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| K1 | `src/core/folders.ts:60` | Chave do aviso sem o nome da configuração | ✅ Killed |
| K2 | `src/core/folders.ts:64` | `warned` nunca esquece | ✅ Killed |
| K3 | `src/core/folders.ts:41` | `parseExclude` sem a checagem da vírgula | ✅ Killed |
| K4 | `src/core/folders.ts:61` | Avisos anteriores ignorados | ✅ Killed |
| K5 | `src/core/folders.ts:61` | Repetição na mesma chamada avisada duas vezes | ✅ Killed |
| K6 | `src/core/folders.ts:64` | `warned` sempre vazio | ✅ Killed |
| K7 | `src/core/folders.ts:67` | Padrão de `accepts` rejeita vírgula | ❌ Survived. Morta na iteração 3 |
| K8 | `src/core/folders.ts:41` | Vírgula rejeitada só no início | ✅ Killed |
| K9 | `src/core/folders.ts:71` | `accepts` nunca consultado | ✅ Killed |
| K10 | `src/core/folders.ts:62` | Entrada já avisada sai do estado seguinte | ✅ Killed |
| H7 | `src/ui/store.ts:102` | Entradas de `specsFolders` avisadas com o nome `tlcSpecs.exclude` | ❌ Survived. Morta na iteração 3 |
| H8 | `src/ui/store.ts:121` | `warn` descarta o `warned` de `pendingWarnings` | ✅ Killed |
| H9 | `src/ui/store.ts:118` | `warn` avisa todo `invalid` e ignora `show` | ✅ Killed |

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
| C12 | `src/core/folders.ts:42` | Entradas inválidas somem do relato | ✅ Killed |
| C13 | `src/core/folders.ts:50` | Entrada inválida relatada normalizada | ✅ Killed |
| C14 | `src/core/folders.ts:51` | Fallback `.specs` vaza para a exclusão | ✅ Killed |
| H1 | `src/ui/store.ts:153` | Glob de exclusão nunca chega ao `findFiles` | ✅ Killed |
| H2 | `src/ui/store.ts:139` | `tlcSpecs.exclude` lida sem a pasta do workspace | ✅ Killed |
| H3 | `src/ui/store.ts:103` | Entrada de `exclude` avisada com o nome `tlcSpecs.specsFolders` | ✅ Killed |
| H4 | `src/ui/store.ts:36` | Mudança de `tlcSpecs.exclude` não recarrega | ✅ Killed |
| H5 | `src/ui/store.ts:152` | A lista da última pasta vale para todas | ✅ Killed |
| H6 | `src/ui/store.ts:119` | Chave do aviso sem o nome da configuração | ❌ Survived. Virou K1, morta na iteração 2 |

**Sensor depth**: iteração 3 com 3 mutações de núcleo e 3 de host, focadas no código e nos testes da rodada. 6 julgadas pela leitura. Iterações 1 e 2 carregadas
**Result**: iteração 3 com 6/6 mortas - PASS ✅

**Isolamento**: `git status --porcelain` da árvore real vazio antes do sensor (82679f4) e vazio depois. HEAD seguiu em 82679f4 do começo ao fim, e nada mudou sob a verificação. Junction removida sem recursão (`[System.IO.Directory]::Delete(..., $false)`). `git worktree remove --force` + `git worktree prune`. `git worktree list` mostra só a árvore real, branch `feat/exclude-folders`. `node_modules` real com 131 entradas antes e depois, `npm ls --depth=0` exit 0. Nenhum VS Code de teste ficou rodando.

---

## Interactive UAT Results (if performed)

Não executado. O Verifier roda sem usuário. O teste independente da spec (`["node_modules", "test"]` neste repositório) fica para o orquestrador.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `ADVICE` tem duas entradas e um uso. O `warn` manteve a forma |
| Surgical changes | ✅ A rodada muda o texto do aviso (`src/ui/store.ts`, +7 -1), a descrição do manifesto e os testes |
| No scope creep | ✅ O painel no EXC-03, o EXC-10 e o texto por configuração entraram na spec (5b0ce63) antes do código e dos testes |
| Matches patterns | ✅ O EXC-10 segue o molde do EXC-07. As checagens do painel usam `tabReport`, `sideReport` e `same`, como o SIDE-10 |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Núcleo 1:1 com os critérios. No host, os dois nomes de configuração e os dois textos são conferidos por inteiro, e o painel nas duas superfícies |
| Every test maps to a spec requirement - no unclaimed tests | ✅ O teste novo do unit (`test/unit/folders.test.ts:113-115`) mapeia para a linha de decisão da vírgula (`spec.md:36`) |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Integridade dos testes (96161f2..82679f4)**:

- `test/integration/suite.cjs`: 35 inserções, 1 remoção (o título do caso EXC-02/03/08). O caso ganhou as checagens do painel. O EXC-10 é novo. Nenhuma asserção saiu ou afrouxou.
- `test/unit/folders.test.ts`: 4 inserções, 1 teste novo. 46 para 47.
- `test/integration/multiroot.cjs`: sem mudança.

Observações que não bloqueiam:

- Os casos de exclude-folders dependem do estado que o caso anterior deixa. O caso EXC-02/03/08 (`suite.cjs:897-929`) muda `tlcSpecs.exclude` sem `try/finally`, e uma falha ali derruba os cinco casos seguintes (W1). O EXC-10 depende do refresh que fecha o EXC-07 (`:974`) para esquecer `../fora` (A1). Nenhuma morte some por isso, mas o diagnóstico de uma falha fica ruidoso. Ver Follow-up 1.
- `ADVICE` é `Record<string, string>` (`src/ui/store.ts:131`). Uma configuração sem entrada vira `undefined` no aviso, e só a integração pega (A3).

---

## Edge Cases

- [x] EXC-06 Lista vazia lista tudo, inclusive `node_modules`: `test/integration/suite.cjs:949-950`
- [x] EXC-07 Entrada inválida ignorada, com aviso que traz o nome dela e o da configuração: `test/integration/suite.cjs:961-969`, `test/unit/folders.test.ts:102-128`
- [x] EXC-08 `tests` fica na listagem com a entrada `test`: `test/integration/suite.cjs:912-914`, `:925`
- [x] EXC-09 Pasta incluída e excluída fica fora: `test/integration/suite.cjs:935-936`
- [x] EXC-10 Mesma entrada inválida nas duas configurações, um aviso para cada, com o nome dela: `test/integration/suite.cjs:985-996`, `test/unit/folders.test.ts:119-120`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (a integração pelo desktop oculto)
- **Typecheck**: exit 0
- **Unit**: 47 aprovados, 0 reprovados, 0 pulados (exit 0)
- **Integration**: 53/53 em `suite.cjs`, 1/1 em `startup.cjs`, 2/2 em `multiroot.cjs` (exit 0)
- **Test count before feature**: 39 unit + 48 integration (46 + 1 + 1, contados em 4df4e6a)
- **Test count after feature**: 47 unit + 56 integration (53 + 1 + 2)
- **Delta**: +8 unit, +7 casos em `suite.cjs`, +1 caso em `multiroot.cjs`. Na iteração 3: +1 unit e +1 caso (EXC-10)
- **Skipped tests**: nenhum
- **Failures**: nenhuma

Os números do orquestrador conferem com a minha execução.

---

## Fix Plans (if issues found)

Nenhum fix bloqueia.

### Follow-up 1 (não bloqueia): isolar os casos de exclude-folders

- **Root cause**: o caso EXC-02/03/08 restaura `tlcSpecs.exclude` fora de um `finally` (`test/integration/suite.cjs:927`). O EXC-07 e o EXC-10 esperam a listagem padrão depois do `finally` (`:974`, `:1002`), então uma falha pula a espera, e o refresh que esquece os avisos pode não rodar antes do caso seguinte.
- **Fix task**: envolver `:911-925` num `try/finally` que chama `setExclude(undefined)` e espera a listagem padrão. No EXC-07 e no EXC-10, mover o `waitForRoots` para dentro do `finally`.
- **Done when**: com W1, só SIDE-11, SIDE-10 e EXC-02/03/08 falham. Com A1, falham só o EXC-07 (`:964`) e o EXC-10 no texto (`:988`).
- **Priority**: Minor

---

## Requirement Traceability Update

O Verifier não altera `spec.md`. Status propostos:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| EXC-01 | Verified | ✅ Verified |
| EXC-02 | Verified | ✅ Verified |
| EXC-03 | Implementing | ✅ Verified |
| EXC-04 | Verified | ✅ Verified |
| EXC-05 | Verified | ✅ Verified |
| EXC-06 | Verified | ✅ Verified |
| EXC-07 | Needs Fix | ✅ Verified |
| EXC-08 | Verified | ✅ Verified |
| EXC-09 | Verified | ✅ Verified |
| EXC-10 | Implementing | ✅ Verified |

A linha de cobertura (`spec.md:91`) passa a ser "10 total, 10 verificados".

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 10/10 requisitos batem com a spec. 0 gaps de precisão
**Sensor**: iteração 3 com 6/6 mortas, entre elas H7 e K7, vivas na iteração 2. 6 mutações julgadas pela leitura, todas mortas
**Gate**: typecheck ok, 47 unit, 53 + 1 + 2 integration, 0 falhas

**What works**: `tlcSpecs.exclude` como lista, com padrão `["node_modules"]` e escopo `resource`. Pasta listada sai da listagem em qualquer profundidade. Mudança de configuração atualiza projetos, árvores, painel na aba e na barra lateral, e diagnósticos. Texto continua valendo como glob. Cada pasta do multi-root usa a sua lista. Lista vazia não exclui nada. Entrada absoluta, com `..`, vírgula ou glob é ignorada, com aviso que traz o nome dela e `tlcSpecs.exclude`. A mesma entrada nas duas configurações gera um aviso para cada, com o nome dela e a orientação dela. `tlcSpecs.specsFolders` continua aceitando vírgula. `tests` fica com a entrada `test`. A exclusão vence a inclusão.

**Issues found**: nenhum que bloqueie. Os casos de exclude-folders dependem do estado do caso anterior (Follow-up 1).

**Next steps**: marcar EXC-01..EXC-10 como Verified e atualizar a cobertura em `spec.md:91`. Fazer o teste independente da spec. O Follow-up 1 pode entrar depois da entrega.
