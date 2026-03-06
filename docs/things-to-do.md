# Things To Do — referendum-time

## Executive Summary

This document serves as the project backlog and honest retrospective for referendum-time. It captures what should be done next to make this a real, production-worthy application, as well as a frank assessment of the current state of the code: the good, the bad, and the truly ugly.

---

## The Good 🟢

These are the things that actually worked well for a two-hour build:

- **Core concept is solid.** Time-relative countdown displays for referendum deadlines are genuinely useful for civic engagement
- **Mock data fallback.** `ENABLE_MOCK_DATA=true` makes demos and local development resilient to API downtime
- **Configurable via environment variables.** No hardcoded values — any deployment can be tuned without code changes
- **Separation of concerns.** API layer, cache layer, and frontend rendering are distinct — easy to swap out individually
- **In-memory caching.** Even a naive TTL cache dramatically reduces load on the Oregon SOS API
- **The deadline calculation logic works.** Days/hours/minutes breakdown with urgency flagging was correct on first generation
- **Documented.** Unusually well-documented for a two-hour project, thanks to AI-assisted doc generation

---

## The Bad 🟡

These are known gaps that should be fixed before anyone relies on this:

- [ ] **No real error handling.** API failures return 500 with a raw stack trace. All errors should be caught and returned as structured JSON with appropriate HTTP status codes
- [ ] **No input validation.** Query parameters are not validated or sanitized
- [ ] **No rate limiting.** A sufficiently enthusiastic user could hammer the server or the Oregon SOS API
- [ ] **No logging infrastructure.** `console.log` is not a logging strategy. Replace with Winston or Pino
- [ ] **Tests were an afterthought.** Test coverage is minimal and does not include edge cases (expired deadlines, malformed API responses, network timeouts)
- [ ] **No CI/CD pipeline.** There is no GitHub Actions workflow to run tests on every push
- [ ] **Cache is not shared across workers.** If the app is run with more than one process (e.g., with PM2 cluster mode), each process has its own independent cache
- [ ] **No `.env.example` file.** Documented in the README but not yet committed as an actual file
- [ ] **No health check endpoint.** `/health` or `/ping` should return `200 OK` for load balancers and uptime monitors
- [ ] **Dependency versions are unpinned** (assuming `package.json` uses `^` ranges) — can break on `npm install`

---

## The Ugly 🔴

These are the things that are genuinely bad and should not exist in any production system:

- [ ] **`SECRET_KEY` has no validation.** The app starts even if `SECRET_KEY` is the default placeholder value from `.env.example`. Add a startup check
- [ ] **No HTTPS enforcement.** The server has no redirect from HTTP to HTTPS and no HSTS header
- [ ] **No Content Security Policy.** The frontend has no CSP headers, making it vulnerable to XSS
- [ ] **CORS is wide open.** All origins are allowed — acceptable for a demo, unacceptable for production
- [ ] **No authentication or authorization.** Any user can hit any endpoint with no identity check
- [ ] **Database credentials are in the connection string.** Consider using environment-specific credential injection instead of a raw `DATABASE_URL` with embedded password
- [ ] **The GPT-5.2 scaffolding was silently discarded.** This means there's an implicit assumption that the scaffolding's directory layout was wrong — but this was never documented. Future contributors may be confused
- [ ] **Tests were written after the fact.** This means the code was not designed for testability. Some functions will be hard to unit test without refactoring

---

## Next Steps Backlog

### High Priority (do this before using in production)

- [ ] Add structured error handling middleware to Express
- [ ] Add request validation with `zod` or `joi`
- [ ] Add a startup validation check for required environment variables
- [ ] Add rate limiting with `express-rate-limit`
- [ ] Set up GitHub Actions CI to run tests on push
- [ ] Pin all dependency versions in `package.json`
- [ ] Add a `/health` endpoint

### Medium Priority (real product features)

- [ ] Add pagination for large referendum lists
- [ ] Add search / filter by status, sponsor, or deadline range
- [ ] Add a "save / watch" feature for specific referendums (requires auth + DB)
- [ ] Add email or push notification when a watched referendum deadline is near
- [ ] Add mobile-responsive CSS
- [ ] Add accessibility pass (WCAG 2.1 AA)
- [ ] Add real Oregon SOS API integration with proper error recovery
- [ ] Add a favicon and Open Graph meta tags

### Low Priority (nice to have)

- [ ] Add a dark mode toggle
- [ ] Add an admin UI for managing mock data
- [ ] Add Dockerfile and `docker-compose.yml` for containerized deployment
- [ ] Add OpenAPI / Swagger documentation for the REST API
- [ ] Add internationalization (i18n) for Spanish-speaking Oregon residents
- [ ] Explore real-time updates via WebSockets or Server-Sent Events
- [ ] Consider replacing in-process cache with Redis for multi-worker deployments

### Documentation Debt

- [ ] Commit the actual `.env.example` file
- [ ] Add `CONTRIBUTING.md`
- [ ] Add `CODE_OF_CONDUCT.md`
- [ ] Add `SECURITY.md` with a vulnerability reporting policy
- [ ] Add JSDoc comments to core functions

---

## Revisiting the Build Philosophy

This project was built in two hours as a demonstration. That was the goal, and that goal was achieved. The gap between "demo quality" and "production quality" is large — and this document exists precisely to make that gap visible and actionable.

If you're picking this up to turn it into a real product:
1. Start with the **Ugly** list — those are actual security issues
2. Then work through the **Bad** list — those are reliability issues
3. Then pick features from the **Next Steps** backlog that match your users' needs

If you're picking this up to learn from the workflow:
- Read [docs/ai-workflow.md](ai-workflow.md) for the full breakdown

---

## Sources & References

| Source | URL |
|---|---|
| OWASP Top 10 | https://owasp.org/www-project-top-ten/ |
| express-rate-limit | https://www.npmjs.com/package/express-rate-limit |
| zod validation library | https://zod.dev |
| Winston logging | https://www.npmjs.com/package/winston |
| Pino logging | https://getpino.io |
| GitHub Actions CI/CD | https://docs.github.com/en/actions |
| WCAG 2.1 Accessibility Guidelines | https://www.w3.org/WAI/WCAG21/quickref/ |
| Redis | https://redis.io |
| OpenAPI Specification | https://spec.openapis.org/oas/latest.html |
