# Contributing to NutriMind OS 🧬

Thanks for your interest in improving NutriMind OS! This guide explains how the project is organized, how to get a local environment running, and what we expect from a pull request before it lands in `main`.

---

## Table of Contents

1. [Welcome](#welcome)
2. [Ways to Contribute](#ways-to-contribute)
3. [Prerequisites](#prerequisites)
4. [Local Setup](#local-setup)
5. [Environment Setup](#environment-setup)
6. [Running the Project](#running-the-project)
7. [Repository Structure](#repository-structure)
8. [Branch Naming Conventions](#branch-naming-conventions)
9. [Coding Standards](#coding-standards)
10. [Commit Message Conventions](#commit-message-conventions)
11. [Pull Request Checklist](#pull-request-checklist)
12. [Reporting Issues](#reporting-issues)
13. [Requesting Features](#requesting-features)
14. [Code Review Expectations](#code-review-expectations)
15. [Documentation Contributions](#documentation-contributions)
16. [Reporting Security Issues](#reporting-security-issues)
17. [Community Etiquette](#community-etiquette)
18. [Thank You](#thank-you)

---

## Welcome

NutriMind OS is a full-stack health intelligence platform — React on the front end, Express on the back end, Turso for storage, and Groq's Llama 3.3 70B doing the AI heavy lifting. Whether you're fixing a chart rendering bug in `Analytics.jsx`, tightening up a Groq prompt in `userRoutes.js`, or just correcting a typo in this doc, your contribution matters. This file exists so you can get from "I want to help" to "my PR is open" with as little friction as possible.

## Ways to Contribute

You don't need to write code to contribute. Useful contributions include:

| Type | Examples |
|---|---|
| **Bug fixes** | Incorrect macro calculations, broken charts, auth edge cases |
| **Features** | Extending an existing health profile, improving the AI chat parsing, new analytics views |
| **Performance** | Reducing Groq round-trip latency, optimizing Turso queries, trimming bundle size |
| **Documentation** | Clarifying setup steps, fixing outdated env var references, improving API endpoint docs |
| **Testing** | Adding coverage around `auth.js`, `db.js`, or AI response parsing |
| **Triage** | Reproducing reported bugs, labeling issues, reviewing open PRs |

> **Note:** If you're proposing a larger architectural change (e.g. swapping Turso for another DB, changing the AI provider), please open an issue first so we can discuss direction before you invest the time.

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** (the project targets Node 20 in production)
- A free **[Groq API key](https://console.groq.com)** — no credit card required
- A free **[Turso database](https://app.turso.tech)** — or skip this for local dev (see below)
- Git, and a GitHub account

## Local Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/NutriMind-Ai.git
cd NutriMind-Ai

# 2. Add the upstream remote so you can sync later
git remote add upstream https://github.com/pallaviXD/NutriMind-Ai.git

# 3. Install dependencies
npm install
```

## Environment Setup

Copy the example env file and fill in your own credentials — never commit `.env`.

```bash
cp .env.example .env
```

```env
JWT_SECRET=any_long_random_string_32_chars_min
GROQ_API_KEY=gsk_your_groq_key_here
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token
PORT=3001
CLIENT_URL=http://localhost:5173
```

> **Tip:** Leave `TURSO_*` blank for local development — the backend falls back to a local SQLite file, so you don't need a hosted database just to contribute.

## Running the Project

```bash
npm run dev:all      # frontend (5173) + backend (3001) together
# or run them separately in two terminals:
npm run server       # backend only
npm run dev           # frontend only
```

Visit [http://localhost:5173](http://localhost:5173) and sign up for a local test account to exercise the full flow (profile setup → chat → meal logging → analytics).

## Repository Structure

A quick map so you know where to make your change — see the README for the full tree.

| Path | What lives here |
|---|---|
| `server/routes/` | Express route handlers (`authRoutes.js`, `userRoutes.js`, `workoutRoutes.js`) |
| `server/db.js` | Turso/libSQL schema and DB client |
| `src/components/` | Dashboard panels, Kitchen, Analytics, Workouts, etc. |
| `src/context/` | `AuthContext.jsx` and `GlobalContext.jsx` — global state |
| `src/pages/` | Top-level routed pages (landing, login, signup, setup) |
| `src/services/aiService.js` | Front-end interface to `/api/user/chat` |

## Branch Naming Conventions

Branch off `main` using one of these prefixes:

| Prefix | Use for |
|---|---|
| `feat/` | New features (e.g. `feat/water-reminders`) |
| `fix/` | Bug fixes (e.g. `fix/bmr-calculation`) |
| `chore/` | Tooling, deps, config (e.g. `chore/update-vite`) |
| `docs/` | Documentation only (e.g. `docs/api-endpoints`) |
| `refactor/` | Non-behavioral code changes |
| `test/` | Adding or fixing tests |

```bash
git checkout -b feat/short-descriptive-name
```

## Coding Standards

We don't enforce a heavyweight style guide, but please keep these conventions in mind so the codebase stays consistent.

**React (`src/`)**
- Functional components with Hooks only — no class components.
- One component per file; file name matches the component name (`Kitchen.jsx`, not `kitchen.jsx`).
- Keep components in `src/components/` lean; move shared logic into `src/context/` or a hook rather than duplicating state handling.
- Co-locate UI-only pieces under `src/components/ui/` (see `SmokeBackground.jsx` for the existing pattern).

**Vite**
- Don't hardcode ports or URLs — use `import.meta.env` and the existing `.env` pattern.
- Avoid adding new build plugins unless there's a clear, discussed need.

**Express (`server/`)**
- Routes stay thin — validation and response shaping in the route, business logic delegated to helper modules where it grows beyond a few lines.
- All DB access goes through parameterized queries in `db.js` — never interpolate user input into SQL strings.
- New routes must pass through the existing `helmet` and rate-limiting middleware; don't bypass it for "just this one endpoint."
- Any new AI-calling route should follow the existing pattern in `userRoutes.js`: server-side only, `response_format: json_object`, with retry/backoff.

**Tailwind CSS**
- Prefer utility classes over custom CSS files; if a pattern repeats more than twice, extract it into a component rather than a new global class.
- Keep class lists readable — group by layout → spacing → typography → color when a className gets long.
- Use Framer Motion for animation rather than ad-hoc CSS transitions, to stay consistent with the rest of the UI.

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

[optional body]
[optional footer]
```

| Type | Use for |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that's neither a fix nor a feature |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependency, or tooling changes |

```bash
git commit -m "feat(analytics): add weekly macro trend chart"
git commit -m "fix(auth): correct token expiry check in middleware"
```

## Pull Request Checklist

Before opening a PR, confirm:

- [ ] Branch is up to date with `upstream/main`
- [ ] `npm run dev:all` runs locally without errors
- [ ] No `.env`, API keys, or secrets are included in the diff
- [ ] New routes are covered by rate limiting / auth middleware where applicable
- [ ] UI changes were checked at both desktop and mobile widths
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains **what** changed and **why**, with screenshots for UI changes
- [ ] Linked to a relevant issue, if one exists (`Closes #123`)

> **Note:** Small, focused PRs are reviewed faster than large ones. If your change touches both backend and frontend in unrelated ways, consider splitting it into two PRs.

## Reporting Issues

Open an issue on GitHub and include:

1. **Steps to reproduce** — be specific (which page, which action, which profile type)
2. **Expected vs. actual behavior**
3. **Environment** — browser, OS, and whether you're running locally or against the live demo
4. **Logs or screenshots**, if relevant (redact any API keys or tokens)

## Requesting Features

We welcome feature ideas that build on what NutriMind OS already does — meal logging, recipes, analytics, workouts, body stats. When opening a feature request, include:

- The problem you're trying to solve (not just the solution)
- Which existing area it relates to (Dashboard, Kitchen, Analytics, Workouts, etc.)
- Any relevant context on how it should behave with the AI chat or health profiles

> Please open an issue before submitting a large feature PR — it saves everyone time if the direction needs discussion first.

## Code Review Expectations

- Maintainers aim to give a first review within a few days.
- Reviews focus on correctness, security (especially around auth and SQL queries), and consistency with existing patterns — not nitpicking style if it's already reasonable.
- Be ready for follow-up questions or requested changes; this is a normal part of getting a PR merged, not a rejection.
- Once approved, a maintainer will merge — please don't force-merge your own PR.

## Documentation Contributions

Docs live primarily in `README.md` and this file. When contributing docs:

- Match the existing tone — direct, concise, table-driven where it helps scanability.
- If you change an API endpoint, environment variable, or setup step in code, update the corresponding table in the README in the same PR.
- Keep code blocks runnable and copy-pasteable; verify commands actually work before submitting.

## Reporting Security Issues

If you discover a security vulnerability (e.g. an auth bypass, SQL injection vector, or exposed secret), **please do not open a public issue.**

Instead, report it privately by opening a [GitHub Security Advisory](https://github.com/pallaviXD/NutriMind-Ai/security/advisories/new) on the repository, or contact a maintainer directly. We'll work with you to confirm the issue and coordinate a fix before any public disclosure.

> **Note:** Given that NutriMind OS handles personal health data, JWTs, and bcrypt-hashed passwords, we take reports involving auth, rate limiting, or data exposure especially seriously.

## Community Etiquette

- Be respectful and assume good intent — most disagreements are about tradeoffs, not right vs. wrong.
- Keep discussions on-topic and in the relevant issue or PR thread.
- Constructive criticism is welcome; personal attacks are not.
- If a discussion stalls, it's fine to tag a maintainer for a tie-breaking opinion.

## Thank You

NutriMind OS is better because people take the time to file a clear bug report, send a clean PR, or improve a confusing paragraph in the docs. Whatever size your contribution is, thank you for putting in the effort — we're glad you're here.