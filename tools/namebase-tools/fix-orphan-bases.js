"use strict";

/**
 * Repoint the orphan map rows whose base is wrong, and report the rest.
 *
 * Run:  node tools/namebase-tools/fix-orphan-bases.js --check
 *       node tools/namebase-tools/fix-orphan-bases.js --write
 *
 * 717 map rows name an ISO that is absent from config/language-mixes-all.js, so
 * nothing can ever select them and 690 of their curated bases are unreachable.
 * They fall into three groups, measured:
 *
 *   12   the ISO name IS the base it points at - a pure catalog omission
 *    6   the ISO matches a different namebase, so the row points at the wrong
 *        one. Fixed here: Sakhalin dialects was pointed at Tibetan, Korean
 *        dialect rows at unrelated languages, Su' at Sundanese.
 *  699   the ISO matches no namebase by name at all. These are mostly Korean
 *        dialect keys whose namebase is called "Chungcheong Korean" rather
 *        than "chungcheong-dialect", plus ISO keys that are full names rather
 *        than codes. They are NOT junk, but reconciling them needs the
 *        `family` field, which exists nowhere in the data and drives the
 *        european/oriental/antique preset filters. Inventing it would silently
 *        mis-sort them, so they are reported rather than guessed at.
 *
 * The 12 and the 699 are catalog omissions, not map errors, so they are left
 * alone here and counted in STATUS.md where the decision is visible.
 */

const fs = require("node:fs");
const path = require("node:path");
const {root} = require("./namebase-lib");
const L = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracket(f) {
  const s = fs.readFileSync(f, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const entries = L.loadAll().flatMap(f => f.entries);
const byI = new Map(entries.map(e => [e.i, e]));
const byName = new Map();
for (const e of entries) {
  const k = norm(e.name);
  if (k && !byName.has(k)) byName.set(k, e);
}

const mapJson = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.json"));
const mapJs = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
const catIsos = new Set(readBracket(path.join(CONFIG_DIRS[0], "language-mixes-all.js")).map(r => r.iso));

const repoint = [];
const catalogOmission = [];
const unresolvable = [];
for (const r of mapJs) {
  if (catIsos.has(r.iso)) continue;
  const want = norm(r.iso);
  const nb = r.bases && r.bases[0] !== undefined ? byI.get(r.bases[0]) : null;
  if (nb && norm(nb.name) === want) { catalogOmission.push(r); continue; }
  const target = byName.get(want);
  if (target) {
    repoint.push({iso: r.iso, from: nb ? `${nb.name}@${r.bases[0]}` : "(nothing)", to: target.i, toName: target.name});
  } else {
    unresolvable.push({iso: r.iso, pointsAt: nb ? nb.name : "(nothing)"});
  }
}

console.log("");
console.log("fix-orphan-bases " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  orphan rows total          : ${mapJs.filter(r => !catIsos.has(r.iso)).length}`);
console.log(`  base is wrong, fixable     : ${repoint.length}`);
console.log(`  correct base, ISO just not in the catalog : ${catalogOmission.length}`);
console.log(`  ISO does not match any namebase, needs catalog reconciliation : ${unresolvable.length}`);
console.log("");
for (const r of repoint) {
  console.log(`  ${r.iso.padEnd(28)} ${r.from.padEnd(24)} -> ${r.toName} (i=${r.to})`);
}
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

const to = new Map(repoint.map(r => [r.iso, r.to]));
const apply = rows => {
  let n = 0;
  for (const row of rows) {
    const t = to.get(row.iso);
    if (t !== undefined && row.bases[0] !== t) { row.bases = [t]; n++; }
  }
  return n;
};
let changed = apply(mapJson);
changed += apply(mapJs);

fs.writeFileSync(path.join(CONFIG_DIRS[0], "language-mixer-map.json"), JSON.stringify(mapJson, null, 2) + "\n", "utf8");
for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), `globalThis.languageMixerMap = ${JSON.stringify(mapJs, null, 2)};\n`, "utf8");
}
console.log(`  rows repointed: ${changed}`);
