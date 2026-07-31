---
title: Design Patterns Fundamentals
sidebar_label: Fundamentals
---

import DesignPatternsFundamentalsQuestions from './_partials/01-design-patterns-fundamentals-questions.mdx';

# Design Patterns Fundamentals

Design pattern interviews rarely start with "implement Observer." They start with definitional
questions that separate candidates who've memorized `UML` diagrams from ones who understand why
the pattern exists at all &mdash; what problem it solves, what it costs, and when *not* to reach
for it. This page builds that vocabulary before the rest of this topic works through the patterns
themselves.

## What a design pattern actually is

A **design pattern** is a named, reusable solution to a problem that recurs in a particular
context in object-oriented design &mdash; not a finished piece of code you copy-paste, but a
*template* for structuring classes and objects that you adapt to your own types and constraints.
The name itself is most of the value: saying "let's use a Decorator here" communicates an entire
structural approach (wrap the object, delegate, add behavior at each layer) in three words, to
anyone who already knows the pattern.

This distinguishes patterns from:

- **Libraries/frameworks** &mdash; code you call directly. A pattern has no artifact to import; you
  re-implement its shape every time, in whatever language you're using.
- **Algorithms** &mdash; a pattern solves a *structural/design* problem (how classes relate, how
  responsibilities are divided), not a computational one (how to sort a list fastest).

The canonical catalog is the 1994 **Gang of Four (GoF)** book, *Design Patterns: Elements of
Reusable Object-Oriented Software*, by Gamma, Helm, Johnson, and Vlissides. It defines 23 patterns
split into three categories, covered in the next three pages of this topic.

## The three GoF categories

| Category | Question it answers | Examples |
|---|---|---|
| **Creational** | How are objects created? | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Structural** | How are classes/objects composed into larger structures? | Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight |
| **Behavioral** | How do objects communicate and distribute responsibility? | Strategy, Observer, Command, Template Method, Iterator, State, Chain of Responsibility, Mediator, Memento, Visitor |

Creational patterns decouple *what* gets created from *who* creates it and *how*. Structural
patterns decouple interface from implementation so pieces can be composed without one depending on
another's concrete shape. Behavioral patterns decouple *which* algorithm/object handles a request
from the code that issues the request. Every GoF pattern falls cleanly into exactly one of these
three buckets &mdash; a fast way to sanity-check "have I actually named a real pattern" is to ask
which of these three questions it answers.

This topic also covers two families that sit *outside* the original 23: **concurrency patterns**
(Producer-Consumer, Thread Pool, Future/Promise &mdash; see
[Concurrency Patterns](./08-concurrency-patterns.md)) that address coordinating work across
threads, and **enterprise/architectural patterns** (Repository, DAO, DTO, Dependency Injection
&mdash; see [Dependency Injection & Enterprise Patterns](./07-dependency-injection-and-enterprise-patterns.md))
that address structuring an application's layers rather than a single class hierarchy. Both come
up constantly in backend interviews even though the GoF book predates threads-as-a-first-class-concern
and layered enterprise architecture as we practice it today.

## Pattern vs. anti-pattern

A **design pattern** is a proven solution; an **anti-pattern** is a *commonly-repeated* solution
that looks reasonable but reliably causes problems &mdash; it's not "the opposite of a pattern," it's
a pattern in the loose sense (a recognizable, recurring shape) that experience has shown to be bad.
Examples: the **God Object** (one class that knows/does everything, the opposite of single
responsibility), **Singleton abuse** (using Singleton as a disguised global variable instead of for
a genuine single-instance constraint), and **Golden Hammer** (reaching for one familiar pattern to
solve every problem regardless of fit). [Anti-Patterns & Pattern Selection](./09-anti-patterns-and-pattern-selection.md)
covers these in depth &mdash; recognizing them is as valuable in an interview as naming the 23 real
patterns.

## Pattern vs. idiom vs. architectural pattern

Three terms that get used interchangeably but describe solutions at different *scales*:

- **Idiom** &mdash; a low-level, language-specific convention, often invisible once you know the
  language (try-with-resources in Java, RAII in C++). Not portable across languages.
- **Design pattern** &mdash; a mid-level, language-agnostic solution to a recurring
  *class/object-design* problem (Singleton, Observer). Portable across any OO language.
- **Architectural pattern** &mdash; a high-level solution to structuring an entire
  *application/system* (MVC, layered architecture, microservices, event-driven architecture).
  Broader in scope than a single pattern &mdash; an architecture is typically built from many
  design patterns working together.

## Design patterns and SOLID

Design patterns are best understood as **applied SOLID principles** &mdash; concrete shapes that
fall out of following those principles consistently, not a separate topic. Strategy and Template
Method are direct expressions of the **Open/Closed Principle** (add new behavior via a new
implementation, without modifying existing code). Dependency Injection (see
[Dependency Injection & Enterprise Patterns](./07-dependency-injection-and-enterprise-patterns.md))
is the **Dependency Inversion Principle** made concrete. Decorator and Adapter both lean on
**Liskov Substitution** (a wrapped/adapted object must still honor the original interface's
contract). Recognizing this connection is useful in interviews: if you're asked to fix a SOLID
violation, naming the pattern that resolves it (and vice versa) shows you understand *why* the
pattern exists, not just its class diagram.

## Reading pattern diagrams

Pattern descriptions are usually accompanied by a UML class diagram. The arrows that matter most:

- **Inheritance/realization** (hollow triangle arrow) &mdash; "is-a." A solid line + hollow triangle
  is `extends`; a dashed line + hollow triangle is `implements`.
- **Association** (plain arrow) &mdash; one class holds a reference to another, but each can
  outlive the other independently.
- **Aggregation** (hollow diamond) &mdash; a "has-a, weak ownership" relationship: the contained
  object can exist independently of the container (a `Team` has `Player`s who can exist without
  the team).
- **Composition** (filled diamond) &mdash; a "has-a, strong ownership" relationship: the contained
  object's lifecycle is bound to the container's (a `House` is composed of `Room`s that don't
  exist once the house is destroyed).

Most GoF pattern diagrams are dominated by association and realization arrows because the whole
point of most patterns is programming to an interface, not an inheritance hierarchy &mdash; a
detail worth calling out explicitly if asked to sketch one on a whiteboard.

:::info Interview Questions
<DesignPatternsFundamentalsQuestions/>
:::
