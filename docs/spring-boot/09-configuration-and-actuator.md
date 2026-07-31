---
title: Configuration, Profiles & Actuator
sidebar_label: Configuration, Profiles & Actuator
---

import ConfigurationAndActuatorQuestions from './_partials/09-configuration-and-actuator-questions.mdx';

# Configuration, Profiles & Actuator

Interviewers use this topic to check operational maturity: not "can you write a `@Value`
annotation" but "do you know how this application actually behaves once it's running in
Kubernetes" — where config comes from, how it changes per environment, and how the platform knows
the app is healthy.

## Externalized configuration and property precedence

Spring Boot deliberately lets the *same* property be set from many places, resolved by a strict
precedence order (highest wins), roughly:

1. Command-line arguments (`--server.port=8081`)
2. `SPRING_APPLICATION_JSON` / environment variables (`SERVER_PORT=8081`)
3. `application-{profile}.yml` (profile-specific file)
4. `application.yml` (base file)
5. `@PropertySource` on `@Configuration` classes
6. Defaults hardcoded in `@ConfigurationProperties` classes

This is what lets the exact same build artifact run unmodified across dev, staging, and
production — environment variables override the packaged `application.yml` without rebuilding
anything, which is exactly the [twelve-factor app](https://12factor.net/config) config model and
why it maps naturally onto container/Kubernetes deployments (env vars injected from
ConfigMaps/Secrets).

## `@Value` vs. `@ConfigurationProperties`

```java
@Value("${payment.gateway.api-key}")
private String apiKey; // one property at a time, no validation, no type-safety beyond the target type
```

```java
@ConfigurationProperties(prefix = "payment.gateway")
@Validated
public record GatewayProperties(
    @NotBlank String apiKey,
    @Min(1000) int timeoutMs,
    List<String> allowedRegions
) {}
```

`@ConfigurationProperties` binds an entire, related group of properties into a single strongly
typed, immutable object in one place — validated at startup with Bean Validation annotations, so a
missing/malformed value fails fast at boot rather than surfacing as a `null` deep in some service
at request time. `@Value` scattered across many classes for related settings is harder to see as a
cohesive config surface and has no built-in validation. The general guidance: reach for
`@ConfigurationProperties` for anything beyond a single, truly standalone value.

## Profiles

```yaml
# application.yml
spring:
  config:
    activate:
      on-profile: "!prod" # applies unless prod profile is active
---
spring:
  config:
    activate:
      on-profile: prod
logging:
  level:
    root: WARN
```

```java
@Service
@Profile("!test")
public class RealPaymentGateway implements PaymentGateway { ... }

@Service
@Profile("test")
public class StubPaymentGateway implements PaymentGateway { ... }
```

A **profile** is a named, activatable slice of configuration (`application-prod.yml`) or
conditionally-registered beans (`@Profile`). Activating `spring.profiles.active=prod` layers
`application-prod.yml` on top of the base `application.yml` (profile file values win) and
registers only the beans whose `@Profile` matches. This is the standard mechanism for swapping
real integrations for stubs/mocks in tests, or tuning logging/connection-pool settings per
environment, without branching application code.

## Actuator

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus
  endpoint:
    health:
      probes:
        enabled: true
      show-details: when-authorized
```

`spring-boot-starter-actuator` exposes operational endpoints over HTTP (or JMX):

- **`/actuator/health`** — aggregate health, composed from `HealthIndicator`s (DB connectivity,
  disk space, custom checks you register).
- **`/actuator/metrics`** and **`/actuator/prometheus`** — application metrics via Micrometer,
  scrapeable by Prometheus.
- **`/actuator/info`** — arbitrary build/git metadata you choose to expose.

Endpoints are **not exposed by default** except `health` and `info` — you opt in explicitly via
`management.endpoints.web.exposure.include`, because endpoints like `/actuator/env` or
`/actuator/heapdump` can leak secrets or be expensive; exposing them all by default would be an
unsafe default for a production-facing framework.

## Liveness vs. readiness (Kubernetes probes)

`management.endpoint.health.probes.enabled=true` splits `/actuator/health` into
`/actuator/health/liveness` and `/actuator/health/readiness`, matching Kubernetes' two distinct
questions:

- **Liveness**: is the process in a state it can never recover from on its own (deadlocked,
  corrupted internal state)? If it fails, Kubernetes **restarts the pod**.
- **Readiness**: is the app currently able to serve traffic (e.g. its DB connection pool is up)?
  If it fails, Kubernetes **stops routing traffic to the pod** without restarting it — useful
  during slow startup or a transient downstream outage the app can recover from once the
  dependency comes back.

Conflating the two is a classic production incident: wiring a *readiness* concern (a downstream
dependency is temporarily down) into the *liveness* probe causes Kubernetes to repeatedly kill and
restart healthy pods that are simply waiting on a dependency to recover, often making an outage
worse instead of better.

:::info Interview Questions
<ConfigurationAndActuatorQuestions/>
:::
