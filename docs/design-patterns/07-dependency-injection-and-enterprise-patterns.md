---
title: Dependency Injection & Enterprise Patterns
sidebar_label: DI & Enterprise Patterns
---

import DependencyInjectionAndEnterprisePatternsQuestions from './_partials/07-dependency-injection-and-enterprise-patterns-questions.mdx';

# Dependency Injection & Enterprise Patterns

None of the patterns on this page are among the original 23 GoF patterns, but they're asked about
constantly in backend interviews because they're how real applications are actually structured day
to day &mdash; every Spring Boot codebase leans on all of them. This page also untangles the
Repository/DAO/DTO trio, which is one of the most common naming-confusion clusters in backend
interviews.

## Inversion of Control and Dependency Injection

**Inversion of Control (IoC)** is the general principle: instead of a class controlling its own
flow and creating the objects it depends on, control is handed to an external framework/container
that drives the flow and supplies dependencies. **Dependency Injection (DI)** is the specific,
most common technique for achieving IoC: a class *declares* what it needs (via constructor
parameters, typically) instead of constructing those dependencies itself, and something external
supplies (injects) them.

```java
class OrderService {
    private final PaymentGateway gateway;
    OrderService(PaymentGateway gateway) { this.gateway = gateway; } // injected, not `new`'d
}
```

This is the **Dependency Inversion Principle** (the "D" in SOLID) made concrete: `OrderService`
depends on the `PaymentGateway` *interface*, not a concrete implementation, and doesn't know or
care what supplies it or how.

## Constructor vs. setter vs. field injection

- **Constructor injection** &mdash; dependencies passed as constructor parameters. Enables making
  fields `final` (immutable after construction), makes required dependencies impossible to forget
  (the object can't be constructed without them), and makes the class trivially testable with
  plain `new` in a unit test, no container needed. Generally the recommended default, including in
  Spring.
- **Setter injection** &mdash; dependencies supplied via setter methods after construction. Useful
  for genuinely optional dependencies, but allows constructing an object in an incomplete/invalid
  state if a setter call is skipped, and fields can't be `final`.
- **Field injection** &mdash; dependencies injected directly onto fields (Spring's `@Autowired`
  on a field). Least boilerplate, but makes the class impossible to construct without a DI
  container/reflection (no plain `new` in a test), hides the dependency list, and is generally
  discouraged for exactly that reason (see [Spring Boot's IoC & DI page](/docs/spring-boot/ioc-and-dependency-injection)
  for Spring's own current guidance favoring constructor injection).

## Dependency Injection vs. Service Locator

Both solve "how does a class get its dependencies without constructing them itself," and both were
common before DI containers became standard, so they're worth contrasting directly:

- **Service Locator** &mdash; the class actively *asks* a central registry for what it needs at
  runtime: `PaymentGateway gw = ServiceLocator.get(PaymentGateway.class);`. The dependency is
  hidden inside the method body, not visible in the constructor signature, and the class is now
  coupled to the locator itself.
- **Dependency Injection** &mdash; the class *declares* what it needs and never touches a registry
  at all; something external supplies it.

DI is generally preferred because the dependency list is visible and explicit (in the constructor
signature), the class has zero coupling to any injection mechanism, and it's straightforward to
unit test by just passing in a fake/mock directly &mdash; Service Locator requires either a real
registry or globally swapping what the registry returns in test setup.

## Factory pattern vs. a DI container

A DI container (Spring's `ApplicationContext`, for instance) is, at its core, doing what a Factory
does &mdash; deciding what concrete class to instantiate and handing back an interface-typed
reference &mdash; but generalized and automated: it wires an entire object graph (resolving each
bean's own dependencies recursively), manages lifecycle/scope (singleton by default, see
[Singleton & Thread Safety](./06-singleton-and-thread-safety.md)), and does it via configuration/
annotations rather than code you write per type. A hand-written Factory Method or Abstract Factory
is still the right tool for a narrow, one-off creation decision; a DI container is the right tool
once an application has enough interdependent components that wiring them by hand becomes its own
maintenance burden.

## Repository vs. DAO vs. DTO

The most common enterprise-pattern naming-confusion trio:

- **DAO (Data Access Object)** &mdash; abstracts *how* to talk to a specific data source (SQL, a
  specific table, a specific ORM). A DAO's methods tend to mirror the underlying storage
  operations closely (`findById`, `insert`, `updateStatus`).
- **Repository** &mdash; a *domain-oriented* abstraction over a collection of aggregate
  roots, framed in terms the business domain understands (`findActiveCustomers()`,
  `nextOrderNumber()`), not necessarily 1:1 with a table. A Repository is often implemented *using*
  one or more DAOs underneath, but presents a coarser, domain-shaped interface. In practice, most
  Spring Data JPA codebases use "Repository" for what is functionally a DAO
  (`JpaRepository<Order, Long>` exposes CRUD methods, table-shaped) &mdash; the strict DDD
  distinction above is frequently blurred in real code, which is worth acknowledging if asked.
- **DTO (Data Transfer Object)** &mdash; a plain object used purely to carry data across a process
  or layer boundary (e.g. serialized as a REST response body), with no behavior and no
  persistence concerns. A DTO is deliberately *not* the same object as the domain entity/JPA
  entity it's built from &mdash; keeping them separate avoids leaking persistence annotations,
  lazy-loading proxies, or internal-only fields across the API boundary, and lets the two evolve
  independently (a DB column rename shouldn't have to be an API breaking change, and vice versa).

:::info Interview Questions
<DependencyInjectionAndEnterprisePatternsQuestions/>
:::
