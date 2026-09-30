"use strict";
/**
 * COMPLETE REBUILD of namebases-research.js from all sources:
 * 1. Load all entries from continent files
 * 2. Load all entries from research files (research-*.json)
 * 3. Load all map entries to find their target base indices
 * 4. For each map base that has no data, try to populate from research by name
 * 5. For map bases with no entry at all, create a new entry (with research data if available)
 * 6. Write the complete research file
 */
const fs = require("fs");
const path = require("path");

// The live tree is public/modules. The repo-root modules/ directory is a stale
// copy that nothing in the app loads - src/index.html loads only the seven
// continent files under public/modules - so reading from it is what made the
// generated research file accumulate copies of entries that were later deleted
// or rebuilt. This previously read from `../modules`, which is why research.js
// still held a 66-seed Han-script Eastern Yugur long after that entry had been
// rebuilt, plus Cyrillic letters the live files no longer had.
const publicDir = path.resolve(__dirname, "..", "public", "modules");
const mapPath = path.resolve(__dirname, "..", "public", "config", "language-mixer-map.js");
const catalogPath = path.resolve(__dirname, "..", "config", "language-mixes.json");
const researchDir = path.resolve(__dirname, "work-data");

// Load map
const mapContent = fs.readFileSync(mapPath, "utf8");
const mapMatch = mapContent.match(/languageMixerMap\s*=\s*(\[[\s\S]*?\]);/);
const map = JSON.parse(mapMatch[1]);

// Load catalog
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const catByISO = {};
const isoByName = new Map();
for (const c of catalog) {
  catByISO[c.iso] = c;
  if (!isoByName.has(c.name.toLowerCase().trim())) {
    isoByName.set(c.name.toLowerCase().trim(), []);
  }
  isoByName.get(c.name.toLowerCase().trim()).push(c.iso);
}

// Load all research data by name
const nameToResearch = new Map();
const researchFiles = [
  "research-germanic.json", "research-africa.json", "research-asia.json",
  "research-europe.json", "research-pacific-americas.json",
  "research-romance-variants.json", "research-slavic-variants.json",
  "research-old-english.json", "research-caucasus.json",
  "research-mixed-3.json", "research-mixed-4.json", "research-mixed-5.json",
  "research-mixed-6.json", "research-extra.json", "research-pacific-2.json",
  "research-pacific-3.json", "research-base1-redirects.json",
  "research-africa-2.json", "research-africa-3.json", "research-africa-4.json",
  "research-africa-5.json", "research-africa-6.json", "research-africa-extra.json",
  "research-asia-2.json", "research-asia-3.json", "research-asia-4.json",
  "research-asia-5.json", "research-asia-6.json", "research-americas-2.json",
  "research-germanic.json", "research-misc-2.json",
  "research-no-data-pilot.json"
];
for (const rf of researchFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(researchDir, rf), "utf8"));
    if (data.results && Array.isArray(data.results)) {
      for (const r of data.results) {
        if (r.name && r.names && r.names.length > 0) {
          nameToResearch.set(r.name.toLowerCase().trim(), r.names);
        }
      }
    }
  } catch (e) {}
}

console.log(`Research entries (with data): ${nameToResearch.size}`);

// Load all existing entries from continent files
const iToData = new Map(); // i -> {name, b, source}
const continentFiles = [
  "namebases-africa.js", "namebases-asia.js", "namebases-europe.js",
  "namebases-northAmerica.js", "namebases-southAmerica.js",
  "namebases-oceania.js", "namebases-fantasy.js"
];
for (const f of continentFiles) {
  try {
    const c = fs.readFileSync(path.join(publicDir, f), "utf8");
    const entryRegex = /\{[^{}]*\}/g;
    const m = c.match(entryRegex);
    if (m) {
      for (const em of m) {
        const nameMatch = em.match(/"name"\s*:\s*"([^"]+)"/);
        const iMatch = em.match(/"i"\s*:\s*(\d+)/);
        const bMatch = em.match(/"b"\s*:\s*"([^"]*)"/);
        // The shape fields have to be carried through, not defaulted. This
        // writer used to emit `min: 3, max: 20, d: "lnrt", m: 0.1` for every
        // entry, which silently flattened the real bounds of any language whose
        // seeds are not 3-20 characters long.
        const minMatch = em.match(/"min"\s*:\s*(\d+|null)/);
        const maxMatch = em.match(/"max"\s*:\s*(\d+|null)/);
        const dMatch = em.match(/"d"\s*:\s*"([^"]*)"/);
        const mMatch = em.match(/"m"\s*:\s*(\d+(?:\.\d+)?)/);
        if (nameMatch && iMatch) {
          const iVal = parseInt(iMatch[1], 10);
          const b = bMatch ? bMatch[1] : "";
          if (!iToData.has(iVal)) {
            iToData.set(iVal, {
              name: nameMatch[1],
              b: b,
              i: iVal,
              min: minMatch && minMatch[1] !== "null" ? parseInt(minMatch[1], 10) : 3,
              max: maxMatch && maxMatch[1] !== "null" ? parseInt(maxMatch[1], 10) : 20,
              d: dMatch ? dMatch[1] : "lnrt",
              m: mMatch ? parseFloat(mMatch[1]) : 0.1
            });
          }
        }
      }
    }
  } catch (e) {}
}

