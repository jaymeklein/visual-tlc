# Specs Folders Specification

## Problem Statement

A extensão só encontra specs em pastas chamadas `.specs`: o nome está fixo na busca, no watcher e na ativação. Projetos que guardam os artefatos da skill em outro lugar (por exemplo `docs/specs`) ou em mais de uma pasta ficam invisíveis. O usuário precisa configurar uma ou mais pastas de specs, com `.specs` como padrão.

## Goals

- [ ] Qualquer pasta listada na configuração aparece na extensão com o mesmo comportamento de uma `.specs`
- [ ] Sem configuração, o comportamento atual continua idêntico

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Pastas fora do workspace (caminhos absolutos) | A busca é por projeto aberto; pastas externas pedem outro modelo de watcher e permissão |
| Estrutura interna diferente da skill | A pasta configurada precisa seguir o layout da skill (`features/`, `STATE.md`, `lessons.json`) |
| Padrões glob nas entradas | Entradas são caminhos literais; o glob já existe em `tlcSpecs.exclude` |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Formato da entrada | Caminho relativo (`.specs`, `docs/specs`) procurado em qualquer profundidade de cada pasta do workspace | Mantém a descoberta de hoje, que já acha `.specs` em monorepos | y |
| Escopo da configuração | `resource`: cada pasta de um workspace multi-root pode ter a sua lista | Projetos diferentes no mesmo workspace guardam specs em lugares diferentes | y |
| Pasta sem artefato da skill | Ignorada, exceto quando a pasta se chama `.specs` | Nomes genéricos como `docs` casariam pastas que não são specs; `.specs` mantém o comportamento atual | y |
| Ativação da extensão | Adicionar `onStartupFinished` além de `workspaceContains:**/.specs/**` | `activationEvents` não lê configuração; sem isso, pastas com outro nome só aparecem depois de abrir a barra lateral | y |
| Lista vazia | Usa `.specs` | Evita uma extensão ativa que não mostra nada | y |
| Entrada inválida (absoluta, com `..` ou com glob) | Ignorada, com aviso que nomeia a entrada | Falha visível em vez de silenciosa | y |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Configuração local e leitura de arquivos: sem persistência, chamadas externas, auth ou concorrência | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Configurar as pastas de specs ⭐ MVP

**User Story**: Como quem usa a skill em projetos com layouts diferentes, quero configurar uma ou mais pastas onde a extensão procura as specs para acompanhar projetos que não usam `.specs`.

**Why P1**: É o pedido; sem isso a extensão não enxerga esses projetos.

**Acceptance Criteria**:

1. The extensão SHALL oferecer a configuração `tlcSpecs.specsFolders`, uma lista de caminhos relativos com padrão `[".specs"]`
2. WHEN a configuração lista uma ou mais pastas THEN a extensão SHALL mostrar como projeto cada pasta do workspace que corresponda a qualquer entrada, em qualquer profundidade
3. WHEN a configuração muda THEN a extensão SHALL recarregar árvores, painel, barra de status e diagnósticos sem recarregar a janela
4. WHEN um arquivo muda dentro de qualquer pasta configurada THEN a extensão SHALL atualizar a visão dessa pasta
5. IF uma pasta de nome diferente de `.specs` corresponde a uma entrada mas não tem artefato da skill (`features/*/*.md`, `STATE.md`, `lessons.json` ou `LESSONS.md`) THEN a extensão SHALL ignorá-la
6. WHEN o workspace abre com uma pasta configurada de nome diferente de `.specs` THEN a extensão SHALL ativar sem que o usuário abra a barra lateral

**Independent Test**: Com `tlcSpecs.specsFolders = ["docs/specs"]` e as specs em `docs/specs/features/...`, as features aparecem na árvore; ao trocar para `[".specs"]`, somem sem recarregar a janela.

---

### P2: Distinguir pastas do mesmo projeto

**User Story**: Como quem tem mais de uma pasta de specs no mesmo projeto, quero ver de qual pasta cada grupo vem para não confundir as features.

**Why P2**: Só importa quando há mais de uma pasta; o MVP funciona sem isso.

**Acceptance Criteria**:

1. WHEN duas pastas de specs pertencem ao mesmo projeto THEN a árvore Features SHALL rotular cada grupo com o projeto e o caminho da pasta (ex.: `api · docs/specs`)

**Independent Test**: Com `[".specs", "docs/specs"]` num projeto que tem as duas, a árvore mostra dois grupos com rótulos diferentes.

---

## Edge Cases

- IF a lista configurada está vazia THEN a extensão SHALL usar `.specs`
- IF uma entrada é absoluta, contém `..` ou caracteres de glob THEN a extensão SHALL ignorar essa entrada e mostrar um aviso com o nome dela
- WHEN duas entradas levam à mesma pasta THEN a extensão SHALL mostrar essa pasta uma única vez
- WHEN uma entrada usa `\` como separador ou termina com `/` THEN a extensão SHALL tratá-la como o mesmo caminho normalizado

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SF-01 | P1: Configurar as pastas de specs | - | Pending |
| SF-02 | P1: Configurar as pastas de specs | Tasks | Implementing |
| SF-03 | P1: Configurar as pastas de specs | - | Pending |
| SF-04 | P1: Configurar as pastas de specs | - | Pending |
| SF-05 | P1: Configurar as pastas de specs | Tasks | Implementing |
| SF-06 | P1: Configurar as pastas de specs | - | Pending |
| SF-07 | P2: Distinguir pastas do mesmo projeto | - | Pending |
| SF-08 | Edge case: lista vazia | Tasks | Implementing |
| SF-09 | Edge case: entrada inválida | Tasks | Implementing |
| SF-10 | Edge case: entradas sobrepostas | Tasks | Implementing |
| SF-11 | Edge case: separadores e barra final | Tasks | Implementing |

**ID format:** `SF-NN`, na ordem dos critérios acima.

**Coverage:** 11 total, escopo Medium (tasks implícitas na execução, sem `tasks.md`).

---

## Success Criteria

- [ ] Um projeto com specs em `docs/specs` aparece completo na extensão só com a configuração
- [ ] Sem configuração, os 24 testes de integração e os testes unitários atuais continuam passando
