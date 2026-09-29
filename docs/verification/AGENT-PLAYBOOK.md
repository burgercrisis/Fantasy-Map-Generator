# Namebase Verification — Agent Playbook

**This is the only document that describes how to work on namebase verification.**
Everything else in `docs/verification/` is historical. If they disagree with this
file or with the data, this file and the data are right.

---

## The one command

```bash
pnpm namebase:verify
```

Run it first, every session, before you touch anything. It prints the state of
the data and fails if you have broken an invariant. If it is green you are on
solid ground. If it is red, nothing you do will commit until it is green again.

Three more commands exist. That is the entire toolset:

| Command | Use it to |
|---|---|
| `pnpm namebase:verify` | Check everything. Start here. Blocked by pre-commit. |
| `pnpm namebase:status` | Regenerate `docs/verification/STATUS.md`. Run after you change data. |
| `pnpm namebase:clean` | Mechanically strip padding, dupes and false status. `-- --check` to preview. |
| `pnpm namebase:claim <continent>` | Lock a continent so another agent does not overwrite your work. |

---

## Read this before you start

`docs/verification/STATUS.md` is **generated**. It cannot be hand-edited and it
cannot be stale. It tells you:

- how many entries are below the seed floor, per continent
- the work queue, ordered by seed count (emptiest first)
- the entries most contaminated by copy-pasted names

Ignore these files. They are historical and they contradict each other:

- `MASTER-PLAN.md` — the original 4-phase plan. Describes an approach that did
  not survive contact with reality.
- `TRACKER.md` — says "ALL PREVIOUS LOGS MARKED UNVERIFIED".
- `checkpoints/*.json` — 15 files for 7 continents, several duplicated, none
  updated since 2026-08-25, all disagreeing.
- `research/by-language/*.md` — some genuine research, but also logs that were
  later found to be inaccurate. Useful as a starting hint, never as proof.
- `../../.opencode/agent/namebase-verification.md` — superseded by this file.

---

## The one rule that matters

**A place name goes in a seed list only if you found it, in this session, in a
source you can cite. If you cannot cite it, it does not go in. Ever.**

Not because a rule says so. Because it already happened, at scale:

- **5,689 synthetic seeds** were appended across **539 entries** to push them
  over the 25-name line — the language name plus a random letter
  (`Bhojpuri` → `Bhojpurik`, `Bhojpurit`, `Bhojpurip`, …), or a bare stem plus an
  English suffix (`Min` → `Mintown`, `Minville`, `Minburg`, …).
- **785 seeds** were research notes pasted straight into seed fields:
  `"1847"`, `"48 Sub-sections"`, `"1900"`, `"African-American Settlers"`.
- **3,988 seeds** were duplicated inside single entries.
- **1,794 entries** were marked `COMPLETE` while holding fewer than 25 names.
- **53 rows** in `namebases-europe.js` were bare index numbers spliced into the
  array — not entries at all.
- **970 entries** still share 10+ seeds with 20+ other languages, which is what
  copy-pasting a block of cities into an unrelated language looks like.

None of this was caught at the time, because the only thing being measured was
"does this entry have 25 names". Padding was the cheapest way to move that
number. `pnpm namebase:verify` now makes padding an error, so the incentive is
gone. Keep it that way.

---

## Workflow

### 1. Look at the queue

```bash
pnpm namebase:verify                    # where things stand
pnpm namebase:status                    # regenerate STATUS.md and read the queue
```

### 2. Claim a continent — always

```bash
node tools/namebase-tools/claim.js asia "Afade + 30 low-seed entries" --agent my-agent
```

Several agents have edited `namebases-africa.js` at the same time. Each read the
file, researched, then wrote the whole array back — so whichever finished last
silently erased the others' work, and the commit message described changes that
were no longer in the tree. Nothing errored. The claims file makes that visible.

If a continent is already claimed, take another one, or wait. A claim older than
8 hours is stale; break it with `--force` only if that agent is genuinely gone.

Release when you are done:

```bash
node tools/namebase-tools/claim.js --release asia --agent my-agent
```

### 3. Research ONE language at a time

Pick an entry from the queue. Ideally the emptiest, so the biggest gain lands
first. Confirm it is a real language and not a family, region, or reconstructed
proto-language — those do not belong in the data at all.

For each candidate name, actually check it:

- It is a real settlement — town, village, city, or named geographic feature.
- It was named by speakers of **this** language, wherever the place is.
- It is **not** a colonial-era name in an indigenous language's entry.
- It is **not** a language name, an ethnic group name, or a person's name.
- It is **not** an administrative unit (province, state, district, county).
- It is not a modern anachronism in a historical base.

Sources that actually work: Wikipedia, GeoNames, Ethnologue, Glottolog, Joshua
Project, Mapcarta, national census and geographic survey databases.

Write down the source as you go. If you cannot name the source for a name, drop
the name. Dropping is always correct. Padding is never correct.

### 4. Edit surgically

Edit only the `b` field of the entry you researched. Leave `min`, `max`, `d`,
`m` alone unless you have a specific reason — they are not what you were asked
to fix, and changing them silently alters name *shapes* for that language.

