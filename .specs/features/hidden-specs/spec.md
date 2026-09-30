# Hidden Specs Specification

## Problem Statement

O painel esconde as features concluídas com uma caixa de texto, "Ocultar concluídas", que não mostra de relance se há algo escondido nem quanto. A árvore Features não esconde nada: lista todas as specs, inclusive as entregues, e não tem como listar só o que falta. Também não há como tirar da frente uma spec que não está concluída, mas saiu do foco, como uma pausada ou abandonada.

## Goals

- [x] Um botão de olho, no painel e na árvore Features, mostra pelo ícone se as specs ocultas estão escondidas ou à vista, e alterna entre os dois estados com um clique
- [x] Qualquer spec não concluída pode ser ocultada e desocultada à mão, pelo olho dela, e continua oculta ao reabrir o VS Code

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Desocultar uma concluída para ela ficar sempre à vista | O usuário escolheu: as concluídas ficam ocultas sozinhas, e o olho por spec vale para as outras |
| Esconder specs na árvore Projeto | O pedido é sobre Features e o painel |
| Tirar as ocultas do resumo, da barra de status e das notificações | O resumo mostra que elas existem. A barra de status e as notificações não mudam |
| Guardar as marcas num arquivo do repositório, para a equipe | A extensão não escreve nas pastas de specs (readonly-navigation) |
| Olho por spec no detalhe da feature | O card e a linha da árvore bastam. O detalhe continua como está |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| O que é uma spec oculta | Uma feature verificada com PASS ou uma feature marcada à mão | Resposta do usuário: "Concluídas e as marcadas" | y (2026-09-29) |
| Controle de ocultar e mostrar | Botão de olho que alterna, no painel e no título da view Features. O ícone mostra o estado: olho fechado com as ocultas escondidas, olho aberto com elas à vista | Resposta do usuário: "Olho que alterna" | y (2026-09-29) |
| Onde as ocultas aparecem quando o olho abre | No lugar delas: a coluna Concluídas e as colunas das etapas no painel, as linhas na árvore | Resposta do usuário | y (2026-09-29) |
| Texto do botão do painel | O número de ocultas: "1 oculta", "3 ocultas", "0 ocultas". O título diz a ação: "Mostrar as specs ocultas" ou "Esconder as specs ocultas" | O número mostra de relance que há algo escondido. O título explica o clique | n |
| Olho por spec | Olho aberto, "Ocultar spec", numa spec à vista. Olho fechado, "Desocultar spec", numa spec marcada. Concluídas não têm olho | Mesmo sentido do botão geral: o ícone mostra o estado da spec | n |
| Ícone de "Visualizar" no card | Troca o olho pelo ícone de pré-visualização, o mesmo da árvore | O olho passa a significar ocultar | n |
| Spec marcada à vista | Card esmaecido no painel. Na árvore, a descrição termina em "· oculta" | Distingue a marcada das outras quando o olho está aberto | n |
| Onde ficam as marcas | No estado do workspace no VS Code (`workspaceState`), fora do repositório | A extensão não escreve nas pastas de specs | n |
| Estado do olho geral | Cada superfície tem o seu: a árvore, a aba e a barra lateral. A árvore começa com as ocultas escondidas a cada abertura do VS Code. O painel guarda o estado como já guarda o "Ocultar concluídas" | O pedido é um botão em cada lugar. Mantém o padrão do painel | n |
| Spec marcada que depois é concluída | Conta uma vez entre as ocultas | Continua oculta pelas duas regras | n |
| Marca de uma spec apagada ou renomeada | Fica guardada. Volta a valer se uma spec com o mesmo nome voltar à mesma pasta | Não há como distinguir uma spec apagada de uma pasta de specs fora da configuração por um tempo | n |
| Projeto com todas as specs ocultas, em workspace com vários projetos | A linha do projeto continua na árvore, sem filhos à vista | Mostra que o projeto existe | n |
| Busca do painel | Com as ocultas escondidas, a busca não encontra as ocultas | A busca filtra o que está no quadro, como hoje | n |
| Duas janelas do mesmo workspace | Cada janela lê as marcas ao abrir. Uma marca feita numa janela só aparece na outra quando ela reabre | O `workspaceState` não avisa as outras janelas | n |
| Dimensões implícitas | Persistência coberta pelo HID-13 e pela linha acima. Remaining dimensions N/A for this scope | Sem chamadas externas, auth ou transições além de oculta e à vista | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Ver e esconder as ocultas pelo olho ⭐ MVP

**User Story**: Como quem acompanha as specs, quero um olho no painel e na árvore Features que mostre se há specs escondidas e as traga à vista com um clique, para ver o que falta sem perder o acesso ao que saiu da frente.

**Why P1**: É o pedido: o controle visual e o botão também em Features.

**Acceptance Criteria**:

