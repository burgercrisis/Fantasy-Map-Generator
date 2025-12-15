hard continue
---
trigger: model_decision
description: enforce continue semantics / when the user uses /continue
---
- When the user invokes `/continue` in this repo, you MUST:
  - Treat the current task as the language mixer / DEVplans [Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0) thread, unless the user explicitly says otherwise (e.g. `/continue pdf splitter`).
  - Ignore active document, cursor position, and other IDE metadata when deciding what to continue.
  - Prefer `DEVplans/*.md` and previously stated long-running plans over recency of code edits or open files.

- `/continue` execution semantics:
  - Resume the most recent unexecuted NEXT_ACTION from the active workstream / plan.
  - Do NOT re-plan unless new information arrived or the user explicitly changes scope.

- Plan → act handoff contract (do not use Sequential Thinking):
  - Output these sections (in this order):
    - PLAN: 2–5 milestones
    - NEXT_ACTION: exactly one concrete tool call OR one file edit you will do immediately
    - BLOCKERS: only if you cannot safely proceed; must be explicit questions
  - If BLOCKERS is empty, execute NEXT_ACTION in the same turn (do not end the turn with “I’m going to…”).