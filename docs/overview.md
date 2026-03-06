# Project Overview — referendum-time

## Executive Summary

**referendum-time** is a time-aware Oregon ballot-initiative tracking tool built live in just over two hours as a workflow demonstration at *Let's Build with A.I.* (Thu, Mar 05 2026) at the Metro Region Innovation Hub in Portland, Oregon. The project showcased an advanced workflow, demonstrating what an individual can ship in a single afternoon session using modern AI-assisted development tools. The idea of evaluating [Oregon House Bill 4123](https://gov.oregonlive.com/bill/2026/HB4123/) (Limits the circumstances under which a landlord may disclose confidential information.) was seeded by an attendee from Salem, OR

The application answers one core question: **"How can we lookup a Oregon ballot initiative?"** and provide pros & cons with minimal bias.

> ⚠️ **This is not production-quality code.** It was built to demonstrate workflow, not to power a real election.

---

## What It Does

- Displays a dialog prompting for looking up Oregon House Bill 4123
- Fetches or simulates referendum metadata (title, description, sponsor, status)
- Provides a simple web interface for browsing referendum info

---

## Why It Exists

The project was created as a live demo during a public AI-assisted development workshop. The goals were:

1. **Demonstrate a real build workflow** using LLMs, a coding agent, and a code-review tool
2. **Ship something tangible** in about two hours, start to finish
3. **Illustrate AI-assisted software development** for an audience of developers and entrepreneurs
4. **Seed a conversation** about civic tech, Oregon ballot processes, and what's possible with AI tooling

---

## Project Context

| Item | Detail |
|---|---|
| **Event** | Let's Build with A.I. — Thu, Mar 05 |
| **Venue** | Metro Region Innovation Hub, Portland, OR |
| **Event URL** | https://www.portlandmetrohub.org/event-details/lets-build-with-a-i-3 |
| **Idea origin** | Attendee from Salem, OR |
| **Time from concept to running** | Just over 2 hours |
| **Test strategy** | Afterthought — written after the core code was done |
| **Commit messages** | VSCode on macOS |
| **Coding agent** | pi coding agent |

---

## Architecture at a Glance

The application follows a straightforward three-tier structure:

```
Browser (HTML/CSS/JS)
    ↕
Node.js / Express API server
    ↕
Oregon SOS Referendum Data  (live API or mock JSON)
```

See [logic-flow.md](logic-flow.md) for detailed Mermaid diagrams.

---

## Scope Limitations

Because this was a two-hour build, several things were intentionally out of scope:

- No i18n
- No SEO
- No authentication or user accounts
- No persistent user-facing database writes
- No production hardening (rate limiting, input sanitization, CSP headers, etc.)
- No accessibility audit
- No mobile-responsive design (beyond browser defaults)
- Minimal error handling

---

## Sources & References

| Source | URL |
|---|---|
| Oregon Secretary of State — Ballot Initiatives | https://sos.oregon.gov/elections/Pages/ballot-initiatives.aspx |
| Oregon Revised Statutes — Initiative & Referendum | https://www.oregonlegislature.gov/bills_laws/ors/ors250.html |
| Metro Region Innovation Hub | https://www.portlandmetrohub.org |
| Let's Build with A.I. event | https://www.portlandmetrohub.org/event-details/lets-build-with-a-i-3 |
