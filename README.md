# Backend Interview Questions 2026

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/docs-live%20site-3ecc5f)](https://alitalhacoban.github.io/backend-interview-questions-2026/)

**Backend Interview Questions 2026** is a free, open-source reference of **337 backend
engineering interview questions and answers**, covering Java, Spring Boot, Kafka, DBMS, Design
Patterns, and Microservices. Each topic explains how the technology actually works &mdash; not
just definitions &mdash; paired with diagrams, real Java/Spring Boot code examples, and interview
questions. Built with [Docusaurus](https://docusaurus.io/).

It's aimed at backend developers with roughly 0-2 years of experience preparing for interviews
that go beyond surface-level definitions, but should be a useful refresher for anyone.

**Browse the live site: [alitalhacoban.github.io/backend-interview-questions-2026](https://alitalhacoban.github.io/backend-interview-questions-2026/)**

### Contents

- [What's covered so far](#whats-covered-so-far)
- [Sample questions](#sample-questions)
- [Content structure](#content-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)

## What's covered so far

337 questions across 6 topics so far:

- **Kafka** (44 questions) &mdash; architecture and fundamentals, producer internals, consumer
  groups and rebalancing, delivery semantics, replication and ISR, the outbox/inbox pattern, and
  common production pitfalls.
- **Java Core** (50 questions) &mdash; OOP fundamentals, the JVM and memory model, the collections
  framework, exception handling, concurrency, generics and type erasure, streams and functional
  interfaces, and string/object contracts.
- **Spring Boot** (61 questions) &mdash; Spring and Spring Boot fundamentals, IoC and dependency
  injection, auto-configuration and starters, Spring MVC and REST, Spring Data JPA and
  transactions, AOP and proxies, Spring Security, testing, configuration/profiles/Actuator, and
  design patterns as they actually show up in Spring's own APIs.
- **DBMS** (59 questions) &mdash; relational theory, keys and SQL, normalization, indexing,
  transactions and ACID, concurrency control and isolation levels, query optimization, storage and
  recovery, and replication/sharding/NoSQL.
- **Design Patterns** (64 questions) &mdash; GoF creational, structural, and behavioral patterns,
  Singleton and thread safety, dependency injection and enterprise patterns, concurrency patterns,
  and anti-patterns/pattern selection.
- **Microservices** (59 questions) &mdash; microservices fundamentals, service communication, API
  gateways and service discovery, data management and distributed transactions, resilience
  patterns, observability, deployment and orchestration, security, and anti-patterns/trade-offs.

More topics (PostgreSQL, Redis, distributed systems, API security, and others) will be added over
time. This is a living project: expect new topics and new questions to show up on existing pages
as the content grows.

## Sample questions

A taste of the depth &mdash; one question per topic, condensed. Full explanations, diagrams, and
code live on the site.

**Q: What's the difference between a Kafka topic and a traditional message queue?**
A: A traditional queue (RabbitMQ, ActiveMQ) removes a message once a worker consumes it, and
workers compete for individual messages. Kafka is an append-only, distributed commit log: messages
aren't deleted on read, multiple independent consumer groups can each read the full stream, and a
new consumer can replay history from the beginning.
[Read more →](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/kafka/fundamentals)

**Q: What's the practical difference between an abstract class and an interface in modern Java?**
A: An abstract class can hold instance state and a constructor but a class can extend only one; an
interface can't hold instance state (only constants) but a class can implement many. Use an
abstract class when subclasses share real state/implementation in a genuine "is-a" hierarchy; use
an interface to define a capability unrelated classes can plug into.
[Read more →](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/java-core/oop-fundamentals)

**Q: What is Spring Boot, and is it a replacement for the Spring Framework?**
A: No &mdash; Spring Boot is built directly on top of the Spring Framework, not a replacement for
it. It's an opinionated layer that eliminates setup boilerplate via auto-configuration, curated
starter dependencies, an embedded server, and production-ready features like Actuator.
[Read more →](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/spring-boot/spring-and-spring-boot-fundamentals)

**Q: What's the difference between OLTP and OLAP systems?**
A: OLTP handles a high volume of short, simple transactions (inserts, point updates) and is
optimized for fast writes on row-oriented storage. OLAP handles complex, read-heavy analytical
queries over large historical datasets and is optimized with columnar storage for
scanning/aggregating many rows across few columns.
[Read more →](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/dbms/dbms-fundamentals)

**Q: What's the difference between a design pattern and an anti-pattern?**
A: A design pattern is a proven solution. An anti-pattern is a commonly-repeated shape that looks
reasonable but reliably causes problems &mdash; e.g. God Object, Singleton abuse, Golden Hammer.
It's not "the opposite" of a pattern, it's a recognizable recurring shape that experience shows is
bad.
[Read more →](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/design-patterns/design-patterns-fundamentals)

**Q: What's the difference between a monolith, microservices, and SOA?**
A: A monolith is a single deployable unit where components talk via in-process calls and usually
share one database. Microservices are many small, independently deployable services, each owning
its own data, communicating over the network. SOA is the broader, older style microservices grew
out of, classically relying on a centralized Enterprise Service Bus for routing/orchestration.
[Read more →](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/microservices/microservices-fundamentals)

Every question on the site (with a condensed answer, grouped by subtopic) also lives in the
[Question Bank](https://alitalhacoban.github.io/backend-interview-questions-2026/docs/question-bank/kafka)
for fast self-testing.

## Content structure

All content lives under `docs/`, organized as one folder per topic:

```
docs/
  kafka/
    _category_.json          # sidebar label + ordering for the topic
    _partials/                # question lists, imported below - excluded from routing/sidebar
      01-fundamentals-questions.mdx
      ...
    01-fundamentals.md
    02-producer-internals.md
    03-consumer-and-groups.md
    04-delivery-semantics.md
    05-replication-and-isr.md
    06-outbox-and-inbox-pattern.md
    07-common-pitfalls.md
  question-bank/
    _category_.json          # pinned to the bottom of the sidebar (position: 100)
    kafka.mdx                # every Kafka question with its answer, grouped by subtopic
```

- Sidebar ordering is controlled by numeric filename prefixes (`01-`, `02-`, ...).
- Each topic folder has its own `_category_.json` controlling its sidebar label and position.
- The sidebar (`sidebars.js`) auto-generates from this folder structure, so a new topic folder
  with its own `_category_.json` shows up automatically &mdash; no config changes required.
- Each page's "Interview Questions" callout is single-sourced: the bullet list lives in a partial
  file under that topic's `_partials/` folder (ignored by Docusaurus routing because of the `_`
  prefix) and is imported by the explanation page. This is where the *question-only* prompt right
  after the explanation lives.
- `question-bank/<topic>.mdx` is a separate, hand-written page: a question followed immediately by
  a short answer, for every question on the site, grouped by subtopic with one link per group back
  to the full explanation. It exists for quick self-testing without re-reading the prose, so its
  content is intentionally not generated from the `_partials/` files &mdash; the answers there are
  condensed summaries, not duplicates of the full explanation.
- Diagrams use [Mermaid](https://mermaid.js.org/) (via `@docusaurus/theme-mermaid`), rendered
  directly from fenced ` ```mermaid ` code blocks in Markdown.
- Search is local/offline (via `@easyops-cn/docusaurus-search-local`) &mdash; no external service
  or account required.
- Internationalization is configured (`i18n.defaultLocale: 'en'`) so additional locales can be
  added later without restructuring, though only English content exists today.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys it
to GitHub Pages via GitHub Actions. In the repository's **Settings → Pages**, the source must be
set to **GitHub Actions** for this to work.

## Contributing

This is primarily a personal study reference, but corrections, clarifications, and new topics are
welcome:

### Running locally

Requires Node.js 20+.

```bash
npm install
npm start
```

This starts the local dev server (with live reload) at `http://localhost:3000/backend-interview-questions-2026/`.

To produce a static production build:

```bash
npm run build
npm run serve
```

### Steps

1. Fork the repo and create a branch for your change.
2. Follow the existing content structure for any new page: short intro, concept explanation, a
   diagram where it helps, a realistic code example, and an "Interview Questions" callout at the
   end. Put the questions themselves in a partial under that topic's `_partials/` folder and
   import it into the callout (see `docs/kafka/_partials/` for the pattern) &mdash; don't inline
   the bullet list directly in the page.
3. Add the same question to `docs/question-bank/<topic>.mdx` (create it, following
   `docs/question-bank/kafka.mdx`, if this is a brand-new topic folder), directly followed by a
   short answer, in the subtopic's section.
4. Run `npm start` locally and confirm both the page and its Question Bank entry render as
   expected before opening a PR.
5. If you added a brand-new topic folder, update the topic list and question counts in this
   README's [What's covered so far](#whats-covered-so-far) section and the `## Topics` list in
   `static/llms.txt` so they don't go stale.
6. Open a pull request describing what you added or changed and why.
