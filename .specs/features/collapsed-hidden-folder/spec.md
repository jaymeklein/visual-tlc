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
| Pastas com spec à vista | Continuam como estavam: expandidas, ou recolhidas se o usuário as recolheu. Vale também para a pasta à vista só por uma concluída mantida à vista pelo olho dela | O pedido é sobre a pasta que o olho traz de volta, e decidir quais pastas abrir fica com o usuário. O nó continua na árvore, e o VS Code mantém o estado que o usuário deu | n |
| Cada abertura do olho | A pasta oculta volta recolhida toda vez, mesmo que o usuário a tenha aberto antes | O pedido é que ela venha fechada ao abrir o olho | n |
| Como a pasta volta recolhida | O nó da pasta oculta é dado como recolhido, com o mesmo `id` de sempre | Medido no VS Code instalado em 2026-09-30: o VS Code usa o estado dado só num nó que ele acrescenta à árvore. Com o olho fechado, a pasta sai da árvore, e o VS Code esquece se estava aberta. Um `id` novo a cada abertura foi testado e não é preciso | n |
| Ocultar ou desocultar uma spec com o olho aberto | O nó da pasta fica aberto ou fechado como estava (CHF-04) | O nó continua na árvore, e o VS Code mantém o estado que o usuário deu, mesmo que a extensão mude o estado dado. Decidir quais pastas abrir fica com o usuário | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Só muda o estado inicial de um nó da árvore. Sem persistência, chamadas externas ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Abrir o olho sem expandir as pastas ocultas ⭐ MVP

**User Story**: Como quem acompanha as specs pela árvore Features, quero que o olho do título traga as pastas ocultas recolhidas, para abrir só as que me interessam.

**Why P1**: É o pedido.

**Acceptance Criteria**:

1. WHEN o usuário abre o olho do título de Features THEN a árvore SHALL mostrar recolhido, sem listar as specs dele, o nó de toda pasta com todas as specs ocultas
2. WHEN o usuário abre o olho do título de Features THEN a árvore SHALL manter o nó de toda pasta com alguma spec à vista como estava: expandido, com as specs listadas, ou recolhido se o usuário o recolheu
3. WHEN o usuário expande o nó recolhido de uma pasta oculta THEN a árvore SHALL listar todas as specs da pasta, cada uma com a descrição terminada em "· oculta"
4. WHILE o olho do título de Features está aberto, WHEN o usuário oculta ou desoculta uma spec, the árvore SHALL manter o nó da pasta dela aberto ou fechado como estava

**Independent Test**: Neste repositório, com todas as specs concluídas, abrir o olho do título de Features. O nó `visual-tlc` aparece recolhido. Expandir o nó mostra as specs, todas com "· oculta".

---

## Edge Cases

- WHEN o usuário fecha e abre de novo o olho do título THEN a árvore SHALL mostrar recolhido outra vez o nó da pasta com todas as specs ocultas

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| CHF-01 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Verified |
| CHF-02 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Implementing |
| CHF-03 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Verified |
| CHF-04 | P1: Abrir o olho sem expandir as pastas ocultas | Execute | Verified |
| CHF-05 | Edge case: abrir o olho de novo | Execute | Verified |

**ID format:** `CHF-NN`, na ordem dos critérios acima.

**Coverage:** 5 total, 4 verificados, 1 com os Fix 1 e 2 à espera da nova validação.

---

## Success Criteria

- [ ] Um teste no VS Code real mostra que, ao abrir o olho, o VS Code não pede as specs da pasta oculta, e pede as da pasta à vista
- [ ] Neste repositório, depois de reinstalar a extensão e recarregar a janela, o olho do título traz o nó `visual-tlc` recolhido
