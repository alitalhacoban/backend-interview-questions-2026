---
title: Deployment & Orchestration
sidebar_label: Deployment & Orchestration
---

import DeploymentAndOrchestrationQuestions from './_partials/07-deployment-and-orchestration-questions.mdx';

# Deployment & Orchestration

Running one service is an operations problem. Running dozens of independently deployed, scaled, and
updated services is a fundamentally different kind of problem, and it's what containers and
orchestration platforms exist to solve.

## Containers vs. VMs

A **container** packages an application with its dependencies (libraries, runtime, config) into a
single, portable image, but shares the host machine's OS kernel with other containers &mdash; it's
isolated at the process level (namespaces, cgroups), not virtualized hardware. A **virtual machine**
virtualizes an entire hardware layer, including its own OS kernel, on top of a hypervisor. The
practical difference: containers start in seconds and are lightweight (megabytes, sharing the host
kernel); VMs start in minutes and are heavier (a full OS per VM), but offer stronger isolation since
they don't share a kernel. Microservices favor containers (typically Docker) specifically because
services need to start, stop, and scale quickly and in large numbers &mdash; VM-level overhead per
service instance doesn't scale to "dozens of services, many replicas each."

## What Kubernetes actually provides

**Kubernetes** is a container orchestration platform: given a declarative description of what
should be running, it handles actually making that true and keeping it true. Key building blocks:

- **Pod** &mdash; the smallest deployable unit; one or more tightly-coupled containers that always
  run together on the same node and share networking/storage. Usually one application container
  per pod, occasionally plus a helper "sidecar" container (see service mesh below).
- **Deployment** &mdash; declares how many replicas of a pod should be running and manages rolling
  out new versions; if a pod crashes or a node dies, the Deployment's controller notices the actual
  state no longer matches the desired state and creates a replacement.
- **Service** &mdash; a stable network name/IP in front of a shifting set of pod replicas; this is
  what gives Kubernetes its built-in [service discovery and load
  balancing](./03-api-gateway-and-service-discovery.md) &mdash; callers address the Service, not
  individual (ephemeral) pod IPs.
- **ConfigMap / Secret** &mdash; externalized configuration and sensitive values injected into pods
  at runtime, kept separate from the container image itself.

The recurring theme across all of these: you declare the *desired state* ("3 replicas of this
image, this configuration"), and a **controller loop** continuously reconciles actual state toward
it &mdash; you don't imperatively tell Kubernetes to start or stop individual containers.

## Deployment strategies

- **Rolling update**: new-version instances are brought up and old-version instances torn down
  gradually, so some capacity of each version briefly coexists. No downtime, but both versions are
  live simultaneously for a window, which means the API/schema must stay compatible across that
  window.
- **Blue-green deployment**: a full second environment ("green") running the new version is stood
  up alongside the current one ("blue"); traffic is switched over all at once once green is
  verified healthy. Instant rollback (switch traffic back to blue), but requires running two full
  environments at once, at least briefly.
- **Canary deployment**: the new version is rolled out to a small percentage of traffic first,
  monitored, and only ramped up to 100% if it looks healthy. Limits the blast radius of a bad
  release to a small slice of traffic, at the cost of more deployment complexity (traffic
  splitting, comparing metrics between versions).

## Service mesh

A **service mesh** (Istio, Linkerd) moves cross-cutting network concerns &mdash; mTLS between
services, retries, timeouts, circuit breaking (see [Resilience
Patterns](./05-resilience-patterns.md)), and traffic-level observability &mdash; out of application
code and into infrastructure. It typically works by deploying a **sidecar proxy** (like Envoy)
alongside every service instance; all inbound and outbound network traffic for that service
transparently flows through its sidecar, which enforces mesh policy without the application code
needing to know the mesh exists.

The trade-off: a service mesh gives every service consistent resilience/security/observability
behavior without each team reimplementing it in every service's own code &mdash; but it adds a
proxy hop to every call and a genuinely complex piece of infrastructure to operate. Small-to-medium
systems can often get most of the same behavior more simply with a shared library and a good API
gateway; a mesh tends to pay for itself once the number of services and the number of teams that
would otherwise duplicate this logic themselves both get large.

:::info Interview Questions
<DeploymentAndOrchestrationQuestions/>
:::
