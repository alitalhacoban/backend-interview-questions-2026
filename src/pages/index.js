import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import HomepageTopics from '@site/src/components/HomepageTopics';
import {totalQuestions} from '@site/src/data/topics';
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
        <div className={styles.journeyGrid}>
          <Link
            className={styles.journeyCard}
            to="/docs/kafka/fundamentals">
            <span className={styles.journeyIcon} aria-hidden="true">▤</span>
            <strong>Learn a Topic</strong>
            <small>Explanations, diagrams, and code examples</small>
            <span>Start learning →</span>
          </Link>
          <Link
            className={`${styles.journeyCard} ${styles.practiceJourney}`}
            to="/docs/question-bank">
            <span className={styles.journeyIcon} aria-hidden="true">◎</span>
            <strong>Practice Questions</strong>
            <small>{totalQuestions} answers and shuffled flashcards</small>
            <span>Start practicing →</span>
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
              </div>
            </div>
          </div>
        </section>
        <section className={styles.topicsSection}>
          <div className="container">
            <HomepageTopics />
            <p className={styles.moreTopics}>
              More topics (PostgreSQL, Redis, distributed systems, API
              security, and others) will be added over time. This is a
              living project, not a finished one.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
