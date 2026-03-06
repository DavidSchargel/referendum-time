# Project Overview — referendum-time

## Executive Summary

**referendum-time** is a time-aware Oregon ballot-initiative tracking tool built live in just over two hours as a workflow demonstration at *Let's Build with A.I.* (Thu, Mar 05 2026) at the Metro Region Innovation Hub in Portland, Oregon. The project showcases what a small team can ship in a single evening session using modern AI-assisted development tools. The idea was seeded by an attendee from Salem, OR.

The application answers one core question: **"How much time is left before this Oregon referendum deadline?"** It surfaces upcoming ballot initiative deadlines, signature-gathering cutoffs, and voter registration windows in a human-readable, time-relative format.

> ⚠️ **This is not production-quality code.** It was built to demonstrate workflow, not to power a real election.

---

## What It Does

- Displays a list of active and upcoming Oregon ballot referendums
- Shows time-remaining countdowns to key deadlines (submission, signature gathering, etc.)
- Fetches or simulates referendum metadata (title, description, sponsor, status)
- Provides a simple web interface for browsing referendum timelines

---

## Why It Exists

The project was created as a live demo during a public AI-assisted development workshop. The goals were:

1. **Demonstrate a real build workflow** using LLMs, a coding agent, and a code-review tool
2. **Ship something tangible** in under two hours, start to finish
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
| **Primary IDE** | VSCode on macOS |
| **Commit messages** | Generated with RepoPrompt |
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
| Cerebras GLM 4.7 | https://cerebras.ai |
| pi coding agent | https://pi.ai |
| RepoPrompt | https://repoprompt.com |
