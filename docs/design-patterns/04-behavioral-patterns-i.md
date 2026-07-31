---
title: Behavioral Patterns I
sidebar_label: Behavioral Patterns I
---

import BehavioralPatternsIQuestions from './_partials/04-behavioral-patterns-i-questions.mdx';

# Behavioral Patterns I

Behavioral patterns are about how responsibility for a request is distributed and how objects
communicate, rather than how they're created or composed. This page covers five of the ten GoF
behavioral patterns &mdash; Strategy, Observer, Command, Template Method, and Iterator &mdash; the
five most likely to show up as "implement X" or "where have you used X" questions. The remaining
five continue in [Behavioral Patterns II](./05-behavioral-patterns-ii.md).

## Strategy

**Problem:** An algorithm needs to vary independently of the class that uses it &mdash; e.g. a
checkout process that can compute shipping cost several different ways depending on carrier &mdash;
and you don't want a chain of `if/else`/`switch` statements picking the logic inline, or a
subclass per variant.

**Solution:** Extract each algorithm variant into its own class implementing a common interface;
the context class holds a reference to a strategy object and delegates to it, swappable at runtime.

**Real-life analogy:** Picking a route in a GPS navigation app &mdash; walking, driving, cycling,
and public-transit are interchangeable ways of computing "how do I get there," and you swap between
them with one tap. The app's "navigate" logic doesn't change; only which routing strategy it
delegates to does.

```java
interface ShippingStrategy { BigDecimal calculate(Order order); }
class FedExStrategy implements ShippingStrategy { /* ... */ }
class UpsStrategy implements ShippingStrategy { /* ... */ }

class Checkout {
    private ShippingStrategy strategy; // injected/swapped at runtime
    BigDecimal shippingCost(Order o) { return strategy.calculate(o); }
}
```

This is composition-over-inheritance in its most direct form &mdash; the same shape as Java's
`Comparator` (a swappable sorting strategy passed into `Collections.sort`).

## Observer

**Problem:** When one object's state changes, an open-ended set of other objects need to be
notified, without the changing object being coupled to the concrete classes of its observers.

**Solution:** The subject maintains a list of observers implementing a common `update()`-style
interface; it notifies all of them (calls `update()`) whenever its state changes, without knowing
what any specific observer does with that notification.

**Real-life analogy:** Subscribing to a YouTube channel &mdash; when the channel (subject) uploads
a new video, every subscriber (observer) gets notified automatically. The channel has no idea who
its subscribers are individually or what they'll do with the notification (watch immediately,
watch later, ignore it) &mdash; it just broadcasts to whoever's currently subscribed.

```java
interface Observer { void update(Event e); }
class EventBus {
    List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o) { observers.add(o); }
    void publish(Event e) { observers.forEach(o -> o.update(e)); }
}
```

This is the basis for pub/sub messaging (see [Kafka Fundamentals](/docs/kafka/fundamentals) for
the distributed version of the same idea) and for Java's own listener conventions
(`addActionListener`, `PropertyChangeListener`). A **push model** sends the full event data to
`update()`; a **pull model** sends a minimal notification and lets the observer query the subject
for whatever details it needs &mdash; the tradeoff is bandwidth/coupling (push) vs. an extra
round-trip and looser coupling (pull).

## Command

**Problem:** A request (an action plus its parameters) needs to be represented as a first-class
object, so it can be queued, logged, undone, or passed around independently of whatever will
eventually execute it.

**Solution:** Encapsulate a request as an object implementing an `execute()` method; the invoker
holds and triggers commands without knowing what they actually do.

**Real-life analogy:** A restaurant order ticket &mdash; the waiter writes down what you want (a
command object: dish + modifications) and hands it to the kitchen. The ticket can sit in a queue,
get handed to whichever cook is free, and if you change your mind before it's cooked, the ticket
can be pulled and cancelled &mdash; the waiter never needs to personally cook anything or know how.

```java
interface Command { void execute(); void undo(); }
class AddTextCommand implements Command {
    void execute() { document.append(text); }
    void undo() { document.removeLast(text.length()); }
}
```

Command is the pattern behind **undo/redo stacks** (each executed command is pushed onto a
history), **job queues/task schedulers** (a `Runnable` is essentially a Command with only
`execute()`, no `undo()`), and transactional/deferred execution (queue commands, run them later or
roll them back on failure).

## Template Method

**Problem:** Several classes share the same overall algorithm *structure*, but differ in one or
two specific steps.

**Solution:** Define the algorithm's skeleton in a base class method marked `final` (so subclasses
can't override the overall sequence), calling out to abstract/overridable "hook" steps that
subclasses fill in.

**Real-life analogy:** A recipe with a fixed sequence &mdash; preheat, mix ingredients, bake, cool
&mdash; where every recipe in the cookbook follows those same four steps in that same order, but
"mix ingredients" is completely different for a cake versus a loaf of bread. The sequence is fixed;
one step is what varies.

```java
abstract class DataProcessor {
    final void process() {         // the template — fixed sequence, not overridable
        readData();
        transform();                // varies per subclass
        writeData();
    }
    abstract void transform();
    void readData() { /* shared default */ }
    void writeData() { /* shared default */ }
}
```

**Template Method vs. Strategy**: both let one step of a process vary. Template Method uses
**inheritance** &mdash; the varying step is a method a subclass overrides, and the overall flow
lives in the base class. Strategy uses **composition** &mdash; the varying step is a separate
object injected into the context, with no inheritance relationship between the two. Strategy is
generally preferred where it fits, since it avoids binding the variation to a class hierarchy and
allows swapping at runtime rather than only at compile time (via subclassing).

## Iterator

**Problem:** Client code needs to traverse a collection's elements sequentially without exposing
the collection's internal representation (array, linked list, tree) or coupling the client to it.

**Solution:** A separate iterator object encapsulates traversal position and the "next element"
logic behind a uniform interface (`hasNext()`/`next()`), regardless of the underlying structure.

**Real-life analogy:** A TV remote's channel-up button &mdash; you press "next" repeatedly to move
through channels one at a time, with no idea (and no need to know) whether the TV stores its
channel list as an array, a linked list, or something else internally.

```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
}
```

This is built directly into Java as the `Iterable`/`Iterator` interfaces (and is what powers the
for-each loop under the hood) &mdash; one of the clearest examples of a GoF pattern becoming a
first-class language feature rather than something developers hand-roll.

:::info Interview Questions
<BehavioralPatternsIQuestions/>
:::
