"use strict";

/**
 * Generate docs/verification/STATUS.md - the single source of truth.
 *
 * Run:  node tools/namebase-tools/namebase-status.js          (print summary)
 *       node tools/namebase-tools/namebase-status.js --write  (rewrite STATUS.md)
 *       node tools/namebase-tools/namebase-status.js --json   (machine readable)
 *
 * WHY THIS FILE REPLACES docs/verification/checkpoints/*.json
 * ------------------------------------------------------------
 * There were 15 checkpoint JSON files for 7 continents, several in duplicate
 * (asia and noceania, north-america and northAmerica, south-america and
 * southAmerica). They were all hand-maintained and all disagreed:
 *
 *   asia-checkpoint.json          "0 WAITING, all 4082 entries COMPLETE"
 *   noceania-checkpoint.json      "RESTART - previous work was incomplete"
 *   europe-checkpoint.json        "100% verification rate"
 *   north-america-checkpoint.json "HONEST STATUS: previous checkpoints
 *                                  falsely marked entries as verified"
 *   TRACKER.md                    "ALL PREVIOUS LOGS MARKED UNVERIFIED"
 *
 * None had been updated since 2026-08-25, while the September passes added and
 * removed thousands of seeds. An agent picking up the work had no way to tell
 * which document to believe, so each one trusted a different one.
 *
 * STATUS.md has exactly one property the checkpoints lacked: it is GENERATED.
 * Nobody can hand-edit a fact into it, so it cannot drift from the data or
 * contradict itself. If you want to change what it says, change the data.
 */

const fs = require("node:fs");
const path = require("node:path");
const {
  CONTINENTS,
  SEED_FLOOR,
  root,
  loadAll,
  seedCount,
  buildSeedFrequency,
  contaminationFor
} = require("./namebase-lib");

const write = process.argv.includes("--write");
const asJson = process.argv.includes("--json");
const OUT = path.join(root, "docs", "verification", "STATUS.md");

const files = loadAll();
const all = files.flatMap(f => f.entries);
const freq = buildSeedFrequency(all);

const perContinent = {};
for (const c of CONTINENTS) {
  const rows = all.filter(e => e.__continent === c);
  const counts = rows.map(seedCount);
  perContinent[c] = {
    entries: rows.length,
    complete: rows.filter(e => e.status === "COMPLETE").length,
    waiting: rows.filter(e => e.status === "WAITING").length,
    belowFloor: counts.filter(n => n < SEED_FLOOR).length,
    zero: counts.filter(n => n === 0).length,
    medianSeeds: counts.length ? counts.slice().sort((a, b) => a - b)[Math.floor(counts.length / 2)] : 0
  };
}

const below = all
  .map(e => ({e, n: seedCount(e)}))
  .filter(x => x.n < SEED_FLOOR)
  .sort((a, b) => a.n - b.n || a.e.__continent.localeCompare(b.e.__continent));

const contaminated = all
  .map(e => ({e, c: contaminationFor(e, freq)}))
  .filter(x => x.c.shared.length >= 10)
  .sort((a, b) => b.c.shared.length - a.c.shared.length);

const totals = {
  entries: all.length,
  complete: all.filter(e => e.status === "COMPLETE").length,
  waiting: all.filter(e => e.status === "WAITING").length,
  belowFloor: below.length,
  zero: all.filter(e => seedCount(e) === 0).length,
  contaminated: contaminated.length
};

if (asJson) {
  console.log(JSON.stringify({seedFloor: SEED_FLOOR, totals, perContinent}, null, 2));
  process.exit(0);
}

if (!write) {
  console.log("");
  console.log(`entries ${totals.entries}  |  COMPLETE ${totals.complete}  |  WAITING ${totals.waiting}`);
  console.log(`below floor (${SEED_FLOOR}) ${totals.belowFloor}  |  zero-seed ${totals.zero}  |  heavily contaminated ${totals.contaminated}`);
  console.log("");
  for (const c of CONTINENTS) {
    const s = perContinent[c];
    console.log(
      `  ${c.padEnd(14)} ${String(s.entries).padStart(5)} entries  ` +
        `${String(s.belowFloor).padStart(4)} below floor  ${String(s.zero).padStart(3)} zero  ` +
        `median ${s.medianSeeds} seeds`
    );
  }
  console.log("");
  console.log("Re-run with --write to regenerate docs/verification/STATUS.md");
  process.exit(0);
}

