# API Documentation

Base URL: `http://localhost:8080/api/v1`

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
  "username": "Anton",
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

Google OAuth callback. Handled server-side — sets cookies and redirects to `CLIENT_URL/auth/callback`.

---

### GET `/github`

Redirects the browser to GitHub's OAuth authorization page.

---

### GET `/github/callback?code=...`

GitHub OAuth callback. Handled server-side — sets cookies and redirects to `CLIENT_URL/auth/callback`.

---

### POST `/forgotPassword`

Send a password reset link to the provided email. Always returns `200` regardless of whether the email exists (anti-enumeration).

Rate limited: 3 requests per hour.

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
  "message": "If that email exists, a reset link has been sent"
}
```

---

### POST `/resetPassword/:token`

Reset the password using the token from the reset email link. Invalidates the refresh token (forces re-login).

Rate limited: 5 requests per hour.

**Params**

- `token` — raw reset token from the email link

**Body**

```json
{
  "password": "NewStrongPass123!"
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Password reset successfully"
}
```

**Errors**

| Status | Reason                        |
| ------ | ----------------------------- |
| `410`  | Token expired or already used |
| `400`  | Invalid token                 |

---

### POST `/changePassword`

**Auth required.** Change password while logged in. Clears both token cookies (forces re-login).

Rate limited: 5 requests per hour.

> OAuth users (Google/GitHub accounts with no password set) will receive a `400` error.

**Body**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewStrongPass123!"
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Password changed successfully. Please log in again"
}
```

**Errors**

| Status | Reason                          |
| ------ | ------------------------------- |
| `400`  | OAuth account — no password set |
| `400`  | Incorrect current password      |

---

## Code Execution — `/api/v1/execute-code`

All routes require authentication.

**Supported languages**

| Value        | Judge0 ID |
| ------------ | --------- |
| `PYTHON`     | 71        |
| `JAVA`       | 62        |
| `JAVASCRIPT` | 63        |
| `CPP`        | 54        |

---

### POST `/run`

**Auth required.** Run code against a problem's example test cases only. Does not create a submission record.

**Testing:** See `test/two_sum-solution.json` for complete test payloads.

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