console.log(`Continent file entries: ${iToData.size}`);

// Find unique base indices from the map
const uniqueI = new Set();
for (const m of map) {
  if (m.bases) for (const b of m.bases) uniqueI.add(b);
}
console.log(`Unique map bases: ${uniqueI.size}`);

// Find max i to use for reporting only - no index is ever allocated
let maxI = Math.max(...iToData.keys(), 0);

// For each map base, check if we have data
let fixed = 0;
let created = 0;
let hadData = 0;
let missing = 0;
const needsIndex = []; // reported, never created - see the "No entry exists" branch

for (const i of uniqueI) {
  const entry = iToData.get(i);
  if (entry && entry.b && entry.b.length > 0) {
    hadData++;
    continue;
  }

  // Find the ISO for this base
  let repISO = null;
  let repName = null;
  for (const m of map) {
    if (m.bases && m.bases.includes(i)) {
      repISO = m.iso;
      repName = catByISO[repISO]?.name;
      break;
    }
  }

  if (entry && repName && (!entry.b || entry.b.length === 0)) {
    // Entry exists but empty, try to populate
    const names = nameToResearch.get(repName.toLowerCase().trim());
    if (names && names.length > 0) {
      entry.b = names.join(",");
      fixed++;
      continue;
    }
    // Try substring match
    let bestMatch = null;
    let bestLen = 0;
    for (const rName of nameToResearch.keys()) {
      if (repName.toLowerCase().trim().includes(rName) || rName.includes(repName.toLowerCase().trim())) {
        if (rName.length > bestLen) {
          bestLen = rName.length;
          bestMatch = rName;
        }
      }
    }
    if (bestMatch) {
      const names2 = nameToResearch.get(bestMatch);
      if (names2 && names2.length > 0) {
        entry.b = names2.join(",");
        fixed++;
        continue;
      }
    }
  }

  if (!entry && repName) {
    // No entry exists for a mixer-map base. This used to mint a new index and
    // repoint the map row at it, which meant running this tool rewrote
    // config/language-mixer-map.js wholesale - reformatting it away from the
    // shape tools/regenerate-js-from-json.js produces and breaking the M001
    // parity check between config/ and public/config/. Index allocation and map
    // edits are not this tool's job, so it now only reports.
    let names = nameToResearch.get(repName.toLowerCase().trim());
    if (!names) {
      // Try substring match
      let bestMatch = null;
      let bestLen = 0;
      for (const rName of nameToResearch.keys()) {
        if (repName.toLowerCase().trim().includes(rName) || rName.includes(repName.toLowerCase().trim())) {
          if (rName.length > bestLen) {
            bestLen = rName.length;
            bestMatch = rName;
          }
        }
      }
      if (bestMatch) names = nameToResearch.get(bestMatch);
    }
    const bData = names ? names.join(",") : "";
    needsIndex.push({ i, repISO, repName, bData });
    created++;
    if (bData) hadData++;
  }

  if (!entry && !repName) {
    missing++;
  }
}

console.log(`Had data: ${hadData}, Fixed: ${fixed}, Reported as needing an entry: ${created}, Missing: ${missing}`);

if (needsIndex.length) {
  console.log(`\nMixer-map bases with no namebase entry (NOT created - this tool does not`);
  console.log(`allocate indices or edit the map; promote these into a continent file by hand):`);
  for (const n of needsIndex.slice(0, 20))
    console.log(`  ${String(n.repISO).padEnd(24)} i=${n.i} "${n.repName}"${n.bData ? `  (research data available: ${n.bData.split(",").length} names)` : ""}`);
  if (needsIndex.length > 20) console.log(`  ... and ${needsIndex.length - 20} more`);
}

// Assign ISO to each entry
for (const m of map) {
  if (m.bases && m.bases.length > 0) {
    const iVal = m.bases[0];
    const e = iToData.get(iVal);
    if (e && !e.iso) {
      e.iso = m.iso;
    }
  }
}

// Write the research file
let js = '"use strict";\n\n';
js += '// Auto-generated from research data files in tools/work-data/.\n';
js += 'window.researchNameBases = [\n';
let writtenCount = 0;
for (const e of iToData.values()) {
  if (e.i === undefined || e.i === null) continue;
  const bEscaped = (e.b || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const iso = e.iso || "unknown";
  js += `  { name: "${e.name}", iso: "${iso}", i: ${e.i}, min: ${e.min ?? 3}, max: ${e.max ?? 20}, d: "${e.d ?? "lnrt"}", m: ${e.m ?? 0.1}, b: "${bEscaped}" },\n`;
  writtenCount++;
}
js += '];\n';

console.log(`Built JS string with ${writtenCount} entries, total length: ${js.length}`);
console.log("First 500 chars:", js.substring(0, 500));

// Only the research file is written. This tool previously also rewrote
// config/language-mixer-map.js and public/config/language-mixer-map.js in a
// hand-rolled wrapper format, which broke the M001 parity check that
// tools/regenerate-js-from-json.js maintains and silently reformatted the map.
// The map is owned by regenerate-js-from-json.js; nothing here touches it.
fs.writeFileSync(path.join(publicDir, "namebases-research.js"), js);
console.log(`Wrote research file with ${iToData.size} entries (map not modified)`);
