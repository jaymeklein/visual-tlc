# Sidebar Dashboard Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (sem `design.md`)
**Status**: In Progress

Design inline:

- O painel passa a ter duas superfícies com o mesmo HTML, script e CSS: a aba do editor (`WebviewPanel`, já existe) e a view lateral (`WebviewView`, nova, id `tlcSpecs.panel`). `src/ui/dashboard.ts` concentra as duas; cada superfície tem a sua webview, a sua seleção pendente e o seu último relatório.
- O layout estreito é só CSS (`@media (max-width: 699px)`), então vale para qualquer superfície estreita.
- Depois de cada `render()`, a webview lê o DOM e manda um relatório (`rendered`): projetos, cartões, feature em detalhe, colunas do quadro, etapas vazias visíveis, largura e rolagem horizontal. Os testes de integração leem esse relatório pela API da extensão. Lição L-002: o critério é conferido no que a tela mostra, não numa mensagem intermediária.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Renderer (`src/webview/render.ts`) | unit | Todos os ramos novos; 1:1 com os ACs | `test/unit/*.test.ts` | `npm test` |
| Webview script, host e manifesto (`src/webview/main.ts`, `src/ui`, `src/extension.ts`, `package.json`, `media/*.css`) | integration | Cada AC verificado no que a webview renderizou (relatório lido do DOM) e nas abas do editor | `test/integration/*.cjs` | `npm run test:integration` |
| Docs (`README.md`) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run typecheck && npm test` |
| Full | After tasks with integration tests | `npm run typecheck && npm test && npm run test:integration` |
| Build | After phase completion or docs-only tasks | `npm run typecheck && npm test && npm run test:integration` |

---

## Execution Plan

### Phase 1: Webview

```
T1 → T2
```

### Phase 2: View lateral

```
T2 → T3 → T4 → T5 → T6 → T7
```

### Phase 3: Docs

```
T7 → T8
```

### Phase 4: Correções do Verifier (iteração 1)

```
T8 → T9 → T10 → T11 → T12 → T13 → T14 → T15
```

### Phase 5: Correções do Verifier (iteração 2)

```
T15 → T16 → T17
```

---

## Task Breakdown

### T1: Marcar as etapas vazias do quadro

**What**: o renderer marca com `is-empty` as colunas do quadro que não têm features
**Where**: `src/webview/render.ts` (modify)
**Depends on**: None
**Reuses**: helpers de `test/unit/webview.test.ts`
**Requirement**: SIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Coluna sem features tem a classe `is-empty`; coluna com features não tem
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 37 existentes + novos passam

**Tests**: unit
**Gate**: quick

**Commit**: `feat(dashboard): mark the board stages without features`

---

### T2: Relatar o que a webview renderizou

**What**: depois de cada `render()`, a webview manda um relatório lido do DOM, exposto na API de teste
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T1
**Reuses**: mensagem `rendered` de `src/core/protocol.ts`
**Requirement**: SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O relatório traz projetos, cartões, feature em detalhe, colunas do quadro, etapas vazias visíveis, largura e rolagem horizontal
- [x] Com o painel em aba a 700px ou mais, o relatório mostra 6 colunas e as etapas vazias visíveis
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 36 de integração existentes + novos passam

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): report what the webview rendered`

---

### T3: Criar a view Painel na barra lateral

**What**: view `tlcSpecs.panel` do tipo webview no contêiner TLC Specs, servida pelo `Dashboard`
**Where**: `src/ui/dashboard.ts` (modify)
**Depends on**: T2
**Reuses**: HTML, script e tratamento de mensagens do painel em aba
**Requirement**: SIDE-01, SIDE-05, SIDE-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `package.json` declara a view "Painel" (`tlcSpecs.panel`, tipo webview) no contêiner `tlcSpecs`, depois de Projeto
- [x] A view renderiza os mesmos projetos de `getProjects()`
- [x] Feature nova gravada numa pasta de specs aparece nos cartões da view
- [x] Sem pasta de specs, a view mostra "Nenhuma spec encontrada"
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): add the panel view to the side bar`

---

### T4: Abrir a feature na view lateral

**What**: `tlcSpecs.showFeature` mostra a view Painel na feature; `tlcSpecs.openDashboard` vira "Abrir painel em aba" e aceita uma feature
**Where**: `src/extension.ts` (modify)
**Depends on**: T3
**Reuses**: `toRef` em `src/extension.ts`
**Requirement**: SIDE-02, SIDE-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Com um arquivo aberto, `tlcSpecs.showFeature` mostra os detalhes da feature na view lateral; as abas e o editor ativo não mudam
- [x] `tlcSpecs.openDashboard` abre a aba "TLC Specs"
- [x] O teste existente "opens the dashboard webview" passa a abrir a aba por `tlcSpecs.openDashboard`, com as mesmas asserções
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): open features in the side bar panel`

