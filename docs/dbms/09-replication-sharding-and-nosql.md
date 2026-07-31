---
title: Replication, Sharding & NoSQL
sidebar_label: Replication & Scaling
---

import ReplicationShardingAndNosqlQuestions from './_partials/09-replication-sharding-and-nosql-questions.mdx';

# Replication, Sharding & NoSQL

A single database server eventually runs out of room to scale vertically (bigger box), and it's a
single point of failure. This page covers the two orthogonal ways to scale a database beyond one
machine &mdash; copying data (replication) and splitting it (sharding) &mdash; and where NoSQL
systems sit relative to the tradeoffs that scaling forces.

## Replication

**Replication** keeps copies of the same data on multiple nodes, primarily for availability (a
replica can take over if the primary fails) and read scaling (reads can be spread across replicas).

- **Master-slave (primary-replica) replication** &mdash; one node accepts all writes; one or more
  read-only replicas receive a stream of changes from it. Simple, avoids write conflicts by
  construction, but the primary is still a single point of failure for writes and a bottleneck for
  write throughput.
- **Multi-master replication** &mdash; more than one node accepts writes, and changes propagate
  between them. Removes the single-writer bottleneck but introduces write-conflict resolution
  (last-write-wins, vector clocks, application-level merge logic) as a hard problem.

**Synchronous vs. asynchronous replication** is about *when* a write is considered durable:

- **Synchronous** &mdash; the primary waits for at least one replica to confirm the write before
  acknowledging it to the client. Zero data loss on failover, but adds latency to every write and
  can block writes entirely if a replica is unreachable.
- **Asynchronous** &mdash; the primary acknowledges the write immediately and replicates in the
  background. Faster writes, but a primary crash before replication completes means that write is
  lost on failover (**replication lag** is the resulting window of risk).

## Sharding vs. partitioning

This is the classic naming-confusion pair here: **partitioning** is the general concept of
splitting a table's data into smaller pieces; **sharding** specifically means splitting data across
*separate database servers/nodes* (horizontal partitioning across machines, not just within one).
Some engines also support **partitioning within a single node** (e.g. Postgres table partitioning
by date range) purely for manageability and query pruning, without it being sharding at all.

- **Horizontal partitioning (sharding)** &mdash; different *rows* of the same logical table live on
  different nodes (e.g. users 1–1M on shard A, users 1M–2M on shard B).
- **Vertical partitioning** &mdash; different *columns* live in different places (e.g. splitting a
  wide `users` table into frequently-accessed core fields and rarely-accessed profile fields, or
  literally moving some columns to a different database).

Common sharding strategies:

- **Range-based** &mdash; shard by a value range (e.g. by date, or ID range). Simple, but can create
  hot spots if traffic skews toward one range (e.g. always the most recent dates).
- **Hash-based** &mdash; shard key is hashed to pick a node, spreading load evenly, but range
  queries ("all orders from March") now have to fan out to every shard instead of hitting one.
- **Directory-based** &mdash; a lookup service maps keys to shards explicitly, most flexible but
  adds an extra hop and a new single point of failure to protect.

The hardest part of sharding in practice isn't picking a strategy, it's that operations spanning
multiple shards (joins, multi-row transactions, unique constraints across shards) become
significantly harder or are simply given up on.

## The CAP theorem

In a distributed system, when a **network partition** occurs (nodes can't talk to each other), you
must choose between:

- **Consistency** &mdash; every read gets the most recent write, or an error.
- **Availability** &mdash; every request gets a (non-error) response, even if it might not reflect
  the latest write.

You cannot have both during a partition (you always have to give up one of C or A when P happens;
Partition tolerance itself isn't really optional for a distributed system, so CAP in practice is
about choosing your priority between C and A specifically during a partition event). Traditional
single-node RDBMSes sidestep this by not being partition-tolerant distributed systems at all.
Distributed NoSQL systems make an explicit choice: e.g. traditional Cassandra/DynamoDB configurations
lean **AP** (favor availability, accept eventually-consistent reads &mdash; the BASE model from
[DBMS Fundamentals](./01-dbms-fundamentals.md#acid-vs-base)), while systems like traditional
MongoDB/Zookeeper-style configurations lean **CP** (favor consistency, refuse requests rather than
serve stale/conflicting data during a partition).

## When to choose NoSQL over an RDBMS

NoSQL is worth reaching for when: the schema is genuinely variable or evolving fast per record
(document stores), the access pattern is simple key-based lookups at very high throughput
(key-value stores), the data is naturally huge, flat, and write-heavy with few cross-entity joins
(wide-column stores), or the core queries are relationship traversals many hops deep (graph
databases) where SQL joins would be unwieldy. It's the wrong choice when the domain is genuinely
relational (lots of entities with real referential integrity needs) and you'd otherwise be
reinventing joins and transactions in application code just to avoid using SQL.

:::info Interview Questions
<ReplicationShardingAndNosqlQuestions/>
:::
