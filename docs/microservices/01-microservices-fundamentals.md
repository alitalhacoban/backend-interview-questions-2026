---
title: Microservices Fundamentals
sidebar_label: Fundamentals
---

import MicroservicesFundamentalsQuestions from './_partials/01-microservices-fundamentals-questions.mdx';

# Microservices Fundamentals

Microservices interviews almost always open with definitions and naming-confusion pairs before
getting into communication patterns or distributed transactions. Candidates who can draw a Saga
diagram but can't cleanly say what actually makes something "a microservice" (versus just "a
service," or "a module") lose points on the easiest part of the interview. This page builds the
vocabulary the rest of this topic assumes.

## What a microservice actually is

A **microservice** is a small, independently deployable service that owns a single business
capability end-to-end &mdash; its own code, its own data, and its own release lifecycle &mdash;
and communicates with other services over the network rather than through in-process function
calls. "Small" is not measured in lines of code; it's measured in scope: a microservice should be
ownable by a single team and changeable without coordinating a release with every other team.

The **microservices architecture** is the practice of building a system as a suite of these
services instead of as one large deployable unit. It trades simplicity (one codebase, one
deployment, in-process calls) for independent scalability, independent deployability, and fault
isolation &mdash; at the cost of new problems that simply don't exist in a single process: network
latency, partial failure, distributed data consistency, and operational complexity. Sections
[Service Communication](./02-service-communication.md), [Data Management & Distributed
Transactions](./04-data-management-and-transactions.md), and [Resilience
Patterns](./05-resilience-patterns.md) cover exactly those new problems.

## Monolith vs. microservices vs. SOA

- **Monolith** &mdash; a single deployable unit containing all of an application's functionality.
  Components talk to each other via in-process function calls, share one codebase, one build, one
  deployment, and (usually) one database. Nothing wrong with this by default &mdash; most systems
  should start monolithic.
- **Microservices** &mdash; many small, independently deployable services, each owning its own
  data, communicating over the network (HTTP/gRPC/messaging). Optimizes for independent scaling
  and deployment at the cost of distributed-systems complexity.
- **SOA (Service-Oriented Architecture)** &mdash; the older, broader architectural style
  microservices grew out of. SOA also decomposes a system into services, but classically relies on
  a centralized **Enterprise Service Bus (ESB)** for routing, transformation, and orchestration
  between services, and services are often larger and more coarse-grained than microservices.
  Microservices are usually described as "SOA done with smart endpoints and dumb pipes" &mdash;
  logic lives in the services themselves (or in a thin [API
  gateway](./03-api-gateway-and-service-discovery.md)), not in a heavyweight central bus, and
  services are deliberately kept smaller and independently deployable.

A useful mental model: monolith → SOA → microservices is a spectrum of increasing decomposition and
decreasing centralized coordination, not three unrelated ideas.

## Service vs. module vs. component

This is the second most common naming-confusion question in this space:

- A **module** (or **component**) is a unit of code organization *within* a single deployable
  &mdash; a package, a JAR, a namespace. It's separated at compile time, not at runtime. Two
  modules in the same monolith still run in the same process, share the same memory, and are
  deployed together.
- A **service**, in the microservices sense, is a unit of *runtime* and *deployment* separation.
  It runs in its own process (or container), can be deployed independently, and is reached over
  the network, not a function call.

A "modular monolith" &mdash; a monolith with clean module boundaries and no cross-module database
access &mdash; is a legitimate, often underrated middle ground: it gets much of the maintainability
benefit of service boundaries without paying the distributed-systems tax. Many teams that adopt
microservices too early would have been better served by a modular monolith first, then splitting
modules into services only once a specific one needs independent scaling or deployment.

## Bounded contexts and Domain-Driven Design

Deciding *where* to draw service boundaries is the hardest part of microservices design, and the
standard vocabulary for it comes from **Domain-Driven Design (DDD)**. A **bounded context** is an
explicit boundary within which a particular domain model and its terminology are consistent and
unambiguous. The same word can mean different things in different bounded contexts &mdash; "order"
means something different to the *Ordering* service than it does to the *Shipping* service &mdash;
and that's expected, not a bug.

The rule of thumb interviewers look for: **one microservice should map to (at most) one bounded
context.** Splitting a single bounded context across multiple services tends to produce exactly the
chatty, tightly-coupled services covered in [Anti-Patterns &
Trade-offs](./09-anti-patterns-and-trade-offs.md); combining multiple unrelated bounded contexts
into one service produces a monolith with extra network hops instead of a monolith with none.

## When microservices are (and aren't) the right call

Microservices solve organizational and scaling problems, not correctness problems. They're worth
the cost when:

- Different parts of the system need to **scale independently** (e.g. a checkout service under
  10x more load than an admin dashboard).
- **Multiple teams** need to ship independently without blocking on each other's release trains.
- Different parts of the system have genuinely different **technology or reliability
  requirements**.

They're usually the wrong call when:

- The team is small enough that coordination overhead was never the bottleneck.
- The domain boundaries aren't well understood yet &mdash; splitting before you know where the
  seams are tends to produce services that constantly need to call back and forth across the
  network for what should have been a single in-process operation (see [Anti-Patterns &
  Trade-offs](./09-anti-patterns-and-trade-offs.md)).
- The team doesn't yet have the operational maturity (CI/CD, monitoring, on-call practices) to run
  many independently deployed services &mdash; a monolith that's hard to reason about is still
  easier to run than ten services that are each individually simple but collectively opaque.

A common, defensible answer in interviews: **start with a well-factored monolith, and extract
services only when a specific, measured pain point (scaling, deployment coupling, team contention)
justifies the added operational cost.**

:::info Interview Questions
<MicroservicesFundamentalsQuestions/>
:::
