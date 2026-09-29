# Read-only Navigation Context

**Gathered:** 2026-09-29
**Spec:** `.specs/features/readonly-navigation/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Todo clique da extensão em artefatos da skill abre modo visualização; tasks aparecem como lista somente leitura na árvore e no painel. Nenhuma capacidade de edição é adicionada.

---

## Implementation Decisions

### Modo de abrir artefatos

- Clique abre o Markdown preview nativo, na coluna ativa
- Ícone inline "Abrir no editor" nas linhas de etapa, arquivo, requisito e fase leva o cursor à linha do item
- Avisos continuam abrindo o editor na linha do problema

### Lista de tasks

- Etapas Tasks e Execução expandem a mesma lista, agrupada por Phase
- Task expande detalhes como itens de leitura (O quê, Onde, Depende de, Requisitos, Tests/Gate, Done when)
- No painel, a linha da task expande e recolhe os detalhes no lugar

### Agent's Discretion

Ícones e textos dos itens de detalhe; posição do ícone de editor no painel.

### Declined / Undiscussed Gray Areas → Assumptions

Arquivo da etapa Execução, ausência de ícone de editor nas tasks e ícone de editor do painel restrito à seção Arquivos — registrados como premissas na spec.

---

## Specific References

No specific requirements - open to standard approaches

---

## Deferred Ideas

- Preview rolado até a linha do item (depende de suporte do Markdown preview)