1. WHEN o painel abre, na aba ou na barra lateral, THEN a extensão SHALL mostrar na barra do topo, no lugar da caixa "Ocultar concluídas", um botão com o olho fechado, o título "Mostrar as specs ocultas" e o texto com o número de specs ocultas ("3 ocultas")
2. WHILE o olho do painel está fechado the extensão SHALL deixar fora do quadro as specs ocultas, concluídas e marcadas, e a coluna Concluídas
3. WHEN o usuário clica no olho fechado do painel THEN a extensão SHALL mostrar no quadro as specs ocultas, cada uma na sua coluna, com a coluna Concluídas, e trocar o botão pelo olho aberto com o título "Esconder as specs ocultas"
4. WHEN o usuário clica no olho aberto do painel THEN a extensão SHALL tirar de novo as specs ocultas do quadro e voltar ao olho fechado
5. WHEN o VS Code abre um workspace com specs THEN a árvore Features SHALL listar só as specs que não estão ocultas e mostrar no título da view o botão "Mostrar specs ocultas", com o ícone `eye-closed`
6. WHEN o usuário clica em "Mostrar specs ocultas" na view Features THEN a árvore SHALL listar todas as specs e o título da view SHALL mostrar o botão "Esconder specs ocultas", com o ícone `eye`
7. WHEN o usuário clica em "Esconder specs ocultas" na view Features THEN a árvore SHALL voltar a listar só as specs que não estão ocultas
8. WHILE a árvore Features esconde as ocultas e há ao menos uma the view SHALL mostrar a mensagem "T feature(s) · D concluída(s) · H oculta(s)", com o total de features, as concluídas e as ocultas

**Independent Test**: Abrir este repositório. A árvore Features lista só as features sem `validation.md` em PASS, e o painel mostra "N ocultas" com o olho fechado. Clicar no olho de cada lugar traz as concluídas de volta, e clicar de novo as esconde.

---

### P2: Ocultar uma spec à mão

**User Story**: Como quem acompanha as specs, quero ocultar uma spec que saiu do foco, mesmo sem estar concluída, para que ela não dispute espaço com as que estão andando.

**Why P2**: Completa o pedido, mas o olho geral já resolve as concluídas sem ela.

**Acceptance Criteria**:

9. WHILE uma spec não concluída está à vista e sem marca the extensão SHALL mostrar na linha dela na árvore Features e no card dela no painel um botão com o olho aberto e o título "Ocultar spec"
10. WHILE uma spec não concluída está marcada como oculta the extensão SHALL mostrar na linha dela na árvore Features e no card dela no painel um botão com o olho fechado e o título "Desocultar spec"

> Desde `eye-on-every-spec` (EYE-01 a EYE-03), toda spec tem o olho, concluída ou não. A concluída começa oculta, com o olho fechado.

11. WHEN o usuário clica em "Ocultar spec", na árvore ou no painel, THEN a extensão SHALL tirar a spec da árvore Features e dos quadros do painel com o olho fechado, e somá-la ao número de ocultas
12. WHEN o usuário clica em "Desocultar spec", na árvore ou no painel, THEN a extensão SHALL devolver a spec à árvore Features e aos quadros do painel, e tirá-la do número de ocultas
13. WHEN o VS Code reabre o mesmo workspace THEN a extensão SHALL manter ocultas as specs marcadas antes
14. WHILE o olho geral está aberto the extensão SHALL mostrar a spec marcada com o card esmaecido no painel e com a descrição terminada em "· oculta" na árvore Features

> Desde `eye-on-every-spec` (EYE-08), o esmaecido e o "· oculta" valem para toda spec oculta, inclusive a concluída sem escolha do usuário.

**Independent Test**: Na árvore Features, clicar no olho de uma spec em andamento. Ela some da árvore e do painel, e o número de ocultas sobe. Abrir o olho geral mostra o card esmaecido com o olho fechado. Clicar nele devolve a spec.

---

## Edge Cases

- WHEN uma spec marcada é aberta no painel pela árvore Features ou por uma notificação THEN a extensão SHALL mostrar o detalhe dela, mesmo com o olho fechado
- IF todas as specs de um projeto único estão ocultas e a árvore esconde as ocultas THEN a view Features SHALL mostrar a lista vazia com a mensagem do HID-08, sem a tela de boas-vindas

> Desde `specs-folder-paths` (SFP-10), a árvore mostra o nó da pasta mesmo com um projeto só. Com tudo oculto, o nó fica sem filhos, e a mensagem continua contando as ocultas.

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| HID-01 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-02 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-03 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-04 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-05 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-06 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-07 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-08 | P1: Ver e esconder as ocultas pelo olho | Execute | Verified |
| HID-09 | P2: Ocultar uma spec à mão | Execute | Verified |
| HID-10 | P2: Ocultar uma spec à mão | Execute | Verified |
| HID-11 | P2: Ocultar uma spec à mão | Execute | Verified |
| HID-12 | P2: Ocultar uma spec à mão | Execute | Verified |
| HID-13 | P2: Ocultar uma spec à mão | Execute | Verified |
| HID-14 | P2: Ocultar uma spec à mão | Execute | Verified |
| HID-15 | Edge case: detalhe de uma marcada | Execute | Verified |
| HID-16 | Edge case: todas ocultas | Execute | Verified |

**ID format:** `HID-NN`, na ordem dos critérios acima.

**Coverage:** 16 total, 16 verificados.

---

## Success Criteria

- [x] Ao abrir o VS Code, nem a árvore Features nem o painel mostram specs ocultas, e os dois mostram um olho fechado
- [x] Uma spec ocultada à mão continua oculta depois de recarregar a janela. Provado com um `Memento` falso lido por uma instância nova. A ligação ao `workspaceState` real não tem teste que reabra o VS Code (Follow-up 1 da validação, opcional)
- [x] Os testes unitários e de integração atuais continuam passando, com os do "Ocultar concluídas" e os que leem concluídas na árvore ajustados ao olho