**Testing Note:** See the [Testing with Sample Files](#testing-with-sample-files) section below for complete test payloads. Use `test/two_sum-solution.json` for ready-to-use payloads for all languages and scenarios.

---

## Problems — `/api/v1/problem`

### POST `/`

**Auth required. Role: `ADMIN`.** Create a new problem.

All `referenceSolutions` are validated against every `testcase` **and** every `example` via Judge0 before the problem is persisted. If validation fails the problem is not created and the response includes per-language failure details.

**Body**

```json
{
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "EASY",
  "tags": ["Array", "Hash Table"],
  "hints": ["Try using a hash map"],
  "companies": ["Google"],
  "editorial": "Use a hash map for O(n) solution",
  "examples": [
    { "input": "[2,7,11,15]\n9", "output": "[0,1]", "explanation": "nums[0]+nums[1]=9", "order": 0 }
  ],
  "constraints": [{ "description": "2 <= nums.length <= 10^4", "order": 0 }],
  "testcases": [
    { "input": "[2,7,11,15]\n9", "output": "[0,1]", "isHidden": false, "order": 0 },
    { "input": "[3,2,4]\n6", "output": "[1,2]", "isHidden": true, "order": 1 }
  ],
  "codeSnippets": [
    {
      "language": "PYTHON",
      "template": "def twoSum(nums, target):\n    pass",
      "userCode": "def twoSum(nums, target):\n    pass"
    }
  ],
  "referenceSolutions": [
    {
      "language": "PYTHON",
      "solution": "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen: return [seen[target-n], i]\n        seen[n] = i"
    }
  ]
}
```

**Fields**

| Field                | Type     | Required | Notes                                        |
| -------------------- | -------- | -------- | -------------------------------------------- |
| `title`              | string   | Yes      | 3–200 chars                                  |
| `description`        | string   | Yes      | Min 10 chars                                 |
| `difficulty`         | string   | Yes      | `EASY` \| `MEDIUM` \| `HARD`                 |
| `tags`               | string[] | Yes      |                                              |
| `examples`           | array    | Yes      | Visible to users; validated via Judge0       |
| `constraints`        | array    | Yes      |                                              |
| `testcases`          | array    | Yes      | At least 1; validated via Judge0             |
| `codeSnippets`       | array    | Yes      | At least 1 language                          |
| `referenceSolutions` | array    | Yes      | At least 1; must pass all testcases+examples |
| `hints`              | string[] | No       |                                              |
| `companies`          | string[] | No       |                                              |
| `editorial`          | string   | No       |                                              |

**Response `201`** — validation passed, problem created

```json
{
  "statusCode": 201,
  "message": "Problem created successfully",
  "data": {
    "id": "uuid",
    "slug": "two-sum"
  }
}
```

**Response `400`** — one or more reference solutions failed validation

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Reference solution(s) failed validation. Problem not created.",
  "data": {
    "failures": [
      {
        "language": "PYTHON",
        "details": [
          {
            "testCase": 2,
            "passed": false,
            "stdout": "[0,2]",
            "expected": "[1,2]",
            "status": "Wrong Answer",
            "time": "0.038",
            "memory": 8192,
            "stderr": null,
            "compileOutput": null
          }
        ]
      }
    ]
  }
}
```

---

#### Testing with Sample Files

The `test/` directory contains sample payloads for complete end-to-end testing:

**Step 1: Create the Problem**

```bash
# Use two-sum-problem.json to create the problem
curl -X POST http://localhost:8080/api/v1/problem \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_ADMIN_ACCESS_TOKEN" \
  -d @test/two-sum-problem.json
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Problem created successfully",
  "data": {
    "id": "abc-123-def-456",
    "slug": "two-sum"
  }
}
```

**Step 2: Test Code Execution**

Update the `problemId` in `test/two_sum-solution.json` (replace all `{{PROBLEM_ID}}` with the returned UUID), then test:

```bash
# Test /run endpoint (examples only, no submission saved)
curl -X POST http://localhost:8080/api/v1/execute-code/run \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -d '{
    "source_code": "class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in seen:\n                return [seen[complement], i]\n            seen[num] = i\n        return []",
    "language": "PYTHON",
    "problemId": "abc-123-def-456"
  }'

# Test /submit endpoint (all test cases, creates submission)
curl -X POST http://localhost:8080/api/v1/execute-code/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -d '{
    "source_code": "class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in seen:\n                return [seen[complement], i]\n            seen[num] = i\n        return []",
    "language": "PYTHON",
    "problemId": "abc-123-def-456"
  }'
```

**Available Test Cases in `test/two_sum-solution.json`:**

- `correctSolution` - Should pass all tests (status: `ACCEPTED`)
- `wrongAnswer` - Should fail with `WRONG_ANSWER` status
- `runtimeError` - Should fail with `RUNTIME_ERROR` status
- `compilationError` - Should fail with `COMPILATION_ERROR` status (Java/C++ only)
- `syntaxError` - Should fail with syntax/compilation error (Python/JavaScript)

All payloads are available for all 4 languages: Python, Java, JavaScript, and C++.

---

### GET `/`

List problems with optional filtering and pagination. Authenticated users also receive their solve status per problem.

**Query Parameters**

| Param        | Type   | Default | Notes                        |
| ------------ | ------ | ------- | ---------------------------- |
| `difficulty` | string | —       | `EASY` \| `MEDIUM` \| `HARD` |
| `tag`        | string | —       | Filter by tag name           |
| `search`     | string | —       | Title keyword search         |
| `page`       | number | `1`     |                              |
| `limit`      | number | `20`    | Max `100`                    |

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Problems fetched successfully",
  "data": {
    "problems": [
      {
        "id": "uuid",
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "EASY",
        "tags": ["Array", "Hash Table"],
        "solved": true
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET `/:id`

Get a single problem by UUID. Authenticated users receive their submission history for the problem.

**Params**

- `id` — UUID of the problem

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Problem fetched successfully",
  "data": {
    "id": "uuid",
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "EASY",
    "description": "...",
    "tags": ["Array"],
    "hints": [],
    "companies": [],
    "editorial": null,
    "examples": [
      { "input": "[2,7,11,15]\n9", "output": "[0,1]", "explanation": "...", "order": 0 }
    ],
    "constraints": [{ "description": "2 <= nums.length <= 10^4", "order": 0 }],
    "codeSnippets": [
      { "language": "PYTHON", "template": "def twoSum...", "userCode": "def twoSum..." }
    ],
    "submissions": []
  }
}
```

