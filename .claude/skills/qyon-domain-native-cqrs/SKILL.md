---
name: qyon-invoices-domain-native-cqrs
description: Mantém o padrão de desenvolvimento do módulo Invoices no Domain sem uso de MediatR, utilizando CQRS nativo via injeção de dependência. Use ao criar ou alterar Commands, Queries, Models, Interfaces, Constants, UseCases ou entidades de Invoices.
---

# Padrão Domain – Invoices (CQRS Nativo, sem MediatR)

## Estrutura de pastas

Manter a organização em `MyApp.Domain/Invoices/`:

- **Commands/** – Comandos CQRS (Create*, Update*, Delete*)
- **Commands/Constants/** – Constantes usadas por comandos
- **Commands/BasicQueueCommands/** – Comandos de fila (Basic*Command)
- **Commands/Handlers/** – Handlers de comandos (ICommandHandler<TCommand>)
- **Queries/Models/** – DTOs de leitura (Select*)
- **Queries/Models/BatchUpdateModels/** – Modelos de batch update (Select*ToBatchUpdate)
- **Queries/Requests/** – Objetos de requisição (Get*Request)
- **Queries/Handlers/** – Handlers de queries (IQueryHandler<TQuery, TResult>)
- **Interfaces/** – Contratos (IInvoicesRepository, I*UseCase, ICommandHandler, IQueryHandler)
- **Constants/** – Constantes do módulo (ex.: InvoiceConstants)
- **Events/Notifications/** – Notificações de domínio (*EventNotification)
- **Responses/** – DTOs de resposta (ex.: InvoiceReferenceResponse)
- **Messages/** – Mensagens de fila (ex.: UpdateInvoicesBatchMessage)
- **UseCases/** – Casos de uso (CreateInvoicesUseCase, etc.)

---

## Abstrações CQRS Nativas
- Skills de CQRS nativo: @skills/cqrs-native
Definir as interfaces genéricas em `MyApp.Domain/Interfaces/`:

```csharp
// ICommandHandler.cs
public interface ICommandHandler<in TCommand>
    where TCommand : class
{
    Task HandleAsync(TCommand command, CancellationToken ct = default);
}

// ICommandHandler com retorno
public interface ICommandHandler<in TCommand, TResult>
    where TCommand : class
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken ct = default);
}

// IQueryHandler.cs
public interface IQueryHandler<in TQuery, TResult>
    where TQuery : class
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken ct = default);
}
```

---

## Commands

- Herdar **Flunt.Notifications.Notifiable** (mantido para validação de domínio).
- **Não** implementar `MediatR.IRequest` – Commands são POCOs puros.
- Propriedades: preferir **private set** e expor **SetXxx(value)** para atribuição.
- Incluir **UsingIdentity(Identity identity)** quando precisar de UserId/TenantId.
- **Validação**: método `Validate(Contract contract, ...)` usando `contract.Requires().IsTrue(...)` com chave e mensagem.
- **Conversão para entidade**: método `ToEntity(...)` que retorna a entidade de domínio (`*EntityDomain`).
- Namespace: `MyApp.Domain.Invoices.Commands`.

```csharp
// Command – POCO puro, sem IRequest
public class CreateInvoiceCommand : Notifiable
{
    public EInvoiceType Type { get; private set; }
    public DateTime IssueDate { get; set; }
    public Guid CreatedBy { get; private set; }
    public Guid TenantId { get; private set; }

    public void SetType(EInvoiceType value) => Type = value;
    public void SetCreatedBy(Guid value) => CreatedBy = value;

    public void UsingIdentity(Identity identity)
    {
        CreatedBy = identity.UserId;
        TenantId = identity.TenantId;
    }

    public void Validate(Contract contract, DateTime issueDate)
    {
        contract.Requires()
            .IsTrue(Type != default, "Type", "invoice.type.required")
            .IsTrue(issueDate != default, "IssueDate", "invoice.issueDate.required");
    }

    public InvoiceEntityDomain ToEntity(CreateInvoiceCommand origin, Guid parentId)
    {
        return new InvoiceEntityDomain
        {
            // mapeamento dos campos
        };
    }
}
```

---

## Handlers de Commands

- Implementar `ICommandHandler<TCommand>` ou `ICommandHandler<TCommand, TResult>`.
- Usar **Primary Constructor** para injeção de dependências.
- Receber o Command já validado (validação feita na camada de aplicação/endpoint).
- Namespace: `MyApp.Domain.Invoices.Commands.Handlers`.

```csharp
public class CreateInvoiceHandler
    : ICommandHandler<CreateInvoiceCommand>
{
    private readonly IInvoicesRepository _repository;

    public CreateInvoiceHandler(IInvoicesRepository repository)
        => _repository = repository;

    public async Task HandleAsync(
        CreateInvoiceCommand command,
        CancellationToken ct = default)
    {
        var entity = command.ToEntity(command, Guid.NewGuid());
        await _repository.InsertInvoiceAsync(entity, ct);
    }
}
```

---

## Queries – Requests

- Requests de listagem herdando **GetAllRequest** (TenantId, UserId, StartDate) quando aplicável.
- Propriedades de filtro com **private set** e **SetXxx** quando precisar ser definido externamente.
- **Não** implementar `MediatR.IRequest` – Requests são POCOs puros.
- Namespace: `MyApp.Domain.Invoices.Queries.Requests`.

```csharp
public class GetInvoicesRequest : GetAllRequest
{
    public string EstablishmentId { get; private set; }
    public void SetEstablishmentId(string value) => EstablishmentId = value;
}
```

---

## Handlers de Queries

- Implementar `IQueryHandler<TQuery, TResult>`.
- Retornar DTOs especializados (`Select*`), nunca entidades de domínio.
- Namespace: `MyApp.Domain.Invoices.Queries.Handlers`.

```csharp
public class GetInvoicesHandler
    : IQueryHandler<GetInvoicesRequest, IEnumerable<SelectInvoiceById>>
{
    private readonly IInvoicesRepository _repository;

    public GetInvoicesHandler(IInvoicesRepository repository)
        => _repository = repository;

    public async Task<IEnumerable<SelectInvoiceById>> HandleAsync(
        GetInvoicesRequest query,
        CancellationToken ct = default)
    {
        return await _repository.GetInvoicesAsync(query, ct);
    }
}
```

---

## Queries – Models (Select*)

- Classe com **[Table("Schema.TableName")]** quando representar uma tabela (ex.: `[Table("Billing.Invoices")]`).
- Propriedades alinhadas aos nomes/aliases da SQL (PascalCase em C#).
- Para consultas com múltiplos JOINs que retornam um agregado:
  - Método estático **GetJoinTypes()** retornando `Type[]` na ordem dos tipos do split.
  - Método de instância **map(object[] objects)** que preenche listas/objetos a partir de `objects[0]`, `objects[1]`, etc., evitando duplicatas.
- Namespace: `MyApp.Domain.Invoices.Queries.Models`.

```csharp
[Table("Billing.Invoices")]
public class SelectInvoiceById
{
    public string Id { get; set; }
    public List<SelectInvoiceItem> Items { get; set; }

    public static Type[] GetJoinTypes() => new Type[]
    {
        typeof(SelectInvoiceById),
        typeof(SelectInvoiceItem),
        typeof(SelectInvoiceTax),
    };

    public void map(object[] objects)
    {
        if (Items == null) Items = new List<SelectInvoiceItem>();
        var item = objects[1] as SelectInvoiceItem;
        if (item != null && !Items.Any(i => i.Id == item.Id))
        {
            Items.Add(item);
        }
    }
}
```

---

## Registro automático dos Handlers (DI)

Registrar todos os handlers via scanning no Startup, sem registro manual:

```csharp
public static class CqrsRegistrationExtensions
{
    public static IServiceCollection AddInvoicesCqrsHandlers(
        this IServiceCollection services,
        Assembly assembly)
    {
        var handlerTypes = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } &&
                        t.GetInterfaces().Any(i => i.IsGenericType &&
                        (i.GetGenericTypeDefinition() == typeof(ICommandHandler<>) ||
                         i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>) ||
                         i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>))));

        foreach (var type in handlerTypes)
        {
            foreach (var iface in type.GetInterfaces())
            {
                services.AddScoped(iface, type);
            }
        }
        return services;
    }
}
```

---

## Uso nos Controllers / Minimal APIs

Injetar o handler específico diretamente no endpoint ou controller:

```csharp
// Minimal API
app.MapPost("/invoices", async (
    CreateInvoiceCommand cmd,
    ICommandHandler<CreateInvoiceCommand> handler,
    CancellationToken ct) =>
{
    var contract = new Contract();
    cmd.Validate(contract, cmd.IssueDate);
    if (!contract.IsValid)
        return Results.BadRequest(contract.Notifications);

    await handler.HandleAsync(cmd, ct);
    return Results.Created();
});

// Controller
[ApiController]
[Route("api/invoices")]
public class InvoicesController : ControllerBase
{
    private readonly ICommandHandler<CreateInvoiceCommand> _createHandler;
    private readonly IQueryHandler<GetInvoicesRequest, IEnumerable<SelectInvoiceById>> _getHandler;

    public InvoicesController(
        ICommandHandler<CreateInvoiceCommand> createHandler,
        IQueryHandler<GetInvoicesRequest, IEnumerable<SelectInvoiceById>> getHandler)
    {
        _createHandler = createHandler;
        _getHandler = getHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateInvoiceCommand cmd,
        CancellationToken ct)
    {
        var contract = new Contract();
        cmd.Validate(contract, cmd.IssueDate);
        if (!contract.IsValid)
            return BadRequest(contract.Notifications);

        await _createHandler.HandleAsync(cmd, ct);
        return Created();
    }
}
```

---

## Interfaces do repositório

- Agrupar métodos em **#region Commands** e **#region Queries**.
- Assinaturas assíncronas: **Task** ou **Task&lt;T&gt;** com `CancellationToken ct = default`.
- Usar entidades e DTOs do Domain (Entities, Queries.Models, Queries.Requests, Responses).
- Namespace: `MyApp.Domain.Invoices.Interfaces`.

```csharp
public interface IInvoicesRepository
{
    #region Commands
    Task InsertInvoiceAsync(
        InvoiceEntityDomain entity,
        CancellationToken ct = default);
    #endregion

    #region Queries
    Task<IEnumerable<SelectInvoiceById>> GetInvoicesAsync(
        GetInvoicesRequest request,
        CancellationToken ct = default);
    #endregion
}
```

---

## Constants

- Classe estática com **const** e **static readonly** para IDs, códigos e listas imutáveis.
- Usar **ReadOnlyCollection&lt;T&gt;** ou arrays para listas expostas.
- Scripts SQL longos podem ficar como const string.
- Namespace: `MyApp.Domain.Invoices.Constants`.

---

## Entidades (Entities)

- Sufixo **EntityDomain** (ex.: InvoiceEntityDomain, InvoiceItemEntityDomain).
- Usar tipos do Domain (enums, value objects) – não referenciar tipos de infra.

---

## Regras gerais

- **Não usar MediatR** (`IRequest`, `IRequestHandler`, `IMediator`) em nenhuma camada do Domain.
- Não referenciar Infra ou camada de dados no Domain (apenas Interfaces que o repositório implementa).
- Handlers são registrados via DI (Scoped) e injetados diretamente nos consumers.
- Enums em `MyApp.Domain.Enums` (ex.: EInvoiceType, EStatus).
- Identidade: `MyApp.Domain.Identities.Identity` e `IIdentifyable` quando aplicável.
- Sempre propagar `CancellationToken` até o repositório para evitar consumo desnecessário de recursos.

---

## Evolução futura (Wolverine-Ready)

Os handlers seguem a convenção `HandleAsync`, o que permite migração para Wolverine ou outro message bus sem alterar a lógica de negócio:
- Substituir a injeção de `ICommandHandler<T>` por um `IMessageBus`.
- Remover o registro nativo sem tocar nos Handlers.
