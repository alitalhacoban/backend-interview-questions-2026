---
title: Exception Handling
sidebar_label: Exception Handling
---

import ExceptionHandlingQuestions from './_partials/04-exception-handling-questions.mdx';

# Exception Handling

Exception handling questions look simple on the surface ("what's the difference between checked
and unchecked exceptions") but interviewers use them to probe API design judgment: do you know
*why* the distinction exists, and can you spot the anti-patterns that show up constantly in real
codebases (swallowed exceptions, lost stack traces, resources leaked on the error path).

## Checked vs. unchecked exceptions

```java
class InsufficientFundsException extends Exception {}      // Checked: extends Exception directly.
class InvalidOrderStateException extends RuntimeException {} // Unchecked: extends RuntimeException.
```

- **Checked exceptions** (subclasses of `Exception`, excluding `RuntimeException`) must be either
  caught or declared in the method signature (`throws`) — the compiler enforces this. They're
  meant for **recoverable, expected** conditions the caller should be forced to consider (e.g. a
  checked `IOException` from a file read).
- **Unchecked exceptions** (subclasses of `RuntimeException`, and `Error`) require no
  declaration or handling. They're meant for **programming errors** (`NullPointerException`,
  `IllegalArgumentException`) that a caller generally can't meaningfully recover from at the call
  site — forcing every caller up the stack to declare or catch them would just add noise.

In practice, this shapes method signature design: a method whose failure is a genuinely expected,
recoverable business condition (insufficient balance, invalid input from a user) benefits from a
checked exception (or, increasingly, a `Result`/`Either`-style return type in modern codebases) to
force callers to think about it; a method failing due to a bug or truly exceptional/unrecoverable
condition should use an unchecked exception so it doesn't pollute every signature up the call
chain with `throws` clauses nobody meaningfully handles.

## try-with-resources

```java
try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    return reader.readLine();
} // reader.close() is called automatically here, even if readLine() throws.
```

Any resource used in try-with-resources must implement **`AutoCloseable`** (or its subinterface
`Closeable`). The compiler generates code equivalent to a `finally` block that calls `close()`,
guaranteeing cleanup without requiring the boilerplate of a manual `finally`. Multiple resources
declared in the same `try(...)` are closed in **reverse order** of declaration, and if both the
try block and a `close()` call throw, the `close()` exception is **suppressed** (attached via
`getSuppressed()`) rather than replacing the original.

## Does `finally` always run?

Almost always — but not unconditionally:

```java
try {
    System.exit(1); // finally does NOT run: the JVM halts immediately.
} finally {
    cleanup();
}
```

`finally` runs even if the `try` block returns, throws, or breaks/continues out of a loop.
It does **not** run if:

- The JVM process is killed (`System.exit()`, `Runtime.halt()`, or the process is killed
  externally, e.g. `kill -9`).
- The thread executing it dies (e.g. an uncaught `Error` that terminates the thread, or the
  thread is forcibly stopped).

A classic gotcha: if both `try` and `finally` contain a `return`, the `finally` block's `return`
silently wins and discards the `try` block's return value — a strong reason to avoid `return`
inside `finally`.

## When to write a custom exception

Reach for a custom exception when:

- The failure represents a **distinct business condition** callers need to handle differently
  from other failures (e.g. `InsufficientFundsException` vs. a generic `IllegalStateException`) —
  the type itself becomes part of your API's vocabulary.
- You need to **attach structured context** (an order ID, a validation error list) that a built-in
  exception type has no field for.

Avoid it when a built-in exception already communicates the failure precisely
(`IllegalArgumentException` for a bad argument, `IllegalStateException` for an object used in the
wrong state) — introducing a one-off custom type there just adds a class callers have to know
about for no added information.

## Exception chaining

```java
try {
    repository.save(order);
} catch (SQLException e) {
    throw new OrderPersistenceException("Failed to save order " + order.getId(), e); // e is the cause.
}
```

Passing the original exception as the **cause** (via a constructor like
`Throwable(String, Throwable)`, or `initCause()`) preserves the original stack trace and exception
type inside the new one, retrievable via `getCause()`. Without chaining, you'd only see
"Failed to save order 123" with no indication it was actually a connection timeout at the JDBC
layer — chaining keeps root-cause information alive as an exception is translated across
architectural layers.

## The "swallowed exception" anti-pattern

```java
try {
    riskyOperation();
} catch (Exception e) {
    // Nothing here. The failure vanishes silently.
}
```

Catching `Exception` broadly and doing nothing (or just `e.printStackTrace()` in production code)
throws away the information needed to diagnose the failure, and worse, lets execution continue as
if nothing went wrong — which can leave the system in an inconsistent state while looking healthy.
Catching `Exception` at all is also usually too broad: it catches unrelated runtime exceptions
(a `NullPointerException` from an unrelated bug) alongside the one you actually intended to
handle. Prefer catching the **specific exception type** you know how to recover from, and either
log with full context and rethrow (often wrapped, per exception chaining above) or handle it in a
way that's visible — never silently discard it.

:::info Interview Questions
<ExceptionHandlingQuestions/>
:::
