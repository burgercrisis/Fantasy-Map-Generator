"use strict";

/**
 * Mechanical namebase repair.
 *
 * Run:  node tools/namebase-tools/clean-namebase-data.js --check
 *       node tools/namebase-tools/clean-namebase-data.js --write
 *
 * SCOPE RULE: this tool only makes changes that are mechanically certain. It
 * never decides whether a place name is authentic, because that is a research
 * question and a tool that guesses will eventually delete something real.
 *
 * It removes exactly five things:
 *
 *   1. Array rows that are not namebase objects. 53 bare index numbers
 *      (202879..203029) were spliced into namebases-europe.js; they are
 *      orphaned references, not entries.
 *
 *   2. Exact duplicate rows - the same language name at the same index in
 *      two files, 107 of them. The mixer resolves bases by index, so it was
 *      already reading one of the two; dropping the other changes no output.
 *      The copy with more seeds is kept.
 *
 *   3. Synthetic padding appended to reach the 25-seed floor:
 *        - language name + one letter   (5,567 seeds / 524 entries)
 *        - bare stem + English suffix   (126 seeds / 15 entries)
 *      This is the reason the floor is now a ratcheted metric rather than a
 *      target. It was the cheapest way to move the only number being tracked.
 *
 *   4. Seeds beginning with a digit. 785 of them. These are dates, counts and
 *      footnotes that leaked in from research notes pasted into seed fields
 *      ("1847", "48 Sub-sections", "1900"). No toponym starts with a digit.
 *
 *   5. Seeds repeated inside one entry (4,098 occurrences), keeping first.
 *
 * It then recomputes every `status` field honestly: COMPLETE only when the
 * entry actually has SEED_FLOOR seeds, otherwise WAITING. 997 entries were
 * claiming COMPLETE while sitting below the floor.
 *
 * It does NOT touch the 214 genuine index conflicts (two different languages
 * sharing one index). Those need an index migration that also rewrites
 * config/language-mixer-map.json, which is a separate, reviewed change.
 */

const fs = require("node:fs");
const path = require("node:path");
const {
  CONTINENTS,
  NAMEBASE_DIR,
  SEED_FLOOR,
  loadNameBaseFile,
  seedsOf,
  detectStemPadding,
  detectTemplatePadding,
  detectNonPlaceTokens,
  findDuplicateSeeds,
  labelOf
} = require("./namebase-lib");

const write = process.argv.includes("--write");
const verbose = process.argv.includes("--verbose");

const totals = {
  garbageRows: 0,
  duplicateRows: 0,
  stemPadding: 0,
  templatePadding: 0,
  numericSeeds: 0,
  duplicateSeeds: 0,
  statusFixed: 0
};

const perFile = [];
const samples = [];
const skippedFiles = [];

