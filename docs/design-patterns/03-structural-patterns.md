---
title: Structural Patterns
sidebar_label: Structural Patterns
---

import StructuralPatternsQuestions from './_partials/03-structural-patterns-questions.mdx';

# Structural Patterns

Structural patterns are about composing classes and objects into larger structures without one
piece depending on another's concrete implementation. Several of these look similar on a class
diagram (a wrapper holding a reference to the thing it wraps) but exist for entirely different
reasons &mdash; the interview-relevant skill is telling them apart by *intent*, not by shape.

## Adapter

**Problem:** Two interfaces are incompatible &mdash; you have an existing class (often third-party,
code you can't change) whose interface doesn't match what your code expects.

**Solution:** Wrap the incompatible class in a new class that implements the interface your code
expects, translating calls to the wrapped class's actual methods.

**Real-life analogy:** A travel power plug adapter &mdash; your laptop's US plug and the wall
socket in Europe are physically incompatible, and you can't change either one. The adapter sits
between them, translating one shape into the other, so both sides work unmodified.

```java
interface PaymentProcessor { void pay(BigDecimal amount); }

class LegacyGateway { void makePayment(double cents) { /* ... */ } } // incompatible interface

class LegacyGatewayAdapter implements PaymentProcessor {
    private final LegacyGateway legacy;
    public void pay(BigDecimal amount) { legacy.makePayment(amount.doubleValue() * 100); }
}
```

Adapter's whole purpose is **translation between two interfaces that already exist** and can't be
changed. `java.util.Arrays.asList()` and `InputStreamReader` (adapting a byte stream to a character
stream) are both classic JDK adapters.

## Decorator

**Problem:** You need to add responsibilities to an individual object dynamically, and doing it via
subclassing would require a new subclass for every combination of added behaviors (an explosion of
classes: `BufferedInputStream`, `BufferedZippedInputStream`, `BufferedZippedEncryptedInputStream`...).

**Solution:** Wrap the object in another object implementing the same interface, which delegates to
the wrapped object and adds its own behavior before/after. Decorators can be stacked arbitrarily.

**Real-life analogy:** Ordering a coffee and adding toppings &mdash; a plain coffee, wrapped with
milk, wrapped with caramel, wrapped with whipped cream. Each topping adds its own cost and taste on
top of whatever it's wrapped around, and you never need a separately-named menu item for every
possible topping combination (no `CaramelWhippedCreamMilkCoffee` class).

```java
InputStream in = new BufferedInputStream(new GZIPInputStream(new FileInputStream("f.gz")));
```

Each layer only knows about the interface (`InputStream`), not the concrete class beneath it, so
any combination of decorators can be composed at runtime instead of requiring a combinatorial class
hierarchy defined at compile time. **Decorator vs. inheritance**: inheritance adds behavior
statically, at compile time, to *every* instance of a class; Decorator adds it dynamically, at
runtime, to *one specific instance*, and lets you combine independent behaviors freely.

## Facade

**Problem:** A subsystem has a large number of interacting classes with a complex interface; most
callers only need a small, simple slice of that functionality.

**Solution:** Provide one simplified interface that internally coordinates the subsystem's
classes, hiding their complexity from callers who don't need it.

**Real-life analogy:** Turning a car's ignition key (or pressing its start button) &mdash;
underneath, that one action coordinates the fuel pump, spark plugs, starter motor, and a dozen
sensors, but the driver never has to touch any of that directly.

```java
class VideoConversionFacade {
    Video convert(String file, String format) {
        // internally coordinates codec selection, decoding, encoding, bitrate readers, etc.
    }
}
```

**Adapter vs. Facade** is the other frequent naming-confusion pair: Adapter makes one existing
interface *look like* another interface the caller expects (translation, same level of
complexity). Facade makes a complex *set* of interfaces simpler to use (simplification, doesn't
necessarily translate anything &mdash; the underlying interfaces are usually fine, just numerous).

## Proxy

**Problem:** You need to control access to an object &mdash; delay its creation, check permissions
before forwarding a call, or forward calls across a process/network boundary &mdash; without the
caller knowing that's happening.

**Solution:** A proxy object implements the same interface as the real object and forwards calls to
it, adding its own logic around the forwarding. Three common flavors:

- **Virtual proxy** &mdash; defers creating an expensive real object until it's actually needed
  (lazy loading).
- **Protection proxy** &mdash; checks permissions before allowing a call through.
- **Remote proxy** &mdash; represents an object that lives in a different address space/process
  (this is exactly what RPC/RMI stubs and gRPC client stubs are).

**Real-life analogy:** A credit card as a stand-in for cash in your bank account &mdash; you never
hand a merchant your actual savings; the card represents access to that money, checks that the
transaction is valid, and forwards the charge on your behalf. You (the client) interact with the
card exactly as if it were the money itself.

**Proxy vs. Decorator**: both wrap an object behind the same interface, which is why they're
confused. The distinction is *intent*: Decorator's job is **adding behavior**, and it's meant to be
stacked arbitrarily by the client, which is aware it's decorating. Proxy's job is **controlling
access**, and it's meant to be transparent &mdash; the client typically doesn't know (or care) it's
talking to a proxy instead of the real object. (Spring's AOP proxies are a Proxy-pattern
implementation used to add cross-cutting behavior &mdash; see [Spring Boot's AOP & Proxies](/docs/spring-boot/aop-and-proxies)
for how that mechanism works underneath `@Transactional`/`@Cacheable`.)

## Composite

**Problem:** Client code needs to treat individual objects and groups of objects uniformly &mdash;
e.g. a filesystem where a `File` and a `Directory` (which contains more files/directories) should
both respond to `getSize()` without the client checking "is this a leaf or a container?"

**Solution:** Define a common interface for both leaf and container nodes; a container implements
the interface by delegating to (and aggregating results from) its children, which may themselves
be leaves or containers &mdash; a recursive tree structure.

**Real-life analogy:** A company's org chart &mdash; asking "how many people report up through
this manager" works the same way whether the manager's direct reports are individual contributors
(leaves) or other managers with their own teams underneath (containers). The question "how many
people" doesn't need special-casing at any level of the hierarchy.

```java
interface FileSystemNode { long getSize(); }
class File implements FileSystemNode { public long getSize() { return sizeInBytes; } }
class Directory implements FileSystemNode {
    List<FileSystemNode> children;
    public long getSize() { return children.stream().mapToLong(FileSystemNode::getSize).sum(); }
}
```

## Bridge

**Problem:** An abstraction and its implementation are both expected to vary independently, and
inheritance alone would force a class for every combination (e.g. `RemoteControl` × `TV` brand
would need `SonyRemoteControl`, `SamsungRemoteControl`, `AdvancedSonyRemoteControl`... an explosion
identical to Decorator's motivating problem, but for a *class hierarchy* rather than added
behavior).

**Solution:** Split the abstraction and implementation into two separate hierarchies, connected by
composition (the abstraction *holds a reference to* an implementation object) instead of
inheritance. Either hierarchy can now grow independently.

**Real-life analogy:** A universal remote control and TV brands &mdash; the remote (abstraction)
defines "power," "volume up," "channel up" without caring which brand of TV it's pointed at, and
any TV brand (implementation) can be added without ever touching the remote's design. Neither
hierarchy needs a version of itself for every combination of the other.

**Bridge vs. Strategy** looks nearly identical on a class diagram (an object holding a reference to
an interchangeable interface implementation). The difference is *when* and *why* the composition is
set up: Bridge is a structural decision made at design time to let two class hierarchies vary
independently (e.g. shape abstraction vs. rendering API). Strategy (see
[Behavioral Patterns I](./04-behavioral-patterns-i.md)) is a behavioral decision to let *one*
algorithm be swapped at runtime for a specific operation.

## Flyweight

**Problem:** An application needs a huge number of similar objects (e.g. rendering millions of
tree instances in a forest, or a character glyph for every character in a text document), and
storing full per-object state would exhaust memory.

**Solution:** Split each object's state into **intrinsic state** (shared, immutable, independent of
context &mdash; e.g. a tree's mesh/texture) stored once in a shared flyweight object, and
**extrinsic state** (unique per instance, context-dependent &mdash; e.g. a tree's x/y position)
passed in by the client at call time instead of stored on the object. A factory hands out the same
shared flyweight instance for a given intrinsic state instead of creating a new object per use.

**Real-life analogy:** A library's collection of physical books &mdash; there's one copy of *Design
Patterns* on the shelf (the shared, expensive-to-produce content), and many different library
cards checking it out at different times (the per-checkout, context-specific details). The library
doesn't print a brand-new physical book for every person who wants to read it.

:::info Interview Questions
<StructuralPatternsQuestions/>
:::
