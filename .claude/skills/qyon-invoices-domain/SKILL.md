---
name: qyon-invoices-domain
description: Mantém o padrão de desenvolvimento do módulo Invoices no Domain (Qyon.Tax.Service.Domain/Invoices). Use ao criar ou alterar Commands, Queries, Models, Interfaces, Constants, UseCases ou entidades de Invoices.
---

# Padrão Domain – Invoices

## Estrutura de pastas

Manter a organização em `Qyon.Tax.Service.Domain/Invoices/`:

- **Commands/** – Comandos CQRS (Create*, Update*, Delete*)
- **Commands/Constants/** – Constantes usadas por comandos
- **Commands/BasicQueueCommands/** – Comandos de fila (Basic*Command)
- **Queries/Models/** – DTOs de leitura (Select*)
- **Queries/Models/BatchUpdateModels/** – Modelos de batch update (Select*ToBatchUpdate)
- **Queries/Requests/** – Objetos de requisição (Get*Request)
- **Interfaces/** – Contratos (IInvoicesRepository, I*UseCase)
- **Constants/** – Constantes do módulo (ex.: InvoiceConstants)
- **Events/Notifications/** – Notificações de domínio (*EventNotification)
- **Responses/** – DTOs de resposta (ex.: InvoiceReferenceResponse)
- **Messages/** – Mensagens de fila (ex.: UpdateInvoicesBatchMessage)
- **UseCases/** – Casos de uso (CreateInvoicesUseCase, etc.)

## Commands

- Herdar **Flunt.Notifications.Notifiable** e implementar **MediatR.IRequest** (ou IRequest&lt;TResponse&gt;).
- Propriedades: preferir **private set** e expor **SetXxx(value)** para atribuição.
- Incluir **UsingIdentity(Identity identity)** quando precisar de UserId/SubscriptionId.
- **Validação**: método `Validate(Contract contract, ...)` usando `contract.Requires().IsTrue(...)` com chave e mensagem (ex.: `"Table53ItemId", "invoiceNoteItems.table53ItemId.required"`).
- **Conversão para entidade**: método `ToEntity(...)` que retorna a entidade de domínio (ex.: `*EntityDomain`).
- Namespace: `Qyon.Tax.Service.Domain.Invoices.Commands`.

```csharp
public class CreatePisCofinsWithholdingTaxCommand : Notifiable, IRequest
{
    public EInvoiceType Type { get; private set; }
    public DateTime PisCofinsDate { get; set; }
    // ...

    public void SetType(EInvoiceType value) => Type = value;
    public void SetCreatedBy(Guid value) => CreatedBy = value;
    public void UsingIdentity(Identity identity) { ... }
    public void Validate(Contract contract, DateTime documentIssueDate) { ... }
    public PisCofinsWithholdingTaxEntityDomain ToEntity(CreatePisCofinsWithholdingTaxCommand origin, Guid parentId) { ... }
}
```

## Queries – Requests

- Requests de listagem herdando **GetAllRequest** (SubscriptionId, UserId, StartValidityDate) quando aplicável.
- Propriedades de filtro com **private set** e **SetXxx** quando precisar ser definido externamente.
- Namespace: `Qyon.Tax.Service.Domain.Invoices.Queries.Requests`.

```csharp
public class GetInvoicesRequest : GetAllRequest
{
    public string EstablishmentReferenceId { get; private set; }
    public void SetEstablishmentReferenceId(string value) => EstablishmentReferenceId = value;
}
```

## Queries – Models (Select*)

- Classe com **[Table("Schema.TableName")]** quando representar uma tabela (ex.: `[Table("Tax.Invoices")]`).
- Propriedades alinhadas aos nomes/aliases da SQL (PascalCase em C#).
- Para consultas com múltiplos JOINs que retornam um agregado (ex.: invoice + itens + notas):
  - Método estático **GetJoinTypes()** retornando `Type[]` na ordem dos tipos do split (raiz primeiro, depois filhos).
  - Método de instância **map(object[] objects)** (ou MapReferenceKeys/MapToIntegration) que preenche listas/objetos a partir de `objects[0]`, `objects[1]`, etc., evitando duplicatas (ex.: `!InvoiceItems.Any(i => i.Id == invoiceItem.Id)`).
- Namespace: `Qyon.Tax.Service.Domain.Invoices.Queries.Models`.

```csharp
[Table("Tax.Invoices")]
public class SelectInvoiceById
{
    public string Id { get; set; }
    public List<SelectInvoiceItems> InvoiceItems { get; set; }
    // ...

    public static Type[] GetJoinTypes() => new Type[]
    {
        typeof(SelectInvoiceById),
        typeof(SelectInvoiceItems),
        typeof(SelectIcmsInvoiceItems),
        // ... na ordem do SplitOn da query
    };

    public void map(object[] objects)
    {
        if (InvoiceItems == null) InvoiceItems = new List<SelectInvoiceItems>();
        var invoiceItem = objects[1] as SelectInvoiceItems;
        if (invoiceItem != null && !InvoiceItems.Any(i => i.Id == invoiceItem.Id))
        {
            // preencher subobjetos de objects[2], [3], etc.
            InvoiceItems.Add(invoiceItem);
        }
        // repetir para outras listas (PisCofinsWithholdingTaxItems, InvoiceNotes, etc.)
    }
}
```

## Interfaces do repositório

- Agrupar métodos em **#region Commands** e **#region Queries**.
- Assinaturas assíncronas: **Task** ou **Task&lt;T&gt;**.
- Usar entidades e DTOs do Domain (Entities, Queries.Models, Queries.Requests, Responses).
- Namespace: `Qyon.Tax.Service.Domain.Invoices.Interfaces`.

## Constants

- Classe estática com **const** e **static readonly** para IDs, códigos e listas imutáveis.
- Usar **ReadOnlyCollection&lt;T&gt;** ou arrays para listas expostas.
- Nomes descritivos (ex.: RegularDocumentStatus, CanceledDocumentStatus, CFOP1410Id).
- Scripts SQL longos podem ficar como const string (ex.: InvoiceItemsInsertScript).
- Namespace: `Qyon.Tax.Service.Domain.Invoices.Constants`.

## Entidades (Entities)

- Sufixo **EntityDomain** (ex.: InvoicesEntityDomain, InvoiceItemsEntityDomain).
- Usar tipos do Domain (enums, value objects) e não tipos de infra (ex.: IDbConnection apenas em interfaces de repositório, não em entidades).

## Regras gerais

- Não referenciar Infra ou camada de dados no Domain (apenas Interfaces que o repositório implementa).
- Enums em `Qyon.Tax.Service.Domain.Enums` (ex.: EInvoiceType, EStatus).
- Identidade: `Qyon.Domain.Identities.Identity` e `IIdentifyable` quando aplicável.
