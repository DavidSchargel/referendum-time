# AI Workflow Documentation — referendum-time

## Executive Summary

This document captures the complete AI-assisted workflow used to build referendum-time from concept to running code in just over two hours. It describes which LLMs were used for which tasks, how the toolchain fits together, what worked well, and what surprised us. This is intended as a reference for anyone interested in replicating or adapting this workflow for their own AI-assisted development sessions.

---

## The Stack

| Tool | Role | Notes |
|---|---|---|
| **VSCode** | Barely used IDE / file management | Extensions used: GitLens, Prettier |
| **pi coding agent** | Primary coding agent / interactive pair programmer / interview interface | Ran locally on macOS |
| **RepoPrompt** | Code context manager + commit message generation | Only on on macOS; Used throughout the session |
| **[pi-interview-tool](https://github.com/nicobailon/pi-interview-tool) pi extension** | Visual interview tool for rounding out project plan | From [Nico Bailon](https://github.com/nicobailon) |
| **[Visual Explainer](https://github.com/nicobailon/visual-explainer) pi extension** | Visual explanation tool for project plan | From [Nico Bailon](https://github.com/nicobailon) |
| **[Repoprompt repoprompt-mcp](https://www.npmjs.com/package/pi-repoprompt-mcp) pi extension** | token-efficient RepoPrompt MCP integration for Pi | From [Warren Winter](https://github.com/w-winter/dot314) |
| **[Repoprompt pi tools](https://github.com/nicobailon/visual-explainer) pi extension** | Forces pi to use RepoPrompt tools during repo-scoped work by disabling Pi's native read, write, edit, ls, find, grep tools | From [Warren Winter](https://github.com/w-winter/dot314) |

---

## LLMs and Their Roles

### GLM 4.7
- **Role:** Ultra fast initial ideation, concept refinement
- **Why chosen:** Fast inference on Cerebras hardware; good for rapid back-and-forth exploration
- **Used for:** Slamming out quick iterations on the initial concept
- **Provider:** Cerebras Coding Plan - $50/mo

### GPT-5.2 (via pi)
- **Role:** Interviews & most planning
- **Why chosen:** Conversational, good at structured planning dialogs
- **Used for:** Feature interviews, breaking down the problem, generating an initial project plan
- **Notable:** Also generated an **unrequested** scaffolding that worked well enough that David would hav enormally stopped in favor of reading & editing and using using a coding model (Opus 4.6? GPT-5.4-codex-high? GPT-5.4-codex-xhigh?) and not a planning model
- **Provider:** ChatGPT Business Plan - $30/mo/seat

### GPT-5.4-codex-high (via RepoPrompt)
- **Role:** Primary code generation
- **Why chosen:** Strong code synthesis; excels at producing working Node.js/Express code from specs
- **Used for:** Express routes, deadline calculation logic, frontend rendering, test stubs
- **Provider:** ChatGPT Business Plan - $30/mo/seat
- **Notable:** Just released at the time of the session

### GPT-5.4 (via RepoPrompt)
- **Role:** Oracle / architecture review
- **Why chosen:** Highest general reasoning capability available; used for design decisions
- **Used for:** Reviewing architectural trade-offs, data model design, caching strategy
- **Provider:** ChatGPT Business Plan - $30/mo/seat

### GPT-5.3-medium (via RepoPrompt)
- **Role:** Pro Edit mode
- **Why chosen:** Good balance of quality and speed for iterative refinement
- **Used for:** Cleaning up generated code, improving error messages, documentation polish
- **Provider:** ChatGPT Business Plan - $30/mo/seat

### Unknown model (via Github Copilot in GitHub Android app)
- **Role:** Post-Event Documentation
- **Why chosen:** It was on the bus and seemed like a good use case for AI-assisted writing...LOL
- **Used for:** Documentation polish
- **Provider:** GitHub Copilot Pro - $10/mo.
---

## What Seemed To Work Well

1. **RepoPrompt as context manager** — towards the middle of the session, passing the right files to the right model at the right time was the biggest productivity multiplier
2. **Cerebras for GLM 4.7** — fast enough to use as a "rubber duck" without breaking flow
3. **Splitting roles by model strength** — using a weaker/faster model for planning and a stronger model for code was efficient
4. **AI-generated commit messages via VS Code** — surprisingly good, saved a few minutes over the session
5. **Using a Screenshot to Debug** — winged it and took a screenshot of the Next.js error message to share with GPT-5.4, which helped it understand the context and provide a more accurate fix
---

## What Surprised Us

- GPT-5.2 generated an entire scaffolding we didn't ask for — it was not usable, but it was a good reminder that LLMs will fill in gaps with assumptions
- The deadline calculation logic was generated correctly on the first try with GPT-5.3-codex-high, with no edits needed
- Tests really were an afterthought — the app was already working before the first test was written
- Did not realize there was a Mock Data and Database mode until after the session — we even asked for no database in the interview and it still generated database code

---

## Lessons Learned

1. **Don't ever use Next.js** — It was used as a quick way to get a frontend up and running, but 2 of us wondered why we ever used it to begin with
2. **Be explicit about what you don't want** — Nico's Interview Tool + LLMs will scaffold unless you tell them not to
3. **Should have done more documentation in the "down times"** — all the docs were written afterwards (via GitHub Copilot) during David's bus ride home, but it would have been more efficient to ask for them during the session when the context was fresh
4. **One LLM per job** — mixing models by strength/task is more efficient than using one model for everything
5. **Context is king** — using RepoPrompt to give the code LLM the right context at the right time was a huge boost to quality and speed
6. **Don't forget the tests** — even if you write them last, they are critical for future maintainability and understanding of intent
7. **Should have stopped the code generation before the plan was approved** - the interview processed determined that it was good enough to start coding, and the code scaffolding that GPT-5.2 generated ended up being more of a distraction than a help
8. **Tests as documentation** — even afterthought tests help future contributors understand intent
9. **Commit messages are content** — using AI for commit messages is a legitimate time saver at demo speed

---

## Reproducibility Notes

If you want to reproduce this workflow:
1. Get a coding plan or API access (Anthropic? OpenAI?) and [pi](https://pi.ai) and [RepoPrompt](https://repoprompt.com)
2. Have a clear, bounded problem (something that fits in 2 hours)
3. Start with Nico's interview/planning LLM before switching to a code LLM
4. Use RepoPrompt to give the code LLM full context of your repo
5. Write tests last if you have to — but write them

---

## Sources & References

| Source | URL |
|---|---|
| Let's Build with A.I. event | https://www.portlandmetrohub.org/event-details/lets-build-with-a-i-3 |
| Metro Region Innovation Hub | https://www.portlandmetrohub.org |
| pi (coding agent & platform) | https://pi.ai |
| RepoPrompt | https://repoprompt.com |
| GLM-4 model family | https://huggingface.co/THUDM/glm-4-9b |
