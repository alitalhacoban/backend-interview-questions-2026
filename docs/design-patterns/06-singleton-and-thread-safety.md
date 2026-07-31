---
title: Singleton & Thread Safety
sidebar_label: Singleton & Thread Safety
---

import SingletonAndThreadSafetyQuestions from './_partials/06-singleton-and-thread-safety-questions.mdx';

# Singleton & Thread Safety

Singleton is the most-asked design pattern in interviews, but rarely for its basic definition
&mdash; almost every follow-up is about making it *safe*: safe under concurrent access, safe
against reflection, safe across serialization. This page works through each implementation and
exactly what breaks if you skip a step.

## The naive (broken) version

```java
class ConfigManager {
    private static ConfigManager instance;
    private ConfigManager() {}
    public static ConfigManager getInstance() {
        if (instance == null) {
            instance = new ConfigManager(); // race condition
        }
        return instance;
    }
}
```

Under single-threaded access this is fine. Under concurrent access it's broken: two threads can
both observe `instance == null`, both proceed past the check, and both construct a
`ConfigManager` &mdash; violating the entire point of Singleton. The rest of this page is different
strategies for closing that race.

## Eager initialization

```java
class ConfigManager {
    private static final ConfigManager INSTANCE = new ConfigManager();
    private ConfigManager() {}
    public static ConfigManager getInstance() { return INSTANCE; }
}
```

The instance is created when the class is loaded, guaranteed thread-safe by the JVM's class-loading
guarantees (a class's static initializers run exactly once, under an implicit lock). Simple and
correct, but the instance is created even if `getInstance()` is never called &mdash; wasteful if
construction is expensive and the singleton might not be needed on every run.

## Synchronized `getInstance()`

```java
public static synchronized ConfigManager getInstance() {
    if (instance == null) instance = new ConfigManager();
    return instance;
}
```

Correct and lazy, but every single call pays the cost of acquiring a lock forever, even decades
after the instance already exists and no race is possible anymore &mdash; unnecessary contention on
a hot path.

## Double-checked locking

```java
class ConfigManager {
    private static volatile ConfigManager instance;
    public static ConfigManager getInstance() {
        if (instance == null) {                     // 1st check, no lock — fast path
            synchronized (ConfigManager.class) {
                if (instance == null) {              // 2nd check, inside the lock
                    instance = new ConfigManager();
                }
            }
        }
        return instance;
    }
}
```

Only pays the synchronization cost on the (rare) first call; every call afterward returns via the
lock-free first check. The `volatile` keyword is not optional here: `new ConfigManager()` is not
atomic &mdash; it involves (1) allocating memory, (2) running the constructor, (3) assigning the
reference. Without `volatile`, the compiler/JIT is allowed to *reorder* steps 2 and 3, so another
thread could see a non-null `instance` reference that points to an object whose constructor hasn't
finished running yet, and read partially-initialized fields. `volatile` establishes a
happens-before relationship that forbids that reordering, so this pattern is unsafe on the
pre-Java-5 memory model and correct from Java 5 onward specifically because of `volatile`.

## Initialization-on-demand holder idiom

```java
class ConfigManager {
    private ConfigManager() {}
    private static class Holder {
        static final ConfigManager INSTANCE = new ConfigManager();
    }
    public static ConfigManager getInstance() { return Holder.INSTANCE; }
}
```

This is generally considered the cleanest lazy, thread-safe approach in Java, with no explicit
locking or `volatile` at all. It works because the JVM doesn't load the nested `Holder` class until
`getInstance()` first references it, and class loading is already guaranteed atomic and
happens-before by the JVM spec &mdash; the same guarantee eager initialization relies on, but
deferred until first use instead of paid upfront.

## Enum singleton

```java
enum ConfigManager {
    INSTANCE;
    void doSomething() { /* ... */ }
}
```

Joshua Bloch's recommendation in *Effective Java* as the single best way to implement Singleton in
Java, because it closes two attack vectors the other approaches don't:

- **Reflection**: `Class.getDeclaredConstructors()` plus `setAccessible(true)` can call a
  `private` constructor directly on any of the earlier approaches, minting a second instance
  regardless of the null checks in `getInstance()`. The JVM specifically forbids reflective
  instantiation of `enum` types, so this attack simply doesn't compile/throws at runtime.
- **Serialization**: serializing and deserializing an ordinary singleton produces a *new* object
  by default (deserialization bypasses constructors entirely) unless the class carefully
  implements `readResolve()` to return the existing instance instead. Enums serialize by name and
  are guaranteed by the JVM to deserialize back to the same enum constant, with no extra code
  required.

The tradeoff is that it can't extend another class (enums implicitly extend `Enum`) and feels
unfamiliar to developers who don't expect a global singleton to be spelled as an enum with one
constant.

## Spring beans: singleton scope without any of this

Spring-managed beans are singletons *by default* (`@Scope("singleton")` is the implicit default),
but application code never writes any of the above &mdash; no private constructor, no
double-checked locking, no `volatile`. The IoC container itself does the equivalent of holding one
shared instance per bean definition and handing out the same reference to every injection point;
the safety concerns above are the container's responsibility, not the class's. This is one of the
practical benefits of Dependency Injection over hand-rolled Singleton, covered in
[Dependency Injection & Enterprise Patterns](./07-dependency-injection-and-enterprise-patterns.md)
and [Spring Boot's IoC & Dependency Injection](/docs/spring-boot/ioc-and-dependency-injection).

:::info Interview Questions
<SingletonAndThreadSafetyQuestions/>
:::
