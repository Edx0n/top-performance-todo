---
name: qyon-invoices-repository
description: Mantém o padrão de desenvolvimento do InvoicesRepository (Qyon.Tax.Service.Infra.Data/Repositories/InvoicesRepository.cs). Use ao implementar ou alterar repositórios de Invoices, queries Dapper, transações e filtros SQL.
---

# Padrão InvoicesRepository

## Dependências e construtor

- **IConnectionManager** – conexão para leitura/escrita (comandos e queries que alteram estado).
- **IConnectionQueryStackManager** – conexão somente leitura quando apropriado (ex.: consultas auxiliares).
- **ILogger&lt;InvoicesRepository&gt;** – logging.
- **IRedisDataCache** – quando houver uso de cache (opcional conforme método).
- Injetar via construtor e armazenar em campos readonly (`_connectionManager`, `_logger`, etc.).

## Transações

- Para operações que alteram mais de uma tabela: `using (IDbConnection connection = await _connectionManager.GetConnectionAsync())` e `using (IDbTransaction transaction = connection.BeginTransaction())`.
- No try: executar todos os passos e ao final `transaction.Commit()`.
- No catch: `transaction.Rollback()` e relançar a exceção (`throw ex` ou `throw`).
- Métodos auxiliares estáticos que só executam comandos devem receber **IDbConnection** e **IDbTransaction** e repassar em todas as chamadas Dapper.

## Inserção de entidades

- **Uma entidade**: `await connection.ExecuteInsertAsync<TEntity>(entity, transaction)`.
- **Lista de entidades**: `await connection.ExecuteBulkInsertAsync<TEntity>(list, transaction)`.
- Para listas grandes (ex.: InvoiceItems com filhos): usar **SplitList(tamanho)** (ex.: 10) e em cada lote chamar ExecuteBulkInsertAsync para a entidade principal e, se existirem, para as entidades filhas (IcmsInvoiceItems, IpiInvoiceItems, PisCofinsInvoiceItems) com `item.Where(x => x.Filho != null).Select(x => x.Filho)`.
- Sempre passar **transaction** quando estiver dentro de uma transação.

Exemplo de criação agregada:

```csharp
await connection.ExecuteInsertAsync<InvoicesEntityDomain>(entity, transaction);
if (entity.InvoiceItems != null && entity.InvoiceItems.Any())
{
    foreach (var item in entity.InvoiceItems.SplitList(10))
    {
        await connection.ExecuteBulkInsertAsync<InvoiceItemsEntityDomain>(item, transaction);
        if (entity.InvoiceItems.Any(x => x?.IcmsInvoiceItems != null))
            await connection.ExecuteBulkInsertAsync<IcmsInvoiceItemsEntityDomain>(item.Where(x => x.IcmsInvoiceItems != null).Select(x => x.IcmsInvoiceItems), transaction);
        // ... demais filhos
    }
}
```

## Queries SQL

- Usar **Dapper**: `QueryAsync<T>`, `QueryFirstOrDefaultAsync<T>`, `ExecuteAsync`.
- SQL em string com **@$"..."** para interpolação; parâmetros sensíveis (datas, números, filtros) preferencialmente via objeto anônimo **new { Param1 = value }** e **@Param1** na SQL para evitar SQL injection.
- Para IDs/valores fixos do contexto (ex.: EstablishmentReferenceId, SubscriptionId) que já vêm validados, a interpolação direta `'{request.EstablishmentReferenceId}'` é usada no projeto; para dados de usuário (texto livre, listas) usar **sempre** parâmetros (ex.: @Year, @Month) ou **ListFormater**.
- **Filtros opcionais**: implementar como métodos privados estáticos que retornam **string** (cláusula SQL ou vazio). Ex.: `FilterByNumber(long? number)`, `FilterByDocumentStatusId(string documentStatusId)`, `FilterByType(List<int> invoiceTypeOptions)`. Retornar `string.Empty` quando o filtro não se aplicar.
- Montar a SQL concatenando as cláusulas: `Where ... {filterByNumber} {filterByDocumentStatusId} ...`.

