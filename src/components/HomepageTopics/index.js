import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {topics} from '@site/src/data/topics';
import styles from './styles.module.css';

function TopicCard({title, questionCount, description, learnTo, practiceTo}) {
  return (
    <article className="col col--4 margin-bottom--lg">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Heading as="h3" className={styles.cardTitle}>
            {title}
          </Heading>
          <span className={styles.cardCount}>{questionCount} questions</span>
        </div>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.cardActions}>
          <Link to={learnTo} className={styles.learnLink}>
            Learn topic →
          </Link>
          <Link to={practiceTo} className={styles.practiceLink}>
            Practice →
          </Link>
        </div>
      </div>
    </article>
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