---

### T5: Layout estreito

**What**: abaixo de 700px o quadro fica em uma coluna, as etapas vazias somem e nada rola na horizontal
**Where**: `media/dashboard.css` (modify)
**Depends on**: T4
**Reuses**: media queries existentes em `media/dashboard.css`
**Requirement**: SIDE-03, SIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Na view lateral (menos de 700px) o relatório mostra 1 coluna, 0 etapas vazias visíveis e nenhuma rolagem horizontal, no quadro e nos detalhes da feature
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): fit the panel in narrow widths`

---

### T6: Voltar da view oculta e atualizar as duas superfícies

**What**: a view oculta limpa o relatório; ao voltar mostra os projetos atuais e a feature selecionada; aba e view atualizam juntas
**Where**: `src/ui/dashboard.ts` (modify)
**Depends on**: T5
**Reuses**: `vscode.setState` em `src/webview/main.ts`
**Requirement**: SIDE-06, SIDE-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Depois de fechar a barra lateral, mudar as pastas de specs e reabrir a view, o relatório tem os projetos novos e a mesma feature em detalhe
- [x] Com a aba e a view abertas, uma mudança nas pastas de specs chega ao relatório das duas
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): restore the side panel when it becomes visible`

---

### T7: Cliques dentro da view lateral

**What**: a API de teste entrega uma mensagem ao tratador da view lateral
**Where**: `src/extension.ts` (modify)
**Depends on**: T6
**Reuses**: `dashboardMessage` em `src/extension.ts`
**Requirement**: SIDE-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Uma mensagem `previewFile` vinda da view lateral abre o preview do markdown
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover artifact clicks from the side panel`

---

### T8: Documentar o painel lateral

**What**: README descreve a view Painel e o comando "Abrir painel em aba"
**Where**: `README.md` (modify)
**Depends on**: T7
**Reuses**: seção "O que aparece"
**Requirement**: SIDE-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README descreve onde o painel abre e como abrir a visão em aba
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the side bar panel`

---

### T9: Relatar só os cartões visíveis

**What**: o relatório da webview conta só os cartões que estão na tela
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T8
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-03, SIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Cartão dentro de uma fase escondida não entra no relatório
- [x] Mutante S4 do Verifier morre (layout estreito que esconde todas as fases)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `fix(dashboard): report only the cards on screen`

---

### T10: Provar o botão da notificação

**What**: teste do botão "Abrir painel" da notificação de spec nova
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T9
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O botão da notificação mostra a feature na view lateral e não abre a aba
- [x] Mutante C2 do Verifier morre
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover the notification button`

---

### T11: Fixar o limite de 700px

**What**: teste unitário lê o CSS e confere o bloco `@media (max-width: 699px)`; o SIDE-09 mede a aba com a barra lateral aberta
**Where**: `test/unit/webview.test.ts` (modify)
**Depends on**: T10
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-03, SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O bloco de 699px contém a regra de uma coluna e a que esconde as fases vazias
- [x] A aba com a barra lateral aberta (700px ou mais) mostra 6 colunas
- [x] Mutantes S5 e S6 do Verifier morrem
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): pin the narrow layout threshold`

---

### T12: Provar a feature aberta na aba e a rolagem medida

**What**: testes conferem o detalhe renderizado quando a aba abre com uma feature e a rolagem horizontal do quadro largo
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T11
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-08, SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tlcSpecs.openDashboard` com uma feature mostra os detalhes dela, em aba nova e em aba já aberta
- [x] O quadro de 6 colunas numa aba com menos de 1298px relata rolagem horizontal
- [x] Mutantes C3 e W2 do Verifier morrem
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover the tab target and the overflow reading`

---

### T13: Provar as entradas do manifesto

**What**: testes conferem o botão "abrir em aba" no título da view Painel e o título de `tlcSpecs.showFeature`
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T12
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-02, SIDE-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `view/title` de `tlcSpecs.openDashboard` vale para `tlcSpecs.panel`
- [x] `tlcSpecs.showFeature` se chama "Abrir feature no painel"
- [x] Mutantes P3 e P4 do Verifier morrem
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover the manifest entries of the panel`

---

### T14: Provar o clique com a barra lateral fechada

**What**: teste aciona `tlcSpecs.showFeature` com a barra lateral fechada; o comentário da guarda `live` diz o que foi verificado
**Where**: `src/ui/dashboard.ts` (modify)
**Depends on**: T13
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Com a barra lateral fechada, o clique reabre a view nos detalhes da feature, sem mexer nas abas
- [x] O comentário de `live` registra que o VS Code 1.120 entrega a mensagem sem a guarda e que as versões anteriores não foram verificadas
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover a feature opened with the side bar closed`

---

### T15: Nomear os eventos do SIDE-05

