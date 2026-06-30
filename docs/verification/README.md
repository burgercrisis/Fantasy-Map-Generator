# Documentation Verification — Quick Start

> **To begin verification work, read this file, then start. Do not ask questions.**

---

## Files You Need to Read (in order)

| Order | File | What It Is |
|-------|------|------------|
| 1 | `docs/verification/verification-protocol.md` | **THE BIBLE** — read this FIRST, follow it EXACTLY |
| 2 | `docs/verification/ENTRY-PROMPT.md` | Entry prompt — tells you how to start and when to stop |
| 3 | `docs/verification/agents/<CONTINENT>-AGENT.md` | Agent-specific pointer |
| 4 | `docs/verification/region/<CONTINENT>.md` | Region context |
| 5 | `docs/verification/checkpoints/<CONTINENT>-checkpoint.json` | Resume position |

**That's it. Read those files in that order, then start working.**

---

## Previous Agents Got This Wrong — Don't Repeat It

Every previous agent fell into the trap of **regional estimation**: researching a language's region, then stuffing the `b:` field with nearby towns while claiming each name was "verified."

**Do not do this.** The protocol now has hard rules against it:
- Every name must be individually verified (not just "from the region")
- Every name must have a documented source URL
- Max 5 names from any single source
- Micro-languages with <30 verified names get marked WAITED, not padded
- Verification log required for every entry

---

## What "Verified" Means

**Verified** = you opened a web page that confirms:
1. The place exists (city/town/village)
2. Speakers of THE SPECIFIC LANGUAGE live there or historically lived there

**NOT verified** = "it's in the same country" / "it's nearby" / "Wikipedia mentioned it in an article about the region"
