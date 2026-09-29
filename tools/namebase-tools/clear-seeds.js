"use strict";

/**
 * Clear the fabricated seed lists that W006 could not separate from a misfiling.
 *
 * Run:  node tools/namebase-tools/clear-seeds.js <indexes.json> [--check]
 *
 * WHY
 *
 * W006 reports entries whose seeds say they are in the wrong continent file,
 * which has two causes. Most were misfiled - right seeds, wrong file - and are
 * fixed by move-entries.js. A few have seeds that are for a continent the
 * language has nothing to do with, and those were already cleared in 4e45b318
 * and 09bb6fee.
 *
 * One was neither. i=202653 "Sri Lankan Portuguese Creole" is filed under
 * asia, which is correct, but its 55 seeds are Palermo, Lyon, Bilbao, Malaga -
 * European cities, not Sri Lankan ones. There is no file move that helps, so it
 * is a clear.
 *
 * This is a thin, auditable wrapper over the same parse-and-reserialise approach
 * as move-entries.js, so it cannot corrupt a file the way hand-splicing did.
 * The language is kept; only the invented seeds go, and the entry returns to
 * WAITING.
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");
const DIR = path.join(root, "public/modules");
const CONTS = ["africa", "asia", "europe", "northAmerica", "southAmerica", "oceania", "fantasy"];

const idsPath = process.argv[2];
const check = process.argv.includes("--check");
if (!idsPath) {
  console.error("usage: node tools/namebase-tools/clear-seeds.js <indexes.json> [--check]");
  process.exit(1);
}
const targets = new Set(JSON.parse(fs.readFileSync(idsPath, "utf8")).map(Number));

function load(cont) {
  const file = path.join(DIR, `namebases-${cont}.js`);
  if (!fs.existsSync(file)) return null;
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { timeout: 30000 });
  const arr = sandbox.window[`${cont}NameBases`];
  if (!Array.isArray(arr)) throw new Error(`${cont}: no array`);
  return arr.map(e => ({ ...e }));
}

const books = new Map();
for (const c of CONTS) {
  const a = load(c);
  if (a) books.set(c, a);
}

const done = new Set();
for (const [c, arr] of books) {
  for (const e of arr) {
    if (!targets.has(e.i) || done.has(e.i)) continue;
    const n = String(e.b || "").split(",").filter(Boolean).length;
    if (!n) { console.log(`  i=${e.i} "${e.name}" [${c}] already empty`); done.add(e.i); continue; }
    console.log(`  i=${e.i} "${e.name}" [${c}] cleared ${n} seeds: ${String(e.b).slice(0, 70)}...`);
    e.b = "";
    e.status = "WAITING";
    done.add(e.i);
  }
}
const missing = [...targets].filter(i => !done.has(i));
if (missing.length) {
  console.error(`\nnot found: ${missing.join(", ")}`);
  process.exit(1);
}

if (check) {
  console.log("\n--check: nothing written.");
  process.exit(0);
}

for (const [c, arr] of books) {
  fs.writeFileSync(path.join(DIR, `namebases-${c}.js`), `window.${c}NameBases = ${JSON.stringify(arr, null, 2)};\n`, "utf8");
}

console.log("\nre-parsing:");
let bad = 0;
for (const c of books.keys()) {
  try {
    const back = load(c);
    console.log(`  OK   ${c.padEnd(14)} ${back.length} entries`);
  } catch (e) { bad++; console.log(`  FAIL ${c.padEnd(14)} ${String(e.message).split("\n")[0]}`); }
}
console.log(`\n${done.size} cleared, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
