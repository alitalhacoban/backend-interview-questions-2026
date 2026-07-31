---
title: API Gateway & Service Discovery
sidebar_label: API Gateway & Discovery
---

import ApiGatewayAndServiceDiscoveryQuestions from './_partials/03-api-gateway-and-service-discovery-questions.mdx';

# API Gateway & Service Discovery

Two problems show up as soon as a system has more than a handful of services: external clients
shouldn't need to know about every internal service individually, and services themselves need a
way to find each other when instances are constantly starting, stopping, and moving. API gateways
solve the first problem; service discovery solves the second.

## What an API gateway does

An **API gateway** is a single entry point that sits in front of a system's services and mediates
every external request. Instead of clients calling ten different services at ten different
addresses, they call one gateway, which routes each request to the right backend service. Beyond
routing, a gateway commonly handles:

- **Authentication/authorization** &mdash; verifying who's calling once, at the edge, instead of
  every service reimplementing it (see [Security](./08-security.md)).
- **Rate limiting and throttling** &mdash; protecting backend services from being overwhelmed.
- **Request/response transformation** &mdash; e.g. translating an external REST call into an
  internal gRPC call.
- **Aggregation** &mdash; combining results from multiple internal services into one response so a
  client doesn't have to make several round trips itself (sometimes split out into a dedicated
  **Backend for Frontend, or BFF**, when different client types need meaningfully different
  aggregated shapes).
- **Cross-cutting observability** &mdash; a natural place to emit consistent request logging,
  metrics, and the start of a [distributed trace](./06-observability.md).

The trade-off: the gateway becomes a shared dependency (a potential bottleneck and single point of
failure if not built for high availability) and, if teams aren't careful, a magnet for business
logic that should live in the services themselves &mdash; a gateway should stay a thin routing and
cross-cutting-concerns layer, not become a second monolith in front of the "real" microservices.

## API gateway vs. load balancer

A common confusion: a **load balancer** distributes traffic across multiple instances of the
*same* service based on network-level or simple HTTP-level rules (round robin, least connections).
An **API gateway** operates one layer up &mdash; it understands application-level routing across
*different* services, and typically does authentication, rate limiting, and transformation that a
plain load balancer doesn't. In practice a gateway usually sits in front of, and works together
with, load balancing for each individual service behind it.

## Service discovery

Once a service is deployed as many replaceable instances (containers/pods that get rescheduled,
scaled, and given new IPs constantly), a caller can't hardcode "call `10.0.4.12:8080`" &mdash; that
address is not stable. **Service discovery** is the mechanism by which a caller finds a current,
healthy instance of the service it wants to call, by name.

- **Client-side discovery**: the calling service queries a **service registry** (e.g. Eureka,
  Consul) directly to get a list of healthy instances, then picks one itself (often using a
  client-side load-balancing library). Fewer network hops, but every client needs the
  discovery/load-balancing logic built in.
- **Server-side discovery**: the caller sends the request to a well-known address (a load
  balancer, or the gateway itself), which consults the registry and forwards the request. The
  client stays simple &mdash; it just calls a fixed address &mdash; but that intermediary is now
  an extra hop and needs to be highly available.

In practice, container orchestration platforms like Kubernetes provide server-side discovery
largely for free: a Kubernetes `Service` gives every deployment a stable DNS name and internally
load-balances across whichever pod IPs are currently healthy, which is why many teams running on
Kubernetes don't stand up a separate discovery system like Eureka or Consul at all. See [Deployment
& Orchestration](./07-deployment-and-orchestration.md) for more on how Kubernetes Services work.

## Service registry and health checks

A **service registry** is the database of "which instances of which services are currently
healthy and where." Instances typically **register** themselves on startup (or are registered by
the platform) and are removed either by **deregistering** on graceful shutdown or by failing
periodic **health checks** (see [readiness vs. liveness probes](./06-observability.md)). Without
active health checking, the registry drifts out of sync with reality and callers start getting
routed to dead instances &mdash; health checks are what keep service discovery trustworthy under
real-world failures, not just at steady state.

:::info Interview Questions
<ApiGatewayAndServiceDiscoveryQuestions/>
:::
