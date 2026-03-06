# AI Workflow Documentation — referendum-time

## Executive Summary

This document captures the complete AI-assisted workflow used to build referendum-time from concept to running code in just over two hours. It describes which LLMs were used for which tasks, how the toolchain fits together, what worked well, and what surprised us. This is intended as a reference for anyone interested in replicating or adapting this workflow for their own AI-assisted development sessions.

---

## The Stack

| Tool | Role | Notes |
|---|---|---|
| **pi coding agent** | Primary coding agent / interactive pair programmer | Ran locally on macOS |
| **RepoPrompt** | Code context manager + commit message generation | Used throughout the session |
| **VSCode** | IDE / file management | Extensions used: GitLens, Prettier |
| **Cerebras** | LLM inference provider | Hosted GLM 4.7 |
| **pi (platform)** | LLM access + interview interface | Hosted GPT-5.2 |

---

## LLMs and Their Roles

### GLM 4.7 (via Cerebras)
- **Role:** Initial ideation, concept refinement
- **Why chosen:** Fast inference on Cerebras hardware; good for rapid back-and-forth exploration
- **Used for:** Early problem framing and feature scoping

### GPT-5.2 (via pi)
- **Role:** Interviews & most planning
- **Why chosen:** Conversational, good at structured planning dialogs
- **Used for:** Feature interviews, breaking down the problem, generating an initial project plan
- **Notable:** Also generated an unrequested scaffolding that didn't work and was discarded

### GPT-5.3-codex-high (via RepoPrompt)
- **Role:** Primary code generation
- **Why chosen:** Strong code synthesis; excels at producing working Node.js/Express code from specs
- **Used for:** Express routes, deadline calculation logic, frontend rendering, test stubs

### GPT-5.4 (via RepoPrompt)
- **Role:** Oracle / architecture review
- **Why chosen:** Highest reasoning capability available; used for design decisions
- **Used for:** Reviewing architectural trade-offs, data model design, caching strategy

### GPT-5.3-medium (via RepoPrompt)
- **Role:** Pro edits and polish
- **Why chosen:** Good balance of quality and speed for iterative refinement
- **Used for:** Cleaning up generated code, improving error messages, documentation polish

---

## Workflow Timeline

```
~0:00  Idea seeded by Salem attendee at "Let's Build with A.I." event
~0:05  Concept interview with GPT-5.2 via pi (feature scoping)
~0:20  Architecture review with GPT-5.4 via RepoPrompt
~0:30  Initial code generation with GPT-5.3-codex-high via RepoPrompt
~0:45  Discarded GPT-5.2 unrequested scaffolding
~0:50  Core API and deadline logic working
~1:10  Frontend rendering added
~1:30  Mock data and environment configuration done
~1:50  Test stubs written (retroactively)
~2:00  First full run ✅
~2:05  README and basic docs committed
```

---

## What Worked Well

1. **RepoPrompt as context manager** — passing the right files to the right model at the right time was the biggest productivity multiplier
2. **Cerebras for GLM 4.7** — fast enough to use as a "rubber duck" without breaking flow
3. **Splitting roles by model strength** — using a weaker/faster model for planning and a stronger model for code was efficient
4. **AI-generated commit messages** — surprisingly good, saved 10–15 minutes over the session
5. **Mock data flag from the start** — made the whole demo resilient to Oregon SOS API downtime

---

## What Surprised Us

- GPT-5.2 generated an entire scaffolding we didn't ask for — it was not usable, but it was a good reminder that LLMs will fill in gaps with assumptions
- The deadline calculation logic was generated correctly on the first try with GPT-5.3-codex-high, with no edits needed
- Tests really were an afterthought — the app was already working before the first test was written

---

## Lessons Learned

1. **Be explicit about what you don't want** — LLMs will scaffold unless you tell them not to
2. **One LLM per job** — mixing models by strength/task is more efficient than using one model for everything
3. **Mock data from day one** — demos without a mock fallback are fragile
4. **Tests as documentation** — even afterthought tests help future contributors understand intent
5. **Commit messages are content** — using AI for commit messages is a legitimate time saver at demo speed

---

## Reproducibility Notes

If you want to reproduce this workflow:
1. Sign up for [Cerebras](https://cerebras.ai) and [pi](https://pi.ai) and [RepoPrompt](https://repoprompt.com)
2. Have a clear, bounded problem (something that fits in 2 hours)
3. Start with an interview/planning LLM before switching to a code LLM
4. Use RepoPrompt to give the code LLM full context of your repo
5. Set up mock data before writing the real integration
6. Write tests last if you have to — but write them

---

## Sources & References

| Source | URL |
|---|---|
| Let's Build with A.I. event | https://www.portlandmetrohub.org/event-details/lets-build-with-a-i-3 |
| Metro Region Innovation Hub | https://www.portlandmetrohub.org |
| Cerebras AI | https://cerebras.ai |
| pi (coding agent & platform) | https://pi.ai |
| RepoPrompt | https://repoprompt.com |
| GLM-4 model family | https://huggingface.co/THUDM/glm-4-9b |
| "AI-Assisted Development" — GitHub Blog | https://github.blog/ai-and-ml/ |