**What**: a spec nomeia criar, alterar e remover; o relatório traz a fase de cada cartão; o teste cobre os três eventos
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T14
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Artefato criado: o cartão aparece com a fase do modelo
- [x] Artefato alterado: a fase do cartão muda
- [x] Artefato removido: o cartão some
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover artifact change and removal in the side panel`

---

### T16: Caber até 250px

**What**: no layout estreito os títulos das seções quebram linha; o teste estreita a barra lateral passo a passo até 250px
**Where**: `media/dashboard.css` (modify)
**Depends on**: T15
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O quadro fica em uma coluna e sem rolagem horizontal em cada largura medida, do padrão até 250px ou menos
- [x] Os detalhes das features não rolam na horizontal na menor largura medida
- [x] A barra lateral volta à largura inicial no fim do teste
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `fix(dashboard): keep the narrow panel from scrolling down to 250px`

---

### T17: Firmar os testes novos

**What**: os testes usam o limite real de rolagem (1298px), esperam pelo detalhe certo e conferem a fase de todos os cartões
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T16
**Reuses**: testes da seção sidebar-dashboard
**Requirement**: SIDE-02, SIDE-05, SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A rolagem do quadro largo é esperada abaixo de 1298px
- [ ] O teste da barra lateral fechada espera o detalhe da feature pedida
- [ ] O SIDE-05 compara a fase de cada cartão com o modelo
- [ ] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [ ] Test count: nenhum teste removido

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): harden the side panel tests`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 ------→ T2
Phase 2:  T3 ------→ T4 ------→ T5 ------→ T6 ------→ T7
Phase 3:  T8
Phase 4:  T9 ------→ T10 ------→ T11 ------→ T12 ------→ T13 ------→ T14 ------→ T15
Phase 5:  T16 ------→ T17
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Marcar as etapas vazias do quadro | 1 classe no renderer | ✅ Granular |
| T2: Relatar o que a webview renderizou | 1 mensagem | ✅ Granular |
| T3: Criar a view Painel na barra lateral | 1 view + contribuição no manifesto | ✅ Coeso |
| T4: Abrir a feature na view lateral | 2 comandos | ✅ Coeso |
| T5: Layout estreito | 1 bloco de CSS | ✅ Granular |
| T6: Voltar da view oculta e atualizar as duas superfícies | 1 evento de visibilidade | ✅ Granular |
| T7: Cliques dentro da view lateral | 1 leitura de teste | ✅ Granular |
| T8: Documentar o painel lateral | 1 arquivo | ✅ Granular |
| T9: Relatar só os cartões visíveis | 1 teste ou leitura | ✅ Granular |
| T10: Provar o botão da notificação | 1 teste ou leitura | ✅ Granular |
| T11: Fixar o limite de 700px | 1 teste ou leitura | ✅ Granular |
| T12: Provar a feature aberta na aba e a rolagem medida | 1 teste ou leitura | ✅ Granular |
| T13: Provar as entradas do manifesto | 1 teste ou leitura | ✅ Granular |
| T14: Provar o clique com a barra lateral fechada | 1 teste ou leitura | ✅ Granular |
| T15: Nomear os eventos do SIDE-05 | 1 teste ou leitura | ✅ Granular |
| T16: Caber até 250px | 1 regra de CSS | ✅ Granular |
| T17: Firmar os testes novos | 3 asserções | ✅ Coeso |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 | ✅ Match |
| T3 | T2 | T2 | ✅ Match |
| T4 | T3 | T3 | ✅ Match |
| T5 | T4 | T4 | ✅ Match |
| T6 | T5 | T5 | ✅ Match |
| T7 | T6 | T6 | ✅ Match |
| T8 | T7 | T7 | ✅ Match |
| T9 | T8 | T8 | ✅ Match |
| T10 | T9 | T9 | ✅ Match |
| T11 | T10 | T10 | ✅ Match |
| T12 | T11 | T11 | ✅ Match |
| T13 | T12 | T12 | ✅ Match |
| T14 | T13 | T13 | ✅ Match |
| T15 | T14 | T14 | ✅ Match |
| T16 | T15 | T15 | ✅ Match |
| T17 | T16 | T16 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Renderer | unit | unit | ✅ OK |
| T2 | Webview script | integration | integration | ✅ OK |
| T3 | Host e manifesto | integration | integration | ✅ OK |
| T4 | Host e manifesto | integration | integration | ✅ OK |
| T5 | CSS | integration | integration | ✅ OK |
| T6 | Host | integration | integration | ✅ OK |
| T7 | Host | integration | integration | ✅ OK |
| T8 | Docs | none | none | ✅ OK |
| T9 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T10 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T11 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T12 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T13 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T14 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T15 | Webview script, host e manifesto | integration | integration | ✅ OK |
| T16 | CSS | integration | integration | ✅ OK |
| T17 | Webview script, host e manifesto | integration | integration | ✅ OK |
