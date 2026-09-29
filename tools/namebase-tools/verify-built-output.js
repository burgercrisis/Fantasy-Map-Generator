"use strict";

/**
 * End-to-end check against the BUILT output in dist/, not the source tree.
 *
 *   node tools/namebase-tools/verify-built-output.js
 *
 * The source tree being correct does not mean the shipped bundle is. Vite
 * copies public/ verbatim, so a data file can be fine on disk and still be
 * wrong, stale or missing in dist/. That gap is exactly where the aggregator
 * syntax error lived for three weeks: fine in git, broken in the bundle that
 * people actually run.
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");
const dist = path.join(root, "dist");

if (!fs.existsSync(dist)) {
  console.error("dist/ not found. Run `pnpm build` first.");
  process.exit(1);
}

const CONTINENTS = ["africa", "asia", "europe", "northAmerica", "southAmerica", "oceania", "fantasy"];

const files = [
  ...CONTINENTS.map(c => path.join(dist, "modules", `namebases-${c}.js`)),
  path.join(dist, "config", "language-mixer-map.js"),
  path.join(dist, "config", "language-mixes-all.js"),
  path.join(dist, "modules", "namebases-all.js")
];

const missing = files.filter(f => !fs.existsSync(f));
if (missing.length) {
  console.error("MISSING from dist/:");
  missing.forEach(f => console.error("  " + path.relative(dist, f)));
  process.exit(1);
}

const sandbox = {
  console: {log() {}, warn() {}, error() {}, info() {}},
  Math, Map, Set, Array, Object, JSON, String, Number, Boolean, RegExp, Error
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const f of files) {
  try {
    vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, {filename: f});
  } catch (e) {
    console.error(`FAILED to load ${path.relative(dist, f)}`);
    console.error(`  ${e.name}: ${e.message}`);
    process.exit(1);
  }
}

const w = sandbox.window;
const problems = [];

if (!Array.isArray(w.nameBases) || !w.nameBases.length) {
  problems.push("window.nameBases is empty - the aggregator did not run");
}
if (!Array.isArray(w.languageMixerMap) || !w.languageMixerMap.length) {
  problems.push("window.languageMixerMap is empty");
}
if (!Array.isArray(w.languageMixerCatalog) || !w.languageMixerCatalog.length) {
  problems.push("window.languageMixerCatalog is empty");
}

const ids = w.defaultNameBaseIds || [];
const populated = w.nameBases ? w.nameBases.filter(Boolean).length : 0;
console.log(`dist/ loads cleanly: ${files.length} files`);
console.log(`  nameBases              : ${w.nameBases ? w.nameBases.length : 0} (sparse)`);
console.log(`  populated entries      : ${populated}`);
console.log(`  defaultNameBaseIds     : ${ids.length}`);
console.log(`  languageMixerMap rows  : ${Array.isArray(w.languageMixerMap) ? w.languageMixerMap.length : 0}`);
console.log(`  catalog rows           : ${Array.isArray(w.languageMixerCatalog) ? w.languageMixerCatalog.length : 0}`);

// A map row is only useful if it resolves, but the two failure modes are not
// the same and must not be conflated:
//
//   - the index exists in a continent file but not in the merged array. That is
//     a real regression: the aggregator dropped an entry the map depends on.
//   - the index exists nowhere. That is a language the catalog offers for which
//     no namebase has been written yet - a research backlog, not a defect.
//     Reporting it as a failure would mean this check can never be green.
let regression = 0;
let backlog = 0;
const badSamples = [];
const backlogSamples = [];
const sourceIndices = new Set();
for (const f of CONTINENTS) {
  const raw = fs.readFileSync(path.join(dist, "modules", `namebases-${f}.js`), "utf8");
  const arr = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
  for (const e of arr) if (e && typeof e.i === "number") sourceIndices.add(e.i);
}

for (const row of w.languageMixerMap || []) {
  for (const b of row.bases || []) {
    if (w.nameBases[b]) continue;
    if (sourceIndices.has(b)) {
      regression++;
      if (badSamples.length < 6) badSamples.push(`  ${row.iso} -> index ${b} (dropped by the aggregator)`);
    } else {
      backlog++;
      if (backlogSamples.length < 6) backlogSamples.push(`  ${row.iso} -> index ${b}`);
    }
  }
}
console.log(`  map rows -> dropped by aggregator (REGRESSION) : ${regression}`);
console.log(`  map rows -> no namebase exists (backlog)        : ${backlog}`);
badSamples.forEach(s => console.log(s));
backlogSamples.forEach(s => console.log(s));

if (regression) {
  problems.push(`${regression} mixer map rows point at an entry the aggregator dropped`);
}

if (problems.length) {
  console.error("\nFAIL:");
  problems.forEach(p => console.error("  " + p));
  process.exit(1);
}
console.log("\nOK: the built bundle loads and the mixer map resolves.");
