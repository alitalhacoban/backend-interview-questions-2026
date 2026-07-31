---
title: Creational Patterns
sidebar_label: Creational Patterns
---

import CreationalPatternsQuestions from './_partials/02-creational-patterns-questions.mdx';

# Creational Patterns

Creational patterns all answer the same underlying question: how do you create objects without
hard-coding the calling code to a specific concrete class? Five patterns cover this ground, each
solving a slightly different flavor of the problem &mdash; from "which subclass to instantiate" to
"how to build a complex object step by step." Singleton gets a brief treatment here and a full
deep dive in [Singleton & Thread Safety](./06-singleton-and-thread-safety.md), since it's the
single most-asked pattern in interviews.

## Factory Method

**Problem:** Calling code needs to create an object, but the exact concrete class to instantiate
should be decided by a subclass, not hard-coded with `new`.

**Solution:** Define a method whose sole job is creating an object; subclasses override it to
return the specific type they need. Calling code depends only on the abstract return type.

**Real-life analogy:** A logistics company's regional office decides *which* vehicle handles a
delivery &mdash; a van for local drops, a ship for overseas, a plane for urgent freight &mdash;
but headquarters just says "deliver this package" and never needs to know or care which vehicle
class ends up doing the work. Headquarters is the caller; the regional office is the factory
method.

```java
abstract class NotificationCreator {
    abstract Notification createNotification(); // the "factory method"

    void notifyUser(String message) {
        Notification n = createNotification();
        n.send(message);
    }
}

class EmailNotificationCreator extends NotificationCreator {
    Notification createNotification() { return new EmailNotification(); }
}

class SmsNotificationCreator extends NotificationCreator {
    Notification createNotification() { return new SmsNotification(); }
}
```

The caller works entirely against `NotificationCreator`/`Notification`; adding a new channel means
adding a new subclass, not touching `notifyUser`.

## Abstract Factory

**Problem:** You need to create *families* of related objects that must be used together, and
swap the entire family at once (e.g. all UI widgets for a "dark theme" vs. "light theme").

**Solution:** One factory interface with a creation method per product in the family; concrete
factories implement the whole family consistently.

**Real-life analogy:** A furniture store selling complete matching sets &mdash; pick the "Victorian"
factory and you get a Victorian sofa, chair, and table that all match each other; pick "Modern" and
you get the modern versions of the same three pieces. You never accidentally end up with a Victorian
sofa and a Modern chair, because the whole family comes from one factory.

```java
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class DarkThemeFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}
```

**Factory Method vs. Abstract Factory** is the most common naming-confusion pair here: Factory
Method creates *one* product via subclassing/overriding a single method. Abstract Factory creates
*a whole family* of related products via composition &mdash; you hand the calling code a factory
object, not a subclass. Abstract Factories are commonly implemented *using* several Factory Methods
internally.

## Builder

**Problem:** An object has many optional constructor parameters, leading to "telescoping
constructors" &mdash; overload after overload of the constructor to cover every combination of
optional fields, which is unreadable and error-prone (easy to swap two same-typed arguments).

**Solution:** A separate builder object accumulates parameters through chained setter-like calls,
then constructs the final immutable object in one step.

**Real-life analogy:** Ordering a sandwich at a made-to-order counter &mdash; you pick the bread,
then the meat, then toppings, then sauce, one decision at a time, and the sandwich only comes
together at the end. Nobody hands the person behind the counter a single 15-argument order like
`orderSandwich(wheat, turkey, true, false, true, mustard, ...)` and hopes they got the argument
order right.

```java
Pizza pizza = new Pizza.Builder()
    .size(Size.LARGE)
    .topping("mushroom")
    .topping("olive")
    .extraCheese(true)
    .build();
```

Builder also enables validation of the fully-assembled state in one place (`build()`) instead of
scattered across constructor overloads, and can enforce immutability on the final object while
still allowing flexible, readable construction.

## Prototype

**Problem:** Creating a new object from scratch is expensive (heavy initialization, DB round-trip
to populate fields) or you need a copy of an object whose exact runtime class you don't know at
compile time.

**Solution:** Objects implement a `clone()` method; new instances are produced by copying an
existing "prototype" instance rather than calling `new` and re-running full initialization.

**Real-life analogy:** Photocopying a filled-out form instead of writing a fresh one from a blank
template &mdash; the copy already has all the boilerplate filled in correctly, and you only need
to change the one or two fields that differ, instead of re-entering everything from scratch.

```java
class Sheep implements Cloneable {
    String name;
    public Sheep clone() {
        try { return (Sheep) super.clone(); }
        catch (CloneNotSupportedException e) { throw new AssertionError(e); }
    }
}
```

The key gotcha: Java's `Object.clone()` does a **shallow copy** by default &mdash; primitive and
immutable fields copy correctly, but reference fields (e.g. a `List` field) end up shared between
original and clone. A correct `clone()` implementation for a class with mutable reference fields
must explicitly deep-copy those fields itself.

## Singleton (brief)

**Problem:** Exactly one instance of a class should exist application-wide (a config manager, a
connection pool), and it must be globally accessible.

**Solution:** The class controls its own instantiation &mdash; a private constructor plus a static
accessor that creates the instance on first use and returns the same one afterward. The subtlety
is almost entirely about *how* to make that safe under multiple threads and resistant to reflection
and serialization attacks, covered fully in [Singleton & Thread Safety](./06-singleton-and-thread-safety.md).

**Real-life analogy:** A single print spooler on your operating system &mdash; every application
on the machine that wants to print sends its job to the *same* spooler. If each app spun up its own
independent spooler, print jobs could interleave or get lost; there has to be exactly one shared
coordinator that everyone talks to.

## Where the JDK already uses these

- `Calendar.getInstance()`, `NumberFormat.getInstance()` &mdash; Factory Method (return type is an
  abstract class; concrete subclass depends on locale/args).
- `Executors.newFixedThreadPool(...)` &mdash; Factory Method returning an `ExecutorService`.
- `StringBuilder`/`StringBuffer` &mdash; not a formal Builder in the GoF sense (no separate builder
  object), but the same "accumulate, then produce a final value" shape.
- `Object.clone()` and the `Cloneable` marker interface &mdash; Prototype, built into the language.

:::info Interview Questions
<CreationalPatternsQuestions/>
:::
