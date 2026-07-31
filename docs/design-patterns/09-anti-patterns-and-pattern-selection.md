---
title: Anti-Patterns & Pattern Selection
sidebar_label: Anti-Patterns & Selection
---

import AntiPatternsAndPatternSelectionQuestions from './_partials/09-anti-patterns-and-pattern-selection-questions.mdx';

# Anti-Patterns & Pattern Selection

Knowing all 23 GoF patterns by name is table stakes; recognizing when a pattern is being *misused*,
and being able to pick the right one under interview time pressure, is what actually separates
candidates. This closing page covers the common anti-patterns and a practical heuristic for
"design me a ___" whiteboard questions.

## God Object

A single class that knows about or does far too much &mdash; validation, persistence, business
logic, formatting output &mdash; instead of responsibilities being split across focused
collaborators. It's the direct opposite of the **Single Responsibility Principle** and tends to
accumulate because it's always locally easier to add "just one more thing" to a class that already
does everything than to introduce a new collaborator. It's recognizable by symptoms rather than a
line count: a class that half the codebase imports, that no one fully understands, and that every
unrelated feature seems to require touching.

## Singleton abuse

Using Singleton not because the domain genuinely requires exactly one instance, but as a
convenient way to smuggle a global variable/global mutable state into an OO codebase while it
*looks* like a design pattern. The tell: if two different tests can't run in isolation because they
both touch the same Singleton's mutable state and step on each other, that Singleton is functioning
as global state, not as a legitimate single-instance constraint. The general fix is to inject the
dependency (see [Dependency Injection & Enterprise Patterns](./07-dependency-injection-and-enterprise-patterns.md))
rather than have every class reach out to a static `getInstance()` &mdash; that keeps the
dependency visible and swappable in tests instead of hidden and global.

## Golden Hammer

Reaching for one familiar pattern/tool to solve every problem, regardless of whether it actually
fits ("if all you have is Observer, every problem looks like pub/sub"). Often shows up as
over-applying Strategy or Factory where a simple `if` statement or direct instantiation would be
clearer &mdash; patterns exist to manage *genuine* variation and complexity, and adding one where
there's no real variation just adds indirection without benefit.

## Pattern for pattern's sake (over-engineering)

Introducing a pattern's full machinery to solve a problem that doesn't exist yet, on the
speculation that it might later ("we might need multiple payment providers eventually, so let's
build an Abstract Factory now" when there's exactly one provider today). This trades immediate
simplicity for flexibility the codebase may never need, and the resulting indirection makes the
*actual* current behavior harder to trace through. The general rule worth stating in an interview:
introduce a pattern when a second concrete variant *actually exists* or is *concretely* imminent,
not speculatively.

## Anemic Domain Model

A backend-specific anti-pattern worth knowing alongside the GoF list: entity/domain classes that
are pure data bags (fields + getters/setters, no behavior), with all actual business logic living
in separate "service" classes that operate on them. This inverts object-oriented design (behavior
divorced from the data it operates on) and is extremely common in layered Spring/JPA codebases,
which is exactly why it's worth flagging &mdash; it's not a mistake exclusive to junior code, it's
often the default shape a `@Entity` + `@Service` layering falls into unless someone actively pushes
back on it.

## A heuristic for "design me a ___" interview questions

1. **Name the actual variation point first.** Before naming a pattern, state in one sentence what
   varies (which algorithm runs, what gets created, how two incompatible interfaces connect) and
   what stays fixed. Most pattern-selection mistakes come from skipping straight to a pattern name
   before pinning down what's actually varying.
2. **Match the variation's *kind* to a category**: object creation → creational; how pieces are
   composed/wrapped → structural; how responsibility/communication flows → behavioral; coordinating
   across threads → concurrency; structuring an app's layers → enterprise/architectural.
3. **State the tradeoff, not just the name.** Naming "Strategy" without adding "...instead of a
   subclass per variant, so new variants don't require touching the context class" signals
   memorization rather than understanding.
4. **Actively ask whether a pattern is even needed.** If there's only one concrete variant today,
   say so explicitly and note you'd introduce the pattern once (or if) a second one appears &mdash;
   this is the single easiest way to show restraint instead of Golden Hammer/over-engineering
   reflexes.

## Quick reference: symptom → candidate pattern(s)

| Symptom | Candidate pattern(s) |
|---|---|
| Long `if/else` or `switch` choosing an algorithm | Strategy |
| Object's behavior should change entirely based on its own internal state | State |
| Need exactly one instance, globally accessible | Singleton |
| Subclass explosion from every combination of optional features | Decorator (behavior) or Builder (construction) |
| Two existing, incompatible interfaces need to work together | Adapter |
| A complex subsystem needs a simple entry point | Facade |
| Need to control/defer/guard access to an object | Proxy |
| Tree of parts and wholes that should be treated uniformly | Composite |
| Many objects need to be created together, consistently, as a swappable family | Abstract Factory |
| One class controls subclass creation | Factory Method |
| Object construction has many optional parameters | Builder |
| Many objects need to be notified of one object's changes | Observer |
| A request needs to be queued, logged, undone, or passed around | Command |
| Same algorithm skeleton, differing steps, across several classes | Template Method |
| One of several handlers should process a request, sender doesn't know which | Chain of Responsibility |
| Many objects would otherwise reference each other directly (tangled web) | Mediator |
| Need to save/restore an object's state without exposing its internals | Memento |
| Need a new operation across a stable set of unrelated classes | Visitor |
| Fast producer, slow consumer (or vice versa), need decoupling | Producer-Consumer |
| Too many threads created per unit of work | Thread Pool |
| Need an eventual async result without blocking the caller | Future / Promise |

:::info Interview Questions
<AntiPatternsAndPatternSelectionQuestions/>
:::