> Test cases are **not** returned to the client. Only examples are visible.

---

### PUT `/:id`

**Auth required. Role: `ADMIN`.** Update an existing problem. All fields are optional.

If `testcases`, `examples`, or `referenceSolutions` are included, full re-validation is run against all solutions before persisting. Falls back to the existing DB values for whichever side is not provided.

**Params**

- `id` — UUID of the problem

**Body** — all fields optional, same shapes as create

```json
{
  "difficulty": "MEDIUM",
  "isPublished": true,
  "testcases": [...]
}
```

**Response `200`** — validation passed (or not required), problem updated

```json
{
  "statusCode": 200,
  "message": "Problem updated successfully",
  "data": {
    "id": "uuid",
    "slug": "two-sum"
  }
}
```

**Response `400`** — validation failed (same shape as create failure)

---

### DELETE `/:id`

**Auth required. Role: `ADMIN`.** Delete a problem and all related data.

**Params**

- `id` — UUID of the problem

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Problem deleted successfully"
}
```

---

## Problem Ratings — `/api/v1/problem`

### POST `/:id/rate`

**Auth required.** Submit or update a rating for a problem (1–5 stars). Calling again with a different value updates the existing rating.

**Params**

- `id` — UUID of the problem

**Body**

```json
{
  "rating": 4
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Rating submitted"
}
```

---

### GET `/:id/rating`

Get the average rating for a problem. Authenticated users also receive their own rating.

**Params**

- `id` — UUID of the problem

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Rating fetched",
  "data": {
    "average": 4.2,
    "count": 158,
    "userRating": 4
  }
}
```

> `userRating` is `null` when unauthenticated or when the user has not rated the problem.

---

## Profile — `/api/v1/profile`

### GET `/me`

