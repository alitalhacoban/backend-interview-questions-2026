import React from 'react';
import styles from './styles.module.css';

function setAllDetails(open) {
  document.querySelectorAll('article details').forEach((details) => {
    // Docusaurus's <details> tracks open/closed via React state
    // (`data-collapsed`) and a CSS height animation, not the native `open`
    // attribute, so it must be toggled by simulating a click on <summary>.
    const isCollapsed = details.dataset.collapsed !== 'false';
    if (open === isCollapsed) {
      details.querySelector(':scope > summary')?.click();
    }
  });
}

export default function ExpandCollapseAll() {
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className="button button--secondary button--sm"
        onClick={() => setAllDetails(true)}>
        Expand all
      </button>
      <button
        type="button"
        className="button button--secondary button--sm"
        onClick={() => setAllDetails(false)}>
        Collapse all
      </button>
    </div>
  );
}
