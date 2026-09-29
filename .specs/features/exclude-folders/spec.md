# Exclude Folders Specification

## Problem Statement

O pedido original era incluir e excluir diretórios da listagem de specs. A feature `specs-folders` entregou só a inclusão. A exclusão ficou na configuração antiga `tlcSpecs.exclude`, que é um glob único em texto: para tirar a pasta `test` da listagem é preciso escrever `{**/node_modules/**,**/test/**}`. Quem usa a extensão num projeto com specs de exemplo em `test/` vê essas specs misturadas com as reais.

## Goals

- [ ] Uma lista de pastas tira da listagem tudo o que está dentro delas
- [ ] Quem já usa `tlcSpecs.exclude` como glob continua com o mesmo resultado

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Globs dentro da lista | Entradas da lista são caminhos literais, como em `tlcSpecs.specsFolders`. O glob continua disponível no formato antigo, em texto |
| Esconder features individuais | O pedido é sobre diretórios |
| Botão na árvore para excluir uma pasta | A exclusão é feita pela configuração |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Nome da configuração | `tlcSpecs.exclude` passa a aceitar uma lista, em vez de criar uma configuração nova | Um lugar só para excluir; quem já configurou não precisa migrar | n |
| Formato da entrada | Caminho relativo (`test`, `packages/legacy`), ignorado em qualquer profundidade de cada pasta do workspace | Mesma regra de `tlcSpecs.specsFolders` | n |
| Padrão | `["node_modules"]` | Equivale ao padrão antigo, `**/node_modules/**` | n |
| Valor em texto | Usado como glob, como antes | Compatibilidade com quem já configurou | n |
| Escopo | `resource`: cada pasta de um workspace multi-root pode ter a sua lista | Mesmo escopo de `tlcSpecs.specsFolders` | n |
| Inclusão e exclusão da mesma pasta | A exclusão vence | Excluir é o pedido mais específico de quem configurou | n |
| Entrada inválida (absoluta, com `..` ou com glob) | Ignorada, com aviso que nomeia a entrada | Mesma regra de `tlcSpecs.specsFolders` | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Configuração local e leitura de arquivos: sem persistência, chamadas externas, auth ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Excluir pastas da listagem ⭐ MVP

**User Story**: Como quem tem specs de exemplo ou de teste no projeto, quero listar as pastas que a extensão deve ignorar para ver só as specs reais.

**Why P1**: É a metade do pedido original que não foi entregue.

**Acceptance Criteria**:

1. The extensão SHALL oferecer a configuração `tlcSpecs.exclude` como lista de caminhos relativos, com padrão `["node_modules"]`
2. WHEN a lista tem uma pasta THEN a extensão SHALL deixar fora da listagem toda pasta de specs que esteja dentro dela, em qualquer profundidade
3. WHEN a configuração `tlcSpecs.exclude` muda THEN a extensão SHALL atualizar projetos, árvores e diagnósticos sem recarregar a janela
4. IF o valor de `tlcSpecs.exclude` é um texto THEN a extensão SHALL usá-lo como glob de exclusão
5. WHERE o workspace tem mais de uma pasta the extensão SHALL aplicar a cada pasta do workspace a lista configurada nela

**Independent Test**: Neste repositório, com `"tlcSpecs.exclude": ["node_modules", "test"]`, as specs de `test/fixtures/` somem da listagem e as de `.specs` continuam.

---

## Edge Cases

- IF a lista está vazia THEN a extensão SHALL listar todas as pastas de specs, inclusive as que estão em `node_modules`
- IF uma entrada é absoluta, contém `..` ou caracteres de glob THEN a extensão SHALL ignorar essa entrada e mostrar um aviso com o nome dela
- WHEN uma pasta tem o nome de uma entrada como parte do nome (`tests` com a entrada `test`) THEN a extensão SHALL manter essa pasta na listagem
- WHEN uma pasta está em `tlcSpecs.specsFolders` e dentro de uma entrada de `tlcSpecs.exclude` THEN a extensão SHALL deixá-la fora da listagem

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| EXC-01 | P1: Excluir pastas da listagem | Execute | Implementing |
| EXC-02 | P1: Excluir pastas da listagem | Execute | Implementing |
| EXC-03 | P1: Excluir pastas da listagem | Execute | Implementing |
| EXC-04 | P1: Excluir pastas da listagem | Execute | Implementing |
| EXC-05 | P1: Excluir pastas da listagem | - | Pending |
| EXC-06 | Edge case: lista vazia | Execute | Implementing |
| EXC-07 | Edge case: entrada inválida | Execute | Implementing |
| EXC-08 | Edge case: nome parecido | Execute | Implementing |
| EXC-09 | Edge case: incluída e excluída | Execute | Implementing |

**ID format:** `EXC-NN`, na ordem dos critérios acima.

**Coverage:** 9 total, escopo Medium (passos listados na execução, sem `tasks.md`).

---

## Success Criteria

- [ ] Com `test` na lista, nenhuma spec de dentro de uma pasta `test` aparece na listagem
- [ ] Os testes unitários e de integração atuais continuam passando
