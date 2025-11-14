# AGENT OPERATIONS OVERVIEW

This file is the primary entry point for any AI agent working in this repository. Load it at the beginning of every session to understand the required protocol, project direction, and supporting documentation.

## Required Reference Documents

- `agent-rules.md` — Defines the AICODE tagging protocol for in-code memory notes (WHY/TRAP/LINK/TODO/ASK) and the expected session workflow around them. Follow it when adding, reading, or updating AICODE comments.
- `Agent's Memory Bank` — Explains how to use the Memory Bank (`memory-bank/` directory) as the persistent context layer between sessions. Read all memory bank files at task start and keep `activeContext.md` / `progress.md` current.
- `ynab-lite-pwa-plan.md` — Project roadmap and functional specification for the YNAB-lite PWA. Treat it as the authoritative source for scope, stack, and delivery order.

Always consult all three documents before planning or executing work. They govern how context is captured, recalled, and maintained across sessions, and detail what “done” looks like for the product.

## Session Boot Checklist

1. Read this `AGENTS.md` to refresh the workflow expectations.
2. Read `Agent's Memory Bank`, then load every file under `memory-bank/` to recover persistent context.
3. Review `ynab-lite-pwa-plan.md` to align on current priorities, milestones, and technical decisions.
4. Follow `agent-rules.md` when scanning code for existing AICODE tags and when recording new knowledge.

## Memory Bank Expectations

- The `memory-bank/` directory mirrors the structure defined below.md`. Keep `activeContext.md` and `progress.md` synchronized with actual development status.
- When the plan introduces new decisions or shifts priorities, update the relevant memory bank files so future sessions start with accurate guidance.
- Never remove historical context unless it is superseded; instead, mark items as resolved or archived.

# Agent's Memory Bank

Agent memory resets completely between sessions. This isn't a limitation - it's what drives agent to maintain perfect documentation. After each reset, agent rely ENTIRELY on Memory Bank to understand the project and continue work effectively. agent MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]
    
    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC
    
    AC --> P[progress.md]

### Core Files (Required)
1. `projectbrief.md`
   - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope

2. `productContext.md`
   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. `activeContext.md`
   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights

4. `systemPatterns.md`
   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths

5. `techContext.md`
   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns

6. `progress.md`
   - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

### Additional Context
Create additional files/folders within memory-bank/ when they help organize:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Core Workflows

### Plan Mode
flowchart TD
    Start[Start] --> ReadFiles[Read Memory Bank]
    ReadFiles --> CheckFiles{Files Complete?}
    
    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]
    
    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]

### Act Mode
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Execute[Execute Task]
    Execute --> Document[Document Changes]

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

flowchart TD
    Start[Update Process]
    
    subgraph Process
        P1[Review ALL Files]
        P2[Document Current State]
        P3[Clarify Next Steps]
        P4[Document Insights & Patterns]
        
        P1 --> P2 --> P3 --> P4
    end
    
    Start --> Process

Note: When triggered by **update memory bank**, agent MUST review every memory bank file, even if some don't require updates. Focus particularly on activeContext.md and progress.md as they track current state.

REMEMBER: After every memory reset, agent begin completely fresh. The Memory Bank is agent only link to previous work. It must be maintained with precision and clarity, as agent effectiveness depends entirely on its accuracy.