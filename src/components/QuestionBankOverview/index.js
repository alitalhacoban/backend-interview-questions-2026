import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {topics, totalQuestions} from '@site/src/data/topics';
import styles from './styles.module.css';

export default function QuestionBankOverview() {
  return (
    <>
      <div className={styles.summary}>
        <div>
          <strong>{totalQuestions}</strong>
          <span>questions</span>
        </div>
        <div>
          <strong>{topics.length}</strong>
          <span>topics</span>
        </div>
        <div>
          <strong>2</strong>
          <span>difficulty levels</span>
        </div>
      </div>
      <div className={styles.legend} aria-label="Question difficulty legend">
        <span><span className="qb-badge qb-badge--core">Core</span>Essential interview knowledge</span>
        <span><span className="qb-badge qb-badge--edge">Edge Case</span>Deeper follow-up questions</span>
      </div>
      <div className={styles.grid}>
        {topics.map((topic) => (
          <Link key={topic.slug} to={topic.practiceTo} className={styles.card}>
            <div>
              <Heading as="h2">{topic.title}</Heading>
              <p>{topic.description}</p>
            </div>
            <span className={styles.count}>{topic.questionCount} questions →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
