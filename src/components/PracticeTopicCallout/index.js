import React from 'react';
import Link from '@docusaurus/Link';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {topics} from '@site/src/data/topics';
import styles from './styles.module.css';

export default function PracticeTopicCallout() {
  const {metadata} = useDoc();
  const topic = topics.find(({slug}) => metadata.id.startsWith(`${slug}/`));

  if (!topic) return null;

  return (
    <aside className={styles.callout} aria-label={`Practice ${topic.title}`}>
      <div>
        <strong>Ready to test your {topic.title} knowledge?</strong>
        <span>Practice {topic.questionCount} interview questions with answers and flashcards.</span>
      </div>
      <Link className="button button--sm" to={topic.practiceTo}>
        Practice this topic →
      </Link>
    </aside>
  );
}
