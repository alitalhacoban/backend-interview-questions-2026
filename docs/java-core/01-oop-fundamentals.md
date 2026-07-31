---
title: OOP Fundamentals
sidebar_label: OOP Fundamentals
---

import OopFundamentalsQuestions from './_partials/01-oop-fundamentals-questions.mdx';

# OOP Fundamentals

Every Java interview opens with "what are the four pillars of OOP," and most candidates recite the
list without being able to say *why* the language is shaped that way, or where the lines between
the pillars actually blur. This page builds the model interviewers actually probe: not the
vocabulary, but the design tradeoffs behind it.

## The four pillars

### Encapsulation

Encapsulation means bundling state (fields) with the behavior that operates on it, and hiding the
internal representation behind a controlled interface (typically `private` fields plus public
getters/setters or, better, methods that express intent rather than exposing raw state).

```java
public class BankAccount {
    private BigDecimal balance;

    public void withdraw(BigDecimal amount) {
        if (amount.compareTo(balance) > 0) {
            throw new InsufficientFundsException();
        }
        balance = balance.subtract(amount);
    }
}
```

The point isn't just "make fields private" — it's that `BankAccount` can enforce the
"never go negative" invariant in exactly one place. Without encapsulation, any caller could set
`balance` directly and the invariant would depend on every caller behaving correctly.

### Abstraction

Abstraction means exposing *what* something does while hiding *how* it does it. A `List` interface
lets you call `.add()` without knowing whether it's backed by an array or a linked structure.
Abstraction is a design-time concept (which details are exposed in the API); encapsulation is the
implementation mechanism that enforces it (hiding those details behind access modifiers). They're
frequently conflated because encapsulation is *how* Java achieves abstraction, but they answer
different questions: abstraction asks "what should the caller need to know?", encapsulation asks
"how do I prevent them from reaching in anyway?"

### Inheritance

Inheritance lets a class (`Dog`) acquire fields and methods from a superclass (`Animal`),
expressing an "is-a" relationship. It enables polymorphism and code reuse, but overusing it
creates fragile hierarchies — see [Composition vs inheritance](#composition-vs-inheritance) below.

### Polymorphism

Polymorphism means an object can be treated as its supertype while still executing its own
overridden behavior at runtime.

```java
Animal a = new Dog();
a.makeSound(); // Runs Dog's makeSound(), decided at runtime — this is dynamic dispatch.
```

This is **runtime (dynamic) polymorphism**, achieved through overriding. **Compile-time (static)
polymorphism** is method overloading, resolved by the compiler based on argument types — see
below.

## Abstract classes vs. interfaces

Both let you define a contract that concrete classes implement, but they solve different problems:

| | Abstract class | Interface |
|---|---|---|
| State | Can hold instance fields | Cannot hold instance state (only `static final` constants) |
| Constructors | Yes | No |
| Multiple inheritance | A class extends only one | A class implements many |
| Method bodies | Any method can have one | `default`/`static` methods can (Java 8+), but no instance state to back them |

Rule of thumb: use an **abstract class** when subclasses share actual state or a common
implementation and are meaningfully related by an "is-a" hierarchy (e.g. `Shape` with a shared
`id` field). Use an **interface** when you're defining a capability unrelated classes can plug into
(`Comparable`, `Runnable`) — Java's single-inheritance-of-state rule means an interface is often
the only option once a class already extends something else.

## Overloading vs. overriding

```java
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; } // Overload: different signature, same class.
}

class ScientificCalculator extends Calculator {
    @Override
    int add(int a, int b) { return super.add(a, b); } // Override: same signature, subclass.
}
```

- **Overloading** is resolved **at compile time** based on the static (declared) types of the
  arguments — it's not polymorphism in the runtime-dispatch sense.
- **Overriding** is resolved **at runtime** based on the object's actual class, via the JVM's
  virtual method dispatch (a vtable-like lookup), which is exactly what makes
  `Animal a = new Dog(); a.makeSound();` call `Dog`'s implementation.

## `final`, `static`, `this`, `super`

- **`final` on a class**: cannot be subclassed (e.g. `String`, `Integer`).
- **`final` on a method**: cannot be overridden by a subclass.
- **`final` on a variable**: the reference cannot be reassigned after initialization — but if it
  refers to a mutable object, the object's *contents* can still change. `final List<String> names`
  means `names` always points to the same list; it does not make the list immutable.
- **`static`**: belongs to the class, not to instances — shared across all instances, accessible
  without an object reference.
- **`this`**: refers to the current instance, most commonly used to disambiguate a field from a
  constructor/method parameter of the same name.
- **`super`**: refers to the immediate superclass, used to call an overridden method's parent
  implementation or an inaccessible-by-default parent constructor.

## Composition vs. inheritance

Inheritance couples a subclass tightly to its superclass's implementation — changing the
superclass can silently break subclasses (the "fragile base class" problem), and Java's
single-inheritance rule means a class can only extend one thing. Composition — giving a class a
field referencing another object and delegating to it — avoids both problems:

```java
// Inheritance: Car IS-A Engine? Doesn't really make sense, and locks Car into Engine's API.
class Car extends Engine { }

// Composition: Car HAS-A Engine. Car can swap engines, mock them in tests, and expose only
// the methods it chooses to.
class Car {
    private final Engine engine;
    Car(Engine engine) { this.engine = engine; }
    void start() { engine.ignite(); }
}
```

The common guidance "favor composition over inheritance" doesn't mean inheritance is wrong — it
means reach for it only when there's a genuine, stable "is-a" relationship and you actually need
polymorphic substitution; otherwise composition keeps classes decoupled and easier to test.

## Access modifiers

| Modifier | Same class | Same package | Subclass (different package) | Everywhere |
|---|---|---|---|---|
| `private` | ✅ | ❌ | ❌ | ❌ |
| (package-private, no modifier) | ✅ | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

The interview trap here is `protected`: it's often assumed to mean "subclasses only," but it also
grants access to the entire package, not just subclasses outside it.

:::info Interview Questions
<OopFundamentalsQuestions/>
:::
