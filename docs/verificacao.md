# Verificação e demonstração

## Resultados verificados

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Concluído sem erros de tipagem. |
| `npm test` | 6 de 6 testes passaram. Foram verificadas a obrigatoriedade, a normalização, a validação de datas, a ordenação com filtros, a leitura da lista e a rejeição de dados inválidos. |
| `npx expo export --platform web --platform android` | Os pacotes web e Android foram gerados. |
| Fluxo no Chromium com viewport de 390 × 844 | Passou pelos cenários abaixo. As capturas em `docs/capturas` registram as três telas. |
| Execução em dispositivo físico ou emulador | Pendente. A exportação Android verifica o empacotamento. |

### Cenários executados no navegador

1. Tentar salvar sem preencher e verificar as quatro mensagens. Informar 31/02/2028 e verificar o erro. Corrigir para 29/02/2028 e salvar.
2. Abrir a edição, verificar o título preenchido, alterá-lo e confirmar que a lista exibe o novo título.
3. Concluir uma atividade, consultar o filtro Concluídas, reabrir a atividade e encontrá-la em Pendentes.
4. Cadastrar outra atividade, concluí-la, recarregar a página e confirmar a presença dos dois registros e do status salvo.
5. Cancelar uma exclusão e confirmar que o registro permanece. Confirmar a exclusão em seguida e verificar que ele continua ausente depois de recarregar.

## Roteiro de apresentação no celular ou emulador

| Tempo | Ação |
| --- | --- |
| 0:00–0:40 | Apresente o problema de organizar prazos de várias disciplinas. Mostre os contadores e a navegação. |
| 0:40–1:45 | Abra o cadastro, tente salvar vazio e preencha uma atividade com título, disciplina, descrição e prazo. |
| 1:45–2:45 | Edite o título. Marque a atividade como concluída e abra o filtro correspondente. |
| 2:45–3:45 | Feche o aplicativo, abra-o novamente e confirme que o título e o status foram mantidos. |
| 3:45–4:30 | Reabra a atividade, mostre a confirmação de exclusão e exclua. Explique como o armazenamento local e os testes sustentam o fluxo. |

Abra o projeto com o Expo Go antes da apresentação e use a mesma instalação ao fechar e reabrir o aplicativo.

