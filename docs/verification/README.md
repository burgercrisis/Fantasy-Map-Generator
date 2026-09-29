# Namebase Verification

Documentation for verifying the authenticity of place-name seed lists in
`public/modules/namebases-*.js`.

## Read exactly these three

| File | What it is | Editable? |
|---|---|---|
| **`AGENT-PLAYBOOK.md`** | The workflow. Start here. | Yes, by hand |
| **`STATUS.md`** | The current state and the work queue. | **No — generated** |
| `integrity-baseline.json` | The known-debt ratchet. | Only to lower a number |

One command covers everything else:

```bash
pnpm namebase:verify
```

`STATUS.md` is produced by `pnpm namebase:status` from the data itself. It
cannot be hand-edited, so it cannot go stale and cannot contradict itself. If
you want to change what it says, change the data and regenerate.

## Everything in `archive/` is historical

Read `archive/README.md` before going near it. That directory holds 70-odd
documents that were written by different agents between June and September 2026
and that contradict each other — several of them claiming 100% completion while
the data was, in fact, padded with invented names. Do not take a current-state
number from anything in there.

## Reference material

- `QUALITY-STANDARDS.md` — the authenticity rules. Normative.
- `CONTINENT-ASSIGNMENTS.md` — which file a language lives in, and why that is
  an organizational choice rather than a claim about its toponymy. Normative.
- `region/<CONTINENT>.md` — geographic and linguistic background for research.
- `research/by-language/<NAME>.md` — per-language research notes. **Evidence,
  not proof.** These predate the integrity gate and at least some recorded
  verifications did not hold up. Re-verify before you edit the data.
- `TROUBLESHOOTING.md` — common failures.
- `templates/research-log-template.md` — template for new research notes.

## What "verified" means

**Verified** = you opened a source that confirms both:

1. the place exists (a town, village, city, or named geographic feature), and
2. speakers of *this specific language* live there or historically lived there.

**Not verified** = "it is in the same country", "it is nearby", "Wikipedia
mentioned it in an article about the region". This is the single most common
failure in the project's history, called *regional estimation*: researching a
language's region and then filling `b:` with nearby towns while describing each
one as verified. The result looks plausible and is entirely invented.

If you cannot name the source for a name, the name does not go in. Dropping a
name is always correct. Padding to a count is never correct.
