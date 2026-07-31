---
title: Streams & Functional Interfaces
sidebar_label: Streams & Functional Interfaces
---

import StreamsAndFunctionalInterfacesQuestions from './_partials/07-streams-and-functional-interfaces-questions.mdx';

# Streams & Functional Interfaces

Java 8's functional features are used constantly and understood shallowly — most candidates can
write a `.stream().filter().map().collect()` chain but can't explain why nothing happens until you
call `.collect()`, or what a functional interface actually is under the hood. This page connects
the syntax to the mechanism.

## Functional interfaces and lambdas

```java
@FunctionalInterface
interface Validator<T> {
    boolean isValid(T value);
}

Validator<String> notEmpty = s -> !s.isEmpty(); // Lambda: an inline implementation of isValid().
```

A **functional interface** is any interface with exactly **one abstract method** (it may have any
number of `default` or `static` methods). A **lambda expression** is syntactic sugar for an
anonymous instance of a functional interface — `s -> !s.isEmpty()` is compiled into an
implementation of `Validator`'s single abstract method, `isValid`. The `@FunctionalInterface`
annotation isn't required for this to work, but it makes the intent explicit and causes a compile
error if a second abstract method is accidentally added. `java.util.function` ships the common
ones pre-defined: `Function<T,R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`.

## Intermediate vs. terminal operations

```java
Stream<String> stream = names.stream()
    .filter(n -> n.length() > 3)   // Intermediate: returns a Stream, not evaluated yet.
    .map(String::toUpperCase);     // Intermediate: also just builds up the pipeline.

long count = stream.count();       // Terminal: this is what actually triggers execution.
```

- **Intermediate operations** (`filter`, `map`, `sorted`, `distinct`) return another `Stream` and
  are **lazy** — calling them just records a step in the pipeline; no elements are actually
  processed.
- **Terminal operations** (`collect`, `forEach`, `count`, `reduce`, `anyMatch`) trigger the actual
  traversal of the source and produce a non-stream result (a collection, a value, or nothing for
  `forEach`). A stream with no terminal operation does no work at all.

## Why streams are lazy

Laziness lets the stream pipeline process elements one at a time, end-to-end, instead of
materializing an intermediate collection after each step:

```java
names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .findFirst(); // Short-circuits: stops as soon as ONE matching element is found and mapped.
```

Because operations are composed lazily and evaluated element-by-element, `findFirst()` doesn't
filter and map the *entire* source before picking the first result — it processes just enough
elements to satisfy the terminal operation, then stops. This matters concretely for
short-circuiting terminal operations (`findFirst`, `anyMatch`, `limit`) on large or infinite
sources (`Stream.iterate(...)`): an eager (non-lazy) implementation would have to fully evaluate
every intermediate step over the entire source first, which is both wasteful and would hang
forever on an infinite stream.

## What `Optional` solves, and how it's misused

```java
Optional<User> findById(Long id) { /* may or may not find a user */ }

// Good: forces the caller to explicitly handle absence.
findById(id).map(User::getEmail).orElse("unknown@example.com");
```

`Optional` exists to make **the possible absence of a value part of the method's return type**,
replacing the old convention of returning `null` and hoping every caller remembers to check for
it. It forces callers to explicitly decide how to handle absence (`orElse`, `orElseThrow`, `map`)
rather than risking an unchecked `NullPointerException` three call frames away from where the
`null` originated.

The most common misuse: calling `.get()` without checking `.isPresent()` first, which just
replaces a `NullPointerException` risk with a `NoSuchElementException` risk and defeats the entire
purpose. A close second: using `Optional` as a field type or method parameter — it was designed as
a **return type** to communicate "this call might not produce a value," not as a general-purpose
substitute for nullable fields, and it adds allocation overhead and serialization awkwardness in
those roles.

## Method reference kinds

```java
names.forEach(System.out::println);       // 1. Reference to a static/instance method
names.stream().map(String::toUpperCase);  // 2. Reference to an instance method of an arbitrary object
Supplier<ArrayList<String>> ctor = ArrayList::new; // 3. Reference to a constructor
```

Method references are shorthand for a lambda that does nothing but call an existing method:

1. **Static or bound instance method reference** (`ClassName::staticMethod`,
   `someInstance::instanceMethod`) — the target object (if any) is fixed.
2. **Unbound instance method reference** (`ClassName::instanceMethod`) — the first lambda
   parameter becomes the receiver the method is called on (`String::toUpperCase` in a `map` over
   strings calls `.toUpperCase()` on each element).
3. **Constructor reference** (`ClassName::new`) — used as a `Supplier`/`Function` that constructs
   a new instance.

## Can a stream be consumed twice?

```java
Stream<String> stream = names.stream();
stream.forEach(System.out::println);
stream.count(); // Throws IllegalStateException: stream has already been operated upon or closed.
```

No. A `Stream` is a **single-use** pipeline over its source — once a terminal operation has run,
the stream is considered consumed, and any further operation on that same stream instance throws
`IllegalStateException`. To iterate the same data again, a new stream must be created from the
source (`names.stream()` again) — the source collection itself is untouched and can produce as
many fresh streams as needed.

:::info Interview Questions
<StreamsAndFunctionalInterfacesQuestions/>
:::
