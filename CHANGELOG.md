# Changelog

As mudanças de cada versão publicada do Visual TLC. A versão mais nova fica no topo.

## 0.1.0

Primeira versão publicada.

- **Barra lateral TLC Specs.** A árvore **Features** mostra cada feature com a fase atual e o progresso, o pipeline Spec → Design → Tasks → Execução → Verificação, as tasks por fase com os detalhes, os requisitos, os arquivos e os avisos. A árvore **Projeto** mostra o Handoff do `STATE.md`, as decisões `AD-NNN` e as lições do `lessons.json`.
- **Painel** na barra lateral ou numa aba do editor, com o resumo do projeto, um quadro por fase e o detalhe de cada feature: stepper, próximo passo, tasks, histórias EARS, requisitos, veredito do Verifier e avisos.
- **Navegação somente leitura.** Clicar num item abre o markdown no preview. O lápis abre o arquivo no editor, na linha do item.
- **Specs ocultas.** O olho de cada spec a oculta ou desoculta, e o olho do topo de cada superfície mostra ou esconde as ocultas. As concluídas começam ocultas. Uma pasta com todas as specs ocultas volta recolhida quando o olho abre.
- **Avisos de spec incompleta** no painel Problemas, com as regras dos validadores da skill e cruzamentos entre `spec.md`, `tasks.md` e `validation.md`.
- **Barra de status** com a feature em foco e **notificações** de spec nova, mudança de fase, conclusão e falha na verificação.
- **Pastas de specs configuráveis** (`tlcSpecs.specsFolders`), com suporte a monorepo e workspaces multi-root.
