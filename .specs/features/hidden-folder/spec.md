# Hidden Folder Specification

## Problem Statement

Com o olho de Features fechado, uma pasta de specs com todas as specs ocultas continua na árvore, como um nó sem filhos (SFP-10). Neste repositório todas as specs estão concluídas e ocultas, e a árvore mostra só o nó `visual-tlc`, vazio. O nó não leva a nada e sugere que há trabalho ali. Uma pasta sem spec à vista deve sair da árvore, como as specs dela.

## Goals

- [ ] Com o olho de Features fechado, a árvore mostra só as pastas com alguma spec à vista
- [ ] Com o olho aberto, a pasta com todas as specs ocultas volta, marcada como oculta

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Esconder a pasta na árvore Projeto | Resposta do usuário: "Só na árvore Features". Handoff, decisões e lições não são specs |
| Esconder a seção do projeto no painel | Resposta do usuário. Com um projeto só, o painel nem mostra o nome da pasta |
| Olho próprio na linha da pasta | A pasta segue as specs dela. O pedido não é ocultar uma pasta à mão |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Onde a pasta some | Só na árvore Features, com o olho do título fechado | Resposta do usuário: "Só na árvore Features" | y (2026-09-30) |
| Pasta com o olho aberto | Aparece, com a descrição "N feature(s) · oculta" | Resposta do usuário: "Com '· oculta'". Segue o EYE-08 | y (2026-09-30) |
| SFP-10 e a linha de vários projetos do hidden-specs | Substituídos: com o olho fechado, a pasta com todas as specs ocultas sai da árvore, com um projeto ou com vários | É o pedido: "a pasta principal deveria também estar oculta" | y (2026-09-30) |
| Quando uma pasta está oculta | Quando tem ao menos uma spec e todas estão ocultas, por qualquer regra do EYE-06 | "Não há mais trabalho a ser feito" | n |
| Pasta sem spec nenhuma, só com `STATE.md` ou lições | Continua na árvore, com "0 feature(s)" | Não tem nada oculto. Sem ela, a árvore ficaria vazia e sem mensagem, porque a mensagem só aparece com alguma feature | n |
| Todas as pastas ocultas | Lista vazia, com a mensagem do HID-08 e sem a tela de boas-vindas, como no HID-16 antes do SFP-10 | A mensagem conta as ocultas e mostra que elas existem | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Regra de exibição sobre as escolhas que o hidden-specs e o eye-on-every-spec já guardam. Sem persistência nova | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Tirar da árvore a pasta sem spec à vista ⭐ MVP

**User Story**: Como quem acompanha as specs pela árvore Features, quero que uma pasta com todas as specs ocultas saia da árvore com o olho fechado, para ver só as pastas que têm trabalho.

**Why P1**: É o pedido.

**Acceptance Criteria**:

1. WHILE o olho de Features está fechado the árvore Features SHALL deixar fora o nó de toda pasta de specs que tem ao menos uma spec e todas ocultas
2. WHEN o usuário oculta, pelo olho da linha dela, a última spec à vista de uma pasta THEN a árvore Features SHALL tirar o nó da pasta
3. WHEN o usuário desoculta, pelo card no painel, uma spec de uma pasta que está fora da árvore THEN a árvore Features SHALL mostrar de novo o nó da pasta, com essa spec dentro
4. WHILE o olho de Features está fechado e nenhuma pasta tem spec à vista the view Features SHALL mostrar a lista vazia com a mensagem "T feature(s) · D concluída(s) · H oculta(s)", sem a tela de boas-vindas
5. WHILE o olho de Features está aberto the nó de uma pasta com todas as specs ocultas SHALL ter a descrição "N feature(s) · oculta", com N o total de specs da pasta
6. WHILE uma pasta tem ao menos uma spec à vista the nó dela SHALL ter a descrição "N feature(s)", sem "· oculta", com o olho de Features aberto ou fechado
7. WHILE todas as specs de uma pasta estão ocultas the árvore Projeto SHALL mostrar o nó dessa pasta, com Handoff, decisões e lições dentro

**Independent Test**: Neste repositório, com todas as specs concluídas e o olho de Features fechado, a árvore fica vazia e a mensagem diz "T feature(s) · T concluída(s) · T oculta(s)". Abrir o olho mostra o nó `visual-tlc` com "T feature(s) · oculta".

---

## Edge Cases

- IF uma pasta de specs não tem spec nenhuma THEN a árvore Features SHALL mostrar o nó dela com a descrição "0 feature(s)", com o olho fechado

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| HFD-01 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Needs Fix |
| HFD-02 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Verified |
| HFD-03 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Verified |
| HFD-04 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Verified |
| HFD-05 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Verified |
| HFD-06 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Verified |
| HFD-07 | P1: Tirar da árvore a pasta sem spec à vista | Execute | Verified |
| HFD-08 | Edge case: pasta sem spec | Execute | Verified |

**ID format:** `HFD-NN`, na ordem dos critérios acima.

**Coverage:** 8 total, 7 verificados, 1 com o Fix 2 à espera da nova validação.

---

## Success Criteria

- [ ] Neste repositório, com todas as specs concluídas, a árvore Features abre vazia, só com a mensagem das ocultas
- [ ] O teste do SFP-10/HID-16, que exigia o nó sem filhos, é reescrito para a regra nova, sem perder as asserções da mensagem e da tela de boas-vindas