for (const continent of CONTINENTS) {
  const file = path.join(NAMEBASE_DIR, `namebases-${continent}.js`);
  const short = `namebases-${continent}.js`;

  // Skip a file that will not parse rather than aborting the whole run. An
  // agent part-way through an edit can leave one continent malformed, and the
  // other six still need cleaning.
  let loaded;
  try {
    loaded = loadNameBaseFile(continent);
  } catch (e) {
    console.log(`  ${continent.padEnd(14)} SKIPPED - does not parse: ${e.message}`);
    skippedFiles.push(continent);
    continue;
  }
  const {raw, entries, garbage} = loaded;

  // Start from the raw array so we can rebuild the exact original row order,
  // dropping only the rows we have decided to drop.
  const start = raw.indexOf("[", raw.indexOf("NameBases = ["));
  const rows = JSON.parse(raw.slice(start, raw.lastIndexOf("]") + 1));

  // --- 1. identify duplicate rows (same name + same index) ----------------
  const signature = e => `${e.name}::${e.i}`;
  const bestBySignature = new Map();
  for (const e of entries) {
    const sig = signature(e);
    const prev = bestBySignature.get(sig);
    if (!prev || seedsOf(e).length > seedsOf(prev).length) bestBySignature.set(sig, e);
  }
  const dropRows = new Set();
  for (let pos = 0; pos < rows.length; pos++) {
    const row = rows[pos];
    if (!row || typeof row !== "object" || row.name === undefined) {
      totals.garbageRows++;
      dropRows.add(pos);
      continue;
    }
    if (bestBySignature.get(signature(row)).__pos !== pos) {
      totals.duplicateRows++;
      dropRows.add(pos);
      if (verbose) samples.push(`${short}: dropped duplicate row ${JSON.stringify(row.name)} (i=${row.i})`);
    }
  }

  // --- 2. clean seeds and status on the rows we keep -----------------------
  const kept = [];
  for (let pos = 0; pos < rows.length; pos++) {
    if (dropRows.has(pos)) continue;
    const entry = rows[pos];
    if (!entry || typeof entry !== "object" || entry.name === undefined) continue;

    const remove = new Set();
    for (const s of detectStemPadding(entry)) remove.add(s);
    for (const s of detectTemplatePadding(entry)) remove.add(s);
    for (const s of detectNonPlaceTokens(entry)) remove.add(s);
    for (const s of findDuplicateSeeds(entry)) remove.add(s);

    const before = seedsOf(entry);
    if (remove.size) {
      if (detectStemPadding(entry).length) totals.stemPadding += detectStemPadding(entry).length;
      if (detectTemplatePadding(entry).length) totals.templatePadding += detectTemplatePadding(entry).length;
      if (detectNonPlaceTokens(entry).length) totals.numericSeeds += detectNonPlaceTokens(entry).length;
      const dupes = findDuplicateSeeds(entry).length;
      if (dupes) totals.duplicateSeeds += dupes;

      const seen = new Set();
      const after = [];
      for (const s of before) {
        if (remove.has(s) || seen.has(s)) continue;
        seen.add(s);
        after.push(s);
      }
      entry.b = after.join(",");
      if (verbose && after.length !== before.length) {
        samples.push(`${short}: ${labelOf(entry)} ${before.length} -> ${after.length} seeds`);
      }
    }

    // --- 3. honest status --------------------------------------------------
    const n = seedsOf(entry).length;
    const wanted = n >= SEED_FLOOR ? "COMPLETE" : "WAITING";
    if (entry.status !== wanted) {
      totals.statusFixed++;
      entry.status = wanted;
    }

    kept.push(entry);
  }

  const rebuilt = `window.${continent}NameBases = ${JSON.stringify(kept, null, 2)};\n`;
  perFile.push({continent, before: rows.length, after: kept.length, changed: rebuilt !== raw});
  if (write && rebuilt !== raw) fs.writeFileSync(file, rebuilt, "utf8");
}

const totalRemoved =
  totals.garbageRows +
  totals.duplicateRows +
  totals.stemPadding +
  totals.templatePadding +
  totals.numericSeeds +
  totals.duplicateSeeds;

console.log("");
console.log("clean-namebase-data " + (write ? "(applied)" : "(dry run)"));
console.log("=====================================");
for (const f of perFile) {
  const mark = f.changed ? " *" : "";
  console.log(`  ${f.continent.padEnd(14)} ${String(f.before).padStart(5)} -> ${String(f.after).padStart(5)} rows${mark}`);
}
console.log("");
console.log(`  garbage array rows removed    : ${totals.garbageRows}`);
console.log(`  exact duplicate rows removed  : ${totals.duplicateRows}`);
console.log(`  language-name+letter padding  : ${totals.stemPadding}`);
console.log(`  english-suffix template seeds : ${totals.templatePadding}`);
console.log(`  non-place (digit) seeds       : ${totals.numericSeeds}`);
console.log(`  repeated seeds within entry   : ${totals.duplicateSeeds}`);
console.log(`  status fields corrected       : ${totals.statusFixed}`);
console.log(`  total items removed           : ${totalRemoved}`);
console.log("");

if (verbose) {
  for (const s of samples.slice(0, 60)) console.log("  " + s);
  if (samples.length > 60) console.log(`  ... and ${samples.length - 60} more`);
  console.log("");
}

if (!write) {
  const changed = perFile.filter(f => f.changed).length;
  console.log(`Dry run. ${changed} file(s) would change. Re-run with --write to apply.`);
}

if (skippedFiles.length) {
  console.log("");
  console.log(`NOT CLEANED (do not parse): ${skippedFiles.join(", ")}`);
  console.log("These are left untouched. Fix the syntax error, then re-run.");
}
