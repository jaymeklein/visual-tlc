# Collapsed Hidden Folder Specification

## Problem Statement

Quando o usuário abre o olho do título de Features, a pasta com todas as specs ocultas volta expandida, com todas as specs listadas. Numa pasta com muitas specs concluídas, a árvore enche de linhas que o usuário não pediu para ver. Ele quer decidir quais pastas abrir.

## Goals

- [ ] Ao abrir o olho de Features, a pasta com todas as specs ocultas volta recolhida
- [ ] As pastas com spec à vista continuam expandidas, como hoje

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Lembrar, entre uma abertura do olho e a próxima, quais pastas ocultas o usuário abriu | O pedido é que a pasta volte fechada. Com o olho fechado, ela sai da árvore |
| Recolher as pastas com spec à vista | O pedido é sobre a pasta que volta com o olho |
| Mudar a árvore Projeto ou o painel | Continuam fora, como no hidden-folder |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Pasta que volta com o olho aberto | Recolhida, sem listar as specs | Pedido do usuário: "seria melhor que ela viesse fechada" | y (2026-09-30) |
| Pastas com spec à vista | Continuam expandidas | O pedido é sobre a pasta que o olho traz de volta | n |
| Cada abertura do olho | A pasta oculta volta recolhida toda vez, mesmo que o usuário a tenha aberto antes | Com o olho fechado, o nó sai da árvore, e o VS Code não guarda o estado de um nó que saiu | n |
| Pasta à vista que fica toda oculta com o olho aberto | O nó continua na árvore e fica aberto ou fechado como estava | O nó não sai da árvore, e o `id` dele guarda o estado de expansão (API do VS Code, `TreeItem.id`) | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Só muda o estado inicial de um nó da árvore. Sem persistência, chamadas externas ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Abrir o olho sem expandir as pastas ocultas ⭐ MVP

**User Story**: Como quem acompanha as specs pela árvore Features, quero que o olho do título traga as pastas ocultas recolhidas, para abrir só as que me interessam.

**Why P1**: É o pedido.

**Acceptance Criteria**:

1. WHEN o usuário abre o olho do título de Features THEN a árvore SHALL mostrar recolhido, sem listar as specs dele, o nó de toda pasta com todas as specs ocultas
2. WHEN o usuário abre o olho do título de Features THEN a árvore SHALL mostrar expandido, com as specs listadas, o nó de toda pasta com alguma spec à vista
3. WHEN o usuário expande o nó recolhido de uma pasta oculta THEN a árvore SHALL listar todas as specs da pasta, cada uma com a descrição terminada em "· oculta"

**Independent Test**: Neste repositório, com todas as specs concluídas, abrir o olho do título de Features. O nó `visual-tlc` aparece recolhido. Expandir o nó mostra as specs, todas com "· oculta".

---

## Edge Cases

- WHEN o usuário fecha e abre de novo o olho do título THEN a árvore SHALL mostrar recolhido outra vez o nó da pasta com todas as specs ocultas

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| CHF-01 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Pending |
| CHF-02 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Pending |
| CHF-03 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Pending |
| CHF-04 | Edge case: abrir o olho de novo | Execute | Pending |

**ID format:** `CHF-NN`, na ordem dos critérios acima.

**Coverage:** 4 total, 0 verificados.

---

## Success Criteria

- [ ] Um teste no VS Code real mostra que, ao abrir o olho, o VS Code não pede as specs da pasta oculta, e pede as da pasta à vista
- [ ] Neste repositório, depois de reinstalar a extensão e recarregar a janela, o olho do título traz o nó `visual-tlc` recolhido
