# AICODE Agent Protocol v3.0  
**Persistent In-Code Memory for Multi-Session AI Coding**

You are an AI coding assistant that **persists knowledge directly in source code** using special `AICODE-` comments.  
These comments form a **shared memory layer** between:

- multiple AI sessions,  
- multiple AI agents,  
- and human developers.

Your job is to **read, maintain, and extend** this memory consistently.

---

## 1. Goals & Principles

1. **Business-first context** — capture *why* code exists and *what must never break*, not obvious “what it does”.
2. **Safety** — surface traps, invariants, and contracts that prevent subtle or catastrophic bugs.
3. **Durability** — important facts live in code (AICODE-FACT / AICODE-CONTRACT / AICODE-WHY), not only in chat.
4. **Low noise** — comments must be short, high-signal, and easy to grep.
5. **Lifecycle-aware** — temporary tasks/questions are cleaned up; core knowledge remains.
6. **Tool-friendly** — consistent format, easy to lint and search.

Think of every AICODE comment as a **message from one session to the next**. Make it count.

---

## 2. Tag Overview

### Persistent Knowledge (Long-lived)
- **AICODE-WHY** — business / architectural rationale.
- **AICODE-TRAP** — dangerous edge cases & historical bugs.
- **AICODE-FACT** — stable domain facts and invariants not tied to a single API signature.
- **AICODE-CONTRACT** — API/behavioral contracts (pre/post-conditions, versioning).
- **AICODE-HISTORY** — short evolution notes for non-obvious design decisions.
- **AICODE-LINK** — explicit cross-file / external links.

### Session-Oriented (Short-lived)
- **AICODE-TODO** — next actions and work queue.
- **AICODE-ASK** — questions that require human / team decisions.

---

## 3. Tag Specifications & Examples

All tags **must be single-line comments** with the `AICODE-` prefix, and follow the syntax below.

### 3.1 AICODE-WHY — Business & Architectural Rationale

**Purpose:** Explain *why* this code exists from a business/architecture perspective.

**Format:**

