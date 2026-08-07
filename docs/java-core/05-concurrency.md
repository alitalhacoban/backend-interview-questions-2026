---
title: Concurrency
sidebar_label: Concurrency
---

import ConcurrencyQuestions from './_partials/05-concurrency-questions.mdx';

# Concurrency

Concurrency questions separate candidates who've memorized keywords (`synchronized`, `volatile`)
from those who understand what guarantees those keywords actually provide. This page focuses on
the guarantees, not just the syntax — what `volatile` does and doesn't protect against, why
thread pools exist, and the memory-model reasoning behind "happens-before."

## Process vs. thread

A **process** is an independently running program with its own isolated memory space — one
process can't directly read another's memory without OS-mediated IPC. A **thread** is the
smallest unit of execution *within* a process: multiple threads in the same process share that
process's heap and static state, but each thread still gets its own call stack, program counter,
and local variables. This is exactly why sharing heap objects across threads needs explicit
synchronization (they really do share memory) while sharing data across processes doesn't
happen by accident (they don't).

## Runnable vs. Thread

```java
class OrderProcessor implements Runnable {
    public void run() { /* process order */ }
}

Thread t = new Thread(new OrderProcessor());
t.start();
```

Implementing `Runnable` and passing it to a `Thread` is preferred over extending `Thread` directly
for two reasons: Java has single inheritance, so extending `Thread` burns your one superclass slot
and prevents extending anything else; and separating the *task* (`Runnable`) from the *execution
mechanism* (`Thread`) means the same task can be submitted to an `ExecutorService` instead of
always spawning a brand-new OS thread.

## `start()` vs. `run()`

```java
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));

t.start(); // Asks the OS for a new thread; that new thread then calls run(). Prints "Thread-0".
t.run();   // Just an ordinary method call on the current thread. Prints "main".
```

`start()` asks the JVM/OS to allocate a new native thread, which then invokes `run()` on that new
thread — this is the only way to actually achieve concurrent execution. Calling `run()` directly
is just an ordinary method invocation on whichever thread called it (usually the current one),
running synchronously with no new thread created at all. Calling `start()` twice on the same
`Thread` object also throws `IllegalThreadStateException` — a thread can only ever be started
once.

## `synchronized` vs. `Lock`

```java
synchronized void increment() { count++; } // Implicit monitor lock, released even if an exception is thrown.

private final Lock lock = new ReentrantLock();
void incrementWithLock() {
    lock.lock();
    try {
        count++;
    } finally {
        lock.unlock(); // Must be released manually — easy to forget without the finally.
    }
}
```

`synchronized` acquires the intrinsic monitor lock of an object, guarantees **mutual exclusion**
(only one thread executes the block per lock at a time) and establishes a **happens-before**
relationship so changes made inside are visible to the next thread that acquires the same lock.
It's automatically released on exit, including via exception.

`java.util.concurrent.locks.Lock` (typically `ReentrantLock`) provides the same mutual exclusion
but adds capabilities `synchronized` doesn't have: `tryLock()` (attempt without blocking),
`lockInterruptibly()` (respond to interruption while waiting), fairness policies, and multiple
condition variables (`Condition`) per lock. The tradeoff is that it must be released manually
(always in a `finally`) — there's no compiler-enforced release.

## `wait()`, `sleep()`, and `yield()`

```java
synchronized (lock) {
    lock.wait(); // Releases `lock` and pauses until notify()/notifyAll() — must hold the lock to call it.
}

Thread.sleep(1000); // Pauses THIS thread for ~1s, holding onto any locks it already has.
Thread.yield();     // A hint to the scheduler: "let another thread of equal priority run now."
```

Three easily-confused pause mechanisms: **`wait()`** (defined on `Object`, only callable while
holding that object's monitor) releases the lock and suspends the thread until another thread
calls `notify()`/`notifyAll()` on the same object — the basis of producer-consumer coordination.
**`sleep()`** (a static `Thread` method) pauses the current thread for a fixed duration **without**
releasing any locks it holds, which can itself cause contention if overused inside a synchronized
block. **`yield()`** is only a hint to the scheduler that the current thread is willing to let
other equal-priority threads run — the JVM is free to ignore it entirely, and it provides no
timing or ordering guarantee at all.

## What `volatile` guarantees (and doesn't)

```java
private volatile boolean running = true;
void stop() { running = false; }               // Thread A
void loop() { while (running) { /* work */ } }  // Thread B — without volatile, may never see the update.
```

`volatile` guarantees:
- **Visibility**: a write to a volatile variable is immediately visible to all threads that
  subsequently read it (no thread-local caching of the value in a register/CPU cache).
- **Ordering**: it prevents the compiler/CPU from reordering instructions around the volatile
  read/write (establishes happens-before for that variable specifically).

`volatile` does **not** guarantee:
- **Atomicity of compound operations.** `count++` on a volatile `int` is still read-modify-write —
  two threads can both read the same value before either writes back the increment, losing an
  update. For atomic compound operations, use `AtomicInteger`/`AtomicLong` or `synchronized`.

## Why prefer `ExecutorService` over manual thread creation

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> processOrder(order));
```

Creating a new `Thread` per task is expensive (OS thread creation/teardown cost, unbounded
resource usage if load spikes) and gives you no control over how many threads run concurrently. An
`ExecutorService`-backed thread pool reuses a bounded set of worker threads across many submitted
tasks, decouples task submission from execution, provides lifecycle management (`shutdown()`,
awaiting termination), and integrates with `Future`/`CompletableFuture` for retrieving results and
composing asynchronous work — all things you'd otherwise have to hand-roll per manually created
thread.

## Deadlock conditions

A deadlock requires all four of these ("Coffman conditions") to hold simultaneously:

1. **Mutual exclusion** — at least one resource is held in a non-shareable mode.
2. **Hold and wait** — a thread holds one resource while waiting for another.
3. **No preemption** — a resource can't be forcibly taken from a thread holding it.
4. **Circular wait** — a cycle of threads exists, each waiting on a resource held by the next.

```java
// Classic deadlock: two threads lock two objects in opposite order.
synchronized (lockA) {
    synchronized (lockB) { /* ... */ }  // Thread 1
}
synchronized (lockB) {
    synchronized (lockA) { /* ... */ }  // Thread 2 — circular wait if both run concurrently.
}
```

The most practical prevention is breaking **circular wait**: always acquire multiple locks in a
single, globally consistent order across the whole codebase. `tryLock()` with a timeout (breaking
"no preemption" by backing off and retrying) is another common mitigation.

## Happens-before in the Java Memory Model

The JVM's Java Memory Model (JMM) doesn't guarantee that writes made by one thread are visible to
another thread at all, *unless* a **happens-before** relationship is established between them —
without it, the compiler and CPU are free to reorder or cache reads/writes for performance, and a
thread can observe stale or partially-constructed state.

Happens-before is established by (among others): a `synchronized` block's unlock happens-before
the next thread's lock on the same monitor; a write to a `volatile` field happens-before a
subsequent read of that field; a `Thread.start()` call happens-before anything the started thread
does; a thread's last action happens-before another thread's `Thread.join()` returning from
joining it.

This matters even when you *are* using `volatile`/`synchronized`, because happens-before is
**transitive but not automatic across unrelated variables**: writing to a volatile flag makes
*all* writes made before that flag write (in program order) visible to a thread that reads the
flag afterward — but only if the reading thread actually reads that same volatile variable. Two
threads that never establish any happens-before edge between them can observe each other's
plain-field writes in an inconsistent or arbitrarily stale order, even on real hardware where "it
seems to work" in casual testing.

:::info Interview Questions
<ConcurrencyQuestions/>
:::
