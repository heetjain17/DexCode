# DexCode

> **Master competitive programming. Write code in the browser. Get instant feedback. Compete globally.**

DexCode is a full-stack, open-source competitive programming platform that combines the problem-solving depth of LeetCode with a modern, developer-first architecture. Built with TypeScript, Express, Drizzle ORM, and PostgreSQL.

## Features

- **Code Execution**: Write and run code in your browser against example test cases in real-time
- **Real-time Judging**: Submit solutions for automated grading against all test cases via Judge0
- **Progress Tracking**: Track submissions, solved problems, and build your portfolio
- **Social Features**: Discuss solutions, rate problems, and learn from the community
- **Playlists**: Curate problem sets for focused learning
- **Multi-method Auth**: Secure authentication with email + password or OAuth (Google/GitHub)
- **Admin Dashboard**: Create, manage, and publish problems with tags, companies, and difficulty levels

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
| Code Execution | Judge0 (self-hosted)                                |
| Validation     | Zod                                                 |
| Email          | Nodemailer + Mailtrap                               |

### Frontend

| Layer     | Technology         |
| --------- | ------------------ |
| Framework | React + TypeScript |
| Build     | Vite               |

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
│   │   ├── db/
│   │   │   ├── schema.ts    # Drizzle schema (25 tables, 5 enums)
│   │   │   └── seed.ts      # Database seeder
│   │   ├── libs/
│   │   │   ├── db.ts        # Drizzle client (pg Pool)
│   │   │   └── judge0.client.ts
│   │   ├── validators/      # Zod schemas
│   │   ├── utils/           # ApiError, asyncHandler, mail
│   │   └── index.ts         # Entry point
│   ├── drizzle/migrations/  # Generated SQL migrations
│   ├── drizzle.config.ts
│   └── package.json
├── frontend/
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
- Judge0 instance running locally (Docker recommended)

### Backend Setup

```bash
cd backend
npm install
```

Copy `.env` and fill in your values:

```env
PORT=8080

# Database (Supabase session-mode pooler — port 5432, IPv4)
DATABASE_URL="postgresql://postgres.<project>:<password>@aws-<region>.pooler.supabase.com:5432/postgres"

# JWT
ACCESS_TOKEN_SECRET=<random-256-bit-hex>
ACCESS_TOKEN_EXPIRY='2h'
REFRESH_TOKEN_SECRET=<random-256-bit-hex>
REFRESH_TOKEN_EXPIRY='7d'

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8080/api/v1/auth/github/callback

# Email
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=

# Judge0
JUDGE0_URL=http://localhost:2358
```

Push schema to your database:

```bash
npm run db:push
```

Seed sample data (38 problems, users, tags, companies):

```bash
npm run db:seed
```

Run the dev server:

```bash
npm run dev
```

The server starts on `http://localhost:8080`. On boot it runs a live DB connectivity check and logs the connected database name and server timestamp before accepting requests.

### Available Scripts

| Script                | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start dev server with hot reload   |
| `npm run db:push`     | Push schema changes directly to DB |
| `npm run db:generate` | Generate SQL migration files       |
| `npm run db:migrate`  | Apply generated migrations         |
| `npm run db:studio`   | Open Drizzle Studio GUI            |
| `npm run db:seed`     | Seed the database                  |

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

Errors:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ ... ]
}
```

---

## Implementation Status

| Feature                  | Status |
| ------------------------ | ------ |
| Email/password auth      | Done   |
| Email verification       | Done   |
| Google & GitHub OAuth    | Done   |
| JWT refresh flow         | Done   |
| Problem browsing         | WIP    |
| Code run (examples)      | Done   |
| Code submit (grading)    | Done   |
| Submission history       | WIP    |
| Playlists                | WIP    |
| Discussions              | WIP    |
| Admin problem management | WIP    |

---

## Contributing

We welcome contributions! See [`Contributing.md`](Contributing.md) for detailed instructions on setup, branching, code style, and pull request guidelines.

### Quick Start

```bash
git clone https://github.com/heetjain17/DEXCODE.git
cd DEXCODE/backend
npm install && npm run db:push && npm run db:seed
npm run dev
```

---

## License

MIT © DexCode Contributors

## Support

- **Issues**: [GitHub Issues](https://github.com/heetjain17/DEXCODE/issues)
- **Discussions**: [GitHub Discussions](https://github.com/heetjain17/DEXCODE/discussions)
- **Documentation**: See [`backend/API_DOCS.md`](backend/API_DOCS.md) for API reference

---

Made with by the DexCode community
