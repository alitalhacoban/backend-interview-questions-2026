import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const topics = [
  {
    title: 'Kafka',
    count: 44,
    description:
      'Architecture, producer/consumer internals, delivery semantics, replication, the outbox/inbox pattern, and common pitfalls.',
    to: '/docs/kafka/fundamentals',
  },
  {
    title: 'Java Core',
    count: 50,
    description:
      'OOP fundamentals, the JVM and memory model, collections, exceptions, concurrency, generics, streams, and object contracts.',
    to: '/docs/java-core/oop-fundamentals',
  },
  {
    title: 'Spring Boot',
    count: 61,
    description:
      'IoC and DI, auto-configuration, Spring MVC and REST, Spring Data JPA, AOP, Spring Security, testing, and Actuator.',
    to: '/docs/spring-boot/spring-and-spring-boot-fundamentals',
  },
  {
    title: 'DBMS',
    count: 59,
    description:
      'Relational theory, normalization, indexing, transactions and ACID, isolation levels, query optimization, and replication.',
    to: '/docs/dbms/dbms-fundamentals',
  },
  {
    title: 'Design Patterns',
    count: 64,
    description:
      'GoF creational, structural, and behavioral patterns, Singleton thread safety, DI, concurrency patterns, and anti-patterns.',
    to: '/docs/design-patterns/design-patterns-fundamentals',
  },
  {
    title: 'Microservices',
    count: 59,
    description:
      'Service communication, API gateways, service discovery, distributed transactions, resilience, and observability.',
    to: '/docs/microservices/microservices-fundamentals',
  },
];

function TopicCard({title, count, description, to}) {
  return (
    <div className="col col--4 margin-bottom--lg">
      <Link to={to} className={styles.card}>
        <div className={styles.cardHeader}>
          <Heading as="h3" className={styles.cardTitle}>
            {title}
          </Heading>
          <span className={styles.cardCount}>{count}</span>
        </div>
        <p className={styles.cardDescription}>{description}</p>
      </Link>
    </div>
  );
}

export default function HomepageTopics() {
  return (
    <div className="row">
      {topics.map((topic) => (
        <TopicCard key={topic.title} {...topic} />
      ))}
    </div>
  );
}
