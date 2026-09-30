# Visual TLC — Spec-Driven Tracker

Extensão do VS Code que acompanha visualmente o desenvolvimento feito com a skill **`/tlc-spec-driven`**.
Ela lê os artefatos que a skill grava em `.specs/` (ou nas pastas que você configurar) e mostra, para cada feature, em que fase está, quanto falta e o que está incompleto.

> **Somente leitura.** A extensão nunca escreve em `.specs/` e não depende da skill instalada — apenas interpreta os arquivos gerados por ela.

## O que aparece

**Barra lateral › TLC Specs**

- **Features** — uma entrada por pasta em `.specs/features/`, com a fase atual e o progresso. Cada linha tem botões para **visualizar o markdown** da spec (`spec.md` no preview do VS Code — ou o primeiro markdown da pasta, se não houver spec), **abrir a pasta** da feature no Explorer, abrir a feature no painel e **ocultar ou desocultar a spec** pelo olho (também no menu de contexto). O VS Code mostra os botões da linha com o mouse em cima dela. Toda spec tem o olho, concluída ou não: aberto enquanto ela está à vista, fechado enquanto está oculta. As concluídas começam ocultas, e o olho de uma delas a deixa sempre à vista. A árvore abre sem as specs ocultas. O **olho no título** de Features mostra ou esconde as ocultas, e a mensagem no topo conta quantas estão fora. Com o olho do título aberto, toda spec oculta aparece com "· oculta" e o olho fechado na linha, que a desoculta. Uma pasta de specs com todas as specs ocultas também sai da árvore com o olho fechado, e volta com "· oculta" quando ele abre. Ao expandir:
  - o pipeline **Spec → Design → Tasks → Execução → Verificação**, com cada etapa concluída, ativa, pulada, pendente ou com falha;
  - em **Tasks** e **Execução**, a lista de tasks agrupada por *Phase* (status vindo dos checkboxes de *Done when*, do campo `**Status**` ou de ✅ no título). Cada task expande seus detalhes (O quê, Onde, Depende de, Requisitos, Tests/Gate, Done when) como itens de leitura, sem abrir o `tasks.md`;
  - requisitos da *Requirement Traceability*, arquivos da feature e **avisos**.

  Clicar numa etapa, arquivo, requisito, fase ou item do Projeto abre o markdown no **preview** (somente leitura). O ícone de lápis na linha abre o arquivo **no editor**, já na linha do item. Avisos abrem direto no editor, na linha do problema.
- **Projeto** — o *Handoff* do `STATE.md` (feature em foco, próximo passo, bloqueios, branch), as decisões `AD-NNN` (ativas e substituídas) e as lições do `lessons.json` (confirmadas, candidatas e em quarentena).

**Painel** (seção "Painel" da barra lateral TLC Specs)

- Fica na barra lateral, fora da área do editor: o código aberto continua na mesma aba, sem dividir a tela. Abrir uma feature no painel (botão da feature, barra de status ou notificação) mostra os detalhes dela ali.
- Abaixo de 700px de largura o quadro fica em uma coluna e esconde as fases sem features. A seção pode ser arrastada para a barra lateral direita.
- `TLC Specs: Abrir painel em aba` (ou o ícone no topo de Features e do Painel) abre a visão larga numa aba do editor, com as fases lado a lado.
- Resumo do projeto, feature em foco e um **quadro por fase** com as specs; cada card tem os mesmos botões de visualizar o markdown e abrir a pasta, e o olho para ocultar ou desocultar a spec, concluída ou não.
- O painel abre com o **olho fechado** no topo, com o número de specs ocultas: as concluídas e as que você ocultou. O quadro mostra só o resto, nas cinco fases. Uma concluída que você desocultou fica na coluna Concluídas, que então aparece com o olho fechado. Clique no olho do topo para ver as ocultas: elas voltam esmaecidas, cada uma na sua coluna, com o olho fechado no card para desocultá-las. O resumo sempre conta todas, e uma spec oculta aberta pela árvore ou por uma notificação mostra os detalhes normalmente.
- Cada superfície tem o seu olho do topo: a árvore, a aba e a barra lateral. O que você escolhe pelo olho de cada spec vale para todas, fica guardado no estado do workspace no VS Code (fora de `.specs/`) e continua valendo ao reabrir.
- Detalhe da feature: stepper do pipeline, próximo passo, tasks por fase, histórias com os padrões EARS, requisitos, veredito do Verifier (critérios, mutantes, UAT, fix plans), design/contexto, arquivos e avisos. As mesmas regras da árvore: cliques abrem o markdown no preview, cada task expande os detalhes no lugar, a seção Arquivos tem o lápis para abrir no editor e avisos abrem o editor na linha.

**Também**

- **Painel Problemas** — os avisos viram diagnósticos no arquivo e na linha exatos.
- **Barra de status** — feature em foco (a do Handoff, ou a mais recente não concluída) e sua fase.
- **Notificações** — quando surge uma spec nova, uma feature muda de fase, é concluída ou falha na verificação.
- Atualização automática sempre que algo nas pastas de specs muda. Suporta várias pastas no workspace (monorepo e multi-root).

