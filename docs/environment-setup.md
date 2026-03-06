# Environment Setup — referendum-time

## Executive Summary

This guide walks through every environment variable used by referendum-time, explains what each one does, provides safe example values, and documents the full local-development setup process. Proper environment configuration is the most common source of first-run failures — read this before filing a bug report.

---

## Prerequisites

- Node.js ≥ 18.x (LTS recommended)
- npm ≥ 9.x
- A PostgreSQL instance (optional — only needed if `DATABASE_URL` is set)
- Network access to the Oregon SOS API (or set `ENABLE_MOCK_DATA=true` to skip)

---

## Step 1 — Clone and Install

```bash
git clone https://github.com/DavidSchargel/referendum-time.git
cd referendum-time
npm install
```

---

## Step 2 — Create Your `.env` File

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in the values described below.

> 💡 `.env` is listed in `.gitignore`. Never commit real secrets to the repository.

---

## Full Variable Reference

### `DATABASE_URL`

| Property | Value |
|---|---|
| **Required** | No (optional — enables persistence layer) |
| **Type** | PostgreSQL connection string |
| **Example** | `postgresql://myuser:mypassword@localhost:5432/referendum` |
| **Production tip** | Use a managed database (e.g., Railway, Supabase, Neon) and rotate credentials regularly |

If omitted, the app runs in read-only / stateless mode with no database writes.

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/referendum
```

> ⚠️ **Security note:** Never embed real usernames or passwords directly in a connection string that is committed to version control. Use environment-specific secrets management (see Security Notes below) and ensure `.env` is listed in `.gitignore`.

---

### `SECRET_KEY`

| Property | Value |
|---|---|
| **Required** | Yes |
| **Type** | Random alphanumeric string (32+ characters recommended) |
| **Example** | `s3cr3t-k3y-ch4ng3-m3-in-pr0d` |
| **Production tip** | Generate with `openssl rand -hex 32` — never reuse across environments |

Used to sign session cookies and any HMAC-protected tokens.

```env
SECRET_KEY=replace-this-with-a-long-random-secret
```

Generate a secure value:

```bash
openssl rand -hex 32
```

---

### `API_BASE_URL`

| Property | Value |
|---|---|
| **Required** | Yes (unless `ENABLE_MOCK_DATA=true`) |
| **Type** | URL string |
| **Example** | `https://api.sos.oregon.gov/` |
| **Notes** | Trailing slash is optional but recommended for path joining |

The base URL of the Oregon Secretary of State referendum data API. All data-fetch requests are constructed relative to this value.

```env
API_BASE_URL=https://api.sos.oregon.gov/
```

---

### `PORT`

| Property | Value |
|---|---|
| **Required** | No |
| **Type** | Integer |
| **Default** | `3000` |
| **Example** | `8080` |

The TCP port the Express server listens on.

```env
PORT=3000
```

---

### `LOG_LEVEL`

| Property | Value |
|---|---|
| **Required** | No |
| **Type** | Enum string |
| **Default** | `info` |
| **Valid values** | `debug`, `info`, `warn`, `error` |

Controls the verbosity of application logs. Use `debug` during local development to see every request and cache event. Use `warn` or `error` in production to reduce noise.

```env
LOG_LEVEL=debug
```

---

### `CACHE_TTL_SECONDS`

| Property | Value |
|---|---|
| **Required** | No |
| **Type** | Integer (seconds) |
| **Default** | `300` (5 minutes) |
| **Example** | `60` for aggressive refresh, `3600` for hourly |

How long fetched referendum data is held in the in-memory cache before being re-fetched from the API. Lowering this value increases freshness but also increases API call frequency.

```env
CACHE_TTL_SECONDS=300
```

---

### `ENABLE_MOCK_DATA`

| Property | Value |
|---|---|
| **Required** | No |
| **Type** | Boolean string (`true` / `false`) |
| **Default** | `false` |
| **Example** | `true` for local dev without network access |

When `true`, the application reads from a local mock JSON file instead of calling the live Oregon SOS API. Useful for offline development, CI pipelines, and demos where live data is unreliable.

```env
ENABLE_MOCK_DATA=true
```

---

## Complete `.env.example`

```env
# ─────────────────────────────────────────
# referendum-time — environment variables
# Copy this file to .env and fill in values
# DO NOT commit .env to version control
# ─────────────────────────────────────────

# Required: Application secret (session signing)
SECRET_KEY=replace-this-with-a-long-random-secret

# Optional: PostgreSQL connection string (enables persistence)
# DATABASE_URL=postgresql://user:pass@localhost:5432/referendum

# Required unless ENABLE_MOCK_DATA=true
API_BASE_URL=https://api.sos.oregon.gov/

# Optional: Server port (default: 3000)
PORT=3000

# Optional: Log verbosity — debug | info | warn | error (default: info)
LOG_LEVEL=info

# Optional: Cache TTL in seconds (default: 300)
CACHE_TTL_SECONDS=300

# Optional: Use mock data instead of live API (default: false)
ENABLE_MOCK_DATA=false
```

---

## Step 3 — Start the Development Server

```bash
npm run dev
```

The server starts on `http://localhost:${PORT}` (default `http://localhost:3000`).

---

## Step 4 — Run Tests

```bash
npm test
```

Tests use mock data by default (`ENABLE_MOCK_DATA=true` is set in the test environment).

---

## Security Notes

- **Never** commit `.env` or any file containing real credentials
- Rotate `SECRET_KEY` immediately if it is ever exposed
- Use environment-specific secrets in CI/CD (e.g., GitHub Actions Secrets, Heroku Config Vars)
- The database user should have the minimum permissions required (SELECT + INSERT only if no admin operations are needed)
- Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production deployments

---

## Sources & References

| Source | URL |
|---|---|
| dotenv npm package | https://www.npmjs.com/package/dotenv |
| Node.js environment variables guide | https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/ |
| OWASP secrets management cheat sheet | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html |
| openssl rand reference | https://www.openssl.org/docs/man1.0.2/man1/openssl-rand.html |
| PostgreSQL connection strings | https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING |
| GitHub Actions Secrets | https://docs.github.com/en/actions/security-guides/encrypted-secrets |