Never reformat the file. `normalize-namebase-format.js` guarantees canonical
formatting; if you run `biome` or an editor that reformats, the diff becomes
unreviewable, which is how the batch-5 padding hid inside a commit that looked
like routine reformatting.

Keep the `status` field honest. It means:

- `COMPLETE` — 25+ verified names, all sourced.
- `WAITING` — fewer than that. This is a normal, respectable state. Say so.

`pnpm namebase:clean` recomputes it for you, so you cannot get it wrong.

### 5. Verify before you commit

```bash
pnpm namebase:verify        # must be green
pnpm namebase:status        # keep STATUS.md in sync
```

`namebase:verify` runs in pre-commit, so a red gate means no commit. That is
intentional. If you are sure the gate is wrong, fix the gate — in its own
commit, with a justification — do not route around it.

### 6. Commit

One continent per commit. The message must say which languages you substantiated,
how many names each went from and to, and which sources you used.

Do not write "test commit". Do not bundle unrelated source changes into a
namebase commit. Nine of the last dozen verification commits had a message that
did not describe their contents.

---

## What the gate checks, and why each one is an error

An error is only ever something a machine can decide. Judgement calls are
warnings, because a gate that encodes a judgement gets argued with and then
switched off.

| Code | Fails on | Why it is mechanical |
|---|---|---|
| `E001` | Array rows that are not namebase objects | Not a judgement. Corruption. |
| `E002` | Entries missing `name` or `i` | Not a judgement. Corruption. |
| `E003` | One index used twice in a file | Ambiguous mixer lookup. |
| `E004` | One index claimed in two files | Ambiguous mixer lookup. |
| `E005` | Language name + one letter, 3+ times or 2+ at the tail | The padding signature. |
| `E006` | Bare stem + English suffix, 6+ times | The template signature. |
| `E007` | The same seed twice in one entry | Wasteful and always wrong. |
| `E008` | `COMPLETE` while below the floor | The status field is a fact, not an opinion. |
| `E009` | A seed starting with a digit | No toponym starts with a digit. It is a date, a count or a footnote. |
| `T001` | A tool reading a data file that does not exist | The tool cannot run. |

Warnings — `W001` zero seeds, `W003` cross-entry contamination, and the below-floor
backlog — are reported, never blocking. They are the work, not the rules.

### The ratchet

Some debt cannot be paid in the same change that creates the gate. Index
collisions need a migration that also rewrites `config/language-mixer-map.json`.
Rather than leave the gate permanently red (which trains everyone to ignore red)
or delete the checks (which loses the debt), current counts are recorded in
`docs/verification/integrity-baseline.json`:

- count **above** baseline → **FAIL**. Known debt may shrink, never grow.
- count **at or below** baseline → pass, and the improvement is reported.

So a new collision fails immediately, and lowering a baseline locks in progress:

```bash
node tools/namebase-tools/verify-namebase-integrity.js --update-baseline
```

Raising a baseline is the only way to make things worse, and it shows up as a
diff somebody has to read. Use it honestly.

---

## Current state, and what is actually left

4,586 entries. 994 below the seed floor. The queue is dominated by **Asia (599)**
— the September 2026 passes worked almost entirely on Africa.

| Continent | Entries | Below floor | Zero seed |
|---|---:|---:|---:|
| africa | 1034 | 180 | 1 |
| asia | 1952 | 599 | 1 |
| europe | 977 | 69 | 0 |
| northAmerica | 243 | 74 | 2 |
| southAmerica | 171 | 10 | 0 |
| oceania | 208 | 62 | 3 |
| fantasy | 1 | 0 | 0 |

Open items, roughly in order of value:

1. **994 entries below the floor.** The main work. Asia first.
2. **970 contaminated entries** sharing 10+ seeds with 20+ others. Needs research,
   not padding. `namebase-status.js` lists the worst.
3. **283 index collisions** (`E003` 61, `E004` 222). 101 of these indices are
   live in `config/language-mixer-map.json`, so the mixer genuinely resolves them
   ambiguously. Needs a dedicated migration: assign fresh indices, rewrite the
   map, re-run the guardrails.
4. **24 dead tools** (`T001`) reading `modules/namebases-*.js` from before the
   files moved to `public/modules/`. Several were being used to measure progress
   during the September passes, so treat any number they produced with suspicion.
   Fix or delete them; the ratchet stops the list growing.

---

## Rules for working on this with other agents

- **One continent, one agent, at a time.** Use the claim tool. This is not
  bureaucracy — concurrent writes to these files have silently destroyed work.
- **Never write a whole namebase file back from a stale read.** Re-read
  immediately before editing, and prefer a targeted edit to the `b` field.
- **Never edit `config/language-mixer-map.json` to work around a namebase
  problem.** It is an append-only registry, and index changes there affect
  generation for every language that uses the base.
- **Do not trust a number you did not just measure** with
  `pnpm namebase:verify`. Several tools in this repo silently undercount because
  of a regex that truncates the array at the first `];`.
- **If you cannot verify a name, remove it.** An entry with 12 real names beats
  one with 25 where 13 are invented. `WAITING` is an honest answer.
