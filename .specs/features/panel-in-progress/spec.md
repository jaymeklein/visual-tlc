# Panel In Progress Specification

## Problem Statement

O painel mostra todas as features, inclusive as concluídas, que ficam na coluna Concluídas. Num projeto com várias features entregues, esses cards ocupam o quadro e disputam espaço com o que ainda está em andamento. Na barra lateral estreita, o quadro vira uma lista longa. A opção "Ocultar concluídas" já existe, mas começa desmarcada. Quando é marcada, a coluna some e deixa uma faixa vazia à direita do quadro.

## Goals

- [x] O painel abre mostrando só as features que não estão concluídas
- [x] As concluídas continuam a um clique, na opção "Ocultar concluídas"

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Configuração para escolher o padrão | O pedido é mudar o padrão. A opção no painel continua mostrando as concluídas |
| Esconder concluídas nas árvores Features e Projeto | O pedido é sobre o painel |
| Esconder tasks concluídas no detalhe de uma feature | Descartado pelo usuário em 2026-09-29 |
| Lembrar a escolha entre uma aba e a próxima | A opção guarda a escolha como já guarda hoje. Uma aba nova começa com o padrão |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| O que é "concluída" | Feature verificada com PASS, a mesma regra da coluna Concluídas e do bloco Concluídas do resumo | É a regra que o painel já usa | y (2026-09-29) |
| O que some | Os cards das concluídas e a coluna Concluídas | O usuário escolheu esconder as features concluídas e a coluna | y (2026-09-29) |
| Superfícies | Painel na aba e na barra lateral | As duas desenham a mesma página | n |
| Largura do quadro sem a coluna Concluídas | As cinco etapas dividem a largura, com 200px no mínimo cada | A faixa vazia de hoje desperdiça um sexto do quadro | n |
| Resumo | O bloco "Concluídas" continua contando as concluídas | Mostra que elas existem sem mostrar os cards | n |
| SIDE-09 (sidebar-dashboard) | As seis etapas lado a lado passam a valer com a opção desmarcada. Com a opção marcada, que é o padrão, são cinco | Esta feature muda o padrão que o SIDE-09 supunha | n |
| Medida em VS Code real | Os testes de integração medem o quadro de cinco etapas. As seis etapas ficam cobertas pelos testes do render e da folha de estilo | Os testes de integração não conseguem clicar na opção dentro da webview | n |
| Busca | Com a opção marcada, a busca não encontra features concluídas | A busca filtra o que está no quadro, como hoje | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Estado de tela local à webview: sem persistência nova, chamadas externas, auth ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Ver só o que está em andamento ⭐ MVP

**User Story**: Como quem acompanha as specs pelo painel, quero que ele abra só com as features em andamento, para ver o que falta sem passar pelas entregues.

**Why P1**: É o pedido.

**Acceptance Criteria**:

1. WHEN o painel abre, na aba ou na barra lateral, THEN a extensão SHALL mostrar a opção "Ocultar concluídas" marcada
2. WHILE a opção "Ocultar concluídas" está marcada the extensão SHALL deixar fora do quadro os cards das features verificadas com PASS e a coluna Concluídas
3. WHILE a opção "Ocultar concluídas" está marcada e o painel tem 700px ou mais the extensão SHALL mostrar as cinco etapas lado a lado, sem espaço reservado à coluna Concluídas
4. WHEN o usuário desmarca a opção "Ocultar concluídas" THEN a extensão SHALL mostrar a coluna Concluídas com os cards das features verificadas com PASS, e as seis etapas lado a lado

**Independent Test**: Abrir o painel em aba neste repositório. As features com `validation.md` em PASS não aparecem no quadro, e não há coluna Concluídas. Desmarcar "Ocultar concluídas" traz a coluna e os cards.

---

## Edge Cases

- WHEN uma feature concluída é aberta no painel pela árvore Features ou por uma notificação THEN a extensão SHALL mostrar o detalhe dela, mesmo com a opção marcada

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| PNL-01 | P1: Ver só o que está em andamento | Execute | Verified |
| PNL-02 | P1: Ver só o que está em andamento | Execute | Verified |
| PNL-03 | P1: Ver só o que está em andamento | Execute | Verified |
| PNL-04 | P1: Ver só o que está em andamento | Execute | Verified |
| PNL-05 | Edge case: detalhe de uma concluída | Execute | Verified |

**ID format:** `PNL-NN`, na ordem dos critérios acima.

**Coverage:** 5 total, 5 verificados; escopo Medium (passos listados na execução, sem `tasks.md`).

---

## Success Criteria

- [x] Ao abrir o painel, nenhuma feature verificada com PASS aparece no quadro
- [x] Os testes unitários e de integração atuais continuam passando, com os do SIDE-09 ajustados ao novo padrão
