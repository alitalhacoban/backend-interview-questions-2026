---
title: Strings & Object Contracts
sidebar_label: Strings & Object Contracts
---

import StringsAndObjectContractsQuestions from './_partials/08-strings-and-object-contracts-questions.mdx';

# Strings & Object Contracts

`String` immutability and the `equals`/`hashCode` contract look like beginner topics, but they're
where interviewers catch candidates who've never actually been burned by getting them wrong — a
broken `hashCode`/`equals` pair silently corrupts `HashMap` lookups, and "is this class actually
immutable" has a real trap hiding in it even when every field is `final`.

## Why `String` is immutable

```java
String a = "hello";
String b = a.concat(" world"); // Returns a NEW String; `a` still refers to the original "hello".
```

Once a `String` is created, its character contents can never change — any operation that looks
like it "modifies" a string (`concat`, `toUpperCase`, `substring`, `+`) actually returns a **new**
`String` object. This is intentional, for several reasons:

- **String pool safety**: multiple references can safely share the same pooled `String` (see
  below) only because none of them can mutate it out from under the others.
- **Thread safety**: an immutable object can be freely shared across threads with zero
  synchronization, since there's no mutable state to race on.
- **Hashcode caching**: `String` caches its computed `hashCode()` after first use, which is only
  safe because the contents (and therefore the hash) can never change afterward — this makes
  repeated use as a `HashMap` key cheap.
- **Security**: strings are used for things like file paths, class names, and network hosts;
  immutability means a value validated once can't be silently changed later by another part of the
  code holding the same reference.

## The string pool and interning

```java
String a = "hello";        // Literal: goes into the string pool.
String b = "hello";        // Same literal: reuses the pooled instance.
String c = new String("hello"); // Explicitly allocates a NEW object on the heap, bypassing the pool.

System.out.println(a == b);        // true — same pooled reference.
System.out.println(a == c);        // false — different objects.
System.out.println(a.equals(c));   // true — same content.
System.out.println(a == c.intern()); // true — intern() returns the pooled instance.
```

The **string pool** (part of the heap since Java 7, previously in PermGen) caches one instance per
unique literal value, so identical string literals across the codebase share a single object
instead of each allocating separately. `new String("hello")` deliberately bypasses the pool,
creating a distinct heap object even though its content matches a pooled literal — which is
exactly why `==` (reference equality) can give a surprising `false` here while `.equals()`
(content equality) correctly returns `true`. `.intern()` explicitly looks up (or adds) a string in
the pool and returns that shared reference.

## `StringBuilder` vs. concatenation with `+`

```java
// Bad in a loop: creates a new String object on every iteration.
String result = "";
for (String s : items) {
    result += s;
}

// Good: one mutable buffer, appended in place.
StringBuilder sb = new StringBuilder();
for (String s : items) {
    sb.append(s);
}
String result = sb.toString();
```

Because `String` is immutable, `result += s` inside a loop doesn't append in place — each
iteration creates an entirely new `String` and copies the old content plus the new piece into it,
making a naive loop of concatenations O(n²) in the number of appended characters. `StringBuilder`
(single-threaded) or `StringBuffer` (synchronized, thread-safe, slower) hold a mutable, resizable
character buffer, so appends are O(1) amortized. Outside a loop, a single `a + b + c` expression is
fine — the compiler itself compiles it into an equivalent `StringBuilder` chain — the problem is
specifically repeated concatenation across iterations, where the compiler can't collapse separate
loop iterations into one buffer for you.

## The `equals`/`hashCode` contract

```java
class Point {
    int x, y;
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }
    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
```

The contract: **if two objects are equal according to `equals()`, they must return the same value
from `hashCode()`.** (The converse isn't required — unequal objects *may* share a hash code; that's
just a collision, not a contract violation.) If you override `equals()` without overriding
`hashCode()` consistently, you can end up with two objects that are `.equals()` to each other but
land in different `HashMap`/`HashSet` buckets — so `map.get(key)` can fail to find an entry that
was `.put()` with an "equal" key, because the lookup never even checks the bucket where it
actually lives. This is one of the most common real-world bug sources tied directly to this
topic.

## Java records

```java
record Point(int x, int y) {}

// Equivalent hand-written boilerplate a record eliminates:
// - private final fields, a canonical constructor
// - public accessor methods x() and y() (not getX()/getY())
// - equals(), hashCode(), and toString() based on all components
```

A **record** (Java 16+) is a compact syntax for an immutable data carrier: declaring its
components generates the constructor, accessors, and a correct `equals`/`hashCode`/`toString`
automatically, eliminating the boilerplate that used to make simple data classes tedious (and
error-prone, per the contract above) to write by hand. Records are implicitly `final` and their
components are implicitly `final` fields, reinforcing immutability by default.

## Effective immutability's classic trap

```java
final class ImmutablePoint {
    private final List<Integer> tags;
    ImmutablePoint(List<Integer> tags) { this.tags = tags; } // Stores the reference directly — bug.
    List<Integer> getTags() { return tags; }                  // Returns the live reference — bug.
}

List<Integer> mutable = new ArrayList<>(List.of(1, 2));
ImmutablePoint p = new ImmutablePoint(mutable);
p.getTags().add(99); // Mutates "immutable" p's internal state from outside!
mutable.add(100);    // Also mutates it, via the constructor-captured reference.
```

A class with only `final` fields is **not** automatically immutable if any of those fields
reference a mutable object (a `List`, a `Date`, an array, or another mutable class). `final`
only prevents the *field* from being reassigned to point elsewhere — it does nothing to prevent
the *object it points to* from being mutated. The classic mistake: storing a caller-supplied
mutable object directly, or returning an internal mutable field directly from a getter, either of
which hands out a live handle that lets outside code mutate "immutable" internal state. The fix is
**defensive copying** — copy the collection/object on the way in (constructor) and on the way out
(getter), e.g. `this.tags = List.copyOf(tags);` and `return List.copyOf(tags);` (or return an
unmodifiable view).

:::info Interview Questions
<StringsAndObjectContractsQuestions/>
:::
