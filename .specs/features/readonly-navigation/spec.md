# Read-only Navigation Specification

## Problem Statement

Hoje, clicar numa etapa, arquivo, requisito ou task da extensão abre o markdown no editor de texto, onde ele pode ser alterado sem querer — e a extensão existe para acompanhar a skill, não para editar os artefatos dela. As tasks só aparecem dentro da etapa Execução e cada clique leva ao `tasks.md` editável. O acompanhamento precisa ser de leitura: artefatos abrem em modo visualização e as tasks aparecem como lista.

## Goals

- [ ] Nenhum clique em artefato abre um editor, exceto pelo ícone explícito "Abrir no editor" e pelos avisos
- [ ] As tasks de toda feature com `tasks.md` ficam visíveis como lista, com status e detalhes, sem abrir arquivo

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Editar tasks ou marcar checkboxes pela extensão | A extensão é somente leitura; o `tasks.md` pertence à skill |
| Renderizador de markdown próprio | O Markdown preview nativo do VS Code já atende |
| Abrir o preview rolado até uma linha | O comando de preview não recebe linha; o ícone "Abrir no editor" cobre esse caso |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Clique em artefato | Abre no Markdown preview da coluna ativa; ícone inline "Abrir no editor" abre na linha do item | Decisão do usuário no discuss | y |
| Lista de tasks | Na árvore (etapas Tasks e Execução) e no painel, com detalhes expandidos no lugar | Decisão do usuário no discuss | y |
| Avisos | Continuam abrindo o editor na linha do problema | A linha é a informação principal de um aviso | y |
| Arquivo da etapa Execução | `tasks.md` | A skill não grava artefato próprio de execução; o progresso vive no `tasks.md` | n |
| Ícone de editor nas linhas de task | Não existe | Tasks são somente leitura; o `tasks.md` segue acessível pelo ícone da etapa Tasks | n |
| Ícone de editor no painel | Só nas linhas da seção Arquivos | Mantém o painel limpo; a linha exata de cada item fica na árvore | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Navegação de UI somente leitura: sem persistência, chamadas externas, auth, concorrência ou transição de estado | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Abrir artefatos em modo visualização ⭐ MVP

**User Story**: Como quem acompanha as specs, quero que clicar numa etapa, arquivo ou requisito abra o markdown em modo visualização para ler sem risco de editar.

**Why P1**: É o pedido central — acompanhar a skill sem alterar os artefatos dela.

**Acceptance Criteria**:

1. WHEN o usuário clica numa etapa com arquivo na árvore Features THEN a extensão SHALL abrir o markdown da etapa no Markdown preview (Spec → `spec.md`, Design → `design.md`, Tasks → `tasks.md`, Execução → `tasks.md`, Verificação → `validation.md`)
2. WHEN o usuário clica num arquivo, requisito ou fase na árvore Features THEN a extensão SHALL abrir o markdown correspondente no Markdown preview
3. WHEN o usuário clica num item da árvore Projeto (Handoff, decisão ou lição) THEN a extensão SHALL abrir `STATE.md` ou `LESSONS.md` no Markdown preview
4. WHEN o usuário aciona o ícone "Abrir no editor" de uma etapa, arquivo, requisito ou fase THEN a extensão SHALL abrir o arquivo no editor de texto com o cursor na linha do item (linha 1 quando o item não tem linha)
5. WHEN o usuário clica num aviso THEN a extensão SHALL abrir o arquivo no editor de texto na linha do aviso

**Independent Test**: Clicar na etapa Spec de `user-auth` abre a aba "Preview spec.md"; o ícone de editor de um requisito abre `spec.md` na linha dele.

---

### P1: Tasks como lista somente leitura ⭐ MVP

**User Story**: Como quem acompanha a execução, quero ver as tasks como lista com status e detalhes para seguir o progresso sem abrir o `tasks.md` editável.

**Why P1**: Pedido explícito; hoje a única forma de ver uma task é abrir o arquivo editável.

**Acceptance Criteria**:

1. WHEN o usuário expande a etapa Tasks ou a etapa Execução de uma feature com tasks THEN a árvore SHALL listar as tasks agrupadas por Phase, cada uma com ícone de status e o rótulo "Tn: título"
2. WHEN o usuário expande uma task na árvore THEN a árvore SHALL mostrar como itens de leitura o O quê, o Onde, o Depende de, os Requisitos, Tests/Gate e cada item de Done when com seu estado marcado ou não
3. The árvore SHALL manter as linhas de task e de detalhe de task sem comando de abrir arquivo, de modo que clicar nelas nunca abre um editor
4. IF a feature não tem `tasks.md` ou o `tasks.md` não tem tasks THEN a árvore SHALL exibir a etapa Tasks sem opção de expandir

**Independent Test**: Expandir Tasks de `user-auth` mostra 3 fases e 7 tasks; expandir T4 mostra 3 itens de Done when, 1 marcado; nenhum desses cliques abre editor.

---

### P2: Mesmo comportamento no painel

**User Story**: Como quem usa o painel, quero que os cliques no painel sigam as mesmas regras da árvore para não alternar entre modos de abrir.

**Why P2**: A árvore cobre o MVP; o painel é a segunda superfície.

**Acceptance Criteria**:

1. WHEN o usuário clica numa etapa do stepper, num link "abrir X.md" ou numa linha de requisito, de história ou de arquivo no painel THEN o painel SHALL abrir o markdown no Markdown preview
2. WHEN o usuário aciona o ícone "Abrir no editor" de uma linha da seção Arquivos no painel THEN o painel SHALL abrir o arquivo no editor de texto
3. WHEN o usuário clica numa linha de task recolhida no painel THEN o painel SHALL expandir no lugar os detalhes da task (O quê, Onde, Depende de, Done when) sem abrir arquivo
4. WHEN o usuário clica numa linha de task expandida no painel THEN o painel SHALL recolher os detalhes da task
5. WHEN o usuário clica num aviso no painel THEN o painel SHALL abrir o arquivo no editor de texto na linha do aviso

**Independent Test**: No detalhe de `user-auth`, clicar em T4 mostra os 3 itens de Done when no lugar; clicar em "abrir spec.md" abre o preview.

---

## Edge Cases

- IF uma etapa não tem arquivo (pulada ou pendente) THEN a extensão SHALL exibir a etapa sem ação de clique e sem ícone de editor
- WHEN as etapas Tasks e Execução estão expandidas ao mesmo tempo THEN a árvore SHALL exibir a lista de tasks nas duas sem erro de identificador duplicado

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| NAV-01 | P1: Abrir artefatos em modo visualização | - | Implementing |
| NAV-02 | P1: Abrir artefatos em modo visualização | - | Implementing |
| NAV-03 | P1: Abrir artefatos em modo visualização | - | Implementing |
| NAV-04 | P1: Abrir artefatos em modo visualização | - | Implementing |
| NAV-05 | P1: Abrir artefatos em modo visualização | - | Implementing |
| NAV-06 | P1: Tasks como lista somente leitura | - | Implementing |
| NAV-07 | P1: Tasks como lista somente leitura | - | Implementing |
| NAV-08 | P1: Tasks como lista somente leitura | - | Implementing |
| NAV-09 | P1: Tasks como lista somente leitura | - | Implementing |
| NAV-10 | P2: Mesmo comportamento no painel | - | Implementing |
| NAV-11 | P2: Mesmo comportamento no painel | - | Implementing |
| NAV-12 | P2: Mesmo comportamento no painel | - | Implementing |
| NAV-13 | P2: Mesmo comportamento no painel | - | Implementing |
| NAV-14 | P2: Mesmo comportamento no painel | - | Implementing |
| NAV-15 | Edge case: etapa sem arquivo | - | Implementing |
| NAV-16 | Edge case: Tasks e Execução expandidas | - | Implementing |

**ID format:** `NAV-NN`, na ordem dos critérios acima (P1 artefatos → NAV-01..05, P1 tasks → NAV-06..09, P2 painel → NAV-10..14, edge cases → NAV-15..16).

**Coverage:** 16 total, escopo Medium (tasks implícitas na execução, sem `tasks.md`).

---

## Success Criteria

- [ ] Nenhum clique em etapa, arquivo, requisito, fase ou task abre um editor de texto
- [ ] As 7 tasks de `user-auth` aparecem como lista na árvore e no painel, com os detalhes legíveis sem abrir arquivo
