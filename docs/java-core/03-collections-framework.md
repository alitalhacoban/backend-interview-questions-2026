---
title: Collections Framework
sidebar_label: Collections Framework
---

import CollectionsFrameworkQuestions from './_partials/03-collections-framework-questions.mdx';

# Collections Framework

Almost every Java interview eventually asks "how does HashMap work internally," and the useful
answer isn't "it uses hashing" — it's being able to walk through what happens on a collision, why
Java 8 changed the bucket structure, and which collection to reach for and why. This page covers
the internals and the decision points, not just the API surface.

## How HashMap actually stores entries

A `HashMap` is backed by an array of buckets. For a given key:

1. `hashCode()` is called on the key, then Java applies a supplemental hash function (XOR-ing the
   hash with its own upper bits) to spread out poor `hashCode()` implementations.
2. The bucket index is `hash & (table.length - 1)` — a bitmask, which only works as modulo because
   the table length is always kept a power of two.
3. The entry is stored in that bucket. If the bucket already has entries, they're chained.

```java
Map<String, Integer> scores = new HashMap<>();
scores.put("alice", 90); // hash("alice") -> bucket index N
scores.get("alice");     // recompute the same hash -> same bucket -> compare keys with equals()
```

This is why **both `hashCode()` and `equals()` must be overridden consistently** on any class used
as a map key: `hashCode()` determines *which bucket* to look in, and `equals()` determines *which
entry within that bucket* is the match.

## Collision handling, and the Java 8 change

Before Java 8, each bucket was a **linked list** of entries — a lookup in a bucket with collisions
was O(n) within that bucket. Since Java 8, if a single bucket accumulates **8 or more entries**
*and* the table has at least 64 buckets, that bucket is converted from a linked list into a
**red-black tree**, making worst-case lookup within that bucket O(log n) instead of O(n). This
specifically defends against hash-flooding (many keys deliberately or accidentally colliding into
the same bucket) degrading `HashMap` to linear-scan behavior.

`HashMap` also resizes (doubles its table and rehashes every entry) once the number of entries
exceeds `capacity * loadFactor` (default load factor `0.75`) — trading memory for fewer collisions.

## ArrayList vs. LinkedList

| | `ArrayList` | `LinkedList` |
|---|---|---|
| Backing structure | Dynamic array | Doubly-linked list |
| Random access (`get(i)`) | O(1) | O(n) |
| Insert/remove at a known node | O(n) (shifts elements) | O(1) |
| Insert/remove at start | O(n) | O(1) |
| Memory overhead | Lower (contiguous array) | Higher (node + 2 pointers per element) |

In practice, **default to `ArrayList`**. Most workloads read far more than they insert in the
middle, and `ArrayList`'s cache-friendly contiguous memory layout beats `LinkedList` even for
many insert-heavy workloads once you account for pointer-chasing and per-node allocation overhead.
`LinkedList` earns its keep mainly as a `Deque` (its actual most common legitimate use today).

## Set implementations

- **`HashSet`**: backed by a `HashMap` internally (values are a dummy constant). No ordering
  guarantee, O(1) average add/contains.
- **`LinkedHashSet`**: a `HashSet` that also maintains a doubly-linked list through entries,
  preserving **insertion order** at a modest memory/performance cost.
- **`TreeSet`**: backed by a red-black tree (`TreeMap` internally), keeps elements in **sorted
  order** (natural ordering or a supplied `Comparator`), at O(log n) add/contains instead of O(1).

## Fail-fast vs. fail-safe iterators

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));
for (String s : list) {
    list.remove(s); // Throws ConcurrentModificationException on the next next()/hasNext() check.
}
```

- **Fail-fast** iterators (`ArrayList`, `HashMap`, most `java.util` collections) track a
  `modCount`; if the collection is structurally modified during iteration by any means other than
  the iterator's own `remove()`, the next call to `next()` throws
  `ConcurrentModificationException`. This is a best-effort safety check, not a concurrency
  guarantee — it exists to catch bugs early, not to make the collection thread-safe.
- **Fail-safe** iterators (`CopyOnWriteArrayList`, `ConcurrentHashMap`) iterate over a
  snapshot or a structure designed for concurrent access, so concurrent modification during
  iteration doesn't throw — but the iterator may not reflect changes made after it was created.

## Comparable vs. Comparator

```java
class Employee implements Comparable<Employee> {
    int salary;
    public int compareTo(Employee other) {
        return Integer.compare(this.salary, other.salary); // "Natural ordering": by salary.
    }
}

// A Comparator defines an alternative, external ordering without touching the class:
Comparator<Employee> byNameThenSalary =
    Comparator.comparing((Employee e) -> e.name).thenComparingInt(e -> e.salary);
```

- **`Comparable`** is implemented *by* the class itself and defines its single "natural" ordering
  (`compareTo`), used by default in `Collections.sort()`, `TreeSet`, `TreeMap`.
- **`Comparator`** is a separate object defining an ordering *externally* — useful when you need
  multiple orderings for the same type, or you can't modify the class (e.g. it's from a library).

## ConcurrentHashMap's locking strategy

Unlike `Collections.synchronizedMap(new HashMap<>())`, which wraps every method in a single lock
on the entire map (serializing all access), `ConcurrentHashMap` (Java 8+) locks at a much finer
grain: writes only synchronize on the specific bin (bucket) being modified, using `synchronized`
blocks on the bin's first node plus CAS (compare-and-swap) operations for bin insertion. Reads are
largely lock-free, using `volatile` reads on the backing array. The result: many threads can write
to different bins concurrently, and reads generally never block at all — far higher throughput
than a single map-wide lock under contention.

:::info Interview Questions
<CollectionsFrameworkQuestions/>
:::
