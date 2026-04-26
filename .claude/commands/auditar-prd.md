Template: Protocolo de Validação de PRD (Foco em Backend/Sistemas)
1. Integridade de Contratos (API & Mensageria)
[ ] Esquema de Dados: O PRD define claramente os tipos de dados (ex: Decimal para valores monetários, UUID para IDs, ISO 8601 para datas)?

[ ] Status de Retorno: Estão mapeados os códigos de erro (HTTP 4xx/5xx) para cada cenário de falha de negócio?

[ ] Idempotência: Se o backend receber a mesma requisição de fatura duas vezes (ex: retry de rede), o PRD especifica como evitar duplicidade?

2. Validação de Persistência e Performance (PostgreSQL/SQL)
[ ] Estratégia de Travamento (Locking): O documento prevê como lidar com atualizações concorrentes no banco de dados para evitar Deadlocks?

[ ] Impacto em Índices: A nova funcionalidade exige filtros que podem degradar a performance de leitura? Existe requisito de criação de índice?

[ ] Consistência Eventual: Em arquiteturas de leitura separada (como o seu Read Database), o PRD define o tempo aceitável de atraso na sincronização?

3. Casos de Borda Sistêmicos (Edge Cases)
[ ] Timeouts: O que acontece se a integração com o serviço de impostos/fiscal demorar mais que o esperado?

[ ] Rollback e Compensação: Se uma transação de escrita falhar no meio do processo (ex: salvou o cabeçalho mas falhou nos itens), como o sistema limpa o "lixo" ou desfaz a operação?

[ ] Volume de Dados: O requisito foi pensado para suportar processamento em lote (Batch/Bulk) ou apenas unitário?

4. Requisitos Não-Funcionais e Segurança
[ ] Log e Rastreabilidade: Existe a obrigatoriedade de registrar o CorrelationID para rastrear a requisição entre diferentes serviços/camadas?

[ ] Validação de Payload: O documento especifica limites de tamanho (ex: Max bytes de um anexo de XML/JSON)?

[ ] Regras de Negócio Invariantes: Estão listadas as regras que nunca podem ser quebradas? (Ex: "O valor total da fatura nunca pode ser negativo").
