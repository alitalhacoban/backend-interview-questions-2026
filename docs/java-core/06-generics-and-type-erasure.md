---
title: Generics & Type Erasure
sidebar_label: Generics & Type Erasure
---

import GenericsAndTypeErasureQuestions from './_partials/06-generics-and-type-erasure-questions.mdx';

# Generics & Type Erasure

Generics questions are where interviews separate "I use `List<String>`" from "I understand why
you can't do `new T[10]`." The unifying idea behind almost every generics gotcha is **type
erasure** — once you understand that generic type information doesn't exist at runtime, most of
the surprising restrictions stop being surprising.

## Type erasure

```java
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();
System.out.println(strings.getClass() == ints.getClass()); // true — both are just ArrayList at runtime.
```

The compiler uses generic type parameters (`<T>`, `<String>`) only for **compile-time type
checking**. After compilation, it **erases** them: `List<String>` and `List<Integer>` both become
the raw type `List` in the bytecode, with compiler-inserted casts wherever the erased type is
retrieved. This is why `strings.getClass() == ints.getClass()` is `true` — at runtime, there is no
`List<String>` type, only `List`. Type erasure exists primarily for backward compatibility: it let
generics be added in Java 5 without breaking binary compatibility with pre-generics bytecode and
libraries.

## Bounded wildcards and PECS

```java
void printAll(List<? extends Number> list) {  // Can read Numbers out, can't add (except null).
    for (Number n : list) { System.out.println(n); }
}

void addIntegers(List<? super Integer> list) { // Can add Integers in, reading gives only Object.
    list.add(42);
}
```

- **`? extends T`** (upper bound): the list holds *some subtype* of `T`, unknown exactly which —
  so you can safely **read** a `T` out (it's guaranteed to be at least a `T`), but you can't
  **add** anything (the compiler can't verify a new element matches the specific unknown subtype).
- **`? super T`** (lower bound): the list holds `T` or some *supertype* of `T` — so you can safely
  **add** a `T` (it's guaranteed to fit), but reading only guarantees you get an `Object`.

**PECS** — "**P**roducer **E**xtends, **C**onsumer **S**uper" — is the mnemonic: if a generic
parameter is a data source you're reading from (*producing* values for you), use `extends`; if
it's a data sink you're writing into (*consuming* values from you), use `super`.

## Why you can't create an array of a generic type

```java
List<String>[] arrays = new List<String>[10]; // Compile error: generic array creation.
```

Arrays in Java are **reified** — they know and enforce their element type at runtime
(`ArrayStoreException` if you try to store the wrong type). Generics, due to erasure, are **not**
reified. If generic array creation were allowed, the runtime would have no way to enforce the
array's supposed element type, silently defeating the type safety generics exist to provide —
a `List<String>[]` masquerading as `Object[]` could have a `List<Integer>` stored into one of its
slots with no `ArrayStoreException` to catch it, and the failure would surface later as a
confusing `ClassCastException` far from the actual mistake. The compiler forbids it outright
rather than allow that hole.

## Bridge methods

```java
class StringBox implements Comparable<String> {
    public int compareTo(String other) { return 0; }
}
```

After erasure, `Comparable<String>`'s `compareTo(String)` and the erased interface method
`compareTo(Object)` need to line up so that polymorphic dispatch through the interface still
works. The compiler generates a synthetic **bridge method** — `compareTo(Object)` that casts its
argument to `String` and delegates to the real `compareTo(String)` — invisible in source but
present in the compiled class, reconciling the generic method signature with its erased form.

## Raw types

```java
List rawList = new ArrayList(); // Raw type: no type parameter at all.
rawList.add("a string");
rawList.add(42); // Compiles fine — no compile-time type checking on a raw type.
```

A **raw type** is a generic type used without its type parameter (`List` instead of
`List<String>`) — legal only for backward compatibility with pre-Java-5 code. It disables all
generic type checking for that variable: the compiler won't stop you from adding mismatched types,
and you'll only find out at a `ClassCastException` far from the actual insertion point when
something reads it back expecting a specific type. Always parameterize collections (or use
`List<?>` if the element type is genuinely unknown and you only need to read) instead of using raw
types in new code.

## Why can't you overload by generic type parameter alone

```java
void process(List<String> list) { }
void process(List<Integer> list) { } // Compile error: erasure — both are process(List).
```

Because of erasure, both method signatures become identical bytecode-level signatures
(`process(List)`) after compilation — the compiler can't generate two distinct methods that only
differ in an erased type parameter, so it rejects this at compile time as a duplicate method
declaration. This is a direct, very common trip-up once someone understands overloading but
hasn't yet connected it to erasure.

:::info Interview Questions
<GenericsAndTypeErasureQuestions/>
:::
