# Auth Backend

A reusable authentication backend built with **TypeScript, Express, PostgreSQL, Drizzle ORM, JWT, Passport.js, Google OAuth, bcrypt, CSRF protection, rate limiting, and Helmet**.

## Features

- User registration
- Login with email or phone number
- Password hashing with bcrypt
- JWT access tokens
- Refresh token rotation
- Refresh token hashing before database storage
- HttpOnly authentication cookies
- Session management
- Logout and session revocation
- Protected profile endpoint
- Google OAuth 2.0 with Passport.js
- OAuth account linking
- CSRF protection
- Authentication rate limiting
- Security headers with Helmet
- Yup request validation
- Centralized error handling
- PostgreSQL with Drizzle ORM
- Docker-based PostgreSQL setup

## Tech Stack

- TypeScript
- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- Passport.js
- Google OAuth 2.0
- JWT
- bcrypt
- Yup
- Docker
- Helmet
- express-rate-limit

## Authentication Flow

### Email / Phone Authentication

```text
Register
   ↓
Hash password with bcrypt
   ↓
Store user in PostgreSQL
   ↓
Login
   ↓
Generate access token
   ↓
Generate refresh token
   ↓
Hash refresh token
   ↓
Store refresh-token hash in sessions
   ↓
Set HttpOnly cookies
```

### Token Model

The application uses two tokens:

**Access Token**
- JWT
- Short-lived
- 15 minutes
- Stored in an HttpOnly cookie
- Used for authenticated requests

**Refresh Token**
- Cryptographically random token
- 7-day lifetime
- Only its SHA-256 hash is stored in the database
- Stored in an HttpOnly cookie
- Used to create a new access token

Refresh tokens are rotated when the `/auth/refresh` endpoint is used.

## Google OAuth

Google authentication is handled by Passport.js.

```text
Browser
   ↓
/auth/google
   ↓
Google
   ↓
/auth/google/callback
   ↓
Passport
   ↓
findOrCreateGoogleUser()
   ↓
users + oauth_accounts
   ↓
Generate application access/refresh tokens
   ↓
Set authentication cookies
```

Google accounts are stored separately in the `oauth_accounts` table.

This allows one application user to have OAuth accounts from multiple providers in the future without adding provider-specific columns to the `users` table.

Current OAuth provider:

- Google

## Database Structure

### users

Stores application users.

Important fields:

- `id`
- `firstName`
- `lastName`
- `email`
- `phoneNumber`
- `passwordHash`
- `createdAt`
- `updatedAt`

`passwordHash` can be `NULL` for users created through Google OAuth.

### sessions

Stores refresh-token sessions.

Important fields:

- `id`
- `userId`
- `refreshTokenHash`
- `expiresAt`
- `createdAt`
- `revokedAt`

### oauth_accounts

Links external OAuth accounts to application users.

Important fields:

- `id`
- `userId`
- `provider`
- `providerAccountId`
- `createdAt`

The combination of `provider` and `providerAccountId` is unique.

## API Endpoints

### Register

```http
POST /auth/register
```

Creates a new local user.

### Login

```http
POST /auth/login
```

Authenticates a user and sets access and refresh cookies.

### Profile

```http
GET /auth/profile
```

Requires a valid access token.

### Refresh

```http
POST /auth/refresh
```

Rotates the refresh token and issues a new access token.

Requires the CSRF token.

### Logout

```http
POST /auth/logout
```

Revokes the refresh-token session and clears authentication cookies.

Requires the CSRF token.

### CSRF Token

```http
GET /auth/csrf
```

Generates the CSRF token used by state-changing requests.

### Google Login

```http
GET /auth/google
```

Starts Google OAuth authentication.

### Google Callback

```http
GET /auth/google/callback
```

Handles the Google OAuth callback.

## Security

### Passwords

Passwords are hashed using bcrypt before being stored.

Plain-text passwords are never stored in the database.

### Refresh Tokens

Only the SHA-256 hash of a refresh token is stored in PostgreSQL.

The original refresh token is only sent to the client through an HttpOnly cookie.

### Cookies

Authentication cookies use:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production

### CSRF

State-changing cookie-authenticated endpoints use a CSRF token.

The frontend sends the token through:

```http
X-CSRF-Token: <token>
```

### Rate Limiting

Authentication endpoints are rate limited to reduce repeated login and registration attempts.

### Helmet

Helmet is enabled to provide common HTTP security headers.

### CORS

The backend allows requests from the configured frontend origin with credentials enabled.

## Environment Variables

Create a `.env` file using `.env.example` as a template.

Never commit `.env` or real credentials to Git.

Required variables include:

```env
PORT=4000
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

NODE_ENV=development
```

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd auth-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start PostgreSQL

The project uses PostgreSQL through Docker.

```bash
docker compose up -d
```

### 4. Configure environment variables

Create `.env` from `.env.example`.

### 5. Run migrations

```bash
npx drizzle-kit migrate
```

### 6. Start the development server

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:4000
```

## Google OAuth Setup

Create a Google OAuth client in Google Cloud Console.

Use:

```text
Authorized redirect URI:

http://localhost:4000/auth/google/callback
```

Set the corresponding credentials in `.env`.

For local development, Google OAuth must be configured with the correct callback URL.

## Project Structure

A simplified structure:

```text
src/
├── config/
│   └── passport.ts
│
├── controllers/
│   ├── authController.ts
│   └── ...
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── middleware/
│   ├── authMiddleware.ts
│   ├── csrfChecker.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validateYupSchema.ts
│
├── routes/
│   └── authRoutes.ts
│
├── services/
│   ├── authService.ts
│   ├── oauthService.ts
│   ├── sessionService.ts
│   └── userService.ts
│
├── utils/
│   ├── AppError.ts
│   ├── jwt.ts
│   ├── password.ts
│   ├── refreshToken.ts
│   └── csrf.ts
│
└── server.ts
```

## Development Notes

This project separates responsibilities between:

- **Controllers** — handle HTTP requests and responses
- **Services** — contain business logic
- **Middleware** — authentication, validation, CSRF, rate limiting, and error handling
- **Database layer** — PostgreSQL and Drizzle schema/query access
- **Utils** — token, password, CSRF, and application error utilities

Unexpected errors are handled by the centralized error handler.

## Testing Checklist

Before considering the authentication flow complete, verify:

- [ ] Register with email
- [ ] Register with phone
- [ ] Duplicate registration
- [ ] Login with email
- [ ] Login with phone
- [ ] Invalid password
- [ ] Non-existing user login
- [ ] Access protected profile
- [ ] Refresh access token
- [ ] Refresh-token rotation
- [ ] Logout
- [ ] Profile after logout
- [ ] Missing CSRF token
- [ ] Invalid CSRF token
- [ ] Rate limiting
- [ ] Google OAuth with a new user
- [ ] Google OAuth with an existing user
- [ ] OAuth account stored correctly
- [ ] Session stored correctly
- [ ] Security headers
- [ ] `.env` excluded from Git

## License

This project is intended as a reusable authentication backend and learning/reference project.