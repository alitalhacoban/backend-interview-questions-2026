import React, {useCallback, useEffect, useState} from 'react';
import styles from './styles.module.css';

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Docusaurus's <details> keeps hidden answers in the DOM (lazy={false}) but
// marks their wrapper with inline `display:none; height:0` while collapsed
// (see @docusaurus/theme-common's Collapsible component). Cloning the node
// and stripping those inline styles is what makes a not-yet-opened answer
// actually visible once it's copied onto the back of a card below.
function collectCards() {
  return Array.from(document.querySelectorAll('article details:not([hidden])'))
    .map((details) => {
      const summary = details.querySelector(':scope > summary');
      if (!summary) {
        return null;
      }
      const clone = details.cloneNode(true);
      clone.querySelector(':scope > summary')?.remove();
      clone.querySelectorAll('[style]').forEach((el) => {
        el.style.removeProperty('display');
        el.style.removeProperty('height');
        el.style.removeProperty('overflow');
      });
      return {
        id: details.id,
        question: summary.textContent.trim(),
        answerHTML: clone.innerHTML,
      };
    })
    .filter(Boolean);
}

export default function Flashcards({compact = false}) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const start = useCallback(() => {
    setCards(shuffle(collectCards()));
    setIndex(0);
    setFlipped(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const next = useCallback(() => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  }, [cards.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowRight') {
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flip();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close, next, prev, flip]);

  const card = cards[index];

  return (
    <>
      <div className={compact ? styles.controlsCompact : styles.controls}>
        <button
          type="button"
          className="button button--secondary button--sm"
          onClick={start}>
          Flashcards
        </button>
      </div>
      {open && card && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <span className={styles.progress}>
                {index + 1} / {cards.length}
              </span>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={close}>
                Close
              </button>
            </div>

            <div className={styles.stage}>
              <div
                key={card.id || index}
                className={styles.flashcard}
                role="button"
                tabIndex={0}
                onClick={flip}
                aria-label="Flip card">
                <div
                  className={
                    flipped
                      ? `${styles.flashcardInner} ${styles.flipped}`
                      : styles.flashcardInner
                  }>
                  <div className={`${styles.face} ${styles.faceFront}`}>
                    <p className={styles.question}>{card.question}</p>
                    <span className={styles.hint}>Click to flip</span>
                  </div>
                  <div className={`${styles.face} ${styles.faceBack}`}>
                    <div
                      className={styles.answer}
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{__html: card.answerHTML}}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.nav}>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={prev}
                disabled={index === 0}>
                ← Prev
              </button>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={start}>
                Shuffle again
              </button>
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={next}
                disabled={index + 1 >= cards.length}>
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
