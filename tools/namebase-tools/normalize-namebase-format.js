"use strict";

/**
 * Normalize namebase file formatting to a single canonical style.
 *
 * Run:  node tools/namebase-tools/normalize-namebase-format.js --check
 *       node tools/namebase-tools/normalize-namebase-format.js --write
 *
 * WHY: the namebase files have been hand-edited for months by many agents, so
 * their indentation has drifted. In public/modules/namebases-africa.js alone
 * some entries are indented two spaces and others zero. That makes every real
 * diff unreviewable, because you cannot tell a data change from a whitespace
 * change - which is exactly how a 163-line padding injection slipped through
 * unnoticed in the "batch 5" commit.
 *
 * This tool re-serializes each file as `JSON.stringify(entries, null, 2)` and
 * asserts the parsed data is byte-for-byte equivalent in value before writing.
 * It cannot change data. If the assertion fails it aborts.
 *
 * Keep this in its own commit so that later data changes produce clean,
 * semantics-only diffs that a reviewer can actually read.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, NAMEBASE_DIR, loadNameBaseFile} = require("./namebase-lib");

const write = process.argv.includes("--write");
const check = process.argv.includes("--check") || !write;

/** Deep structural equality, order sensitive for arrays. */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (typeof a !== "object") return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

let changedFiles = 0;
let changed = [];

for (const continent of CONTINENTS) {
  const file = path.join(NAMEBASE_DIR, `namebases-${continent}.js`);
  const {file: loadedPath, raw, entries, garbage} = loadNameBaseFile(continent);

  // Preserve any non-object rows so normalization is provably data-neutral.
  const start = raw.indexOf("[", raw.indexOf("NameBases = ["));
  const parsed = JSON.parse(raw.slice(start, raw.lastIndexOf("]") + 1));
  const rebuilt = `window.${continent}NameBases = ${JSON.stringify(parsed, null, 2)};\n`;

  // Real assertion: the rewritten text must parse back to the same data.
  // Comparing `parsed` to itself would pass unconditionally and prove nothing.
  const reparsed = JSON.parse(rebuilt.slice(rebuilt.indexOf("["), rebuilt.lastIndexOf("]") + 1));
  if (!deepEqual(parsed, reparsed)) {
    console.error(`[FAIL] ${continent}: rewrite changed data. Aborting without writing.`);
    process.exit(1);
  }
  if (loadedPath !== file) {
    console.error(`[FAIL] ${continent}: path mismatch. Aborting.`);
    process.exit(1);
  }

  if (rebuilt === raw) continue;

  changedFiles++;
  changed.push({continent, entries: parsed.length, garbage: garbage.length});

  if (write) {
    fs.writeFileSync(file, rebuilt, "utf8");
  }
}

if (check && changedFiles) {
  console.log(`normalize-namebase-format: ${changedFiles} file(s) not canonical:`);
  for (const c of changed) {
    console.log(`  namebases-${c.continent}.js  (${c.entries} rows, ${c.garbage} malformed)`);
  }
  console.log("");
  console.log("Run with --write to canonicalize (data-neutral, whitespace only).");
  process.exit(1);
}

if (write) {
  console.log(`normalize-namebase-format: rewrote ${changedFiles} file(s) (data unchanged).`);
  for (const c of changed) console.log(`  namebases-${c.continent}.js`);
} else {
  console.log("normalize-namebase-format: all files already canonical.");
}
