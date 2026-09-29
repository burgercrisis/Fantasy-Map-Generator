"use strict";

/**
 * Runs the namebase aggregator in a sandboxed VM, the way a browser would, and
 * reports what it produced. This is the only way to find out whether
 * public/modules/namebases-all.js actually works - `node --check` only proves
 * it parses, not that it runs.
 *
 * Usage: node tools/namebase-tools/verify-aggregator-runs.js
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {CONTINENTS, NAMEBASE_DIR} = require("./namebase-lib");

const root = path.resolve(__dirname, "..", "..");
const agg = path.join(NAMEBASE_DIR, "namebases-all.js");

if (!fs.existsSync(agg)) {
  console.error(`aggregator not found: ${agg}`);
  process.exit(1);
}

const sandbox = {
  console: {log() {}, warn() {}, error() {}, info() {}},
  Math,
  Map,
  Set,
  Array,
  Object,
  JSON,
  String,
  Number,
  Boolean,
  RegExp,
  Error
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const files = [
  ...CONTINENTS.map(c => path.join(NAMEBASE_DIR, `namebases-${c}.js`)),
  path.join(root, "public", "config", "language-mixer-map.js"),
  agg
];

let loaded = 0;
for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error(`MISSING: ${path.relative(root, f)}`);
    process.exit(1);
  }
  const src = fs.readFileSync(f, "utf8");
  try {
    vm.runInContext(src, sandbox, {filename: f});
    loaded++;
  } catch (e) {
    console.error(`\nFAILED loading ${path.relative(root, f)}`);
    console.error(`  ${e.name}: ${e.message}`);
    process.exit(1);
  }
}

const bases = sandbox.window.nameBases;
const defaults = sandbox.window.defaultNameBases;
const ids = sandbox.window.defaultNameBaseIds;

console.log(`loaded ${loaded} files without error`);
console.log(`  window.nameBases            : ${Array.isArray(bases) ? bases.length : typeof bases}`);
console.log(`  window.defaultNameBases     : ${Array.isArray(defaults) ? defaults.length : typeof defaults}`);
console.log(`  window.defaultNameBaseIds   : ${Array.isArray(ids) ? ids.length : typeof ids}`);

if (!Array.isArray(bases)) {
  console.error("\nFAIL: window.nameBases was not created.");
  process.exit(1);
}

const populated = ids ? ids.length : bases.filter(Boolean).length;
const maxI = Math.max(...bases.filter(Boolean).map(b => b.i));
console.log(`  populated entries           : ${populated}`);
console.log(`  max declared index          : ${maxI}`);

if (!populated) {
  console.error("\nFAIL: aggregator produced zero namebase entries.");
  process.exit(1);
}

// Every declared index must be reachable at its own array position, or the
// mixer map (which addresses bases by index) will read the wrong language.
let mismatched = 0;
const examples = [];
for (const pos of ids || []) {
  const b = bases[pos];
  if (!b) continue;
  if (typeof b.i === "number" && b.i !== pos) {
    mismatched++;
    if (examples.length < 6) examples.push(`  position ${pos} holds i=${b.i} (${b.name})`);
  }
}
console.log(`  position/index mismatches   : ${mismatched}`);
if (examples.length) {
  console.log("  examples:");
  examples.forEach(e => console.log(e));
}

console.log(mismatched ? "\nFAIL: index addressing is inconsistent." : "\nOK: aggregator runs and indices line up.");
process.exit(mismatched ? 1 : 0);
