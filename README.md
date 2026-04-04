# DexCode

> **Master competitive programming. Write code in the browser. Get instant feedback. Compete globally.**

DexCode is a full-stack, open-source competitive programming platform that combines the problem-solving depth of LeetCode with a modern, developer-first architecture. Built with TypeScript, Express, Drizzle ORM, and PostgreSQL.

> [!IMPORTANT]
> **🧪 DexCode is currently in closed beta.** Public registration is disabled. Beta testers use pre-assigned credentials. See the [Beta Info](#beta) section below.

## Features

- **Code Execution**: Write and run code in your browser against example test cases in real-time
- **Real-time Judging**: Submit solutions for automated grading against all test cases via Judge0
- **Progress Tracking**: Track submissions, solved problems, and build your portfolio
- **Social Features**: Discuss solutions, rate problems, and learn from the community
- **Playlists**: Curate problem sets for focused learning
- **Multi-language Support**: Python, Java, JavaScript, C++
- **Admin Dashboard**: Create, manage, and publish problems with tags, companies, and difficulty levels

---

## Beta

DexCode is in **closed beta** on the `dev+beta` branch.

### What's Different in Beta

| Feature | Status |
|---|---|
| Registration (email) | 🔒 Disabled |
| OAuth (Google/GitHub) | 🔒 New accounts disabled |
| Login (existing users) | ✅ Works |
| Code execution & judging | ✅ Works |
| Discussions & playlists | ✅ Works |
| Rate limits | ⚡ Relaxed for testing |

### Beta Deployment

| Service | Platform | URL |
|---|---|---|
| Backend | Render (free tier) | `https://dexcode-backend.onrender.com` |
| Frontend | Vercel (free tier) | `https://dexcode.vercel.app` |
| Database | Supabase | — |

### Beta Credentials

Beta testers receive pre-assigned credentials. If you need access, contact the maintainers.

### Toggling Beta Mode

All beta restrictions are controlled by a single env var:

```env
BETA_MODE=true   # Beta: registration disabled, OAuth gated
BETA_MODE=false  # Normal: everything open
```

---

## Tech Stack

### Backend

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Runtime        | Node.js + TypeScript                                |
| Framework      | Express 5                                           |
| ORM            | Drizzle ORM                                         |
| Database       | PostgreSQL (Supabase)                               |
| Auth           | JWT (access + refresh tokens) + Google/GitHub OAuth |
| Code Execution | Judge0 (RapidAPI)                                   |
| Validation     | Zod                                                 |
| Email          | Nodemailer + Mailtrap                               |

### Frontend

| Layer     | Technology                    |
| --------- | ----------------------------- |
| Framework | Next.js 16 + React 19        |
| Styling   | Tailwind CSS 4                |
| UI        | shadcn/ui + Radix             |
| Editor    | Monaco Editor                 |
| State     | TanStack Query                |

---

## Repository Structure

```
DexCode/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic & DB queries
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/          # Express routers
│   │   ├── config/          # Rate limit configs
│   │   ├── db/
│   │   │   ├── schema.ts    # Drizzle schema (25 tables, 5 enums)
│   │   │   ├── seed.ts      # Database seeder
│   │   │   └── seed-beta.ts # Beta account seeder
│   │   ├── libs/            # DB client, Judge0 client
│   │   ├── validators/      # Zod schemas
│   │   ├── utils/           # ApiError, asyncHandler, mail
│   │   └── index.ts         # Entry point
│   ├── drizzle/migrations/  # Generated SQL migrations
│   ├── drizzle.config.ts
│   └── package.json
├── frontend/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # API client, utilities
│   └── package.json
├── render.yaml              # Render deployment blueprint
└── README.md
```

---

## Database Schema

25 tables across 6 domains, all hosted on Supabase PostgreSQL.

| Domain      | Tables                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| Auth        | `User`, `Profile`                                                         |
| Problems    | `Problem`, `TestCase`, `CodeTemplate`, `Example`, `Constraint`, `Hint`    |
| Taxonomy    | `Tag`, `Company`, `Topic`, `ProblemTag`, `ProblemCompany`, `ProblemTopic` |
| Submissions | `Submission`, `TestCaseResult`                                            |
| Progress    | `ProblemSolved`, `ProblemRating`                                          |
| Playlists   | `Playlist`, `ProblemInPlaylist`                                           |
| Discussions | `Discussion`, `DiscussionComment`, `DiscussionVote`, `CommentVote`        |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (or any PostgreSQL instance)
- Judge0 API access (RapidAPI or self-hosted)

### Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Push schema to your database:

```bash
npm run db:push
```

Seed sample data (37 problems, users, tags, companies):

```bash
npm run db:seed
```

Seed beta tester accounts (with real hashed passwords):

```bash
npm run db:seed-beta
```

Run the dev server:

```bash
npm run dev
```

The server starts on `http://localhost:8080`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Run the dev server:

```bash
npm run dev
```

The frontend starts on `http://localhost:3000`.

### Available Scripts

#### Backend

| Script                | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start dev server with hot reload    |
| `npm run db:push`     | Push schema changes directly to DB  |
| `npm run db:generate` | Generate SQL migration files        |
| `npm run db:migrate`  | Apply generated migrations          |
| `npm run db:studio`   | Open Drizzle Studio GUI             |
| `npm run db:seed`     | Seed problems & sample data         |
| `npm run db:seed-beta`| Seed beta tester accounts           |

#### Frontend

| Script            | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start Next.js dev server       |
| `npm run build`   | Production build               |
| `npm run start`   | Start production server        |

---

## API Reference

See [`backend/API_DOCS.md`](backend/API_DOCS.md) for full endpoint documentation.

All API responses follow this shape:

```json
{
  "statusCode": 200,
  "message": "...",
  "data": { ... }
}
```

---

## Implementation Status

| Feature                  | Status |
| ------------------------ | ------ |
| Email/password auth      | ✅ Done |
| Email verification       | ✅ Done |
| Google & GitHub OAuth    | ✅ Done |
| JWT refresh flow         | ✅ Done |
| Problem browsing         | ✅ Done |
| Code run (examples)      | ✅ Done |
| Code submit (grading)    | ✅ Done |
| Submission history       | ✅ Done |
| Playlists                | ✅ Done |
| Discussions              | ✅ Done |
| Admin problem management | 🔧 WIP |

---

## Deployment

### Backend (Render)

The `render.yaml` at the repo root defines a Render Blueprint. Deploy via:

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect the repo, select `dev+beta` branch
3. Add env vars in the dashboard

### Frontend (Vercel)

1. Import repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set `NEXT_PUBLIC_API_URL` env var
4. Deploy from `dev+beta` branch

---

## Contributing

We welcome contributions! See [`Contributing.md`](Contributing.md) for detailed instructions on setup, branching, code style, and pull request guidelines.

### Quick Start

```bash
git clone https://github.com/heetjain17/DexCode.git
cd DexCode/backend
npm install && npm run db:push && npm run db:seed
npm run dev
```

---

## License

MIT © DexCode Contributors

## Support

- **Issues**: [GitHub Issues](https://github.com/heetjain17/DexCode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/heetjain17/DexCode/discussions)
- **Documentation**: See [`backend/API_DOCS.md`](backend/API_DOCS.md) for API reference

---

Made with ❤️ by the DexCode community
