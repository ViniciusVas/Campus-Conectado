# Planejamento do Campus Conectado

Estudantes lidam com prazos de várias disciplinas. Quando informações ficam dispersas entre anotações e canais de aula, fica difícil decidir o que fazer primeiro e acompanhar o que já foi entregue.

## Requisitos

| ID | Requisito funcional | Critério de aceite |
| --- | --- | --- |
| RF01 | Navegar entre início, lista e formulário | É possível abrir a lista e o cadastro a partir da tela inicial e voltar pela interface. |
| RF02 | Cadastrar uma atividade | Título, disciplina, descrição e prazo válido são gravados. A atividade começa pendente. |
| RF03 | Consultar a agenda | A lista mostra dados e status, com filtros Todas, Pendentes e Concluídas. As pendências aparecem primeiro e cada grupo é ordenado por prazo. |
| RF04 | Editar uma atividade | O formulário abre preenchido e atualiza os dados do registro selecionado. |
| RF05 | Excluir uma atividade | O registro só é removido após confirmação. |
| RF06 | Alterar o status | É possível concluir uma atividade e depois reabri-la. |
| RF07 | Recuperar dados locais | Registros e status salvos voltam a aparecer quando o aplicativo é reaberto. |
| RF08 | Validar o formulário | Campos vazios e datas inexistentes exibem erros junto aos campos. |

**Requisitos não funcionais.** Cadastro e consulta funcionam sem conexão depois que o aplicativo foi carregado. Controles principais têm rótulos visíveis, botões com pelo menos 44 pontos de altura e mensagens de erro em português. As regras de validação e seleção da lista podem ser verificadas separadamente da interface.

## Protótipo de baixa fidelidade

```text
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│ CAMPUS CONECTADO    │   │ CAMPUS           ←  │   │ CAMPUS           ←  │
│                     │   │ Atividades          │   │ Nova / Editar       │
│ Organize sua rotina │   │ Todas · Pend. · Con.│   │ Título      [     ] │
│ acadêmica           │   │ [+ Nova atividade]  │   │ Disciplina  [     ] │
│                     │   │                     │   │ Descrição   [     ] │
│ [Pend.]   [Concl.]  │   │ Disciplina · Status │   │ Prazo       [     ] │
│ [+ Nova atividade]  │   │ Título e descrição  │   │                     │
│ [Ver atividades]    │   │ Prazo               │   │ [Salvar atividade]  │
│                     │   │ Concluir Editar ... │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

Início → lista pelo botão de atividades ou pelos contadores. Início e lista → formulário de cadastro. Lista → formulário de edição. Ao salvar, a lista exibe o resultado.

## Reflexão final

1. **Desafios técnicos.** Validar datas exigiu verificar o calendário além do formato digitado. As operações aguardam a gravação local antes de confirmar mudanças na interface.
2. **Persistência.** Uma agenda precisa manter prazos e status entre sessões para que o estudante possa retomar a organização.
3. **Usabilidade.** Os contadores abrem diretamente o filtro correspondente. O mesmo formulário serve para cadastrar e editar, e os erros aparecem próximos aos campos.
4. **Identificação de erros.** Os testes cobrem espaços em branco, datas impossíveis, anos bissextos, filtros e leitura de dados armazenados. A verificação pela interface segue operações completas e inclui reabertura da agenda.
5. **Ampliação para a universidade.** Uma versão institucional poderia importar prazos de disciplinas com autorização e oferecer sincronização opcional entre dispositivos.

