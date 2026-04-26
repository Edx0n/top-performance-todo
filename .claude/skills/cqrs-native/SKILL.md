Here is the **SKILL.md** structured for a high-performance, native CQRS implementation in .NET. This design focuses on clean architecture and native Dependency Injection, ensuring that the system remains lean and prepared for any future messaging framework integration.

---

# SKILL: .NET Native CQRS Architecture

## Metadata

* **Name:** .NET Native CQRS Skill
* **Version:** 1.0.0
* **Category:** Software Architecture / .NET 10+
* **Description:** Implements the CQRS pattern using native .NET Dependency Injection and C# modern features. This approach prioritizes performance, type safety, and architectural decoupling, avoiding the "Service Locator" pitfall of traditional mediator libraries.

---

## Prerequisites

* Proficiency in **C# 12+** (Primary Constructors, Records, Collection Expressions).
* Deep understanding of the **ASP.NET Core Dependency Injection** container.
* Familiarity with the **Command Query Responsibility Segregation (CQRS)** architectural style.

---

## Core Principles

1. **Zero External Dependencies:** The Domain and Application layers must not depend on third-party mediation libraries.
2. **Direct Dependency Injection:** Prefer injecting specific Handlers into Consumers (Controllers/Minimal APIs) to ensure compile-time safety and better "Go to Definition" navigation.
3. **POCO-Based Messages:** Commands and Queries are pure data structures (Records) without mandatory base classes or interfaces from external frameworks.
4. **Interface-Based Handlers:** Use consistent interfaces to allow for automated registration and easy decoration.

---

## Implementation Guide

### 1. Unified Abstractions

Define thin, generic interfaces for the Command and Query sides.

```csharp
public interface ICommandHandler<in TCommand> 
    where TCommand : class
{
    Task HandleAsync(TCommand command, CancellationToken ct = default);
}

public interface IQueryHandler<in TQuery, TResult> 
    where TQuery : class
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken ct = default);
}

```

### 2. Implementation Pattern

Use `Records` for immutability and `Primary Constructors` for clean dependency management within the handler.

```csharp
// The Message
public record UpdateProductPriceCommand(Guid Id, decimal NewPrice);

// The Handler
public class UpdateProductPriceHandler : ICommandHandler<UpdateProductPriceCommand>
{
    private readonly IProductRepository _repository;
    
    public UpdateProductPriceHandler(IProductRepository repository) 
        => _repository = repository;

    public async Task HandleAsync(UpdateProductPriceCommand command, CancellationToken ct = default)
    {
        var product = await _repository.GetByIdAsync(command.Id, ct);
        product.UpdatePrice(command.NewPrice);
        await _repository.SaveAsync(product, ct);
    }
}

```

### 3. Automatic Service Registration

Avoid manual registration of every handler by using a scanning strategy during Startup.

```csharp
public static class CqrsRegistrationExtensions
{
    public static IServiceCollection AddNativeCqrsHandlers(this IServiceCollection services, Assembly assembly)
    {
        var handlerTypes = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } &&
                        t.GetInterfaces().Any(i => i.IsGenericType && 
                        (i.GetGenericTypeDefinition() == typeof(ICommandHandler<>) || 
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

### 4. Consumer Usage (Minimal APIs)

Inject the specific handler directly into the endpoint. This provides maximum transparency and performance.

```csharp
app.MapPatch("/products/price", async (
    UpdateProductPriceCommand cmd, 
    ICommandHandler<UpdateProductPriceCommand> handler,
    CancellationToken ct) =>
{
    await handler.HandleAsync(cmd, ct);
    return Results.NoContent();
});

```

---

## Future Evolution Path

While this skill focuses on the **Native Pattern**, it is designed to be **Wolverine-Ready**:

* By keeping Handlers as standard classes with a `HandleAsync` or `Handle` method, you follow the **"Convention over Configuration"** rule.
* If complex requirements (Outbox, Sagas, or Retries) arise, the migration involves replacing the `ICommandHandler` injection with a `MessageBus` and removing the native registration, without touching the business logic inside the Handlers.

---

## Best Practices

* **Explicit Validation:** Use `IEndpointFilter` or a Decorator to validate Commands via FluentValidation before they reach the Handler.
* **Idempotency:** Ensure Command Handlers are idempotent where possible, especially in distributed environments.
* **Read-Only Models:** Ensure Query Handlers return specialized DTOs (Data Transfer Objects) rather than Domain Entities to prevent accidental state mutation.
* **Cancellation Support:** Always propagate `CancellationToken` to avoid unnecessary resource consumption on aborted requests.
