import React from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function DocsModeSwitch() {
  const {pathname} = useLocation();
  const isPractice = pathname.includes('/docs/question-bank');

  return (
    <nav className={styles.switcher} aria-label="Choose a learning mode">
      <Link
        to="/docs/category/kafka"
        className={clsx(styles.option, !isPractice && styles.active)}>
        <span aria-hidden="true">▤</span>
        Learn
      </Link>
      <Link
        to="/docs/question-bank"
        className={clsx(styles.option, isPractice && styles.activePractice)}>
        <span aria-hidden="true">◎</span>
        Practice
      </Link>
    </nav>
  );
}
