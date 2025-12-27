# Backend Revamp & TypeScript Migration Plan

This document outlines the strategy to modernize the backend, migrating to TypeScript, improving architecture, and enhancing authentication and user profiles.

## 1. Objectives

- **Refactor to TypeScript**: Strict typing for better stability and developer experience.
- **Architecture Upgrade**: Introduce a **Service Layer** to separate business logic from Controllers.
- **Enhanced Authentication**: Robust JWT handling, access/refresh token rotation, rate limiting, and input validation.
- **Detailed User Profile**: Expand data models to store rich user profiles.
- **Standardized Error Handling**: Unified error classes and responses.

## 2. Directory Structure Update

Moving from a purely technical grouping to a more modular or strictly layered structure. We will keep the layered approach but add `services` and `types`.

```text
backend/
├── src/
│   ├── config/             # Config variables (env, constants)
│   ├── controllers/        # Request handling, validation checks
│   ├── services/           # Business logic (database calls, complex operations)
│   ├── routes/             # API definition
│   ├── middleware/         # Auth checks, error handling, logging
│   ├── utils/              # Helper functions (AsyncHandler, AppError)
│   ├── types/              # TypeScript definitions (d.ts)
│   ├── validators/         # Zod schemas for input validation
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── package.json
└── tsconfig.json
```

## 3. Database Schema Updates

### User & Profile Split

Keep `User` for auth data (email, password, role) and create a `Profile` model for public/editable details.

**Updated `User` Model**:

- `email`
- `role` (USER, ADMIN)
- `isEmailVerified`
- `status` (ACTIVE, BANNED)
- `securityEvents` (Last login IP/Time - Optional)

**New `Profile` Model**:

- `userId` (FK to User)
- `displayName`
- `bio`
- `avatarUrl`
- `socialLinks` (JSON: twitter, linkedin, github)
- `website`
- `location`

**Prisma Schema Snippet**:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  profile   Profile?
  ...
}

model Profile {
  id          String @id @default(uuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id])
  displayName String?
  bio         String?
  socialLinks Json?  // { github: "url", linkedin: "url" }
  ...
}
```

## 4. Authentication Improvements

### Security Enhancements

1.  **Strict Validation**: Use `zod` for all request bodies (login, signup, update).
2.  **Rate Limiting**: Apply `express-rate-limit` to auth endpoints to prevent brute force.
3.  **Token Rotation**:
    - **Access Token**: Short-lived (15 mins). Sent in JSON or memory.
    - **Refresh Token**: Long-lived (7 days). Stored in **HTTPOnly, Secure Cookie**.
    - Implement `/refresh` endpoint to dispense new access tokens.
4.  **Security Headers**: Use `helmet` middleware.

### Edge Cases to Handle

- **Token reuse**: Detect if a refresh token is used twice (sign of theft) and invalidate all user tokens.
- **Account Lockout**: After N failed attempts (optional).
- **Email Verification**: Ensure logic handles "resend verification" and "expired token" gracefully.

## 5. Development Workflow (Step-by-Step)

### Phase 1: Setup

1.  Initialize `tsconfig.json`.
2.  Install `typescript`, `ts-node`, `nodemom` (or `tsx`), `@types/*`.
3.  Setup ESLint + Prettier for TS.

### Phase 2: Core Refactor

1.  **Utils**: Convert `ApiError`, `ApiResponse`, `AsyncHandler` to TS.
2.  **Middleware**: Type the `authMiddleware` and `errorHandler`.
3.  **Config**: Ensure `process.env` variables are typed/validated.

### Phase 3: Module Migration (One by one)

Start with **Auth**:

1.  Define **Zod Scehmas** for Login/Register.
2.  Create `AuthService` class/functions (Move logic from `auth.controllers.js`).
3.  Rewrite `auth.controller.ts` to use `AuthService` and Zod.
4.  Rewrite `auth.routes.ts`.

Then proceed to **User/Profile**, **Problems**, **Playlists**.

### Phase 4: Verification

1.  Unit tests for Critical Services (AuthService).
2.  Integration tests for API endpoints using `supertest`.

## 6. Implementation Checklist

- [ ] Install Depedencies (`zod`, `helmet`, `cors`, `@types/...`)
- [ ] Configure `tsconfig.json` (strict: true)
- [ ] Refactor `src/index.js` -> `src/server.ts` & `src/app.ts`
- [ ] Implement `Profile` model in Prisma
- [ ] Create generic Service class or pattern
- [ ] Migrate Auth Module