## Como a fase é calculada

A skill cria os arquivos de forma preguiçosa (arquivo ausente = fase pulada ou ainda não alcançada). A extensão usa isso:

| Situação | Fase exibida |
| --- | --- |
| só `spec.md` (e talvez `context.md`) | Spec |
| `design.md` sem `tasks.md` | Design |
| `tasks.md` sem nenhuma task iniciada | Tasks (rascunho / aprovadas) |
| alguma task iniciada, ou requisitos em *Implementing* | Execução *n/m* |
| todas as tasks concluídas, sem `validation.md` | Aguardando verificação |
| `validation.md` com FAIL / sem veredito | Verificação falhou / incompleta |
| `validation.md` com PASS e evidência `file:line` | Concluída |

Features de escopo Medium (sem `design.md` e `tasks.md`) aparecem com essas etapas como *puladas*.

## Avisos de spec incompleta

As checagens reproduzem os validadores da própria skill (`validate_spec.py`, `validate_tasks.py`, `validate_state.py`), com a mesma severidade, mais alguns cruzamentos entre arquivos:

- **spec.md** — seções obrigatórias ausentes, critério de aceitação sem `SHALL` ou sem padrão EARS, premissas sem *default*/*rationale*, perguntas em aberto, linhas de template, IDs malformados, histórias sem critérios.
- **tasks.md** — seções obrigatórias, task sem `Tests`/`Gate`, dependência apontando para fase posterior, diagrama divergente do `Depends on`, `Where` com vários arquivos, task concluída com dependência pendente, task bloqueada.
- **validation.md** — sem veredito, placeholder `[PASS | FAIL]`, FAIL, PASS sem evidência `file:line`, GAPs, mutantes sobreviventes.
- **Entre arquivos** — execução concluída sem `validation.md` (o Verifier não rodou), requisitos sem task, task citando requisito inexistente, rastreabilidade não atualizada para *Verified*, arquivo vazio, feature parada há N dias, bloqueio no Handoff.

## Configurações

| Chave | Padrão | Descrição |
| --- | --- | --- |
| `tlcSpecs.diagnostics.enabled` | `true` | Publica os avisos no painel Problemas. |
| `tlcSpecs.notifications.enabled` | `true` | Notifica mudanças de fase, conclusão e falhas. |
| `tlcSpecs.staleAfterDays` | `14` | Dias sem alteração para marcar uma feature como parada (0 desativa). |
| `tlcSpecs.specsFolders` | `[".specs"]` | Pastas onde a extensão lê as specs, a partir da raiz do workspace. |

### Pastas de specs

A extensão lê só as pastas listadas em `tlcSpecs.specsFolders`. Cada entrada é o caminho de uma pasta a partir da raiz da pasta do workspace:

```json
{ "tlcSpecs.specsFolders": [".specs", "packages/api/.specs"] }
```

- O padrão `[".specs"]` lê só a `.specs` na raiz do workspace. Pastas `.specs` em subpastas, como as de exemplo em `test/fixtures`, não aparecem na barra lateral nem no painel.
- Para ler outra pasta, liste o caminho dela: `docs/specs`, `packages/api/.specs`. Não há busca em profundidade nem glob.
- A pasta precisa seguir o layout da skill (`features/`, `STATE.md`, `lessons.json`). Uma pasta de nome diferente de `.specs` só aparece quando tem algum desses artefatos.
- Uma entrada que ainda não existe é ignorada sem aviso, e a pasta aparece assim que for criada.
- Entradas absolutas, com `..` ou com glob são ignoradas, com um aviso que nomeia a entrada.
- Lista vazia usa `.specs`.
- A configuração vale por pasta do workspace: em multi-root, cada pasta pode ter a sua lista.
- As árvores Features e Projeto mostram o nó de cada pasta de specs, com o nome da pasta do workspace, mesmo com uma pasta só. Features só deixa de fora, com o olho do título fechado, a pasta com todas as specs ocultas. Quando a mesma pasta do workspace tem mais de uma pasta de specs, o nó mostra também o caminho (`api · docs/specs`).
- A configuração `tlcSpecs.exclude` das versões anteriores não existe mais. Um valor dela que tenha ficado no `settings.json` não tem efeito.

## Desenvolvimento

```bash
npm install
npm run build            # dist/extension.cjs + dist/webview.js
npm test                 # testes unitários dos parsers (node --test)
npm run test:integration # abre um VS Code isolado com uma cópia de cada workspace em test/fixtures
npm run package          # gera o .vsix
```

`F5` abre um Extension Development Host já com o projeto de exemplo (`test/fixtures/sample`), que cobre todos os estados: em execução, concluída, verificação com FAIL, aguardando o Verifier, escopo Medium, spec incompleta, design em rascunho e pasta quebrada.

Instalar o pacote: `code --install-extension visual-tlc-0.1.0.vsix`.

### Estrutura

```
src/core/     parsers e análise (sem dependência do VS Code, testáveis com node --test)
src/ui/       árvores, painel, status bar, diagnósticos, notificações, store com file watcher
src/webview/  script do painel (bundle para o navegador)
media/        CSS do painel e ícones
```
