# Eye On Every Spec Specification

## Problem Statement

O olho de ocultar só existe nas specs que não estão concluídas. As concluídas ficam ocultas sozinhas e não têm olho próprio. Num projeto com todas as specs concluídas, como este, a árvore Features não mostra olho nenhum, e não há como ocultar nem manter à vista uma spec pela linha dela. O usuário pediu três vezes para ocultar uma spec pela árvore Features.

## Goals

- [ ] Toda spec tem um olho na linha da árvore Features e no card do painel, concluída ou não
- [ ] O clique no olho troca a spec entre oculta e à vista, e a escolha vale até o usuário trocar de novo

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Olho no detalhe da feature | Continua fora, como no hidden-specs. O card e a linha bastam |
| Deixar os botões da linha sempre visíveis | O VS Code mostra os botões de uma linha da árvore só com o mouse em cima ou com a linha selecionada. A API não muda isso |
| Mudar o olho geral do painel e do título de Features | Continua como no hidden-specs: fechado esconde as ocultas, aberto mostra |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Olho nas concluídas | Toda spec tem olho. As concluídas começam ocultas, e o olho de uma delas pode deixá-la à vista | Resposta do usuário: "Olho em toda spec" | y (2026-09-30) |
| Estado de uma spec | Oculta quando o usuário a ocultou, ou quando está concluída e o usuário não a deixou à vista. À vista nos outros casos | Junta a regra das concluídas com a escolha do usuário | n |
| Ícone do olho da spec | Olho aberto, "Ocultar spec", numa spec à vista. Olho fechado, "Desocultar spec", numa spec oculta. Igual ao hidden-specs, agora também nas concluídas | Mesmo sentido do olho geral: o ícone mostra o estado | n |
| Onde fica a escolha | No estado do workspace no VS Code, como no hidden-specs. As ocultas à mão na lista que já existe, as concluídas à vista numa segunda lista | Mantém as marcas já gravadas | n |
| Escolha que coincide com o padrão | Não é gravada: ocultar uma concluída à vista apaga a escolha, e ela volta a ser oculta por ser concluída | Evita escolhas que não mudam nada | n |
| Spec ocultada à mão que depois é concluída | Continua oculta | Oculta pelas duas regras | n |
| Concluída deixada à vista que depois volta a falhar | Continua à vista | Não concluída fica à vista por padrão | n |
| Coluna Concluídas com o olho geral fechado | Aparece quando há alguma concluída à vista, com as seis etapas. Sem concluída à vista, as cinco etapas, como no PNL-03 | A concluída à vista precisa de uma coluna | n |
| Esmaecido e "· oculta" com o olho geral aberto | Toda spec oculta, concluída ou não, fica esmaecida no quadro e com "· oculta" na árvore. Substitui o HID-14, que valia só para as marcadas | Mostra quais specs o olho geral fechado esconde | n |
| Número de ocultas | Conta as specs ocultas por qualquer regra, uma vez cada | Mantém o HID-01 | n |
| Dimensões implícitas | Persistência coberta pelo EYE-09. Remaining dimensions N/A for this scope | Estado local ao workspace, sem chamadas externas ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Ocultar ou mostrar qualquer spec pelo olho dela ⭐ MVP

**User Story**: Como quem acompanha as specs pela barra lateral, quero um olho em cada spec, concluída ou não, para escolher quais ficam à vista.

**Why P1**: É o pedido repetido do usuário.

**Acceptance Criteria**:

1. The extensão SHALL mostrar um olho em toda spec, na linha da árvore Features e no card do painel, concluída ou não
2. WHILE uma spec está à vista the olho dela SHALL ser o olho aberto com o título "Ocultar spec"
3. WHILE uma spec está oculta the olho dela SHALL ser o olho fechado com o título "Desocultar spec"
4. WHEN o usuário clica em "Ocultar spec", na árvore ou no card, THEN a extensão SHALL tirar a spec da árvore e do quadro com o olho geral fechado e somá-la ao número de ocultas, concluída ou não
5. WHEN o usuário clica em "Desocultar spec" numa spec concluída THEN a extensão SHALL mostrá-la na árvore e na coluna Concluídas com o olho geral fechado, e tirá-la do número de ocultas
6. WHILE uma spec concluída não tem escolha do usuário the extensão SHALL tratá-la como oculta
7. WHILE o olho geral do painel está fechado e há alguma concluída à vista the quadro SHALL mostrar a coluna Concluídas com ela, nas seis etapas
8. WHILE o olho geral está aberto the extensão SHALL mostrar toda spec oculta, concluída ou não, com o card esmaecido no painel e com a descrição terminada em "· oculta" na árvore
9. WHEN o VS Code reabre o mesmo workspace THEN a extensão SHALL manter as escolhas feitas pelo olho de cada spec

**Independent Test**: Neste repositório, abrir o olho do título de Features, passar o mouse numa spec concluída e clicar no olho fechado dela. Fechar o olho do título: a spec continua na árvore e no painel, e o número de ocultas cai um. Clicar no olho aberto dela: ela some de novo.

---

## Edge Cases

- WHEN o usuário oculta uma concluída que estava à vista THEN a extensão SHALL apagar a escolha, e a spec volta a ser oculta por ser concluída
- WHEN uma spec oculta à mão é aberta no painel pela árvore ou por uma notificação THEN a extensão SHALL mostrar o detalhe dela, como no HID-15

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| EYE-01 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | In Tasks |
| EYE-02 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | In Tasks |
| EYE-03 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | In Tasks |
| EYE-04 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | Implementing |
| EYE-05 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | Implementing |
| EYE-06 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | Implementing |
| EYE-07 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | In Tasks |
| EYE-08 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | In Tasks |
| EYE-09 | P1: Ocultar ou mostrar qualquer spec pelo olho dela | Execute | Implementing |
| EYE-10 | Edge case: ocultar uma concluída à vista | Execute | Implementing |
| EYE-11 | Edge case: detalhe de uma oculta | Execute | In Tasks |

**ID format:** `EYE-NN`, na ordem dos critérios acima.

**Coverage:** 11 total, 11 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Neste repositório, onde todas as specs estão concluídas, cada linha da árvore Features tem o olho ao passar o mouse
- [ ] Uma concluída deixada à vista continua à vista depois de recarregar a janela
- [ ] Os testes do hidden-specs que diziam "concluída sem olho" e "concluída sem esmaecido" são reescritos para a regra nova, sem perder as outras asserções
