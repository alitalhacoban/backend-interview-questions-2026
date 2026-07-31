---
title: Query Processing & Optimization
sidebar_label: Query Optimization
---

import QueryProcessingAndOptimizationQuestions from './_partials/07-query-processing-and-optimization-questions.mdx';

# Query Processing & Optimization

SQL is declarative &mdash; you say *what* you want, not *how* to get it. The gap between those two
is filled by the query planner/optimizer, and understanding roughly how it works is what separates
"I added an index and it got faster" from actually being able to diagnose a slow query.

## From SQL to execution plan

1. **Parse** &mdash; the SQL text is checked for syntax and turned into a parse tree.
2. **Rewrite/normalize** &mdash; views get expanded, subqueries may get rewritten as joins, etc.
3. **Plan/optimize** &mdash; the optimizer considers multiple possible **execution plans** (which
   indexes to use, which join algorithm, which join order) and picks the one with the lowest
   estimated cost.
4. **Execute** &mdash; the chosen plan runs, physically reading pages and producing rows.

An **execution plan** is a tree of physical operations (scan, join, sort, aggregate) with an
estimated cost and row count at each step &mdash; it's the concrete "how" behind the query.

## Reading EXPLAIN

`EXPLAIN` (and `EXPLAIN ANALYZE`, which actually runs the query and reports real timings alongside
estimates) shows the chosen plan. The two operations to recognize immediately:

- **Sequential scan** (`Seq Scan` in Postgres, full table scan elsewhere) &mdash; reads every row
  in the table. Fine for small tables or queries that need most of the rows anyway; a red flag on a
  large table filtered down to a handful of rows.
- **Index scan** &mdash; uses an index to jump directly to matching rows (see
  [Indexing](./04-indexing.md)). An **index-only scan** is the best case: every column the query
  needs is in the index itself (a covering index), so the table isn't touched at all.

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42;

--                                     QUERY PLAN
-- Index Scan using idx_orders_customer_id on orders
--   (cost=0.29..8.31 rows=1 width=48) (actual time=0.02..0.03 rows=3 loops=1)
--   Index Cond: (customer_id = 42)
```

If `EXPLAIN` shows a sequential scan where an index scan was expected, the usual causes are: no
index exists on the filtered column, the index doesn't cover the full leading-column pattern used
in the query (see [composite index column order](./04-indexing.md#composite-indexes-and-column-order)),
or the optimizer's statistics estimate a sequential scan is cheaper anyway (common when the filter
matches a large fraction of the table &mdash; an index scan isn't always faster).

## Cost-based optimization

Most modern optimizers are **cost-based**: they estimate the cost (roughly, disk I/O + CPU) of
several candidate plans using table statistics &mdash; row counts, value distribution/histograms,
index selectivity &mdash; and pick the cheapest estimate. Those statistics are gathered
periodically (`ANALYZE` in Postgres, auto-updated in most systems) and go stale after large data
changes, which is a common real-world cause of a previously-fast query suddenly picking a bad plan.

## The N+1 query problem

The **N+1 problem** happens at the application layer, not inside a single query: fetching a list of
`N` parent rows with one query, then issuing one additional query *per row* to fetch related data
(`N` more queries), instead of a single join or a single `WHERE id IN (...)` batch fetch. It's the
most common ORM-driven performance bug (Hibernate/JPA lazy loading is the classic offender), and
the fix is almost always either an explicit join/fetch, or a single batched follow-up query.

## Query plan caching

Repeatedly parsing and planning the exact same query is wasted work, so databases cache execution
plans keyed by the query text (or, for **prepared statements**, by the parameterized query shape) so
subsequent executions skip straight to execution. This is also why **prepared statements**
(`SELECT * FROM users WHERE id = $1` with a bound parameter) are both a performance win (plan
reuse) and a security win (parameters are never interpolated into the SQL text, which is the
standard defense against SQL injection).

:::info Interview Questions
<QueryProcessingAndOptimizationQuestions/>
:::
