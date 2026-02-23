# Contributing to DexCode

Thanks for contributing. Follow these guidelines to keep the codebase clean and the review process smooth.

---

## 1. Setup

```bash
git clone git@github.com:heetjain17/LeetProject.git
cd LeetProject/backend
npm install
```

Copy the env file and fill in your values (see README for required variables):

```bash
cp .env.example .env
```

Push the schema to your database:

```bash
npm run db:push
```

Seed sample data:

```bash
npm run db:seed
```

Run the dev server:

```bash
npm run dev
```

---

## 2. Branching

| Branch            | Purpose                           |
| ----------------- | --------------------------------- |
| `main`            | Stable, production-ready          |
| `feature/<name>`  | New features                      |
| `fix/<name>`      | Bug fixes                         |
| `refactor/<name>` | Refactors without behavior change |

Always branch off `main`. No direct commits to `main` — open a PR.

---

## 3. Code Style

The backend uses **ESLint** (flat config) + **Prettier**. Both are wired into a single command:

```bash
npm run prepr
```

This runs `eslint --fix` first, then `prettier --write`. Run it before every commit.

Rules enforced:

- Single quotes, 2-space indent, trailing commas, 100 char line width
- Unused variables are errors — prefix intentionally unused params with `_`
- `any` is a warning, not an error (Drizzle internals require it in a few places)

Never commit:

- Unformatted code
- `.env` or any secrets
- `console.log` left for debugging (use the debug comment pattern if temporary)

---

## 4. Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description
```

**Types**

| Type       | When to use                         |
| ---------- | ----------------------------------- |
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `refactor` | Code change with no behavior change |
| `docs`     | Documentation only                  |
| `chore`    | Dependency updates, config changes  |
| `test`     | Adding or updating tests            |

**Examples**

```
feat(auth): add github oauth callback
fix(code): handle empty testcases on submit
refactor(orm): migrate crud ops to drizzle
chore(deps): upgrade drizzle-kit to 0.31
```

---

## 5. Pull Requests

Run this before opening a PR:

```bash
npm run prepr       # lint + format
npx tsc --noEmit    # type check
```

PR checklist:

- [ ] `npm run prepr` passes with 0 errors
- [ ] `tsc --noEmit` passes with 0 errors
- [ ] No leftover `console.log` debug statements
- [ ] No commented-out code blocks
- [ ] PR title follows Conventional Commits format
- [ ] Description explains what changed and why
- [ ] References related issue if applicable

Merge strategy: **merge commit** (no squash, no rebase) to preserve history.

---

## 6. Architecture

The backend follows a layered architecture — keep each layer's responsibilities clean:

```
Request → Route → Middleware → Controller → Service → Database
```

| Layer          | Responsibility                             |
| -------------- | ------------------------------------------ |
| `routes/`      | Register endpoints, attach middleware      |
| `middleware/`  | Auth, validation, error handling           |
| `controllers/` | Parse request, call service, send response |
| `services/`    | Business logic, all database queries       |
| `db/schema.ts` | Drizzle schema — single source of truth    |
| `validators/`  | Zod schemas for request validation         |

Rules:

- No database queries in controllers — put them in services
- No business logic in routes
- Validate all external input at the route/middleware layer

---

## 7. Database Changes

The project uses **Drizzle ORM** with **Supabase PostgreSQL**.

All schema changes must go through `src/db/schema.ts`. Never modify the database directly.

**Development workflow**

```bash
# Edit src/db/schema.ts, then push changes directly
npm run db:push

# Or generate a migration file first (for production deployments)
npm run db:generate
npm run db:migrate
```

- Keep migrations small and focused — one concern per migration
- If adding a required column to an existing table, provide a default value
- Foreign keys use `onDelete: 'cascade'` by convention — confirm this is correct for your change before adding

---

## 8. Security

- Never trust user input — validate at the route layer with Zod
- Always use environment variables for secrets
- Never commit `.env`
- Don't expose stack traces in production responses — the error middleware handles sanitization
- Passwords must be hashed with `bcryptjs` before storing
