const fs = require("node:fs");
const L = require("./namebase-lib");
const {loadNameBases} = require("./load-namebases");

const {nameBases: sparse} = loadNameBases();
const read = f => {
  const s = fs.readFileSync(f, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
};
const map = read("config/language-mixer-map.js");
const cat = read("config/language-mixes-all.js");
const catByIso = new Map();
for (const r of cat) if (r && r.iso) catByIso.set(r.iso, r);

// Sample rows across the index range to eyeball whether ISO -> base is sensible.
const step = Math.floor(map.length / 40);
console.log("SAMPLED MIXER MAP ROWS");
console.log("=" .padEnd(60, "="));
for (let i = 0; i < map.length; i += step) {
  const row = map[i];
  const c = catByIso.get(row.iso);
  const nb = sparse[row.bases[0]];
  const catName = c ? c.name : "(not in catalog)";
  const got = nb ? nb.name : "(UNRESOLVED)";
  const seeds = nb && nb.b ? nb.b.split(",").filter(Boolean).length : 0;
  const match = c && nb && c.name.toLowerCase().trim() === String(nb.name).toLowerCase().trim();
  console.log(
    `  ${match ? "ok " : "?? "} ${row.iso.padEnd(22)} catalog="${catName}"  ->  "${got}" (${seeds} seeds)`
  );
}
