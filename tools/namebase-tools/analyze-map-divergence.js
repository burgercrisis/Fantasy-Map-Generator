const fs = require("node:fs");
const L = require("./namebase-lib");

function readArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const mapJson = JSON.parse(fs.readFileSync("config/language-mixer-map.json", "utf8"));
const mapJs = readArray("config/language-mixer-map.js");
const mixesJson = JSON.parse(fs.readFileSync("config/language-mixes.json", "utf8"));
const mixesAll = readArray("config/language-mixes-all.js");

console.log("row counts:");
console.log("  map.json     ", mapJson.length);
console.log("  map.js       ", mapJs.length);
console.log("  mixes.json   ", mixesJson.length);
console.log("  mixes-all.js ", mixesAll.length);

// Do the mixes pair agree? If mixes.json == mixes-all.js, the convention is
// "json is source, js is generated" and the map .js is a stale generation.
const mixKey = r => `${r.iso}|${r.name}|${r.region}|${r.category}|${r.family}`;
const mj = new Set(mixesJson.map(mixKey));
const ma = new Set(mixesAll.map(mixKey));
let mixOnlyJ = 0, mixOnlyA = 0;
mj.forEach(k => { if (!ma.has(k)) mixOnlyJ++; });
ma.forEach(k => { if (!mj.has(k)) mixOnlyA++; });
console.log("\nmixes.json vs mixes-all.js:");
console.log("  only in json:", mixOnlyJ, " only in js:", mixOnlyA,
  " => in sync:", mixOnlyJ === 0 && mixOnlyA === 0);

// Which map file references indices that actually exist?
const all = L.loadAll().flatMap(f => f.entries);
const valid = new Set(all.map(e => e.i).filter(v => v !== undefined));
function dangling(map) {
  const bad = new Set();
  for (const r of map) for (const b of r.bases) if (!valid.has(b)) bad.add(b);
  return bad;
}
const dj = dangling(mapJson), ds = dangling(mapJs);
console.log("\nindices referenced but not present in any namebase file:");
console.log("  map.json:", dj.size);
console.log("  map.js  :", ds.size);

// Which map is consistent with mixes (same iso set)?
const mixIsos = new Set(mixesJson.map(r => r.iso));
const mapJsonIsos = new Set(mapJson.map(r => r.iso));
const mapJsIsos = new Set(mapJs.map(r => r.iso));
let onlyMapJ = 0, onlyMapJs = 0;
mapJsonIsos.forEach(i => { if (!mixIsos.has(i)) onlyMapJ++; });
mapJsIsos.forEach(i => { if (!mixIsos.has(i)) onlyMapJs++; });
console.log("\nisos in map but not in the language catalog:");
console.log("  map.json:", onlyMapJ, "  map.js:", onlyMapJs);

// bases length distribution
const dist = m => {
  const d = {};
  for (const r of m) d[r.bases.length] = (d[r.bases.length] || 0) + 1;
  return d;
};
console.log("\nbases-per-row distribution:");
console.log("  map.json:", JSON.stringify(dist(mapJson)));
console.log("  map.js  :", JSON.stringify(dist(mapJs)));
