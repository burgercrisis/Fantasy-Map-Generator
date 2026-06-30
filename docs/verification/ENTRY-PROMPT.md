# Entry Prompt — Verification Agent

> **Read this file, then start working. Do not ask questions. Do not stop.**

---

## BEFORE YOU DO ANYTHING ELSE

1. Read `docs/verification/verification-protocol.md` — this is the bible, follow it exactly
2. Read `docs/verification/checkpoints/<CONTINENT>-checkpoint.json` — find your resume position
3. Open `modules/namebases-<CONTINENT>.js` — this is your source file
4. **STOP.** Do not touch the file until you have read the protocol in full.

---

## WHAT YOU ARE DOING

You are verifying language namebase entries. Each entry has a `b:` field containing place names.
Every name in `b:` must be:
1. A real place (city, town, village, hamlet)
2. Named by or commonly used by speakers of THAT specific language
3. Verifiable from a web source

**This is NOT a numbers game.** Padding with regional towns is WORSE than leaving the entry broken.

---

## HOW TO PROCEED

For EACH entry starting from the checkpoint position:

1. Read the entry
2. Research the language (Wikipedia, Ethnologue)
3. Verify EVERY existing name in `b:` — remove any that fail
4. If below minimum threshold (30 small / 50 medium / 80 major), add verified names
5. For EVERY name you add, log the source URL and language connection
6. Write a verification log entry in `docs/verification/research/by-language/<name>.md`
7. Update checkpoint every 10 entries
8. Run `pnpm mixer:guardrails` after every edit
9. Move to next entry

---

## WHEN YOU STOP

You may ONLY stop when:
- ALL entries are verified and above minimum threshold (or marked WAITING with justification)
- OR you have hit 6 web search rate limits (wait 5-10 min each time)
- OR you need to hand off to another agent (update checkpoint, write clear notes)

When you stop, update the checkpoint file and report:
- Entries completed this session (with verification status)
- Entries marked WAITING (with detailed reasons — what you searched, what you found)
- Any blockers encountered
- Exact resume position for next agent

---

## THE ANTI-PATTERNS — DO NOT DO THESE

Every previous agent got this wrong. Don't be like them.

❌ Adding towns "from the region" without verifying language connection
❌ Dumping names from one Wikipedia article
❌ Padding micro-languages with regional cities
❌ Treating "verified the language exists" as "verified each name"
❌ Stopping after every entry to ask what to do next
❌ Marking COMPLETE with unverified names still in b:
❌ Spot-checking or sampling names — EVERY name must be verified
❌ Rushing through entries to finish faster

Instead:

✅ Verify EVERY individual name against a source — no exceptions
✅ Log every source in your research log
✅ Mark WAITING if you can't find verified names after 3+ searches
✅ Remove any name you cannot verify
✅ Keep going without stopping
✅ Take the time to do it RIGHT — accuracy matters more than speed
