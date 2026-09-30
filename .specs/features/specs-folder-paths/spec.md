# Specs Folder Paths Specification

## Problem Statement

Cada entrada de `tlcSpecs.specsFolders` é procurada em qualquer profundidade. Por isso `.specs` também acha as pastas `.specs` de exemplo e de teste dentro do projeto, e as specs delas aparecem na barra lateral e no painel. Para tirá-las existe uma segunda configuração, `tlcSpecs.exclude`, que o usuário precisa descobrir e combinar com a primeira. Duas configurações fazem o trabalho de uma. E quando sobra uma pasta de specs só, as árvores Features e Projeto somem com o nó da pasta e listam o conteúdo direto, diferente de quando há várias.

## Goals

- [ ] `tlcSpecs.specsFolders` sozinha decide quais pastas a extensão lê: cada entrada é o caminho exato de uma pasta, a partir da raiz da pasta do workspace
- [ ] As árvores Features e Projeto mostram sempre a pasta de cada projeto, com o conteúdo dentro dela

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Glob nas entradas (`packages/*/.specs`) | O usuário escolheu caminho exato. Cada pasta de um monorepo entra como uma entrada |
| Pastas fora do workspace ou caminhos absolutos | Continuam recusados com aviso, como hoje (SF-09) |
| Nome do projeto no painel com um projeto só | O usuário escolheu mostrar a pasta só nas árvores Features e Projeto |
| Migrar os valores de `tlcSpecs.exclude` | A configuração sai. Um valor antigo no `settings.json` fica sem efeito |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| O que é uma entrada | Caminho exato de uma pasta, relativo à raiz de cada pasta do workspace. Sem busca em profundidade | Resposta do usuário: "Caminho exato" | y (2026-09-30) |
| `tlcSpecs.exclude` | Removida. Só `tlcSpecs.specsFolders` escolhe as pastas | Pedido do usuário: "somente .specsFolders seria necessário" | y (2026-09-30) |
| Nó da pasta com um projeto só | Aparece nas árvores Features e Projeto. O painel continua sem título com um projeto só | Resposta do usuário: "Features e Projeto" | y (2026-09-30) |
| Specs fora das pastas configuradas | Não aparecem em lugar nenhum: árvores, painel na aba e na barra lateral, barra de status, painel Problemas e notificações | Pedido do usuário: "não devem ser listadas no painel lateral" | y (2026-09-30) |
| Padrão | `[".specs"]`: lê só a `.specs` na raiz de cada pasta do workspace | Consequência do caminho exato | n |
| Entrada inválida | Caminho absoluto, com `..` ou com glob é ignorado com um aviso que o cita, como hoje | Mantém o SF-09 | n |
| Entrada que não existe | Ignorada sem aviso. Aparece quando a pasta for criada | A skill cria a pasta depois. Um aviso antes disso seria falso | n |
| Pasta com outro nome que `.specs` | Só aparece com algum artefato da skill (`features/*/*.md`, `STATE.md`, `lessons.json` ou `LESSONS.md`), como hoje | Mantém o SF-05 | n |
| Rótulo do nó | Nome da pasta do workspace. Quando a mesma pasta do workspace tem mais de uma pasta de specs, "nome · caminho" (`visual-tlc · docs/specs`) | Distingue as pastas sem repetir o caminho quando há uma só | n |
| Workspace com várias pastas | Cada pasta do workspace usa a própria lista, como hoje (escopo `resource`) | Mantém o SF-01 | n |
| Projeto com todas as specs ocultas | O nó do projeto continua na árvore, sem filhos à vista. Substitui o HID-16, que previa a lista vazia | O nó agora aparece sempre | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Configuração lida do VS Code, sem persistência nova, chamadas externas ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Ler só as pastas configuradas ⭐ MVP

**User Story**: Como quem usa a extensão num projeto com specs de exemplo e de teste, quero dizer numa configuração só quais pastas ela lê, para ver só as minhas specs.

**Why P1**: É o pedido: uma configuração, e nada além das pastas escolhidas.

**Acceptance Criteria**:

