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
  contaminationFor,
  findPastedBlocks,
  continentMismatches
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

const pasted = findPastedBlocks(all, {run: 8, minEntries: 20});
const misplaced = continentMismatches(all, {minSeeds: 6, share: 0.7});

// Languages the mixer map offers but which have no namebase under that name.
// These are the largest remaining research backlog: a real language the user can
// ask for, which currently resolves to an unrelated seed list.
function mapBacklog() {
  try {
    const mapPath = path.join(root, "config", "language-mixer-map.js");
    const raw = fs.readFileSync(mapPath, "utf8");
    const map = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
    const catPath = path.join(root, "config", "language-mixes-all.js");
    const craw = fs.readFileSync(catPath, "utf8");
    const catalog = JSON.parse(craw.slice(craw.indexOf("["), craw.lastIndexOf("]") + 1));
    const isoName = new Map();
    for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

    const norm = s =>
      String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const known = new Set();
    for (const e of all) known.add(norm(e.name));
    for (const k of aliasKeys(all)) known.add(k);

    const out = [];
    for (const row of map) {
      const nm = isoName.get(row.iso);
      if (!nm) continue;
      const want = norm(nm);
      if (want && !known.has(want)) out.push({iso: row.iso, name: nm, index: row.bases[0]});
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/**
 * Protolanguages and macrolanguage groupings can never have a legitimate
 * namebase: nobody ever spoke a reconstructed proto-language, and a language
 * family is not a community with a shared set of settlements. Listing them as
 * work sends an agent to research something that cannot be done, which is worse
 * than not listing it. They are reported separately so that the decision to
 * drop them from the mixer map is visible rather than silently deferred forever.
 */
const isUnworkable = u =>
  /^(proto|pre-proto)/i.test(u.iso) ||
  /^(proto|pre-proto)/i.test(u.name) ||
  /^(macro|super|over)/i.test(u.iso) ||
  /\b(umbrella|macrolanguage|language family|dialect (cluster|continuum|group)|grouping|macrofamily)\b/i.test(
    `${u.name} ${u.family || ""}`
  );

function aliasKeys(entries) {
  const out = new Set();
  for (const e of entries) {
    for (const paren of String(e.name || "").match(/\(([^)]+)\)/g) || []) {
      for (const part of paren.replace(/[()]/g, "").split(/[,;/]/)) {
        const k = part.trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        if (k.length >= 4) out.add(k);
      }
    }
  }
  return out;
}

const allNoNamebase = mapBacklog();
const unworkable = allNoNamebase.filter(isUnworkable);
const noNamebase = allNoNamebase.filter(u => !isUnworkable(u));

const totals = {
  entries: all.length,
  complete: all.filter(e => e.status === "COMPLETE").length,
  waiting: all.filter(e => e.status === "WAITING").length,
  belowFloor: below.length,
  zero: all.filter(e => seedCount(e) === 0).length,
  contaminated: contaminated.length,
  pasted: pasted.size,
  noNamebase: noNamebase.length,
  unworkable: unworkable.length
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
L.push(`| Pasted 8-seed blocks (W004, actionable) | ${totals.pasted} |`);
L.push(`| Map ISOs with no namebase (research backlog) | ${totals.noNamebase} |`);
L.push(`| Map ISOs that can never have a namebase | ${totals.unworkable} |`);
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
L.push("## Pasted seed blocks — work from this list, not the shared-seed count");
L.push("");
L.push(`**${totals.pasted} entries** contain a run of 8 identical seeds, in the same order,`);
L.push("shared with 20+ other entries. That is the copy-paste signature and it is");
L.push("never legitimate. These entries need their own toponyms researched.");
L.push("");
L.push("Do **not** use the raw shared-seed count as a work list. Related languages");
L.push("genuinely share place names — Moldovan and Romanian, Occitan and its");
L.push("dialects, the Caribbean creoles — as do diaspora languages that took their");
L.push("settlers' names. Deleting those would destroy correct data. The block");
L.push("detector is contiguity-and-order based precisely so it does not do that.");
L.push("");
L.push("| Language | Continent | Index | Partners | Block |");
L.push("|---|---|---:|---:|---|");
for (const [e, info] of [...pasted.entries()]
  .sort((a, b) => b[1].partners - a[1].partners)
  .slice(0, 60)) {
  L.push(`| ${e.name} | ${e.__continent} | ${e.i} | ${info.partners} | ${info.block.slice(0, 3).join(", ")}, ... |`);
}
if (pasted.size > 60) {
  L.push("");
  L.push(`_Showing ${Math.min(60, pasted.size)} of ${pasted.size}. Full list: ` +
    "`node tools/namebase-tools/verify-namebase-integrity.js` (W004)_");
}
L.push("");
L.push("## Entries whose seeds say they are in the wrong continent file");
L.push("");
L.push(`${misplaced.size} entries hold seeds that belong overwhelmingly to another`);
L.push("continent's entries. Which FILE a language lives in is organisational and");
L.push("is not a claim about its toponymy, so this is not automatically an error -");
L.push("Siberian Tatar, Khakas and Mari are all genuinely transcontinental. But an");
L.push("Australian Aboriginal language carrying Nigerian cities is one thing, and");
L.push("nothing in the name says so.");
L.push("");
L.push("| Entry | In file | Seeds belong to | Confidence | Examples |");
L.push("|---|---|---|---:|---|");
for (const [e, info] of [...misplaced.entries()]
  .sort((a, b) => b[1].share - a[1].share)
  .slice(0, 80)) {
  L.push(`| ${e.name} (i=${e.i}) | ${e.__continent} | ${info.to} | ${Math.round(info.share * 100)}% | ${info.examples.slice(0, 3).join(", ")} |`);
}
if (misplaced.size > 80) {
  L.push("");
  L.push(`_Showing 80 of ${misplaced.size}._`);
}
L.push("");
L.push("## Map ISOs with no namebase");
L.push("");
L.push(`${totals.noNamebase} languages the mixer map offers have no namebase entry`);
L.push("under that name, so they currently resolve to an unrelated seed list. Real");
L.push("languages — Agaw, Baka, Bamukumbit, Dibiyaso, Guriaso. Each needs a namebase");
L.push("created from research. Nothing here is guessed at.");
L.push("");
L.push("| ISO | Language name | Currently resolves to index |");
L.push("|---|---|---:|");
for (const r of noNamebase.slice(0, 150)) {
  L.push(`| ${r.iso} | ${r.name} | ${r.index} |`);
}
if (noNamebase.length > 150) {
  L.push("");
  L.push(`_Showing 150 of ${noNamebase.length}._`);
}
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
