---
title: Security
sidebar_label: Security
---

import SecurityQuestions from './_partials/08-security-questions.mdx';

# Security

A monolith has one process boundary to secure. Microservices multiply that boundary by every
service, and add a new problem a monolith never has: services now need to authenticate *each
other*, not just the end user. This page covers both halves &mdash; user-facing auth and
service-to-service auth &mdash; and where each is enforced.

## Authentication vs. authorization, at the system level

The same distinction covered in [Spring Security](../spring-boot/07-spring-security.md) applies at
the architecture level: **authentication** answers "who is making this request" and
**authorization** answers "is that identity allowed to do this specific thing." In microservices,
both questions have to be answered correctly not just once at the edge, but potentially again at
every internal hop, because a request that's authenticated at the gateway doesn't automatically
prove *which* internal service-to-service calls it should be allowed to trigger.

## User-facing auth: OAuth2 and JWT

For end users and external clients, the standard pattern is **OAuth2** for delegated authorization
(a client gets a token scoped to specific permissions, without ever handling the user's actual
credentials) combined with **JWT (JSON Web Token)** as the token format: a compact,
digitally-signed token containing claims (user ID, roles, expiry) that any service can
**verify the signature of locally**, without calling back to an auth server for every single
request. That local verifiability is exactly why JWTs fit microservices well &mdash; a central
identity provider issues the token once, and every downstream service can independently trust its
claims until it expires, without adding a network round trip (and a new single point of failure) to
every request.

The trade-off: because a JWT is self-contained, it can't be un-issued before it naturally expires
&mdash; revoking a compromised token before expiry requires extra machinery (a blocklist a gateway
checks, or deliberately short expiries with refresh tokens), since there's no equivalent of deleting
a server-side session record.

## Where auth is enforced: the gateway vs. every service

Two models, often combined:

- **Auth at the edge only**: the [API gateway](./03-api-gateway-and-service-discovery.md)
  authenticates and authorizes the incoming request, then internal services trust that anything
  reaching them has already been validated. Simple, and keeps auth logic out of every service, but
  it means a compromised internal service (or a bug that lets internal traffic bypass the gateway)
  has no further check to stop it.
- **Auth at every hop (zero trust)**: every service independently verifies the caller's identity
  and permissions, even for internal calls, rather than assuming "it's internal, so it's trusted."
  This is the practical meaning of **zero-trust** architecture: trust is never implicit just because
  traffic originated inside the network perimeter. More defense in depth, at the cost of every
  service needing (and every call paying the latency cost of) real auth logic — often why teams
  reach for a [service mesh](./07-deployment-and-orchestration.md) to enforce this consistently via
  sidecar proxies instead of duplicating it in every service's own code.

## Service-to-service authentication: mTLS and API keys

Once a request is inside the system, the caller isn't a human with a password &mdash; it's another
service, and it needs its own way to prove its identity:

- **mTLS (mutual TLS)**: normal TLS has only the server present a certificate the client verifies;
  *mutual* TLS has both sides present certificates, so the server also cryptographically verifies
  which service is calling it. This is the most common mechanism a service mesh provides
  automatically via sidecar proxies, without any application code changes.
- **API keys / service credentials**: a simpler, static shared secret a calling service includes on
  every request. Easier to set up than mTLS, but weaker &mdash; a leaked key is valid until manually
  rotated, and it doesn't prove anything about the calling service beyond "possesses this string."

## Defense in depth

The strongest interview answer ties these together: don't rely on a single layer. A well-secured
microservices system typically combines edge authentication/authorization at the [API
gateway](./03-api-gateway-and-service-discovery.md), mTLS between services so internal traffic is
also encrypted and mutually authenticated, and each service still enforcing its own
authorization rules for what a given identity is allowed to do to *its* data &mdash; so that no
single compromised or misconfigured component exposes the whole system.

:::info Interview Questions
<SecurityQuestions/>
:::