1. WHEN `tlcSpecs.specsFolders` lista `.specs` THEN a extensão SHALL ler a pasta `.specs` na raiz da pasta do workspace e SHALL ignorar as pastas `.specs` dentro de subpastas
2. WHEN `tlcSpecs.specsFolders` lista um caminho com subpastas, como `packages/api/.specs` THEN a extensão SHALL ler a pasta nesse caminho, a partir da raiz da pasta do workspace
3. WHILE uma spec está fora das pastas configuradas the extensão SHALL deixá-la fora das árvores Features e Projeto, do painel na aba e na barra lateral, da barra de status e do painel Problemas
4. The extensão SHALL oferecer `tlcSpecs.specsFolders` como a única configuração de pastas, sem `tlcSpecs.exclude`
5. IF uma entrada aponta para uma pasta que não existe THEN a extensão SHALL ignorá-la sem aviso
6. WHEN a pasta de uma entrada é criada depois THEN a extensão SHALL mostrá-la sem recarregar a janela

**Independent Test**: Neste repositório, com a configuração padrão, a barra lateral e o painel mostram só as specs de `.specs`, sem as de `test/fixtures`. Trocar para `["test/fixtures/sample/.specs"]` mostra só as specs do fixture.

---

### P2: Ver a pasta de cada projeto nas árvores

**User Story**: Como quem acompanha as specs pela barra lateral, quero ver sempre a pasta de onde as specs vêm, para saber o que estou lendo mesmo com um projeto só.

**Why P2**: Completa o pedido. A listagem funciona sem isso.

**Acceptance Criteria**:

7. WHILE há uma única pasta de specs the árvore Features SHALL mostrar um nó com o nome da pasta do workspace, com as specs dentro dele
8. WHILE há uma única pasta de specs the árvore Projeto SHALL mostrar um nó com o nome da pasta do workspace, com Handoff, decisões e lições dentro dele
9. WHEN uma pasta do workspace tem mais de uma pasta de specs configurada THEN as árvores SHALL rotular cada nó como "nome da pasta do workspace · caminho da entrada"

**Independent Test**: Com só `.specs` configurada, a árvore Features mostra o nó `visual-tlc` com as specs dentro, e a árvore Projeto mostra o nó `visual-tlc` com o Handoff dentro.

---

## Edge Cases

- WHILE o olho de Features está fechado e todas as specs de um projeto estão ocultas the árvore Features SHALL mostrar o nó do projeto sem filhos, com a mensagem da view contando as ocultas
- IF uma entrada é absoluta, tem `..` ou tem glob THEN a extensão SHALL ignorá-la com um aviso que cita a entrada, como no SF-09

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SFP-01 | P1: Ler só as pastas configuradas | Design | Pending |
| SFP-02 | P1: Ler só as pastas configuradas | Design | Pending |
| SFP-03 | P1: Ler só as pastas configuradas | Design | Pending |
| SFP-04 | P1: Ler só as pastas configuradas | Design | Pending |
| SFP-05 | P1: Ler só as pastas configuradas | Design | Pending |
| SFP-06 | P1: Ler só as pastas configuradas | Design | Pending |
| SFP-07 | P2: Ver a pasta de cada projeto nas árvores | Design | Pending |
| SFP-08 | P2: Ver a pasta de cada projeto nas árvores | Design | Pending |
| SFP-09 | P2: Ver a pasta de cada projeto nas árvores | Design | Pending |
| SFP-10 | Edge case: projeto com tudo oculto | Design | Pending |
| SFP-11 | Edge case: entrada inválida | Design | Pending |

**ID format:** `SFP-NN`, na ordem dos critérios acima.

**Coverage:** 11 total, 0 mapped to tasks, 11 unmapped ⚠️

---

## Success Criteria

- [ ] Neste repositório, com a configuração padrão, nenhuma spec de `test/fixtures` aparece na barra lateral nem no painel
- [ ] As configurações da extensão têm uma entrada de pastas só: `tlcSpecs.specsFolders`
- [ ] Os testes atuais continuam passando, com os de `tlcSpecs.exclude` removidos junto com a configuração e os de busca em profundidade reescritos para o caminho exato
