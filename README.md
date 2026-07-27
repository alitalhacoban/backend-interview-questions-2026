# Backend Interview Questions 2026

A self-hosted, growing reference for backend engineering interview preparation, built with
[Docusaurus](https://docusaurus.io/). Each topic explains the underlying mechanics of a
technology or pattern, not just the vocabulary, and pairs the explanation with diagrams, real
Java/Spring Boot code examples, and a set of interview questions the page prepares you to answer.

It's aimed at backend developers with roughly 0-2 years of experience preparing for interviews
that go beyond surface-level definitions, but should be a useful refresher for anyone.

Live site: `https://alitalhacoban.github.io/backend-interview-questions-2026/`

## What's covered so far

- **Kafka** &mdash; architecture and fundamentals, producer internals, consumer groups and
  rebalancing, delivery semantics, replication and ISR, the outbox/inbox pattern, and common
  production pitfalls.

More topics (Spring Boot, PostgreSQL, Redis, distributed systems, API security, and others) will
be added over time. This is a living project: expect new topics and new questions to show up on
existing pages as the content grows.

## Running locally

Requires Node.js 20+.

```bash
npm install
npm start
```

This starts the local dev server (with live reload) at `http://localhost:3000/backend-interview-questions-2026/`.

To produce a static production build:

```bash
npm run build
npm run serve
```

## Content structure

All content lives under `docs/`, organized as one folder per topic:

```
docs/
  kafka/
    _category_.json          # sidebar label + ordering for the topic
    _partials/                # question lists, imported below - excluded from routing/sidebar
      01-fundamentals-questions.mdx
      ...
    01-fundamentals.md
    02-producer-internals.md
    03-consumer-and-groups.md
    04-delivery-semantics.md
    05-replication-and-isr.md
    06-outbox-and-inbox-pattern.md
    07-common-pitfalls.md
  question-bank/
    _category_.json          # pinned to the bottom of the sidebar (position: 100)
    kafka.mdx                # every Kafka question with its answer, grouped by subtopic
```

- Sidebar ordering is controlled by numeric filename prefixes (`01-`, `02-`, ...).
- Each topic folder has its own `_category_.json` controlling its sidebar label and position.
- The sidebar (`sidebars.js`) auto-generates from this folder structure, so a new topic folder
  with its own `_category_.json` shows up automatically &mdash; no config changes required.
- Each page's "Interview Questions" callout is single-sourced: the bullet list lives in a partial
  file under that topic's `_partials/` folder (ignored by Docusaurus routing because of the `_`
  prefix) and is imported by the explanation page. This is where the *question-only* prompt right
  after the explanation lives.
- `question-bank/<topic>.mdx` is a separate, hand-written page: a question followed immediately by
  a short answer, for every question on the site, grouped by subtopic with one link per group back
  to the full explanation. It exists for quick self-testing without re-reading the prose, so its
  content is intentionally not generated from the `_partials/` files &mdash; the answers there are
  condensed summaries, not duplicates of the full explanation.
- Diagrams use [Mermaid](https://mermaid.js.org/) (via `@docusaurus/theme-mermaid`), rendered
  directly from fenced ` ```mermaid ` code blocks in Markdown.
- Search is local/offline (via `@easyops-cn/docusaurus-search-local`) &mdash; no external service
  or account required.
- Internationalization is configured (`i18n.defaultLocale: 'en'`) so additional locales can be
  added later without restructuring, though only English content exists today.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys it
to GitHub Pages via GitHub Actions. In the repository's **Settings → Pages**, the source must be
set to **GitHub Actions** for this to work.

## Contributing

This is primarily a personal study reference, but corrections, clarifications, and new topics are
welcome:

1. Fork the repo and create a branch for your change.
2. Follow the existing content structure for any new page: short intro, concept explanation, a
   diagram where it helps, a realistic code example, and an "Interview Questions" callout at the
   end. Put the questions themselves in a partial under that topic's `_partials/` folder and
   import it into the callout (see `docs/kafka/_partials/` for the pattern) &mdash; don't inline
   the bullet list directly in the page.
3. Add the same question to `docs/question-bank/<topic>.mdx` (create it, following
   `docs/question-bank/kafka.mdx`, if this is a brand-new topic folder), directly followed by a
   short answer, in the subtopic's section.
4. Run `npm start` locally and confirm both the page and its Question Bank entry render as
   expected before opening a PR.
5. Open a pull request describing what you added or changed and why.
