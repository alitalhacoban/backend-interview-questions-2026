---
title: Anti-Patterns & Trade-offs
sidebar_label: Anti-Patterns & Trade-offs
---

import AntiPatternsAndTradeOffsQuestions from './_partials/09-anti-patterns-and-trade-offs-questions.mdx';

# Anti-Patterns & Trade-offs

Every pattern in this topic exists to solve a real problem, but each one is also easy to reach for
too early, too broadly, or in the wrong shape. This page covers the ways microservices most commonly
go wrong in practice, and closes the loop back to [Microservices
Fundamentals](./01-microservices-fundamentals.md)'s central question: when is this architecture
actually worth it?

## The distributed monolith

The single most common failure mode: a system that's *deployed* as many separate services but is
still, structurally, one tightly-coupled application &mdash; services share a database, deploy in
lockstep because their APIs are too tightly coupled to change independently, and a single feature
routinely requires coordinated changes across several services' codebases at once. This gets you
the worst of both worlds: all the network latency, partial-failure risk, and operational overhead of
microservices, with none of the independent-deployability benefit that was supposed to justify it.
It usually happens when service boundaries were drawn along technical lines (e.g. "the database
layer" as its own service) rather than along [bounded
contexts](./01-microservices-fundamentals.md#bounded-contexts-and-domain-driven-design) that
actually isolate business capabilities.

## Chatty services

Splitting what used to be a single in-process object graph into services means what used to be
in-memory method calls become network calls. A **chatty** design is one where completing a single
logical operation requires many small, sequential network calls between services &mdash;
effectively an **N+1 query problem** at the network layer instead of the database layer. Each
individual call might be fast, but their latencies stack, and each one is a new opportunity for
partial failure. The fix is usually to redraw the boundary (the two chatty services probably
belong in the same bounded context, or even the same service) or to change the interaction: batch
requests, use [API composition or a CQRS read
model](./04-data-management-and-transactions.md#querying-across-services) instead of many
sequential fine-grained calls, or push logic that needs tight, low-latency coordination into a
single service instead of splitting it.

## Shared database anti-pattern

Two or more services reading from (or worse, writing to) the same database defeats
[database-per-service](./04-data-management-and-transactions.md#database-per-service) and
re-couples services that were supposed to be independently deployable: one service's schema
migration can silently break another service that was never involved in that deployment. It often
appears as a shortcut during an initial monolith-to-microservices migration ("split the code, but
keep the one database for now") and, without deliberate follow-through, becomes permanent because
untangling shared tables later is far more work than not sharing them in the first place.

## Decomposing a monolith into services

When teams do decide to extract services from an existing monolith, the pattern most commonly
recommended over a rewrite is the **Strangler Fig pattern**: new functionality (and, incrementally,
extracted pieces of old functionality) is built as new services behind a routing layer (often the
[API gateway](./03-api-gateway-and-service-discovery.md)), while the old monolith keeps serving
everything not yet extracted. Over time, more traffic is routed to new services and less to the
monolith, until the monolith either shrinks to nothing or remains only for the parts that never
needed to change. This avoids the classic failure mode of a **big-bang rewrite**: months (or years)
of parallel development with no incremental value delivered, high risk of the rewrite never
actually catching up to the moving target of the still-changing original system.

## Over-decomposition ("nanoservices")

The opposite failure from the distributed monolith: splitting services so finely that each one is
too small to justify its own operational overhead (deployment pipeline, monitoring, on-call
surface) &mdash; sometimes called **nanoservices**. A service should map to a real [bounded
context](./01-microservices-fundamentals.md#bounded-contexts-and-domain-driven-design), not to
"one class" or "one database table." If two services almost always need to change together and are
never scaled or deployed independently in practice, that's a signal they were split too finely and
should probably be merged.

## Revisiting the trade-off

Every pattern in this topic &mdash; sagas, circuit breakers, service discovery, distributed
tracing, service meshes &mdash; exists specifically because splitting a system into services
introduces problems a monolith never had. None of them make the distributed system as simple as
the equivalent monolith would have been; they make a *justified* distributed system's problems
manageable. The strongest interview answer on "should we use microservices" names the actual
organizational or scaling pressure driving the decision (see [When microservices are (and aren't)
the right
call](./01-microservices-fundamentals.md#when-microservices-are-and-arent-the-right-call)), rather
than treating microservices as a default architecture that's simply more modern than a monolith.

:::info Interview Questions
<AntiPatternsAndTradeOffsQuestions/>
:::
