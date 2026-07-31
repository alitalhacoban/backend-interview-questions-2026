---
title: Concurrency Control & Isolation Levels
sidebar_label: Concurrency & Isolation
---

import ConcurrencyControlAndIsolationQuestions from './_partials/06-concurrency-control-and-isolation-questions.mdx';

# Concurrency Control & Isolation Levels

Isolation is the ACID property with the most nuance, because it's not binary &mdash; it's a
spectrum of tradeoffs between correctness and throughput, and this is the section of the DBMS
topic interviewers lean on hardest to separate candidates who've memorized definitions from
candidates who've actually debugged a concurrency bug in production.

## The anomalies isolation levels prevent

- **Dirty read** &mdash; transaction A reads a row that transaction B has modified but not yet
  committed. If B then rolls back, A read a value that never actually existed.
- **Non-repeatable read** &mdash; transaction A reads the same row twice and gets different values,
  because transaction B updated and committed that row in between A's two reads.
- **Phantom read** &mdash; transaction A re-runs the same range query twice and gets a different
  *set of rows*, because transaction B inserted or deleted a row matching the range in between.

The difference between the last two: a non-repeatable read is about an existing row's value
changing; a phantom read is about the row *set* changing.

## The four standard isolation levels

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| Read Uncommitted | Possible | Possible | Possible |
| Read Committed | Prevented | Possible | Possible |
| Repeatable Read | Prevented | Prevented | Possible (though MVCC implementations often prevent it too) |
| Serializable | Prevented | Prevented | Prevented |

Higher isolation means stronger guarantees and less real concurrency (more blocking, or more
transaction retries on conflict) &mdash; it's a direct tradeoff, not a strictly-better setting.
Most production OLTP workloads default to **Read Committed** (PostgreSQL, Oracle, SQL Server) or
**Repeatable Read** (MySQL/InnoDB), reaching for `SERIALIZABLE` only for the specific transactions
that genuinely can't tolerate any anomaly.

## Locking-based concurrency: Two-Phase Locking (2PL)

**Two-Phase Locking** is the classical mechanism for enforcing isolation: every transaction has a
**growing phase**, where it acquires locks as it accesses rows, and a **shrinking phase**, where it
releases them &mdash; and critically, once it releases even one lock, it may never acquire another.
This two-phase structure is what guarantees the resulting execution schedule is serializable.
Strict 2PL (holding all locks until commit/rollback, only releasing in one batch at the end) is
what real databases actually implement, since plain 2PL can still allow cascading rollbacks.

## MVCC (Multi-Version Concurrency Control)

Rather than blocking readers behind writers' locks, **MVCC** keeps multiple versions of a row and
gives each transaction a consistent snapshot to read from, based on when it started. A writer
creates a new version instead of overwriting in place; readers keep seeing the version that was
current as of their snapshot, unaffected by concurrent uncommitted writes. This is how PostgreSQL,
MySQL/InnoDB, and Oracle all implement `READ COMMITTED`/`REPEATABLE READ` without readers and
writers blocking each other &mdash; a major practical win over pure locking, at the cost of needing
to periodically clean up old row versions (`VACUUM` in Postgres).

## Optimistic vs. pessimistic locking

This is a common naming-confusion pair, and it's an application-level pattern choice layered on top
of whatever the database's isolation level provides:

- **Pessimistic locking** &mdash; acquire a lock before touching a row (`SELECT ... FOR UPDATE`),
  assuming conflicts are likely, so other transactions block until you're done.
- **Optimistic locking** &mdash; don't lock anything up front; instead, check at write time (usually
  via a `version` column) whether the row changed since you read it, and reject/retry the write if
  it did, assuming conflicts are rare.

```sql
-- Optimistic locking pattern
UPDATE accounts
SET balance = 900, version = version + 1
WHERE id = 1 AND version = 5; -- 0 rows updated => someone else changed it first, retry
```

Optimistic locking wins when conflicts are rare and you want to avoid blocking (typical web request
paths); pessimistic locking wins when conflicts are frequent and retries would be expensive or
awkward (e.g. a batch job reserving inventory).

## Deadlocks

A **deadlock** happens when two or more transactions each hold a lock the other needs, so neither
can proceed. Example: transaction A locks row 1 then wants row 2, while transaction B locks row 2
then wants row 1. Databases detect this by tracking a **wait-for graph** and looking for cycles;
when one is found, the database picks a victim transaction (usually the cheaper one to roll back)
and aborts it with an error, letting the other proceed. The application-level mitigation is
consistent lock ordering &mdash; always acquiring locks on multiple rows in the same order across
every code path that touches them, so a cycle can't form in the first place.

:::info Interview Questions
<ConcurrencyControlAndIsolationQuestions/>
:::
