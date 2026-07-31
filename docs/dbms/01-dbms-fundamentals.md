---
title: DBMS Fundamentals
sidebar_label: DBMS Fundamentals
---

import DbmsFundamentalsQuestions from './_partials/01-dbms-fundamentals-questions.mdx';

# DBMS Fundamentals

Database questions in interviews almost always open with definitions and naming-confusion pairs
before moving into indexing or transactions. Candidates who can explain B-tree internals but stall
on "what's the difference between a DBMS and an RDBMS" lose points on the easiest part of the
interview. This page builds the vocabulary the rest of this topic assumes.

## What a DBMS actually is

A **Database Management System (DBMS)** is software that sits between applications and stored
data, providing a controlled, structured way to create, read, update, and delete that data. It is
not the data itself and not the disk it sits on &mdash; it's the layer that enforces structure,
handles concurrent access, and guarantees the data survives crashes.

Before DBMSes were standard, applications stored data directly in flat files (CSV, plain text). A
DBMS improves on that in a few concrete ways:

- **Concurrency control** &mdash; many users/processes can read and write safely at the same time
  without corrupting each other's changes (see [Concurrency Control & Isolation Levels](./06-concurrency-control-and-isolation.md)).
- **Data integrity** &mdash; constraints (foreign keys, uniqueness, type checks) are enforced by
  the system, not by every application that happens to touch the data.
- **Durability and recovery** &mdash; committed changes survive a crash or power loss (see
  [Storage, Buffer Management & Recovery](./08-storage-and-recovery.md)).
- **Query capability** &mdash; a declarative language (SQL, for relational systems) instead of
  every application hand-rolling its own file-parsing and search logic.
- **Redundancy control** &mdash; normalization (see [Normalization & Schema Design](./03-normalization-and-schema-design.md))
  reduces the same fact being duplicated and going out of sync across files.

## DBMS vs. RDBMS

This is the single most common naming-confusion question in this space. **DBMS** is the general
term for any system that manages data. **RDBMS (Relational DBMS)** is a specific *kind* of DBMS
that organizes data into tables with rows and columns, enforces relationships between tables via
keys, and is queried with SQL. Every RDBMS is a DBMS; not every DBMS is relational &mdash; a
document store like MongoDB or a key-value store like Redis is a DBMS but not an RDBMS.

The practical distinguishing features of an RDBMS specifically:

- A fixed schema defined ahead of time (columns and types per table).
- Relationships between tables expressed through primary/foreign keys.
- Full ACID transaction guarantees as the default operating mode (see [Transactions & ACID](./05-transactions-and-acid.md)).
- SQL as the standard query language.

## SQL vs. NoSQL

**SQL databases** are relational, schema-first, and built around ACID transactions (PostgreSQL,
MySQL, Oracle, SQL Server). **NoSQL databases** are a broad umbrella for anything that departs from
that model &mdash; typically schema-flexible, built for horizontal scale, and often trading strict
consistency for availability and partition tolerance (see [CAP theorem](./09-replication-sharding-and-nosql.md)).
NoSQL is not one thing; it covers several distinct data models covered below.

Choosing between them in practice comes down to: how relational is the data (lots of joins across
well-defined entities → SQL), how much the schema will change over time (frequently → NoSQL), and
how the system needs to scale (vertical scaling and strong consistency → SQL; horizontal scaling
across many cheap nodes → NoSQL).

## OLTP vs. OLAP

**OLTP (Online Transaction Processing)** systems handle a high volume of short, simple transactions
&mdash; inserting an order, updating a user's profile, checking inventory. They're optimized for
fast writes and point lookups on small amounts of data per query, and they're the systems ACID and
row-oriented storage are designed around.

**OLAP (Online Analytical Processing)** systems handle complex, read-heavy queries over large
volumes of historical data &mdash; "total revenue by region for the last 8 quarters." They're
optimized for scanning and aggregating many rows across few columns, which is why OLAP systems
typically use **columnar storage** rather than the row-oriented storage OLTP systems favor.

A production system commonly runs both: an OLTP database (e.g. PostgreSQL) for the live
application, and a separate OLAP warehouse (e.g. Snowflake, BigQuery, ClickHouse) fed by ETL/CDC
pipelines for reporting, so heavy analytical queries never compete with production traffic.

## The major DBMS data models

- **Relational** &mdash; tables, rows, columns, foreign keys (PostgreSQL, MySQL).
- **Document** &mdash; self-contained JSON/BSON-like documents, flexible schema (MongoDB, Couchbase).
- **Key-value** &mdash; simplest model, a hash map at scale, extremely fast point lookups (Redis, DynamoDB).
- **Columnar / wide-column** &mdash; optimized for scanning single columns across huge row counts, common in OLAP (Cassandra, HBase, ClickHouse).
- **Graph** &mdash; nodes and edges as first-class citizens, optimized for traversing relationships (Neo4j).

## ACID vs. BASE

**ACID** (Atomicity, Consistency, Isolation, Durability) is the guarantee traditional RDBMSes make:
every transaction leaves the database in a valid state, and once committed, it's permanent. **BASE**
(Basically Available, Soft state, Eventual consistency) is the looser model many distributed NoSQL
systems favor instead: the system stays available even during partial failures, and any given read
might return slightly stale data that will *eventually* converge to consistent. Neither is strictly
"better" &mdash; ACID trades some availability/scale for correctness guarantees; BASE trades some
immediate consistency for availability and horizontal scale. [Transactions & ACID](./05-transactions-and-acid.md)
covers ACID in depth; [Replication, Sharding & NoSQL](./09-replication-sharding-and-nosql.md) covers
where BASE systems land on the CAP theorem.

:::info Interview Questions
<DbmsFundamentalsQuestions/>
:::