**Auth required.** Get the authenticated user's full profile.

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Profile fetched",
  "data": {
    "id": "uuid",
    "email": "anton@example.com",
    "name": "Anton",
    "role": "USER",
    "username": "anton",
    "bio": null,
    "location": null,
    "avatarUrl": null,
    "website": null,
    "socialLinks": {
      "github": null,
      "twitter": null,
      "linkedin": null
    },
    "totalSolved": 12,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### PUT `/me`

**Auth required.** Update the authenticated user's profile. All fields are optional. Send an empty string (`""`) for URL fields to clear them.

**Body**

```json
{
  "name": "Anton Dev",
  "bio": "Backend engineer",
  "location": "Berlin",
  "avatarUrl": "https://example.com/avatar.png",
  "website": "https://antondev.io",
  "socialLinks": {
    "github": "https://github.com/anton",
    "twitter": "",
    "linkedin": "https://linkedin.com/in/anton"
  }
}
```

**Fields**

| Field                  | Type   | Notes                                |
| ---------------------- | ------ | ------------------------------------ |
| `name`                 | string | 1–100 chars                          |
| `bio`                  | string | Max 500 chars                        |
| `location`             | string | Max 100 chars                        |
| `avatarUrl`            | string | Must be a valid URL or `""` to clear |
| `website`              | string | Must be a valid URL or `""` to clear |
| `socialLinks.github`   | string | Must be a valid URL or `""` to clear |
| `socialLinks.twitter`  | string | Must be a valid URL or `""` to clear |
| `socialLinks.linkedin` | string | Must be a valid URL or `""` to clear |

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Profile updated"
}
```

**Errors**

| Status | Reason                       |
| ------ | ---------------------------- |
| `400`  | No fields provided to update |

---

## Discussions — `/api/v1/discussion`

### POST `/`

**Auth required.** Create a new discussion thread for a problem.

**Body**

```json
{
  "problemId": "uuid",
  "title": "Best approach for Two Sum?",
  "content": "I was thinking about using a hash map..."
}
```

**Fields**

| Field       | Type   | Notes          |
| ----------- | ------ | -------------- |
| `problemId` | UUID   | Required       |
| `title`     | string | 3–200 chars    |
| `content`   | string | 10–10000 chars |

**Response `201`**

```json
{
  "statusCode": 201,
  "message": "Discussion created",
  "data": {
    "id": "uuid"
  }
}
```

---

### GET `/`

List discussions for a problem, paginated.

**Query Parameters**

| Param       | Type   | Required | Default |
| ----------- | ------ | -------- | ------- |
| `problemId` | UUID   | Yes      | —       |
| `page`      | number | No       | `1`     |
| `limit`     | number | No       | `10`    |

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Discussions fetched",
  "data": {
    "discussions": [
      {
        "id": "uuid",
        "title": "Best approach for Two Sum?",
        "upvotes": 12,
        "downvotes": 1,
        "commentCount": 5,
        "isLocked": false,
        "author": { "id": "uuid", "username": "anton", "avatarUrl": null },
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 24,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET `/:id`

Get a single discussion with all comments. Authenticated users also receive their own vote on the discussion and each comment.

**Params**

- `id` — UUID of the discussion

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Discussion fetched",
  "data": {
    "id": "uuid",
    "title": "Best approach for Two Sum?",
    "content": "I was thinking about using a hash map...",
    "upvotes": 12,
    "downvotes": 1,
    "isLocked": false,
    "userVote": 1,
    "author": { "id": "uuid", "username": "anton", "avatarUrl": null },
    "comments": [
      {
        "id": "uuid",
        "content": "Hash map is the way to go!",
        "upvotes": 3,
        "downvotes": 0,
        "userVote": 0,
        "author": { "id": "uuid", "username": "bob", "avatarUrl": null },
        "createdAt": "2025-01-02T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

> `userVote` is `null` when unauthenticated, `1` for upvote, `-1` for downvote, `0` for no vote.

---

### PUT `/:id`

**Auth required.** Update a discussion. Only the author can edit. Locked discussions cannot be edited.

**Params**

- `id` — UUID of the discussion

**Body** — at least one field required

```json
{
  "title": "Updated title",
  "content": "Updated content..."
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Discussion updated"
}
```

**Errors**

| Status | Reason               |
| ------ | -------------------- |
| `403`  | Not the author       |
| `403`  | Discussion is locked |
| `404`  | Discussion not found |

---

### DELETE `/:id`

**Auth required.** Delete a discussion. Author or `ADMIN` only.

**Params**

- `id` — UUID of the discussion

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Discussion deleted"
}
```

---

### POST `/:id/comment`

**Auth required.** Add a comment to a discussion. Locked discussions do not accept new comments.

**Params**

- `id` — UUID of the discussion

**Body**

```json
{
  "content": "Hash map is the way to go!"
}
```

> Max 5000 characters.

**Response `201`**

```json
{
  "statusCode": 201,
  "message": "Comment added",
  "data": {
    "id": "uuid"
  }
}
```

---

### PUT `/:id/comment/:commentId`

**Auth required.** Edit a comment. Author only.

**Params**

- `id` — UUID of the discussion
- `commentId` — UUID of the comment

**Body**

```json
{
  "content": "Updated comment text"
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Comment updated"
}
```

---

### DELETE `/:id/comment/:commentId`

**Auth required.** Delete a comment. Author or `ADMIN` only.

**Params**

- `id` — UUID of the discussion
- `commentId` — UUID of the comment

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Comment deleted"
}
```

---

### POST `/:id/vote`

**Auth required.** Vote on a discussion. Send `value: 0` to remove an existing vote.

**Params**

- `id` — UUID of the discussion

**Body**

```json
{
  "value": 1
}
```

| `value` | Effect                         |
| ------- | ------------------------------ |
| `1`     | Upvote (or flip from downvote) |
| `-1`    | Downvote (or flip from upvote) |
| `0`     | Remove existing vote           |

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Vote recorded"
}
```

---

### POST `/:id/comment/:commentId/vote`

**Auth required.** Vote on a comment. Same `value` semantics as discussion voting.

**Params**

- `id` — UUID of the discussion
- `commentId` — UUID of the comment

**Body**

```json
{
  "value": -1
}
```

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Vote recorded"
}
```

---

## Submissions — `/api/v1/submission`

> Submission history endpoints are not yet implemented.

---

## Playlists — `/api/v1/playlist`

> Playlist endpoints are not yet implemented.

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