const stamp = new Date().toISOString().slice(0, 10);
const L = [];
L.push("# Namebase Verification Status");
L.push("");
L.push("> **GENERATED FILE - DO NOT EDIT.**");
L.push("> Produced by `node tools/namebase-tools/namebase-status.js --write`.");
L.push("> Hand edits are overwritten. To change a number here, change the data in");
L.push("> `public/modules/namebases-*.js` and regenerate.");
L.push("");
L.push(`Generated: ${stamp}  |  Seed floor: ${SEED_FLOOR}`);
L.push("");
L.push("## Headline");
L.push("");
L.push("| Metric | Count |");
L.push("|---|---:|");
L.push(`| Language entries | ${totals.entries} |`);
L.push(`| Marked COMPLETE (>= ${SEED_FLOOR} seeds) | ${totals.complete} |`);
L.push(`| Marked WAITING (< ${SEED_FLOOR} seeds) | ${totals.waiting} |`);
L.push(`| Below seed floor | ${totals.belowFloor} |`);
L.push(`| Zero seeds | ${totals.zero} |`);
L.push(`| Heavily contaminated (>=10 shared seeds) | ${totals.contaminated} |`);
L.push("");
L.push("## By continent");
L.push("");
L.push("| Continent | Entries | Below floor | Zero seed | Median seeds |");
L.push("|---|---:|---:|---:|---:|");
for (const c of CONTINENTS) {
  const s = perContinent[c];
  L.push(`| ${c} | ${s.entries} | ${s.belowFloor} | ${s.zero} | ${s.medianSeeds} |`);
}
L.push("");
L.push("## Work queue: entries below the seed floor");
L.push("");
L.push(`${below.length} entries need authentic settlement names. Ordered by seed count,`);
L.push("so the emptiest entries come first. One at a time, research then edit.");
L.push("");
L.push("| Seeds | Continent | Index | Language |");
L.push("|---:|---|---:|---|");
for (const x of below.slice(0, 300)) {
  L.push(`| ${x.n} | ${x.e.__continent} | ${x.e.i} | ${x.e.name} |`);
}
if (below.length > 300) {
  L.push("");
  L.push(`_Showing the lowest 300 of ${below.length}. Full queue:_`);
  L.push("");
  L.push("```");
  L.push("node tools/namebase-tools/verify-namebase-integrity.js --json");
  L.push("```");
}
L.push("");
L.push("## Heavily contaminated entries");
L.push("");
L.push(`${contaminated.length} entries share 10+ seeds with 20+ other entries, which`);
L.push("normally means a block of names was copy-pasted between unrelated languages");
L.push("rather than researched. These need re-research, not padding.");
L.push("");
L.push("| Shared seeds | Entry | Examples |");
L.push("|---:|---|---|");
for (const x of contaminated.slice(0, 120)) {
  L.push(`| ${x.c.shared.length} | ${x.e.name} (i=${x.e.i}) | ${x.c.shared.slice(0, 5).join(", ")} |`);
}
if (contaminated.length > 120) L.push("");
if (contaminated.length > 120) L.push(`_Showing the worst 120 of ${contaminated.length}._`);
L.push("");
L.push("## How to work on this");
L.push("");
L.push("Read `docs/verification/AGENT-PLAYBOOK.md`. It is the only document that");
L.push("describes the workflow. The older files in this directory");
L.push("(`MASTER-PLAN.md`, `TRACKER.md`, `checkpoints/`, `research/by-language/`)");
L.push("are historical and are known to disagree with each other and with reality.");
L.push("");

fs.writeFileSync(OUT, L.join("\n"), "utf8");
console.log(`wrote ${path.relative(root, OUT)} (${L.length} lines)`);
