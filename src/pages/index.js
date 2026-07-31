import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/kafka/fundamentals">
            Browse the Topics →
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/question-bank/kafka">
            Browse the Question Bank →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A living, topic-by-topic reference for backend engineering interviews: Kafka, databases, distributed systems, API design, and more.">
      <HomepageHeader />
      <main>
        <section className={styles.aboutSection}>
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <Heading as="h2">What this is</Heading>
                <p>
                  This is a growing, self-hosted reference for backend
                  engineering interview preparation. Each topic is written to
                  actually explain the underlying mechanics&mdash;not just
                  define terms&mdash;so that you can reason about follow-up
                  questions, not just recite an answer.
                </p>
                <p>
                  Every page mixes concept explanations, diagrams, and
                  real Java/Spring Boot code examples, and closes with a set
                  of interview questions that the page's content prepares you
                  to answer.
                </p>
                <Heading as="h2">Currently covered</Heading>
                <ul>
                  <li>
                    <Link to="/docs/kafka/fundamentals">Kafka</Link> &mdash;
                    architecture, producer/consumer internals, delivery
                    semantics, replication, the outbox/inbox pattern, and
                    common pitfalls.
                  </li>
                  <li>
                    <Link to="/docs/java-core/oop-fundamentals">Java Core</Link>{' '}
                    &mdash; OOP fundamentals, the JVM and memory model, the
                    collections framework, exception handling, concurrency,
                    generics and type erasure, streams and functional
                    interfaces, and string/object contracts.
                  </li>
                  <li>
                    <Link to="/docs/spring-boot/spring-and-spring-boot-fundamentals">
                      Spring Boot
                    </Link>{' '}
                    &mdash; Spring and Spring Boot fundamentals, IoC and
                    dependency injection, auto-configuration and starters,
                    Spring MVC and REST, Spring Data JPA and transactions, AOP
                    and proxies, Spring Security, testing,
                    configuration/profiles/Actuator, and design patterns as
                    they actually show up in Spring's own APIs.
                  </li>
                  <li>
                    <Link to="/docs/dbms/dbms-fundamentals">DBMS</Link>{' '}
                    &mdash; relational theory, keys and SQL, normalization,
                    indexing, transactions and ACID, concurrency control and
                    isolation levels, query optimization, storage and
                    recovery, and replication/sharding/NoSQL.
                  </li>
                  <li>
                    <Link to="/docs/design-patterns/design-patterns-fundamentals">
                      Design Patterns
                    </Link>{' '}
                    &mdash; GoF creational, structural, and behavioral
                    patterns, Singleton and thread safety, dependency
                    injection and enterprise patterns, concurrency patterns,
                    and anti-patterns/pattern selection.
                  </li>
                  <li>
                    <Link to="/docs/microservices/microservices-fundamentals">
                      Microservices
                    </Link>{' '}
                    &mdash; microservices fundamentals, service communication,
                    API gateways and service discovery, data management and
                    distributed transactions, resilience patterns,
                    observability, deployment and orchestration, security, and
                    anti-patterns/trade-offs.
                  </li>
                </ul>
                <p>
                  More topics (PostgreSQL, Redis, distributed systems, API
                  security, and others) will be added over time. This is a
                  living project, not a finished one.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
