---
title: Auto-Configuration & Starters
sidebar_label: Auto-Configuration & Starters
---

import AutoConfigurationAndStartersQuestions from './_partials/03-auto-configuration-and-starters-questions.mdx';

# Auto-Configuration & Starters

"What does `@SpringBootApplication` actually do?" is a filter question — it separates people who
have memorized that it's "three annotations in one" from people who understand how Spring Boot
decides, at startup, which beans to create for you without any XML or explicit `@Bean` methods.

## `@SpringBootApplication`

```java
@SpringBootApplication
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

This is a meta-annotation composing three:

- **`@SpringBootConfiguration`** — a specialized `@Configuration`, marking the class as a source of
  bean definitions.
- **`@ComponentScan`** — scans the package of the annotated class and its sub-packages for
  `@Component`-stereotyped classes. This is why your main class's package placement matters: a
  `@Service` sitting in a sibling package your main class doesn't scan will silently never be
  registered.
- **`@EnableAutoConfiguration`** — the actual auto-configuration trigger, described below.

## How auto-configuration decides what to create

`@EnableAutoConfiguration` tells Spring Boot to look up candidate configuration classes listed in
`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (the successor
to the older `spring.factories` mechanism, used since Spring Boot 2.7+) on the classpath, and
conditionally apply each one.

```java
@AutoConfiguration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
```

Every auto-configuration class is guarded by one or more `@Conditional*` annotations, evaluated at
startup:

| Annotation | Applies its bean(s) only if... |
|---|---|
| `@ConditionalOnClass` | A given class is present on the classpath |
| `@ConditionalOnMissingClass` | A given class is absent from the classpath |
| `@ConditionalOnBean` | A bean of a given type already exists in the context |
| `@ConditionalOnMissingBean` | No bean of a given type exists yet — this is the one that makes auto-config "backs off" whenever you define your own |
| `@ConditionalOnProperty` | A given property is set (optionally to a specific value) in configuration |
| `@ConditionalOnWebApplication` | The application context is a web application (servlet or reactive) |

This is why adding `spring-boot-starter-data-jpa` to the classpath is enough to get a working
`DataSource`, `EntityManagerFactory`, and `JpaTransactionManager` with zero configuration: the
relevant classes become present on the classpath, `@ConditionalOnClass` passes, and no
`@ConditionalOnMissingBean` beans exist yet to block them.

## Starters

A "starter" (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, ...) is not code — it's a
Maven/Gradle dependency descriptor with no classes of its own, that pulls in a curated, mutually
compatible set of libraries (e.g. `spring-boot-starter-web` pulls in Spring MVC, an embedded
Tomcat, Jackson) plus the matching `spring-boot-autoconfigure` module. Adding one line to your
build file is what puts the classes on the classpath that the `@ConditionalOnClass` checks above
are watching for.

## Overriding auto-configuration

Because most auto-configuration beans are guarded by `@ConditionalOnMissingBean`, defining your own
bean of the same type simply wins — auto-config quietly backs off instead of clashing:

```java
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource(customHikariConfig()); // auto-config's DataSource never gets created
    }
}
```

This "convention over configuration with an escape hatch" pattern — sensible defaults that get out
of the way the moment you're explicit — is the core design philosophy of Spring Boot, and it's
worth being able to say that in exactly those terms in an interview.

## Auto-configuration ordering

When one auto-configuration class depends on beans another one creates, ordering matters.
`@AutoConfigureAfter`/`@AutoConfigureBefore` (and the coarser `@AutoConfigureOrder`) declare that
relationship explicitly — e.g. `JpaRepositoriesAutoConfiguration` runs `@AutoConfigureAfter`
`DataSourceAutoConfiguration`, because it needs a `DataSource` bean to already exist.

## Writing a custom starter

A custom internal starter (e.g. `acme-audit-logging-starter`) is just:

1. An `@AutoConfiguration` class with the conditionals appropriate to when it should activate.
2. An entry for that class in
   `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.
3. Optionally, a companion `-autoconfigure` and thin `-starter` module split (the convention Spring
   Boot itself uses), so consumers depend on the starter and get the autoconfigure module
   transitively.

```
# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.acme.audit.AuditAutoConfiguration
```

:::info Interview Questions
<AutoConfigurationAndStartersQuestions/>
:::