## Formatação de listas para SQL

- **IDs (Guid/string)**: `ListFormater.FormatIds(lista)` para produzir lista formatada para IN (ex.: `'id1','id2'`).
- **Números**: `ListFormater.FormatNumbers(lista)` para listas de inteiros.
- Nunca concatenar valores de usuário diretamente na SQL; usar esses helpers ou parâmetros.

## Queries com múltiplos tipos (multi-mapping)

- SQL com todos os campos necessários e JOINs; ordem das colunas deve refletir o **SplitOn** implícito (por Ids que mudam).
- No repositório: `connection.QueryAsync(sql, Model.GetJoinTypes(), (object[] row) => { ... })`.
- No callback: usar um **Dictionary** (ex.: por Id da raiz) para agregar; obter o objeto raiz de `row[0]`, chamar `raiz.map(row)` (ou MapReferenceKeys) para preencher listas/objetos; retornar o objeto raiz para o Dapper; ao final, obter o resultado do dictionary pelo id desejado.
- Os Models de query devem expor **GetJoinTypes()** e **map(object[] objects)** conforme a skill **qyon-invoices-domain**.

Exemplo de uso no repositório:

```csharp
var dictionary = new Dictionary<string, SelectInvoiceById>();
var result = await connection.QueryAsync(sql, SelectInvoiceById.GetJoinTypes(), objects =>
{
    var invoice = objects[0] as SelectInvoiceById;
    if (!invoiceDictionary.TryGetValue(invoice.Id, out var entry))
    {
        entry = invoice;
        invoiceDictionary.Add(invoice.Id, entry);
    }
    entry.map(objects);
    return entry;
});
records = dictionary.GetValueOrDefault(id);
```

## Paginação e ordenação

- **Offset/Fetch**: `Offset {request.PageIndex * request.PageSize} Rows Fetch Next {request.PageSize} Rows Only`.
- Ordenação dinâmica: método auxiliar (ex.: `OrderByColumn(column, order)`) que retorna `Order By a.Coluna Direção` ou string vazia; validar/normalizar nome da coluna para evitar injection (ex.: mapear "documentStatusCode" para tabela "c" e coluna "Code").

## Nomenclatura e organização

- Métodos públicos assíncronos: sufixo **Async** (ex.: SelectInvoiceByIdAcync – manter grafia existente se estiver assim no projeto).
- Interface do repositório: **#region Commands** e **#region Queries**; implementação pode seguir a mesma ordem.
- Constantes de domínio: usar classes como **InvoiceConstants** (ex.: InvoiceConstants.RegularDocumentStatus, InvoiceConstants.CanceledDocumentStatus) em filtros; referenciar via `using static` ou namespace para evitar magic strings.

## Logging e métricas

- Usar **ILogger** para informações relevantes (ex.: tempo de query após Stopwatch).
- Helpers como **MemoryMeter.MeasureMemory** ou **StopWatchExtension.StopWatchShowOnly** podem ser usados para diagnóstico de performance quando já existirem no projeto.

## Remoção física

- **PhysicallyRemove(Guid)**: abrir conexão, iniciar transação, executar deletes na ordem (filhos antes da raiz), commit.
- Quando a interface expõe overload com (Guid, IDbConnection, IDbTransaction), a implementação sem conexão deve abrir conexão/transação e chamar o overload que recebe connection/transaction.

## Resumo de checagem

- [ ] Transação com Commit/Rollback em comandos que alteram múltiplas tabelas
- [ ] ExecuteInsertAsync para único registro, ExecuteBulkInsertAsync para listas
- [ ] SplitList para lotes grandes de itens
- [ ] Filtros opcionais como métodos privados retornando string
- [ ] ListFormater.FormatIds/FormatNumbers para listas em SQL
- [ ] Multi-mapping com GetJoinTypes() e map(objects) no model
- [ ] Parâmetros Dapper para dados variáveis (evitar SQL injection)
