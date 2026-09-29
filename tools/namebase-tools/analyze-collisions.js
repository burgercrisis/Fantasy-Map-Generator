const fs = require("node:fs");
const L = require("./namebase-lib");

const all = L.loadAll().flatMap(f => f.entries);

// --- collision landscape -------------------------------------------------
const byIndex = new Map();
for (const e of all) {
  if (e.i === undefined) continue;
  if (!byIndex.has(e.i)) byIndex.set(e.i, []);
  byIndex.get(e.i).push(e);
}
const collided = [...byIndex.entries()].filter(([, v]) => v.length > 1);
console.log("distinct colliding indices:", collided.length);
console.log("  total entries involved  :", collided.reduce((a, [, v]) => a + v.length, 0));
console.log("  entries to remap (all but 1 per index):", collided.reduce((a, [, v]) => a + v.length - 1, 0));

const sizeDist = {};
for (const [, v] of collided) sizeDist[v.length] = (sizeDist[v.length] || 0) + 1;
console.log("  group sizes:", sizeDist);

// --- who is referenced by which map -------------------------------------
const jsonMap = JSON.parse(fs.readFileSync("config/language-mixer-map.json", "utf8"));
const jsRaw = fs.readFileSync("config/language-mixer-map.js", "utf8");
const jsMap = JSON.parse(jsRaw.slice(jsRaw.indexOf("["), jsRaw.lastIndexOf("]") + 1));

const refJson = new Map();
for (const r of jsonMap) for (const b of r.bases) {
  if (!refJson.has(b)) refJson.set(b, []);
  refJson.get(b).push(r.iso);
}
const refJs = new Map();
for (const r of jsMap) for (const b of r.bases) {
  if (!refJs.has(b)) refJs.set(b, []);
  refJs.get(b).push(r.iso);
}

let refNone = 0, refOne = 0, refBoth = 0;
let refNoneJs = 0, refOneJs = 0, refBothJs = 0;
for (const [i, v] of collided) {
  const inJ = (refJson.get(i) || []).length > 0;
  const inJs = (refJs.get(i) || []).length > 0;
  if (inJ && inJs) refBoth++;
  else if (inJ || inJs) refOne++;
  else refNone++;
  if (inJs && inJ) refBothJs++;
  else if (inJs) refOneJs++;
  else refNoneJs++;
}
console.log("\nreferenced by map:");
console.log("  json: both-in-file/one/none ->", refBoth, refOne, refNone);
console.log("  js  : both-in-file/one/none ->", refBothJs, refOneJs, refNoneJs);

// --- cross-file vs intra-file ------------------------------------------
let intra = 0, cross = 0, mixed = 0;
for (const [, v] of collided) {
  const conts = new Set(v.map(e => e.__continent));
  if (conts.size === 1) intra++;
  else if (v.every(e => (refJson.get(e.i) || []).length > 0)) mixed++;
  else cross++;
}
console.log("\nintra-file collisions:", intra);
console.log("cross-file collisions:", cross);

// --- what does a fresh index need to avoid? -----------------------------
const used = new Set(all.map(e => e.i).filter(v => v !== undefined));
let max = Math.max(...used);
console.log("\nmax index in use:", max, " used indices:", used.size);
// next free id block used by the project
let probe = max + 1;
while (used.has(probe)) probe++;
console.log("first free index above max:", probe);

// --- example collisions -------------------------------------------------
console.log("\nexamples:");
for (const [i, v] of collided.slice(0, 8)) {
  console.log(
    `  i=${i}  ` +
      v.map(e => `${e.__continent}:${e.name}(${L.seedCount(e)} seeds)`).join("  |  ") +
      `   mapRefs=${(refJson.get(i) || []).length}json/${(refJs.get(i) || []).length}js`
  );
}
