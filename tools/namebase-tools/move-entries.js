"use strict";

/**
 * Move a namebase entry from one continent file to another.
 *
 * Run:  node tools/namebase-tools/move-entries.js <mapping.json> [--check]
 *
 * The mapping is { "<i>": "<targetContinent>", ... }, e.g.
 *
 *   { "869": "asia", "202798": "europe" }
 *
 * WHY THIS EXISTS
 *
 * W006 reports entries whose seeds say they are in the wrong continent file.
 * Amdo Tibetan sat in namebases-europe.js holding Haibei, Huangnan and Golog,
 * which are Tibetan areas of Qinghai. Kaitag sat in africa holding Zugdidi, Quba
 * and Xinaliq, which are Dagestan. The names are right and only the file is
 * wrong.
 *
 * These were previously moved by hand-splicing text, which corrupted five of
 * the namebase files across two attempts: the entries are stored as blocks, and
 * moving one means lifting it out of one array and appending it to another, and
 * a single separator mistake silently breaks the file.
 *
 * normalize-namebase-format.js is what makes this safe. It puts every continent
 * file into one canonical shape - LF endings, JSON.stringify(entries, null, 2),
 * no per-entry indentation drift - so a rewrite is a whole-file regeneration
 * rather than a splice, and the data round-trips exactly. This tool parses,
 * moves, re-serialises, and then re-parses to prove the result is loadable and
 * that no entry changed except for its file.
 *
 * Entry indices are untouched, so the mixer map needs no change.
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");
const DIR = path.join(root, "public/modules");
const CONTS = ["africa", "asia", "europe", "northAmerica", "southAmerica", "oceania", "fantasy"];

const mappingPath = process.argv[2];
const check = process.argv.includes("--check");
if (!mappingPath) {
  console.error("usage: node tools/namebase-tools/move-entries.js <mapping.json> [--check]");
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));

/** Load a continent file into an array, remembering nothing about its bytes. */
function load(cont) {
  const file = path.join(DIR, `namebases-${cont}.js`);
  if (!fs.existsSync(file)) return null;
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { timeout: 30000 });
  const arr = sandbox.window[`${cont}NameBases`];
  if (!Array.isArray(arr)) throw new Error(`${cont}: no array on window.${cont}NameBases`);
  return arr.map(e => ({ ...e }));
}

/** The canonical serialisation, matching normalize-namebase-format.js. */
function serialize(cont, entries) {
  return `window.${cont}NameBases = ${JSON.stringify(entries, null, 2)};\n`;
}

const books = new Map();
for (const c of CONTS) {
  const arr = load(c);
  if (arr) books.set(c, arr);
}
const totalBefore = [...books.values()].reduce((s, a) => s + a.length, 0);
console.log(`loaded: ${[...books.entries()].map(([c, a]) => `${c}=${a.length}`).join(" ")}`);

// locate and move
const plan = [];
let alreadyDone = 0;
for (const [id, dest] of Object.entries(mapping)) {
  const from = [...books.keys()].find(c => books.get(c).some(e => e.i === Number(id)));
  if (!from) { console.error(`  i=${id}: not found in any continent file`); process.exit(1); }
  if (!books.has(dest)) { console.error(`  i=${id}: unknown target continent "${dest}"`); process.exit(1); }
  // The mapping states where each entry belongs, not what to do, so re-running
  // it is a no-op rather than an error. Without this the file could not be
  // replayed after a partial run.
  if (from === dest) { alreadyDone++; continue; }
  plan.push({ id: Number(id), from, to: dest });
}
if (alreadyDone) console.log(`  ${alreadyDone} already in the target file, skipping`);
if (!plan.length) {
  console.log("\nnothing to move.");
  process.exit(0);
}

for (const { id, from, to } of plan) {
  const arr = books.get(from);
  const at = arr.findIndex(e => e.i === id);
  const [entry] = arr.splice(at, 1);
  books.get(to).push(entry);
  console.log(`  i=${id} "${entry.name}"  ${from} -> ${to}`);
}

const totalAfter = [...books.values()].reduce((s, a) => s + a.length, 0);
if (totalAfter !== totalBefore) {
  console.error(`\nentry count changed: ${totalBefore} -> ${totalAfter}. Aborting.`);
  process.exit(1);
}

// a moved entry may now sit out of index order; that is fine, but say so
for (const [c, arr] of books) {
  let unsorted = 0;
  for (let k = 1; k < arr.length; k++) if (arr[k].i < arr[k - 1].i) unsorted++;
  if (unsorted) console.log(`  note: ${c} now has ${unsorted} index-order break(s) from the moves`);
}

if (check) {
  console.log("\n--check: nothing written. Run without --check to apply.");
  process.exit(0);
}

// write, then prove every file still loads and no data changed
const snapshot = new Map();
for (const [c, arr] of books) snapshot.set(c, JSON.stringify(arr));

for (const [c, arr] of books) {
  fs.writeFileSync(path.join(DIR, `namebases-${c}.js`), serialize(c, arr), "utf8");
}

console.log("\nre-parsing:");
let bad = 0;
for (const c of books.keys()) {
  try {
    const back = load(c);
    const identical = JSON.stringify(back) === snapshot.get(c);
    if (!identical) bad++;
    console.log(`  ${identical ? "OK  " : "DATA"} ${c.padEnd(14)} ${back.length} entries${identical ? "" : "  *** DATA CHANGED ***"}`);
  } catch (e) {
    bad++;
    console.log(`  FAIL ${c.padEnd(14)} ${String(e.message).split("\n")[0]}`);
  }
}
console.log(`\n${plan.length} moved, ${totalAfter} entries total, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
