---
title: Behavioral Patterns II
sidebar_label: Behavioral Patterns II
---

import BehavioralPatternsIiQuestions from './_partials/05-behavioral-patterns-ii-questions.mdx';

# Behavioral Patterns II

The second half of the GoF behavioral patterns: State, Chain of Responsibility, Mediator, Memento,
and Visitor. These come up less often as "implement this from scratch" questions than the five in
[Behavioral Patterns I](./04-behavioral-patterns-i.md), but naming-confusion questions between
State/Strategy and Mediator/Observer are common, and Chain of Responsibility is worth recognizing
since it's what most web frameworks' middleware/filter chains actually are.

## State

**Problem:** An object's behavior needs to change entirely based on its internal state, and
representing that with a field plus conditional branches everywhere (`if (state == OPEN) ... else
if (state == CLOSED) ...`) scatters the same state-check across every method and gets unmanageable
as states/transitions grow.

**Solution:** Extract each state into its own class implementing a common interface; the context
object holds a reference to its *current* state object and delegates behavior to it. Transitions
are handled by swapping which state object the context holds.

**Real-life analogy:** A vending machine &mdash; pressing a button behaves completely differently
depending on whether the machine is in "waiting for coins," "has enough credit," or "out of stock"
state. It's the same button and the same machine, but what happens is entirely dictated by which
state it's currently in, and each transaction can move it into a different state.

```java
interface OrderState {
    void ship(Order order);
}
class PaidState implements OrderState {
    public void ship(Order order) { order.setState(new ShippedState()); /* dispatch */ }
}
class ShippedState implements OrderState {
    public void ship(Order order) { throw new IllegalStateException("already shipped"); }
}
```

**State vs. Strategy, precisely**: they're structurally identical (a context holds a reference to
an interchangeable interface implementation) — the difference is entirely about *intent and who
controls the swap*. In Strategy, the *client* chooses and injects the strategy, and the strategies
generally don't know about each other. In State, the *state objects themselves* usually trigger
transitions to the next state (as `PaidState.ship()` does above), and the context's behavior is
meant to change automatically as its internal state evolves, without the client managing that.

## Chain of Responsibility

**Problem:** A request needs to be handled by one of several possible handlers, but the sender
shouldn't need to know which handler will end up processing it, and the set of handlers/their order
should be configurable independently of the sender.

**Solution:** Chain handler objects together; each handler either processes the request itself or
passes it to the next handler in the chain, without the sender coordinating any of that.

**Real-life analogy:** An expense reimbursement request at a company &mdash; your manager can
approve up to $1,000; anything above that gets forwarded to the director; anything above the
director's limit goes to a VP. You submit one request and have no idea in advance which level
will actually approve it &mdash; each approver either handles it or passes it up the chain.

```java
abstract class Handler {
    protected Handler next;
    Handler setNext(Handler next) { this.next = next; return next; }
    abstract void handle(Request r);
}
class AuthHandler extends Handler {
    void handle(Request r) {
        if (!r.isAuthenticated()) { reject(r); return; }
        if (next != null) next.handle(r);
    }
}
```

This is exactly what **servlet filters**, Spring's `HandlerInterceptor` chain, and most web
frameworks' middleware pipelines are: each filter/middleware either short-circuits the request or
calls the next one in the chain, and the chain's composition is configured separately from any of
the individual handlers.

## Mediator

**Problem:** Many objects need to communicate with each other, and letting each one hold direct
references to all the others produces a tangled many-to-many web of dependencies that's hard to
change or reason about.

**Solution:** Introduce a single mediator object that all the participants talk to instead of
talking to each other directly; the mediator centralizes the coordination logic, turning many-to-many
coupling into many-to-one.

**Real-life analogy:** An airport control tower &mdash; pilots don't communicate directly with
every other plane in the sky to coordinate takeoffs and landings; every plane talks only to the
tower, and the tower coordinates all of them. Remove the tower and you'd need every pilot
coordinating directly with every other pilot, which doesn't scale.

**Mediator vs. Observer**: both decouple communicating objects, which makes them easy to conflate.
Observer is one-directional and anonymous &mdash; a subject broadcasts to observers that subscribed,
without knowing or caring who they are, and observers don't talk back through the subject. Mediator
is bidirectional and central &mdash; participants explicitly go through the mediator to talk *to
each other*, and the mediator often contains real coordination/business logic (e.g. a dialog
box mediator disabling a "Submit" button until several other fields are valid), not just a
notify-list. In practice, a Mediator is often implemented *using* Observer internally (participants
notify the mediator, which then notifies other participants).

## Memento

**Problem:** You need to capture and later restore an object's internal state (for undo, or
checkpointing) without violating encapsulation &mdash; without exposing that internal state to the
code doing the saving/restoring.

**Solution:** The object itself produces an opaque **memento** snapshot of its own state (only it
knows the internal representation) and can later restore itself from one; the caretaker that stores
mementos for later never reads or modifies their contents, just holds onto them.

**Real-life analogy:** A video game save point &mdash; the game writes a save file capturing
everything about your current progress, and you can later load that file to return to exactly that
point. You (the player) never need to know or touch the internal format of the save file; you just
hand it back to the game to restore from.

```java
class Editor {
    private String content;
    Memento save() { return new Memento(content); }         // opaque to the caller
    void restore(Memento m) { this.content = m.getSaved(); } // only Editor can read it back
}
```

Memento pairs naturally with Command for undo/redo: each executed Command can save a Memento before
running, and undo restores it.

## Visitor

**Problem:** You need to add a new operation across a set of unrelated classes in an object
structure (e.g. "export," "pretty-print," "compute total") without modifying each of those classes
every time a new operation is needed.

**Solution:** Define a `Visitor` interface with one `visit()` overload per concrete element type;
each element class implements an `accept(Visitor v)` method that calls back `v.visit(this)`. This
**double dispatch** (the call is routed based on both the element's runtime type *and* the
visitor's type) is what lets the right `visit()` overload run without `instanceof` checks.

**Real-life analogy:** A tax auditor visiting different types of accounts &mdash; checking,
savings, and investment accounts are all very different, but the auditor (visitor) can apply a
brand-new rule ("calculate this year's tax treatment") across all of them without the bank having
to modify a single one of its account classes. Next year's new rule is just a new auditor visiting
the same unchanged accounts.

```java
interface ShapeVisitor { void visit(Circle c); void visit(Square s); }
interface Shape { void accept(ShapeVisitor v); }
class Circle implements Shape { public void accept(ShapeVisitor v) { v.visit(this); } }
```

Adding a new operation means writing one new `Visitor` implementation, touching zero existing
element classes. The tradeoff runs the other way, though: adding a *new element type* means
touching every existing Visitor implementation to add a `visit()` overload for it &mdash; the
inverse of Strategy/Template Method's tradeoff. This is why Visitor is comparatively rare in
practice: it's a good fit only when the set of element types is stable and the set of operations
grows, which is a less common shape in most application codebases than the other way around.

:::info Interview Questions
<BehavioralPatternsIiQuestions/>
:::
