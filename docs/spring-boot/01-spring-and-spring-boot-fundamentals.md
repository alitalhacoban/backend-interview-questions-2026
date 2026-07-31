---
title: Spring & Spring Boot Fundamentals
sidebar_label: Spring & Spring Boot Fundamentals
---

import SpringAndSpringBootFundamentalsQuestions from './_partials/01-spring-and-spring-boot-fundamentals-questions.mdx';

# Spring & Spring Boot Fundamentals

Almost every Spring Boot interview opens with some version of "what is Spring, and how is it
different from Spring Boot?" It's a filter question: a candidate who has only ever run
`spring-boot-starter-web` starters often can't separate what the underlying Spring Framework
actually does from what Spring Boot layers on top of it. This page builds that foundation before
the rest of this topic gets into internals.

## What is the Spring Framework?

Spring is a comprehensive framework for building Java applications, built around one core idea:
**inversion of control**. Instead of your objects constructing and wiring their own collaborators,
a container (the `ApplicationContext`, covered in
[IoC & Dependency Injection](./02-ioc-and-dependency-injection.md)) does it for you. Spring emerged
in the early 2000s as a reaction to the heavyweight, interface-laden complexity of J2EE/EJB —
its pitch was that you could get transaction management, data access abstraction, and web MVC
using **plain old Java objects (POJOs)**, wired together declaratively, instead of forcing every
class to implement framework-specific interfaces.

"Spring" is really an umbrella for a set of cohesive modules, not one monolithic library:

| Module | Provides |
|---|---|
| Spring Core / Beans / Context | The IoC container itself |
| Spring AOP | Aspect-oriented programming (cross-cutting concerns like transactions) |
| Spring Data Access | JDBC/ORM abstraction, declarative transaction management |
| Spring MVC | The web/REST framework (`DispatcherServlet` and friends) |
| Spring Security | Authentication and authorization |

You can use any of these modules independently — Spring MVC, for instance, is just one module
among many, not the whole framework (see below).

## What is Spring Boot?

Spring Boot is **not** a replacement for the Spring Framework — it's built directly on top of it.
It's an opinionated layer that solves a different problem: setting up a production-ready Spring
application by hand meant writing large amounts of XML or `@Configuration` boilerplate, manually
choosing compatible library versions, and deploying a WAR to an external, separately-managed
application server. Spring Boot's job is to make that "day one" experience close to instant:

- **Auto-configuration** — sensibly configures beans based on what's on the classpath, covered in
  depth in [Auto-Configuration & Starters](./03-auto-configuration-and-starters.md).
- **Starter dependencies** — curated, version-aligned dependency bundles (`spring-boot-starter-web`),
  so you don't hand-pick and cross-check individual library versions.
- **An embedded server** — the app is a self-contained, runnable JAR with Tomcat/Jetty/Undertow
  built in, rather than an artifact deployed onto a separately-managed server.
- **Production-ready features** — Actuator's health checks and metrics endpoints, covered in
  [Configuration, Profiles & Actuator](./09-configuration-and-actuator.md), with no extra
  scaffolding.

The relationship in one sentence: **Spring gives you the capabilities (DI, AOP, MVC, data access,
security); Spring Boot gives you a fast, opinionated, convention-driven way to assemble and run an
application using those capabilities.** Every Spring Boot application is a Spring application; the
reverse isn't true.

## Spring Boot vs. Spring MVC

This pairing is a common point of confusion because both names contain "Spring" and both come up
when building a REST API — but they're not alternatives to each other, they operate at different
levels:

- **Spring MVC** is a single module of the Spring Framework: the request-handling layer
  (`DispatcherServlet`, `@Controller`, `HandlerMapping`) that turns HTTP requests into method calls
  and responses. It existed for over a decade before Spring Boot did, and required manual
  `DispatcherServlet` registration and configuration in a traditional Spring app.
- **Spring Boot** is a much broader tool: it auto-configures Spring MVC for you (when
  `spring-boot-starter-web` is on the classpath) as *one* of many things it wires up, alongside the
  embedded server, data access, security, and more.

So "Spring Boot vs. Spring MVC" isn't really a fair comparison — Spring Boot auto-configures Spring
MVC, it doesn't compete with it. The apt comparison is "traditional, manually-configured Spring MVC
app" vs. "Spring Boot app," covered next.

## Traditional Spring app vs. Spring Boot app

| | Traditional Spring | Spring Boot |
|---|---|---|
| Configuration | Manual XML or `@Configuration` classes wiring every bean | Auto-configuration infers sensible beans from the classpath; override only what you need |
| Dependency versions | You pick and cross-check every library version yourself | `spring-boot-starter-parent` provides a curated BOM of compatible versions |
| Web server | Deployed as a WAR to an external, separately-managed servlet container (Tomcat, JBoss) | Packaged as an executable "fat" JAR with an embedded server — `java -jar app.jar` runs it directly |
| Ops visibility | Nothing built in — you add your own health/metrics endpoints | Actuator gives you `/health`, `/metrics`, and more out of the box |

## Why an embedded server, and what an executable JAR actually is

Packaging the servlet container *inside* the application artifact — rather than deploying the
application *onto* a separately-installed one — means the app is fully self-contained: the exact
server version is pinned per-service instead of shared and drifting across a fleet of apps on the
same external Tomcat install. This is also what makes Spring Boot apps a natural fit for
containerized/cloud-native deployment: `docker run` a container built around a single executable
JAR is a much simpler deployment unit than "install this WAR into this specific shared app server."

The executable JAR itself (sometimes called a "fat" or "uber" JAR) bundles your compiled classes,
every dependency's compiled classes, and the embedded server, launched via a Spring Boot-specific
bootstrap class (`JarLauncher`) that knows how to find and load nested JARs — a plain
`java -jar` on an ordinary JAR can't do that, since the standard JVM classloader doesn't understand
JAR-within-a-JAR layouts.

## `spring-boot-starter-parent`

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!-- no <version> needed - inherited from the parent's dependency management -->
    </dependency>
</dependencies>
```

Inheriting from `spring-boot-starter-parent` pulls in a dependency management section (a BOM —
bill of materials) that pins compatible versions for hundreds of common third-party libraries, plus
sensible default plugin configuration (the Maven compiler plugin's Java version, resource
filtering, the `spring-boot-maven-plugin` needed to produce the executable JAR). This is what lets
you add a starter with no explicit `<version>` and trust that it's been tested against every other
version in that Spring Boot release, instead of manually resolving version conflicts yourself.

:::info Interview Questions
<SpringAndSpringBootFundamentalsQuestions/>
:::
