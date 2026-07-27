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
            Start with Kafka →
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
                </ul>
                <p>
                  More topics (Spring Boot, PostgreSQL, Redis, distributed
                  systems, API security, and others) will be added over time.
                  This is a living project, not a finished one.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
