# API Documentation

Base URL: `http://localhost:8080/api/v1`

> **Note:** This document covers currently implemented endpoints. Routes marked **[WIP]** have stubs registered but controllers are not yet implemented.

---

## Response Format

All responses use a consistent envelope:

```json
{
  "statusCode": 200,
  "message": "Human readable message",
  "data": {}
}
```

Error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "errors": []
}
```

---

## Authentication

Tokens are delivered via **HttpOnly cookies**:

| Cookie         | TTL | Purpose                     |
| -------------- | --- | --------------------------- |
| `accessToken`  | 2h  | Authenticates every request |
| `refreshToken` | 7d  | Issues a new access token   |

Protected routes require a valid `accessToken` cookie. Pass `credentials: true` in frontend fetch calls.

---

## Auth — `/api/v1/auth`

### POST `/register`

Register a new account. Sends a verification email.

**Body**

```json
{
  "name": "Anton",
  "email": "anton@example.com",
  "password": "StrongPass123!"
}
```

**Response `201`**

```json
{
  "statusCode": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "uuid"
  }
}
```

---

### GET `/verify/:emailVerificationToken`

Verify email address using the token from the email link.

**Params**

- `emailVerificationToken` — string from email link

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Email verified successfully"
}
```

---

### POST `/resendEmailVerification`

Resend verification email.

**Body**

```json
{
  "email": "anton@example.com"
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Verification email resent"
}
```

---

### POST `/login`

Login with email or username + password. Sets `accessToken` and `refreshToken` cookies.

**Body**

```json
{
  "identifier": "anton@example.com",
  "password": "StrongPass123!"
}
```

> `identifier` can be either an email address or a username.

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "anton@example.com",
      "name": "Anton",
      "role": "USER",
      "profile": {
        "username": "anton",
        "displayName": "Anton",
        "avatarUrl": null
      }
    }
  }
}
```

---

### POST `/refresh`

Rotate tokens using the `refreshToken` cookie. Issues new `accessToken` and `refreshToken` cookies.

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Tokens refreshed"
}
```

---

### POST `/logout`

**Auth required.** Clears token cookies and invalidates the refresh token.

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

### GET `/google`

Redirects the browser to Google's OAuth consent screen.

---

### GET `/google/callback?code=...&state=...`

Google OAuth callback. Handled server-side — sets cookies and redirects to frontend.

---

### GET `/github`

Redirects the browser to GitHub's OAuth authorization page.

---

### GET `/github/callback?code=...`

GitHub OAuth callback. Handled server-side — sets cookies and redirects to frontend.

---

## Code Execution — `/api/v1/execute-code`

All routes require authentication.

**Supported languages**

| Value        | Judge0 ID |
| ------------ | --------- |
| `PYTHON`     | 71        |
| `JAVA`       | 62        |
| `JAVASCRIPT` | 63        |

---

### POST `/run`

**Auth required.** Run code against a problem's example test cases only. Does not create a submission record.

**Body**

```json
{
  "source_code": "def twoSum(nums, target):\n    ...",
  "language": "PYTHON",
  "problemId": "uuid"
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Code executed",
  "data": {
    "allPassed": true,
    "detailedResults": [
      {
        "testCase": 1,
        "passed": true,
        "stdout": "[0, 1]",
        "expected": "[0,1]",
        "status": "Accepted",
        "time": "0.042",
        "memory": 9216,
        "stderr": null,
        "compileOutput": null
      }
    ]
  }
}
```

---

### POST `/submit`

**Auth required.** Run code against all test cases (including hidden ones). Creates a `Submission` record and `TestCaseResult` rows. Marks problem as solved if all pass.

**Body** — same shape as `/run`

```json
{
  "source_code": "def twoSum(nums, target):\n    ...",
  "language": "PYTHON",
  "problemId": "uuid"
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Code submitted",
  "data": {
    "submissionId": "uuid",
    "status": "ACCEPTED"
  }
}
```

Possible `status` values: `ACCEPTED` | `WRONG_ANSWER` | `RUNTIME_ERROR` | `COMPILATION_ERROR` | `TIME_LIMIT_EXCEEDED` | `MEMORY_LIMIT_EXCEEDED`

---

## Problems — `/api/v1/problem` [WIP]

> Controllers are stubbed. These routes are registered but return empty responses. Full implementation is in progress.

| Method   | Path           | Auth | Role    | Description          |
| -------- | -------------- | ---- | ------- | -------------------- |
| `GET`    | `/problem`     | No   | —       | List all problems    |
| `GET`    | `/problem/:id` | No   | —       | Get single problem   |
| `POST`   | `/problem`     | Yes  | `ADMIN` | Create problem       |
| `PUT`    | `/problem/:id` | No   | —       | Update problem [WIP] |
| `DELETE` | `/problem/:id` | No   | —       | Delete problem [WIP] |

---

## Submissions — `/api/v1/submission` [WIP]

> Route file exists but is commented out in `index.ts`. Not yet mounted.

---

## Playlists — `/api/v1/playlist` [WIP]

> Route file exists but is commented out in `index.ts`. Not yet mounted.

---

## Health Check

### GET `/health`

No auth required. Returns server status.

**Response `200`**

```json
{
  "status": "ok",
  "message": "DexCode is running"
}
```
