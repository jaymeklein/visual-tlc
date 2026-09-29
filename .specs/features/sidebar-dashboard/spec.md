# Sidebar Dashboard Specification

## Problem Statement

O painel abre como uma aba do editor. Para vê-lo, a pessoa troca de aba e perde o código de vista, ou divide a tela. Quem acompanha uma feature enquanto programa precisa do painel fora da área do editor, na barra lateral.

## Goals

- [ ] O painel aparece na barra lateral TLC Specs sem abrir, fechar ou dividir abas do editor
- [ ] O painel cabe na largura da barra lateral sem rolagem horizontal
- [ ] A visão larga em aba do editor continua disponível por comando

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Contribuir a view direto na barra lateral direita | A versão mínima declarada (VS Code 1.90) só documenta contêineres na barra de atividades e no painel inferior. O usuário pode arrastar a view para a direita |
| View no painel inferior | Decisão do usuário: só barra lateral |
| Configuração para escolher onde os cliques abrem o painel | Decisão do usuário: cliques abrem a lateral, a aba fica num comando |
| Mudar o conteúdo do painel | O pedido é sobre onde ele abre. O conteúdo é o mesmo nas duas superfícies |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Local do painel | View na barra lateral TLC Specs, junto de Features e Projeto | Resposta do usuário | y |
| Painel em aba | Continua disponível por comando próprio. Os cliques passam a abrir a view lateral | Resposta do usuário | y |
| Posição da view | Última, depois de Projeto, com o nome "Painel" | Não muda a posição das árvores que já existem | n |
| Comando da aba | `tlcSpecs.openDashboard` mantém o id e passa a se chamar "Abrir painel em aba". O botão no título da view Features continua chamando esse comando | Atalhos e keybindings existentes continuam valendo | n |
| Quais cliques abrem a lateral | Tudo que chama `tlcSpecs.showFeature`: botão e menu da feature, barra de status e notificações | São os cliques que hoje abrem o painel numa feature | n |
| Largura que define o layout estreito | Menos de 700px | A barra lateral costuma ter de 250 a 500px; abaixo de 700px não cabem 3 colunas de 200px | n |
| Etapas vazias no layout estreito | Ocultas | Seis blocos empilhados, a maioria vazia, empurram as features para fora da tela | n |
| View oculta | O VS Code descarta o conteúdo da view oculta. Ao voltar, ela recarrega o estado atual e mantém a feature selecionada | Evita manter uma webview viva em segundo plano | n |
| Dimensões implícitas | Remaining dimensions N/A for this scope | Mudança de superfície de exibição: sem persistência nova, chamadas externas, auth ou concorrência | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Ver o painel na barra lateral ⭐ MVP

**User Story**: Como quem programa acompanhando uma feature, quero o painel na barra lateral para consultá-lo sem sair do código aberto.

**Why P1**: É o pedido.

**Acceptance Criteria**:

1. The extensão SHALL oferecer a view "Painel" no contêiner TLC Specs da barra lateral, com os mesmos projetos do painel em aba
2. WHEN o usuário aciona "Abrir feature no painel" THEN a extensão SHALL mostrar a view Painel nos detalhes dessa feature, sem abrir nem fechar abas do editor
3. WHILE a view Painel tem menos de 700px de largura a extensão SHALL mostrar as etapas do quadro em uma coluna, sem rolagem horizontal
4. WHILE a view Painel tem menos de 700px de largura a extensão SHALL ocultar as etapas do quadro que não têm features
5. WHEN um artefato muda em uma pasta de specs THEN a extensão SHALL atualizar a view Painel
6. WHEN a view Painel volta a ficar visível depois de oculta THEN a extensão SHALL mostrar os projetos atuais e a feature que estava selecionada
7. WHEN o usuário clica em um artefato na view Painel THEN a extensão SHALL abrir o preview do markdown desse artefato

**Independent Test**: Com um arquivo de código aberto, clicar na feature da barra de status. A barra lateral mostra os detalhes da feature e o arquivo continua aberto na mesma aba, sem divisão.

---

### P2: Abrir a visão larga em aba

**User Story**: Como quem quer ver o quadro inteiro, quero abrir o painel numa aba do editor para ter as seis etapas lado a lado.

**Why P2**: A visão larga já existe; a história só garante que ela não se perde.

**Acceptance Criteria**:

1. WHEN o usuário executa "Abrir painel em aba" THEN a extensão SHALL abrir o painel numa aba do editor chamada "TLC Specs"
2. WHILE o painel em aba tem 700px ou mais de largura a extensão SHALL mostrar as seis etapas do quadro lado a lado

**Independent Test**: Executar "TLC Specs: Abrir painel em aba" na paleta de comandos. Abre a aba com o quadro de seis colunas.

---

## Edge Cases

- WHEN a view Painel e o painel em aba estão abertos ao mesmo tempo THEN a extensão SHALL atualizar os dois
- IF o workspace não tem pasta de specs THEN a view Painel SHALL mostrar a mensagem "Nenhuma spec encontrada"

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SIDE-01 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-02 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-03 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-04 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-05 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-06 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-07 | P1: Ver o painel na barra lateral | Tasks | Implementing |
| SIDE-08 | P2: Abrir a visão larga em aba | Tasks | Implementing |
| SIDE-09 | P2: Abrir a visão larga em aba | Tasks | Implementing |
| SIDE-10 | Edge case: as duas superfícies abertas | Tasks | Implementing |
| SIDE-11 | Edge case: workspace sem specs | Tasks | Implementing |

**ID format:** `SIDE-NN`, na ordem dos critérios acima.

**Coverage:** 11 total, 0 mapeados em tasks, 11 sem task.

---

## Success Criteria

- [ ] Clicar numa feature mostra o painel na barra lateral e o código aberto continua na mesma aba
- [ ] Os testes unitários e de integração atuais continuam passando; os que abriam a aba por `tlcSpecs.showFeature` passam a abri-la pelo comando da aba
