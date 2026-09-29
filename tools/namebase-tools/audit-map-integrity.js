const fs = require("node:fs");
const L = require("./namebase-lib");

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const all = L.loadAll().flatMap(f => f.entries);
const byIndex = new Map();
for (const e of all) {
  if (!byIndex.has(e.i)) byIndex.set(e.i, []);
  byIndex.get(e.i).push(e);
}

for (const src of ["config/language-mixer-map.js", "config/language-mixer-map.json"]) {
  const map = readBracketArray(src);
  const catalog = readBracketArray("config/language-mixes-all.js");
  const isoName = new Map();
  for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

  const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

  let match = 0, mismatch = 0, noIndex = 0, noName = 0, ambiguous = 0;
  const badSamples = [];
  const noMatchIdx = new Map();

  for (const row of map) {
    const want = norm(isoName.get(row.iso));
    if (!want) { noName++; continue; }
    const b = row.bases[0];
    const claimants = byIndex.get(b) || [];
    if (!claimants.length) { noIndex++; continue; }
    const hits = claimants.filter(c => {
      const have = norm(c.name);
      return have && (have === want || have.startsWith(want) || want.startsWith(have));
    });
    if (hits.length === 1) { match++; continue; }
    if (hits.length > 1) { ambiguous++; continue; }
    mismatch++;
    // is the wanted language present SOMEWHERE else?
    const elsewhere = all.find(c => norm(c.name) === want);
    if (elsewhere) noMatchIdx.set(elsewhere.i, (noMatchIdx.get(elsewhere.i) || 0) + 1);
    if (badSamples.length < 12) {
      badSamples.push(`  ${row.iso.padEnd(12)} want "${isoName.get(row.iso)}"  but index ${b} holds: ${claimants.map(c => c.__continent + ":" + c.name).join(" | ")}`);
    }
  }

  console.log(`\n=== ${src} (${map.length} rows) ===`);
  console.log(`  ISO name matches the base it points at : ${match}`);
  console.log(`  MISMATCH                               : ${mismatch}`);
  console.log(`  base name ambiguous (dup name+index)   : ${ambiguous}`);
  console.log(`  ISO not in catalog                     : ${noName}`);
  console.log(`  index does not exist                   : ${noIndex}`);
  console.log(`  ...of the mismatches, wanted language exists elsewhere at a known index: ${noMatchIdx.size} distinct indices`);
  console.log("  samples:");
  badSamples.forEach(s => console.log(s));
}
