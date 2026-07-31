---
title: Testing
sidebar_label: Testing
---

import TestingQuestions from './_partials/08-testing-questions.mdx';

# Testing

The interview signal here isn't "do you know `@SpringBootTest` exists" — it's whether you pick the
*narrowest* test slice that actually exercises what you're testing, because loading a full
`ApplicationContext` for a test that only needs one repository is the single most common cause of a
slow CI suite.

## The test pyramid, Spring-flavored

| Annotation | Context loaded | Speed | Use for |
|---|---|---|---|
| Plain JUnit + Mockito, no Spring annotation | None | Fastest | Pure unit tests of a service with mocked collaborators |
| `@WebMvcTest(OrderController.class)` | Only the web layer (controller, filters, `@ControllerAdvice`) | Fast | Controller request/response mapping, validation, error handling |
| `@DataJpaTest` | Only the JPA layer (repositories, an embedded/test DB) | Fast | Repository queries, derived query methods |
| `@SpringBootTest` | Full application context | Slow | True end-to-end integration tests |

## Slice tests

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean OrderService orderService; // real service NOT loaded - only the web layer is

    @Test
    void returns404WhenOrderMissing() throws Exception {
        given(orderService.findById(1L)).willThrow(new OrderNotFoundException(1L));

        mockMvc.perform(get("/api/orders/1"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
    }
}
```

`@WebMvcTest` boots only the MVC infrastructure — the controller under test, its
`@RestControllerAdvice`s, filters, and message converters — and explicitly does **not** load
`@Service`/`@Repository` beans, so any dependency the controller needs must be supplied as a
`@MockBean` (a Mockito mock registered into the slice's context). This makes the test fast and
narrowly scoped: a bug in `OrderService` can't make this test fail, because the real
`OrderService` was never instantiated.

`@DataJpaTest` is the mirror image for the persistence layer: it configures an embedded/test
database, scans `@Entity` classes and Spring Data repositories, wraps each test in a transaction
that rolls back afterward, and by default swaps in an in-memory database unless you disable that
with `@AutoConfigureTestDatabase(replace = Replace.NONE)`.

## `@SpringBootTest`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderIntegrationTest {

    @Autowired TestRestTemplate restTemplate;

    @Test
    void placesOrderEndToEnd() {
        var response = restTemplate.postForEntity("/api/orders", newOrderRequest(), OrderResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

`@SpringBootTest` boots the entire application context — all real beans, real auto-configuration —
optionally with a real embedded servlet container (`WebEnvironment.RANDOM_PORT`) for genuine HTTP
round-trip tests via `TestRestTemplate` or `WebTestClient`. It's the right tool for true end-to-end
tests, but is deliberately reserved for a small number of critical-path scenarios, not the default
for every test, because each one pays the full context-startup cost.

## `MockMvc` vs. `@MockBean`

These solve different problems and are easy to conflate: **`MockMvc`** simulates the servlet
request/response cycle *without* starting a real HTTP server — it drives `DispatcherServlet`
directly, which is what makes `@WebMvcTest` fast. **`@MockBean`** replaces a specific *bean* in the
Spring context with a Mockito mock, regardless of which test annotation is in use — it's about
what's inside the context, not how requests are simulated.

## Testcontainers

```java
@SpringBootTest
@Testcontainers
class OrderRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```

An in-memory database (H2) is fast but doesn't behave identically to production Postgres/MySQL —
different SQL dialect quirks, constraint behavior, and locking semantics can hide real bugs.
Testcontainers spins up the **real** database engine in a throwaway Docker container scoped to the
test class, giving integration tests production-equivalent behavior at the cost of needing Docker
available in CI. This is now the standard recommendation over H2 for anything beyond the simplest
repository test.

:::info Interview Questions
<TestingQuestions/>
:::
