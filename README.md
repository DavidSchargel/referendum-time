# referendum-time

> ⚠️ **This is not production-quality code.** See [docs/things-to-do.md](docs/things-to-do.md) for the full good, bad, and ugly breakdown.

A time-aware referendum tracking tool for Oregon ballot initiatives — built live as a workflow demonstration.

---

## Quick Facts

| Item | Detail |
|---|---|
| **Concept → Running** | Just over 2 hours |
| **Tests** | Afterthought (added retroactively) |
| **Primary IDE** | VSCode on macOS |
| **Commit messages** | RepoPrompt (yes, really) |
| **Coding agent** | pi coding agent |
| **Event** | [Let's Build with A.I. — Thu, Mar 05](https://www.portlandmetrohub.org/event-details/lets-build-with-a-i-3) at Metro Region Innovation Hub |
| **Idea origin** | Seeded by an attendee from Salem, OR |

---

## LLMs Used

| Role | Model |
|---|---|
| Interviews & most planning | GLM 4.7 (on Cerebras) + GPT-5.2 (via pi) |
| Code generation | GPT-5.3-codex-high (via RepoPrompt) |
| Oracle / architecture review | GPT-5.4 (via RepoPrompt) |
| Pro edits & polish | GPT-5.3-medium (via RepoPrompt) |

> Note: GPT-5.2 also produced a non-working scaffolding that was not requested — which was promptly ignored.

---

## Environment Variables

Copy `.env.example` to `.env` and populate the values described below before running the application.

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Connection string for the primary database | `postgresql://user:pass@localhost:5432/referendum` |
| `SECRET_KEY` | Application secret used for session signing | A long random string |
| `API_BASE_URL` | Base URL for the referendum data API | `https://api.sos.oregon.gov/` |

### Optional Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |
| `CACHE_TTL_SECONDS` | How long to cache referendum data (seconds) | `300` |
| `ENABLE_MOCK_DATA` | Use static mock data instead of live API | `false` |

> See [docs/environment-setup.md](docs/environment-setup.md) for full setup instructions and security guidance.

---

## Documentation

Full documentation lives in the [`docs/`](docs/) directory.

| File | Description |
|---|---|
| [docs/table-of-contents.md](docs/table-of-contents.md) | Master index of all documentation |
| [docs/overview.md](docs/overview.md) | Project overview, goals, and executive summary |
| [docs/logic-flow.md](docs/logic-flow.md) | System logic with Mermaid diagrams |
| [docs/environment-setup.md](docs/environment-setup.md) | Environment variable setup guide |
| [docs/ai-workflow.md](docs/ai-workflow.md) | AI tooling, workflow, and lessons learned |
| [docs/things-to-do.md](docs/things-to-do.md) | Next steps, and the good, the bad & the ugly |

---

## Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run tests
npm test
```

---

## License

MIT — do whatever you like, but don't blame us when it breaks in prod (see warning above).