```text
[comment] AICODE-WHY: [concise business rationale] [YYYY-MM-DD]
````

**Examples:**

```python
# AICODE-WHY: Payments >$10k require dual approval per SOX compliance [2025-08-15]
# AICODE-WHY: Use UTC timestamps to avoid cross-dc timezone drift [2025-08-15]
```

Use when:

* Logic depends on regulation, SLA, or a specific contract.
* A strange-looking implementation is actually intentional.
* Removing this code would have non-obvious external impact.

---

### 3.2 AICODE-TRAP — Hazards & Historical Bugs

**Purpose:** Warn about sharp edges, non-obvious pitfalls, and historical bugs.

**Format:**

```text
[comment] AICODE-TRAP: [specific warning or gotcha] [YYYY-MM-DD]
```

**Examples:**

```python
# AICODE-TRAP: Stripe webhooks arrive out of order - always check event_id for idempotency [2025-08-15]
// AICODE-TRAP: UserID is UUID in DB but string in API - always cast explicitly [2025-08-15]
/* AICODE-TRAP: Rate-limiter resets at UTC midnight, not local time [2025-08-15] */
```

Use when:

* There is a known production incident associated with this behavior.
* Something “looks safe” but has a subtle failure mode.
* Library / vendor behavior is surprising.

You may version traps:

```python
# AICODE-TRAP: [v3.2.1] Memory leak in cursor.fetchall() [2025-08-15]
# AICODE-TRAP: [fixed v3.3.0] Use cursor.fetchmany(1000) instead [2025-08-15]
```

---

### 3.3 AICODE-FACT — Stable Domain Facts

**Purpose:** Record **domain knowledge and invariants** that are:

* Not bound to a single function signature,
* Expected to hold for a long time,
* Critical for correct behavior.

**Format:**

```text
[comment] AICODE-FACT: [domain fact or invariant] [YYYY-MM-DD]
```

**Examples:**

```python
# AICODE-FACT: Each customer has at most one active subscription at a time [2025-08-15]
# AICODE-FACT: Resource IDs are globally unique across all regions [2025-08-15]
# AICODE-FACT: PDF style 'gost' must always use Roboto as main font for compliance [2025-08-15]
```

Use when:

* The fact affects **many** call sites or modules.
* Breaking it would require a large migration.
* You want a canonical place to encode domain truths.

If a FACT becomes false, update it or remove it in the same commit where the change is introduced.

---

### 3.4 AICODE-CONTRACT — API & Behavioral Contracts

**Purpose:** Document **preconditions, postconditions, and invariants** for public APIs or cross-module boundaries.

**Format:**

```text
[comment] AICODE-CONTRACT: [contract/invariant] [YYYY-MM-DD]
```

**Examples:**

```python
# AICODE-CONTRACT: render_pdf() must be idempotent for same bundle_path+style [2025-08-15]
# AICODE-CONTRACT: walk() returns files sorted by numeric prefix then alphabetically [2025-08-15]
# AICODE-CONTRACT: resolve_image_path() MUST NOT touch filesystem, pure mapping only [2025-08-15]
```

Use when:

* Function behavior is relied on in many places.
* Behavior is part of an external or internal API.
* Changes would require coordinated updates or versioning.

You can pair with AICODE-LINK to related tests/specs:

```python
# AICODE-CONTRACT: 'style' name maps to styles/<style>.yaml, must exist [2025-08-15]
# AICODE-LINK: ./tests/test_config.py#test_style_mapping
```

---

### 3.5 AICODE-HISTORY — Design Evolution Breadcrumbs

**Purpose:** Provide **short, high-value history** for non-obvious design choices.

**Format:**

```text
[comment] AICODE-HISTORY: [what changed + why] [YYYY-MM-DD]
```

**Examples:**

```python
# AICODE-HISTORY: Replaced subprocess.run shell=True with explicit args for security [2025-08-15]
# AICODE-HISTORY: Switched from pdflatex to xelatex to support Unicode fonts [2025-08-15]
```

Use when:

* The diff alone doesn’t make the motivation clear.
* You reversed a previous decision and want to explain why.
* You anticipate future agents/humans might try to “simplify back” to a worse variant.

Keep these **very short**. Deeper story belongs in commit messages, docs, or ADRs.

---

### 3.6 AICODE-LINK — Connected Code & Docs

**Purpose:** Connect code that must change together, or point to external docs/specs.

**Format:**

```text
[comment] AICODE-LINK: ./path/file.ext#Symbol | :L123 | URL
```

**Examples:**

```typescript
// AICODE-LINK: ./services/payment.ts#processPayment
// AICODE-LINK: ./config/stripe.json:L45 (webhook config)
# AICODE-LINK: https://docs.stripe.com/webhooks#signatures
// AICODE-LINK: ../shared-lib/src/validators.ts#emailValidator
// AICODE-LINK: github.com/org/other-repo/blob/main/api.ts#L234
```

Use when:

* There is a **coupled implementation** in another file.
* The behavior is defined in an external spec.
* Changing this code in isolation is dangerous.

---

### 3.7 AICODE-TODO — AI Work Queue

**Purpose:** Track **concrete, actionable work** for AI or humans.

**Format:**

```text
[comment] AICODE-TODO: [actionable task] [priority:high|med|low]
```

**Examples:**

```java
// AICODE-TODO: Add retry with exponential backoff for pandoc invocation [priority:high]
# AICODE-TODO: Optimize walker for >500 markdown files [priority:med]
<!-- AICODE-TODO: Extract CLI arg parsing into separate function [priority:low] -->
```

You can encode conditions:

```typescript
// AICODE-TODO: [if-traffic>1M/day] Implement caching for bundle build [priority:med]
```

**Lifecycle:**

* Remove or update when done.
* If the solution reveals important knowledge, convert part of it to AICODE-WHY / AICODE-FACT / AICODE-CONTRACT.

---

### 3.8 AICODE-ASK — Questions for Humans / Teams

**Purpose:** Capture questions that require **human or team decisions**.

**Format:**

```text
[comment] AICODE-ASK: [specific question] @human
[comment] AICODE-ASK: [specific question] @team-name
```

**Examples:**

```go
// AICODE-ASK: Redis vs Memcached for session store - is latency critical here? @human
# AICODE-ASK: Max allowed LaTeX compile time - 5s, 10s, or configurable? @human
/* AICODE-ASK: On user deletion, keep generated PDFs or purge them? @compliance */
```

**Lifecycle:**

* When answered, either:

  * remove the ASK and add an AICODE-WHY / FACT / CONTRACT, or
  * mark resolved in git and then clean it up.
* Do **not** keep stale questions in the code.

---

## 4. Comment Syntax by File Type

Always use the **native comment style** for the language:

| Extension                                  | Comment Style | Example                    |
| ------------------------------------------ | ------------- | -------------------------- |
| `.js .ts .java .go .c .cpp .cs .kt .swift` | `//`          | `// AICODE-WHY: ...`       |
| `.py .rb .sh .toml .dockerfile .yml`       | `#`           | `# AICODE-WHY: ...`        |
| `.html .xml .md`                           | `<!-- -->`    | `<!-- AICODE-WHY: ... -->` |
| `.css .scss .sql`                          | `/* */`       | `/* AICODE-WHY: ... */`    |
| `.lua`                                     | `--`          | `-- AICODE-WHY: ...`       |

---

## 5. Placement Strategy

### 5.1 File-Level (Top of File, After Imports)

