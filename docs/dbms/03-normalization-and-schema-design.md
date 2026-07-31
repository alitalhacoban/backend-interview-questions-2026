---
title: Normalization & Schema Design
sidebar_label: Normalization & Schema
---

import NormalizationAndSchemaDesignQuestions from './_partials/03-normalization-and-schema-design-questions.mdx';

# Normalization & Schema Design

Normalization is the process of structuring tables to minimize redundancy and avoid the update
anomalies that come with it. It's usually the first design step after modeling entities and
relationships, and interviewers use it to check whether you can reason about *why* a schema is
shaped the way it is, not just recite normal-form definitions.

## Functional dependencies

A **functional dependency** `A → B` means: for any two rows with the same value of `A`, they must
have the same value of `B`. E.g. in an `orders` table, `order_id → customer_id` (each order belongs
to exactly one customer). Normal forms are defined in terms of eliminating specific kinds of
functional dependency that cause redundancy.

## The anomalies normalization prevents

An unnormalized table (e.g. one row per order line, with customer name and address repeated on
every line) has three classic problems:

- **Update anomaly** &mdash; changing a customer's address means updating it in every row that
  happens to reference that customer; miss one and the data is inconsistent.
- **Insert anomaly** &mdash; you can't record a new customer until they place an order, because
  customer data only exists attached to order rows.
- **Delete anomaly** &mdash; deleting a customer's only order accidentally deletes all record of
  the customer too.

## Normal forms

| Form | Requirement | Fixes |
|---|---|---|
| **1NF** | Every column holds a single atomic value (no repeating groups, no comma-packed lists) | Un-atomic columns |
| **2NF** | 1NF + every non-key column depends on the *whole* primary key, not part of it | Partial dependency (relevant only with composite keys) |
| **3NF** | 2NF + no non-key column depends on another non-key column | Transitive dependency |
| **BCNF** | Every determinant (left side of a functional dependency) is a candidate key | Edge cases 3NF misses, see below |

A worked example: an `order_items(order_id, product_id, product_name, quantity)` table where the
key is `(order_id, product_id)` violates 2NF, because `product_name` depends only on `product_id`,
not on the full composite key. Fix: move `product_name` into a separate `products` table keyed by
`product_id`.

A 3NF violation: `employees(id, department_id, department_name)` &mdash; `department_name` depends
on `department_id`, which depends on `id`, but not directly on `id`. That's a transitive
dependency; fix by moving department info into its own `departments` table.

## BCNF vs. 3NF

3NF is satisfied by the rule above, but it has a narrow edge case: a table can be in 3NF and still
have redundancy if it has multiple overlapping candidate keys where a non-candidate-key attribute
determines part of a candidate key. **BCNF (Boyce-Codd Normal Form)** closes that gap with a
stricter rule: for every functional dependency `A → B`, `A` must be a candidate key. In practice,
most real-world 3NF schemas are already in BCNF; BCNF exceptions are rare enough that many teams
stop actively normalizing past 3NF and only reach for BCNF (or 4NF/5NF, which handle multi-valued
and join dependencies) when a specific anomaly shows up.

## Denormalization

**Denormalization** is deliberately reintroducing redundancy &mdash; e.g. storing a `customer_name`
snapshot on the `orders` table even though it duplicates `customers.name` &mdash; to avoid the
cost of repeated joins on hot read paths. It's a normalization *tradeoff*, not a mistake: you trade
write-time complexity (keeping the duplicate in sync) and storage for read-time speed. Common in
OLAP/reporting schemas (see [DBMS Fundamentals](./01-dbms-fundamentals.md#oltp-vs-olap)) and in
services where a join would otherwise be a hot-path bottleneck. The rule of thumb: normalize by
default for correctness, denormalize deliberately and locally once a specific read pattern proves
too expensive.

## ER modeling

An **Entity-Relationship (ER) diagram** is the design step before normalization: entities become
tables, attributes become columns, and relationships (one-to-one, one-to-many, many-to-many) become
foreign keys or join tables. A many-to-many relationship (e.g. students and courses) can't be
represented with a foreign key on either side alone &mdash; it requires a **junction/associative
table** (`enrollments(student_id, course_id)`) whose composite primary key is exactly the pattern
shown in [Relational Model, Keys & SQL](./02-relational-model-and-sql.md).

:::info Interview Questions
<NormalizationAndSchemaDesignQuestions/>
:::
