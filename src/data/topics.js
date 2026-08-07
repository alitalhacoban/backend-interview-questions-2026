export const topics = [
  {
    slug: 'java-core',
    title: 'Java Core',
    questionCount: 74,
    learnTo: '/docs/category/java-core',
    practiceTo: '/docs/question-bank/java-core',
    description:
      'OOP fundamentals, the JVM and memory model, collections, exceptions, concurrency, generics, streams, and object contracts.',
  },
  {
    slug: 'design-patterns',
    title: 'Design Patterns',
    questionCount: 64,
    learnTo: '/docs/category/design-patterns',
    practiceTo: '/docs/question-bank/design-patterns',
    description:
      'GoF creational, structural, and behavioral patterns, Singleton thread safety, DI, concurrency patterns, and anti-patterns.',
  },
  {
    slug: 'spring-boot',
    title: 'Spring Boot',
    questionCount: 61,
    learnTo: '/docs/category/spring-boot',
    practiceTo: '/docs/question-bank/spring-boot',
    description:
      'IoC and DI, auto-configuration, Spring MVC and REST, Spring Data JPA, AOP, Spring Security, testing, and Actuator.',
  },
  {
    slug: 'dbms',
    title: 'DBMS',
    questionCount: 59,
    learnTo: '/docs/category/dbms',
    practiceTo: '/docs/question-bank/dbms',
    description:
      'Relational theory, normalization, indexing, transactions and ACID, isolation levels, query optimization, and replication.',
  },
  {
    slug: 'microservices',
    title: 'Microservices',
    questionCount: 59,
    learnTo: '/docs/category/microservices',
    practiceTo: '/docs/question-bank/microservices',
    description:
      'Service communication, API gateways, service discovery, distributed transactions, resilience, and observability.',
  },
  {
    slug: 'kafka',
    title: 'Kafka',
    questionCount: 44,
    learnTo: '/docs/category/kafka',
    practiceTo: '/docs/question-bank/kafka',
    description:
      'Architecture, producer/consumer internals, delivery semantics, replication, the outbox/inbox pattern, and common pitfalls.',
  },
];

export const totalQuestions = topics.reduce(
  (total, topic) => total + topic.questionCount,
  0,
);