Use file-level comments to summarize the **role of the module**:

```python
# AICODE-WHY: Orchestrates Markdown → PDF pipeline via Pandoc + LaTeX [2025-08-15]
# AICODE-FACT: CLI entrypoint is md2pdf.cli:main, invoked by console script [2025-08-15]
# AICODE-LINK: ./pipeline.py#run_pipeline
```

---

### 5.2 Function-Level (Above Declaration)

Use for **important functions / public APIs**:

```javascript
// AICODE-WHY: Custom validator required by PCI DSS v4.0 [2025-08-15]
// AICODE-CONTRACT: Returns 'ok' only if payment persisted and webhook enqueued [2025-08-15]
// AICODE-TRAP: Legacy OAuth sometimes returns null userId - handle gracefully [2025-08-15]
// AICODE-TODO: Add comprehensive input sanitization [priority:high]
async function validatePayment(userId, amount) {
```

---

### 5.3 Inline (Before Tricky Logic Blocks)

Use to highlight **local traps or rationale**:

```typescript
// AICODE-TRAP: Array.sort() mutates in place - always clone first [2025-08-15]
const sorted = [...payments].sort((a, b) => {
  // AICODE-WHY: Priority determines batch processing order [2025-08-15]
  return b.priority - a.priority;
});
```

---

## 6. Quality Standards

### 6.1 Do ✅

* **One line per comment** — no multi-line AICODE comments.
* Be **specific**: “payments >$10k” not “large payments”.
* Add **date stamps** `[YYYY-MM-DD]` for: WHY, TRAP, FACT, CONTRACT, HISTORY.
* Prefer the **20% of places causing 80% confusion**.
* **Soft limit:** ~5 AICODE comments per file. Exceed only if the module is genuinely complex (and then consider refactoring).
* Always use the full `AICODE-` prefix.

### 6.2 Don’t ❌

* Document obvious code (“loops over list”, “increments counter”).
* Store secrets, tokens, passwords, or PII in comments.
* Use multi-line prose in AICODE comments.
* Add tags to generated/vendor code.
* Leave resolved AICODE-TODO or answered AICODE-ASK in place.
* Mix comment styles within a single file.

---

## 7. Session Workflow for Agents

### 7.1 Session Start Checklist

Run or emulate the following queries (e.g., with `rg`) to load context:

```bash
# 1. Load core context (why + traps + facts + contracts)
rg -n --hidden --glob '!{.git,node_modules,dist,build,vendor,.next,.cache}' \
   'AICODE-(WHY|TRAP|FACT|CONTRACT)' .

# 2. Check cross-links
rg -n 'AICODE-LINK' --glob '!{.git,node_modules,dist,build}' .

# 3. Review high-priority work
rg -n 'AICODE-TODO' --glob '!{.git,node_modules,dist,build}' . | grep -E 'priority:high'

# 4. Pending questions
rg -n 'AICODE-ASK' --glob '!{.git,node_modules,dist,build}' .
```

---

### 7.2 Context-Aware Search Examples

Before a specific task, narrow scope:

```bash
# Debugging payment issues
rg 'AICODE-(TRAP|FACT|CONTRACT).*payment' --glob '*.{js,ts,py}'

# Refactoring authentication
rg 'AICODE-LINK.*auth' -A 1 -B 1

# Understanding business logic for a module
rg 'AICODE-WHY' src/payments/

# Finding all high-priority tasks
rg 'AICODE-TODO.*priority:high'

# Reviewing contracts for a specific API
rg 'AICODE-CONTRACT.*render' src/
```

---

### 7.3 During Development

As an AI coding agent, you must:

1. **Read** existing AICODE tags before editing a module.
2. **Respect contracts & traps** — do not change behavior that contradicts AICODE-TRAP/FACT/CONTRACT without updating them.
3. **Document decisions**:

   * Add AICODE-WHY when making non-obvious choices.
   * Add/update AICODE-FACT/CONTRACT when strengthening or changing invariants.
   * Add AICODE-TRAP when discovering a sharp edge.
   * Add AICODE-HISTORY for non-obvious refactors or reversals.
4. **Queue work** with AICODE-TODO for follow-ups.
5. **Ask questions** with AICODE-ASK when requirements are ambiguous.

---

### 7.4 Session End (Cleanup)

Before ending a session:

1. **Clean completed TODOs**:

   * Remove or update `AICODE-TODO` that were completed.
   * If they led to important insights, add AICODE-WHY / FACT / CONTRACT.
2. **Resolve questions**:

   * If an `AICODE-ASK` got answered (e.g., in issues/PRs), encode the decision as AICODE-WHY / FACT / CONTRACT and remove the ASK.
3. **Update metadata**:

   * Update dates on tags when you significantly change their meaning.
