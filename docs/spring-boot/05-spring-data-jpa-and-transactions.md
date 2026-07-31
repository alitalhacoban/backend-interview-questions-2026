---
title: Spring Data JPA & Transactions
sidebar_label: Spring Data JPA & Transactions
---

import SpringDataJpaAndTransactionsQuestions from './_partials/05-spring-data-jpa-and-transactions-questions.mdx';

# Spring Data JPA & Transactions

This is where interviews separate people who've used `@Transactional` from people who understand
*why* it sometimes silently doesn't do anything. The proxy mechanism behind it, and the N+1 query
problem, are the two things worth being able to explain in depth here.

## Repositories

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdAndStatus(String customerId, OrderStatus status);

    @Query("select o from Order o join fetch o.lines where o.id = :id")
    Optional<Order> findByIdWithLines(@Param("id") Long id);
}
```

Spring Data derives a query implementation from the method name at startup (`findByCustomerIdAndStatus`
parses into a `WHERE customer_id = ? AND status = ?`), or you can drop to explicit JPQL/native SQL
with `@Query` when the derivation gets unwieldy or you need a fetch join. You never write an
implementation class — a `RepositoryFactoryBean`-driven JDK dynamic proxy provides it at runtime.

## `@Transactional` and the proxy trap

```java
@Service
public class OrderService {

    @Transactional
    public void placeOrder(Order order) {
        orderRepository.save(order);
        inventoryService.reserve(order); // participates in the same transaction
    }

    public void placeOrderBatch(List<Order> orders) {
        for (Order order : orders) {
            this.placeOrder(order); // @Transactional is silently ignored here!
        }
    }
}
```

`@Transactional` is implemented as an **AOP proxy** wrapping the bean (see
[AOP & Proxies](./06-aop-and-proxies.md)): the proxy opens a transaction, calls the real method,
then commits or rolls back based on whether an exception escaped. That proxy only intercepts calls
that come **from outside the bean, through the proxy**. `this.placeOrder(order)` above is a plain
Java call on `this` — it bypasses the proxy entirely, so no transaction is opened. This
**self-invocation problem** is one of the most common "why isn't my transaction working" bugs in
real Spring codebases, and it's the single highest-value thing to be able to explain clearly in an
interview. The fix is to call through a separate bean (inject `OrderService` into itself via a
different bean, or split the method into a different `@Service`) so the call goes through the
proxy.

By default, `@Transactional` rolls back only on unchecked exceptions (`RuntimeException` and
`Error`) — a checked exception commits the transaction unless you add
`rollbackFor = Exception.class`.

## Propagation

| Propagation | Behavior |
|---|---|
| `REQUIRED` (default) | Join the existing transaction if one is active; otherwise start a new one |
| `REQUIRES_NEW` | Always start a new, independent transaction, suspending any existing one |
| `NESTED` | Start a savepoint within the existing transaction — a rollback here can be contained without rolling back the whole outer transaction |
| `MANDATORY` | Must run inside an existing transaction; throws if there isn't one |
| `NOT_SUPPORTED` | Suspend any existing transaction and run non-transactionally |

`REQUIRES_NEW` is the one interviewers probe most: it's used for things that must persist
regardless of the outer transaction's outcome, e.g. writing an audit log entry even if the calling
business operation later rolls back.

## Isolation levels

Standard SQL isolation levels apply (`READ_COMMITTED` is Spring's/most databases' practical
default): `READ_UNCOMMITTED` allows dirty reads; `READ_COMMITTED` prevents dirty reads but allows
non-repeatable reads; `REPEATABLE_READ` prevents those but allows phantom reads; `SERIALIZABLE`
prevents all three at the cost of the most contention. Most applications never override the
database default — this is asked more to check you understand the tradeoff than to check you tune
it often.

## The N+1 problem

```java
List<Order> orders = orderRepository.findAll(); // 1 query
for (Order order : orders) {
    order.getLines().size(); // N additional queries - one per order, lazy-loaded
}
```

With a lazy `@OneToMany` (the sensible default), accessing `order.getLines()` outside the
originating query triggers a separate `SELECT` per order — 1 query to fetch orders, plus N queries
to fetch each order's lines. Fixes:

- **Fetch join**: `select o from Order o join fetch o.lines` — one query, though it can produce a
  cartesian-product-sized result set if multiple collections are fetch-joined at once.
- **`@EntityGraph`**: declarative alternative to a manual fetch-join JPQL string.
- **Batch fetching** (`@BatchSize` / `hibernate.default_batch_fetch_size`): instead of N individual
  `SELECT`s, Hibernate issues a handful of `SELECT ... WHERE id IN (?, ?, ...)` queries.

## Lazy vs. eager loading

`FetchType.LAZY` (default for `@OneToMany`/`@ManyToMany`) defers loading an association until it's
accessed; `FetchType.EAGER` (default for `@ManyToOne`/`@OneToOne`) loads it immediately with the
owning entity. Accessing a lazy association **after** the persistence context/session has closed
(e.g. after the `@Transactional` method returns and the entity is serialized in a
`@RestController`) throws `LazyInitializationException` — this is why DTO projections or fetch
joins, not returning entities directly from a controller, are the standard practice.

:::info Interview Questions
<SpringDataJpaAndTransactionsQuestions/>
:::
