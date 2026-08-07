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

## Constructors, and why a constructor might be private

```java
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    Point() { this(0, 0); } // this(...) chains to another constructor in the same class.
}

class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {} // Private: nobody outside this class can call `new Singleton()`.
    static Singleton getInstance() { return INSTANCE; }
}
```

A **constructor** initializes a new object's state and runs exactly once per instance, at creation
time. `this(...)` chains to another constructor in the same class; `super(...)` (implicit if
omitted) chains to the superclass's constructor — either must be the first statement if used. A
**private constructor** doesn't prevent object creation altogether; it prevents creation *from
outside the class*, which is exactly the mechanism behind the Singleton pattern (only the class
itself can call `new`), static factory methods (`Optional.of(...)`, `List.of(...)`), and
utility/helper classes that should never be instantiated at all (a private constructor plus only
static members).

## Shallow copy vs. deep copy

```java
class Team implements Cloneable {
    List<String> members;

    @Override
    public Team clone() throws CloneNotSupportedException {
        return (Team) super.clone(); // Object.clone(): shallow — copies the field, not what it points to.
    }
}

Team original = new Team();
original.members = new ArrayList<>(List.of("Alice"));
Team copy = original.clone();
copy.members.add("Bob"); // Also shows up in original.members — they share the SAME List instance!
```

A **shallow copy** duplicates an object's fields as-is: primitive fields get independent copies,
but reference fields still point to the exact same underlying objects as the original — mutating
a shared referenced object through the copy also affects the original. `Object.clone()`'s default
behavior is shallow. A **deep copy** recursively copies every referenced object too, so the copy
and the original share no mutable state at all. Achieving a real deep copy usually means manually
cloning each mutable field (`this.members = new ArrayList<>(other.members)`) rather than relying on
`super.clone()`, since Java has no built-in automatic deep-clone mechanism.

## Multiple inheritance and the diamond problem

```java
interface Flyer { default String move() { return "flying"; } }
interface Swimmer { default String move() { return "swimming"; } }

class Duck implements Flyer, Swimmer {
    @Override
    public String move() { return Flyer.super.move(); } // Must resolve the conflict explicitly.
}
```

Java doesn't allow a class to `extends` more than one class, specifically to avoid the **diamond
problem**: if `Duck extends Flyer, Swimmer` were legal and both defined conflicting *state* or
implementation, it would be ambiguous which one `Duck` actually inherits. Java sidesteps this for
state by only ever allowing single class inheritance — but interfaces *can* be implemented in any
number, and since Java 8 interfaces can carry `default` method bodies, so the diamond problem
resurfaces there: if two implemented interfaces provide the same default method, the implementing
class **must** override it and explicitly choose (or combine) an implementation via
`InterfaceName.super.method()`, otherwise it's a compile error rather than a silent ambiguous pick.

## Marker interfaces

```java
class User implements Serializable { // No methods to implement — Serializable has none.
    String name;
}
```

A **marker interface** declares no methods at all; implementing it exists purely to attach metadata
that the JVM or a framework checks via `instanceof` at runtime. `Serializable` tells the
serialization machinery an object is safe to convert to a byte stream; `Cloneable` tells
`Object.clone()` it's allowed to return a copy instead of throwing `CloneNotSupportedException`;
`Remote` marks an object as eligible for RMI. Modern Java favors annotations for this kind of
metadata, but marker interfaces remain common in legacy and JDK APIs because, unlike annotations,
they also affect the static type system (a `Serializable` value passes an `instanceof Serializable`
check and can be used where that type is required).

## Default and static methods in interfaces

```java
interface Vehicle {
    void drive(); // Abstract — still required.

    default void honk() { System.out.println("Beep!"); } // Has a body — implementers get it for free.
    static Vehicle economyCar() { return () -> System.out.println("driving economically"); }
}
```

Added in Java 8 specifically to let library authors evolve interfaces without breaking every
existing implementer: a **default method** provides a body that implementing classes inherit
automatically unless they choose to override it — this is how `Collection` grew `stream()` and
`forEach()` without breaking every pre-existing `List` implementation ever written. A **static
method** on an interface is a plain utility function namespaced under the interface (like
`Comparator.comparing(...)`) — it's not inherited by implementers at all and must be called via the
interface name.

## The `instanceof` operator

```java
Object obj = "hello";

if (obj instanceof String) {
    String s = (String) obj; // Pre-Java 16: still need a manual, redundant cast.
    System.out.println(s.length());
}

if (obj instanceof String s) { // Java 16+ pattern matching: binds `s` directly, cast implied.
    System.out.println(s.length());
}
```

`instanceof` checks whether an object is an instance of a given class or interface at runtime,
returning `false` (not an exception) for `null` on either side. Since Java 16, **pattern matching
for `instanceof`** lets the check bind a typed local variable directly in the condition, eliminating
the manual, boilerplate cast that used to immediately follow every `instanceof` check.

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