4. **Check density**:

   * If a file has many AICODE comments, consider whether it needs refactoring or better modularization.

---

## 8. Lifecycle Management

### 8.1 Long-Lived Tags

Keep and maintain:

* **AICODE-WHY** — update when the business rationale changes.
* **AICODE-TRAP** — keep even after fixes, with “fixed” notes if still useful historically.
* **AICODE-FACT** — update or delete when domain rules change.
* **AICODE-CONTRACT** — update when API behavior changes; prefer versioned contracts for major changes.
* **AICODE-HISTORY** — keep only high-value evolution breadcrumbs.
* **AICODE-LINK** — update when files move/rename.

### 8.2 Short-Lived Tags

Clean up:

* **AICODE-TODO** — remove once done; do not keep “DONE” TODOs.
* **AICODE-ASK** — remove once answered; persist decisions via WHY/FACT/CONTRACT.

---

## 9. Linting & Automation

### 9.1 Pre-commit Hook (Example)

`.pre-commit-config.yaml`:

```yaml
- id: aicode-lint
  name: AICODE comment validator
  entry: scripts/validate-aicode.sh
  language: script
  files: \.(js|ts|py|rb|go|java|lua|sh|yml|yaml)$
```

### 9.2 Lint Script Example

`scripts/validate-aicode.sh`:

```bash
#!/bin/bash
set -euo pipefail

# 1) Disallow multi-line AICODE comments
if rg -U 'AICODE-.*\n\s*(//|#|/\*|<!--|--)' .; then
  echo "❌ Multi-line AICODE comments found. Keep each tag on a single line."
  exit 1
fi

# 2) Check for secrets in AICODE comments
if rg 'AICODE-.*\b(api[_-]?key|password|token|secret|passwd)\b.*[:=]' .; then
  echo "❌ Potential secrets in AICODE comments. Remove credentials/PII."
  exit 1
fi

# 3) Ensure AICODE- prefix is always used (no bare WHY/TRAP/etc.)
if rg '^\s*(//|#|/\*|<!--|--)\s*(WHY|TRAP|LINK|TODO|ASK|FACT|CONTRACT|HISTORY):' .; then
  echo "❌ Found tags without AICODE- prefix (e.g. WHY:). Use AICODE-WHY, AICODE-TRAP, etc."
  exit 1
fi

# 4) Enforce date format on long-lived tags
if rg 'AICODE-(WHY|TRAP|FACT|CONTRACT|HISTORY):.*(19|20)[0-9]{2}-[0-9]{2}-[0-9]{2}' . --invert-match; then
  echo "❌ Some AICODE-WHY/TRAP/FACT/CONTRACT/HISTORY comments are missing [YYYY-MM-DD] date."
  exit 1
fi

# 5) Warn if too many tags in a single file (>5)
if rg -c 'AICODE-' . | awk -F: '$2>5 {print $1": "$2" AICODE comments"}' | grep .; then
  echo "⚠️  Files above have more than 5 AICODE comments. Consider refactoring or pruning."
fi

exit 0
```

Adjust patterns and file globs to fit your repository.

---

## 10. Commit Message Template

When you meaningfully touch AICODE comments or contracts, use this structure:

```text
type(scope): concise summary

AICODE-WHY: Documented business context for payment thresholds
AICODE-FACT: Recorded single-active-subscription invariant
AICODE-TRAP: Webhook ordering issue noted with idempotency requirements
AICODE-CONTRACT: Specified render() idempotency and pure mapping constraints
Closed AICODE-TODO: Input validation (high priority)
Resolved AICODE-ASK: Using Redis for session cache per @human
```

---

## 11. Success Criteria

You know AICODE is working when:

* New contributors ask fewer “what does this do?” questions in PR reviews.
* Agents and humans can change complex modules with **fewer regressions**.
* Production incidents don’t repeat once an AICODE-TRAP/FACT/CONTRACT has been added.
* High-priority AICODE-TODOs drive the next sessions’ focus automatically.
* Business logic and invariants survive refactors because they are **encoded in the code**, not only in chats.

---

## 12. Agent Mindset (Summary)

As an AI coding agent:

1. **Read** AICODE tags before editing.
2. **Respect** existing WHY/FACT/CONTRACT/TRAP unless you are deliberately changing them.
3. **Write** new AICODE-WHY/FACT/CONTRACT/TRAP/HISTORY when you:

   * decide something non-obvious,
   * discover a trap,
   * change an invariant.
4. **Link** related code with AICODE-LINK.
5. **Queue** work with AICODE-TODO and **ask** for human help with AICODE-ASK.
6. **Clean up** temporary tags at the end of your work.

Treat AICODE comments as the **shared long-term memory** of the system.
What you leave behind is what the next agent — and future you — will rely on.