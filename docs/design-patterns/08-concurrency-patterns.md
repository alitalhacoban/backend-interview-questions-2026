---
title: Concurrency Patterns
sidebar_label: Concurrency Patterns
---

import ConcurrencyPatternsQuestions from './_partials/08-concurrency-patterns-questions.mdx';

# Concurrency Patterns

These patterns predate the GoF categorization but come up constantly in backend interviews,
because most of the JDK's high-level concurrency utilities (`ExecutorService`, `BlockingQueue`,
`CompletableFuture`) are productionized implementations of exactly these shapes. See
[Java Core's Concurrency page](/docs/java-core/concurrency) for the underlying threading
primitives these patterns are built on top of.

## Producer-Consumer

**Problem:** One or more threads produce work items faster or slower than one or more other
threads can consume them, and you need to decouple the two sides so producers don't have to wait
for consumers to be ready (and vice versa) while still bounding memory use.

**Solution:** A thread-safe queue sits between producers and consumers. Producers push items onto
the queue and move on; consumers pull items off and block/wait when it's empty. A **bounded**
queue additionally makes producers block/wait when it's full, providing backpressure so a fast
producer can't run a slow consumer out of memory.

```java
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(1000); // bounded

// producer thread
queue.put(task); // blocks if queue is full

// consumer thread
Task t = queue.take(); // blocks if queue is empty
```

`java.util.concurrent.BlockingQueue` implements this pattern directly &mdash; `put()`/`take()`
handle all the waiting/notifying that a hand-rolled version would need `wait()`/`notify()` or a
`Lock`/`Condition` for.

## Thread Pool (Worker Pool)

**Problem:** Creating a new OS thread per unit of work is expensive (thread creation/teardown
overhead) and unbounded (nothing stops the number of live threads from growing without limit under
load).

**Solution:** Maintain a fixed (or bounded) pool of worker threads that pull tasks from a shared
queue and execute them, reusing the same threads across many tasks instead of creating a thread per
task.

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
pool.submit(() -> processOrder(order));
```

`ExecutorService` *is* this pattern, combined with Producer-Consumer internally (submitted tasks go
onto an internal queue that the pool's worker threads consume from). Sizing the pool correctly
(CPU-bound work: roughly `#cores`; I/O-bound work: larger, since threads spend most of their time
blocked rather than computing) is the most common follow-up question.

## Future / Promise

**Problem:** Code that submits asynchronous work needs a way to eventually get the result (or the
failure) back, without blocking the submitting thread until the work completes.

**Solution:** The asynchronous call immediately returns a placeholder object representing a result
that will exist *later*; the caller can poll it, block on it when it actually needs the value, or
(with a promise-style API) attach a callback to run automatically once the result is available.

```java
CompletableFuture<Order> future = CompletableFuture.supplyAsync(() -> fetchOrder(id));
future.thenApply(order -> order.getTotal())
      .thenAccept(total -> System.out.println(total)); // runs later, doesn't block here
```

A **Future** (the JDK's original `java.util.concurrent.Future`) supports blocking-retrieval
(`get()`) and cancellation but has no way to chain callbacks. A **Promise** (what
`CompletableFuture` actually is, despite the name) additionally supports composing/chaining
(`thenApply`, `thenCompose`, `thenCombine`) so dependent async steps don't require blocking at
every stage.

## Active Object

**Problem:** An object's methods are called from multiple threads, but you want each call to
actually *run* on the object's own dedicated thread (decoupling the caller's thread from the
thread that executes the method), and you want callers to get a Future back rather than block.

**Solution:** Method calls on the active object are turned into Command objects (see
[Behavioral Patterns I](./04-behavioral-patterns-i.md#command)) placed on an internal queue that
the object's own single worker thread processes one at a time; the caller immediately gets back a
Future representing the eventual result. This is precisely how Android's early `AsyncTask` and
actor-model frameworks (Akka actors) behave: each actor/active object processes its own mailbox
serially on one logical thread, so its internal state never needs its own locking.

## Monitor Object

**Problem:** An object's internal state is mutated by multiple threads and needs to stay
consistent, but unlike Active Object, callers should call methods synchronously and get a direct
return value, not a Future.

**Solution:** Every method that touches shared state acquires the object's own intrinsic lock for
the duration of the call (in Java, a `synchronized` method or block), so only one thread executes
inside the object's critical sections at a time; other threads calling in block until the lock is
free.

```java
class Counter {
    private int count;
    synchronized void increment() { count++; }  // Monitor Object: caller blocks, then returns directly
}
```

**Active Object vs. Monitor Object**: both make an object safe under concurrent calls, but Active
Object decouples the *caller's* thread from execution (calls are queued, executed elsewhere,
results returned via Future asynchronously) while Monitor Object keeps calls synchronous (the
caller's own thread runs the method body, just serialized against other threads via the lock). Pick
Monitor Object for simple synchronous thread-safety; pick Active Object when you specifically want
calls to not block the caller.

:::info Interview Questions
<ConcurrencyPatternsQuestions/>
:::
