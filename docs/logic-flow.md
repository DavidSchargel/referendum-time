# Logic Flow — referendum-time

## Executive Summary

This document describes the end-to-end logic of the referendum-time application using a series of Mermaid diagrams. It covers the user request lifecycle, data-fetching strategy, deadline calculation logic, and the high-level component relationship diagram. These diagrams were produced as part of the post-build documentation sprint.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Browser["🌐 Browser\n(HTML + JS)"]
    API["🖥️ Express API Server\n(Node.js)"]
    Cache["⚡ In-Memory Cache\n(TTL: configurable)"]
    SOS["🗳️ Oregon SOS\nReferendum Data Source"]
    Mock["📄 Mock JSON\n(dev / offline fallback)"]

    Browser -->|HTTP GET /api/referendums| API
    API -->|Cache hit?| Cache
    Cache -->|Yes → return cached data| API
    API -->|No → fetch fresh data| SOS
    API -->|ENABLE_MOCK_DATA=true| Mock
    SOS -->|JSON response| API
    Mock -->|JSON response| API
    API -->|Store in cache| Cache
    API -->|JSON payload| Browser
    Browser -->|Render countdown UI| Browser
```

---

## 2. User Request Lifecycle

```mermaid
sequenceDiagram
    participant User as 🧑 User (Browser)
    participant Server as 🖥️ Express Server
    participant Cache as ⚡ Cache
    participant DataSource as 🗳️ Data Source (SOS / Mock)

    User->>Server: GET /api/referendums
    Server->>Cache: Check cache (key: "referendums")
    alt Cache hit (TTL not expired)
        Cache-->>Server: Cached referendum list
        Server-->>User: 200 OK — JSON (from cache)
    else Cache miss or expired
        Server->>DataSource: Fetch referendum data
        DataSource-->>Server: Raw referendum JSON
        Server->>Server: Normalize & enrich data
        Server->>Server: Calculate deadlines & time-remaining
        Server->>Cache: Store with TTL
        Server-->>User: 200 OK — JSON (fresh)
    end
    User->>User: Render referendum cards with countdowns
```

---

## 3. Deadline Calculation Logic

```mermaid
flowchart TD
    Start([Start: Referendum record received])
    ParseDate["Parse deadline date string\nfrom data source"]
    Now["Get current timestamp\nnew Date()"]
    Diff["Calculate diff\n= deadline - now"]

    Negative{Is diff < 0?}
    Expired["Mark as EXPIRED\ntime_remaining = 0"]
    Days["Calculate days remaining\nMath.floor(diff / 86_400_000)"]
    Hours["Calculate hours remaining\n(remainder after days)"]
    Minutes["Calculate minutes remaining\n(remainder after hours)"]

    Urgent{Days < 7?}
    UrgentFlag["Add urgency flag\n⚠️ URGENT"]
    NormalFlag["Normal display\n✅ ON TRACK"]

    Format["Format human-readable string\ne.g. '6 days, 3 hours, 12 minutes'"]
    Output([Return enriched referendum object])

    Start --> ParseDate --> Now --> Diff --> Negative
    Negative -- Yes --> Expired --> Output
    Negative -- No --> Days --> Hours --> Minutes --> Urgent
    Urgent -- Yes --> UrgentFlag --> Format --> Output
    Urgent -- No --> NormalFlag --> Format --> Output
```

---

## 4. Frontend Render Flow

```mermaid
flowchart LR
    Load([Page loads])
    Fetch["fetch('/api/referendums')"]
    Parse["Parse JSON response"]
    Empty{Any referendums?}
    ShowEmpty["Render 'No active referendums' message"]
    Loop["For each referendum\nrender a card"]
    Card["Card contents:\n• Title\n• Description\n• Sponsor\n• Status badge\n• Countdown timer\n• Urgency indicator"]
    Timer["setInterval every 60s\nRefresh countdowns"]
    End([Done])

    Load --> Fetch --> Parse --> Empty
    Empty -- No --> ShowEmpty --> End
    Empty -- Yes --> Loop --> Card --> Timer --> End
```

---

## 5. Data Model

```mermaid
erDiagram
    REFERENDUM {
        string  id
        string  title
        string  description
        string  sponsor
        string  status
        date    signature_deadline
        date    submission_deadline
        int     signatures_required
        int     signatures_gathered
    }

    DEADLINE_SUMMARY {
        string  referendum_id
        string  label
        date    deadline_date
        int     days_remaining
        int     hours_remaining
        int     minutes_remaining
        bool    is_urgent
        bool    is_expired
    }

    REFERENDUM ||--o{ DEADLINE_SUMMARY : "has"
```

---

## 6. Environment & Config Decision Tree

```mermaid
flowchart TD
    Start([App starts])
    EnvCheck{ENABLE_MOCK_DATA\n= 'true'?}
    MockMode["Use mock JSON file\n(no network calls)"]
    LiveMode["Use live Oregon SOS API\nAPI_BASE_URL required"]
    DBCheck{DATABASE_URL\nset?}
    DBConnect["Connect to PostgreSQL\n(future: persist user-saved referendums)"]
    DBSkip["Skip DB connection\n(read-only mode)"]
    ServerUp([Server ready on PORT])

    Start --> EnvCheck
    EnvCheck -- Yes --> MockMode --> DBCheck
    EnvCheck -- No --> LiveMode --> DBCheck
    DBCheck -- Yes --> DBConnect --> ServerUp
    DBCheck -- No --> DBSkip --> ServerUp
```

---

## Sources & References

| Source | URL |
|---|---|
| Mermaid diagram documentation | https://mermaid.js.org/intro/ |
| Mermaid flowchart syntax | https://mermaid.js.org/syntax/flowchart.html |
| Mermaid sequence diagram syntax | https://mermaid.js.org/syntax/sequenceDiagram.html |
| Mermaid ER diagram syntax | https://mermaid.js.org/syntax/entityRelationshipDiagram.html |
| GitHub Mermaid rendering | https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams |
| Oregon SOS — Ballot Measures | https://sos.oregon.gov/elections/Pages/ballot-initiatives.aspx |
