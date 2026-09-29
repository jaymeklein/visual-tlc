# Visual TLC — Spec-Driven Tracker

Extensão do VS Code que acompanha visualmente o desenvolvimento feito com a skill **`/tlc-spec-driven`**.
Ela lê os artefatos que a skill grava em `.specs/` (ou nas pastas que você configurar) e mostra, para cada feature, em que fase está, quanto falta e o que está incompleto.

> **Somente leitura.** A extensão nunca escreve em `.specs/` e não depende da skill instalada — apenas interpreta os arquivos gerados por ela.

## O que aparece

**Barra lateral › TLC Specs**

- **Features** — uma entrada por pasta em `.specs/features/`, com a fase atual e o progresso. Cada linha tem botões para **visualizar o markdown** da spec (`spec.md` no preview do VS Code — ou o primeiro markdown da pasta, se não houver spec), **abrir a pasta** da feature no Explorer e abrir a feature no painel (também no menu de contexto). Ao expandir:
  - o pipeline **Spec → Design → Tasks → Execução → Verificação**, com cada etapa concluída, ativa, pulada, pendente ou com falha;
  - em **Tasks** e **Execução**, a lista de tasks agrupada por *Phase* (status vindo dos checkboxes de *Done when*, do campo `**Status**` ou de ✅ no título). Cada task expande seus detalhes (O quê, Onde, Depende de, Requisitos, Tests/Gate, Done when) como itens de leitura, sem abrir o `tasks.md`;
  - requisitos da *Requirement Traceability*, arquivos da feature e **avisos**.

  Clicar numa etapa, arquivo, requisito, fase ou item do Projeto abre o markdown no **preview** (somente leitura). O ícone de lápis na linha abre o arquivo **no editor**, já na linha do item. Avisos abrem direto no editor, na linha do problema.
- **Projeto** — o *Handoff* do `STATE.md` (feature em foco, próximo passo, bloqueios, branch), as decisões `AD-NNN` (ativas e substituídas) e as lições do `lessons.json` (confirmadas, candidatas e em quarentena).

**Painel** (seção "Painel" da barra lateral TLC Specs)

- Fica na barra lateral, fora da área do editor: o código aberto continua na mesma aba, sem dividir a tela. Abrir uma feature no painel (botão da feature, barra de status ou notificação) mostra os detalhes dela ali.
- Abaixo de 700px de largura o quadro fica em uma coluna e esconde as fases sem features. A seção pode ser arrastada para a barra lateral direita.
- `TLC Specs: Abrir painel em aba` (ou o ícone no topo de Features e do Painel) abre a visão larga numa aba do editor, com as fases lado a lado.
- Resumo do projeto, feature em foco e um **quadro por fase** com as specs; cada card tem os mesmos botões de visualizar o markdown e abrir a pasta.
- O painel abre com **Ocultar concluídas** marcada: o quadro mostra só as features em andamento, nas cinco fases. Desmarque para ver a coluna Concluídas com as features verificadas com PASS. O resumo sempre conta as concluídas, e uma feature concluída aberta pela árvore ou por uma notificação mostra os detalhes normalmente.
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
| `tlcSpecs.specsFolders` | `[".specs"]` | Pastas onde a extensão procura as specs. |
| `tlcSpecs.exclude` | `["node_modules"]` | Pastas que ficam fora da listagem de specs. |

### Pastas de specs

Use `tlcSpecs.specsFolders` quando o projeto guarda os artefatos da skill fora de `.specs`:

```json
{ "tlcSpecs.specsFolders": [".specs", "docs/specs"] }
```

- Cada entrada é um caminho relativo, procurado em qualquer profundidade de cada pasta do workspace. `docs/specs` acha `docs/specs` e `packages/api/docs/specs`.
- A pasta precisa seguir o layout da skill (`features/`, `STATE.md`, `lessons.json`). Uma pasta de nome diferente de `.specs` só aparece quando tem algum desses artefatos.
- Entradas absolutas, com `..` ou com glob são ignoradas, com um aviso que nomeia a entrada.
- Lista vazia usa `.specs`.
- A configuração vale por pasta do workspace: em multi-root, cada pasta pode ter a sua lista.

### Pastas fora da listagem

Use `tlcSpecs.exclude` para esconder da listagem as specs que estão dentro de certas pastas, como as de exemplo ou de teste:

```json
{ "tlcSpecs.exclude": ["node_modules", "test"] }
```

- A configuração só filtra o que aparece na extensão. Nenhuma pasta é criada, movida ou apagada.
- Cada entrada é um caminho relativo, ignorado em qualquer profundidade. `test` esconde `test/fixtures/.specs` e `packages/api/test/.specs`; a pasta `tests` continua aparecendo.
- A exclusão vence a inclusão: uma pasta de `tlcSpecs.specsFolders` que esteja dentro de uma pasta excluída não aparece.
- Ao definir a lista, mantenha `node_modules` nela. Lista vazia não exclui nada.
- Entradas absolutas, com `..`, com vírgula ou com glob são ignoradas, com um aviso que nomeia a entrada e a configuração.
- Um texto no lugar da lista é usado como glob (`"**/node_modules/**"`), como nas versões anteriores.
- A configuração vale por pasta do workspace, como `tlcSpecs.specsFolders`.
- Quando um projeto tem mais de uma pasta de specs, cada grupo mostra o projeto e a pasta (`api · docs/specs`).

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
