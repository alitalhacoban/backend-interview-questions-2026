import React, {useEffect, useState} from 'react';
import ExpandCollapseAll from '@site/src/components/ExpandCollapseAll';
import Flashcards from '@site/src/components/Flashcards';
import styles from './styles.module.css';

export default function PracticeTools() {
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    setQuestionCount(document.querySelectorAll('article details').length);
  }, []);

  return (
    <section className={styles.panel} aria-label="Practice tools">
      <div className={styles.headingRow}>
        <div>
          <strong>Practice tools</strong>
          <span>{questionCount} questions</span>
        </div>
        <div className={styles.actions}>
          <ExpandCollapseAll compact />
          <Flashcards compact />
        </div>
      </div>
    </section>
  );
}
