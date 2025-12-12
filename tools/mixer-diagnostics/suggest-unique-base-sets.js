"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function toKey(bases) {
  const uniq = Array.from(new Set((bases || []).map(Number))).filter(n => Number.isFinite(n));
  uniq.sort((a, b) => a - b);
  return uniq.join(",");
}

function parseArgs(argv) {
  const args = argv.slice(2);

  const flags = new Set(args.filter(a => a.startsWith("--")));
  function getArg(name, def = null) {
    const hit = args.find(a => a.startsWith(name + "="));
    if (!hit) return def;
    const v = hit.slice(name.length + 1);
    return v === "" ? def : v;
  }

  // PowerShell treats commas as an array separator unless quoted, so:
  //   --isos=btv,bhe,dmk
  // may arrive as argv tokens:
  //   ["--isos=btv", "bhe", "dmk"]
  // Support both forms.
  function getArgList(name) {
    let hitIndex = args.findIndex(a => a.startsWith(name + "="));
    let first = "";
    if (hitIndex !== -1) {
      first = args[hitIndex].slice(name.length + 1);
    } else {
      // Support: --isos btv,bhe,dmk
      hitIndex = args.findIndex(a => a === name);
      if (hitIndex === -1) return [];
    }

    const out = [];
    if (first) out.push(first);

    // Include trailing non-flag tokens as additional list elements.
    for (let i = hitIndex + 1; i < args.length; i++) {
      const token = args[i];
      if (!token || token.startsWith("--")) break;
      out.push(token);
    }

    return out;
  }

  // Alternative: repeatable --iso=XXX
  const repeatedIso = args
    .filter(a => a.startsWith("--iso="))
    .map(a => a.slice("--iso=".length))
    .map(s => s.trim())
    .filter(Boolean);

  const isoCsvParts = getArgList("--isos");
  const isoCsvJoined = isoCsvParts.join(",");
  const isosFromCsv = isoCsvJoined
    ? isoCsvJoined
        .split(/[\s,]+/)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  const isos = repeatedIso.length ? repeatedIso : isosFromCsv;

  const maxCandidates = Number(getArg("--max", "10")) || 10;
  const maxAdditions = Number(getArg("--max-add", "3")) || 3;

  const debug = flags.has("--debug");

  return { flags, isos, maxCandidates, maxAdditions, debug };
}

function main() {
  const { isos, maxCandidates, maxAdditions, debug } = parseArgs(process.argv);

  const mixes = readJson("config/language-mixes.json");
  const mapPath = path.join(root, "config", "language-mixer-map.json");
  const mapRaw = fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, "");
  if (debug) {
    console.log("Reading map:", path.relative(root, mapPath).replace(/\\/g, "/"));
    console.log("Raw contains \"iso\": \"btv\"?", mapRaw.includes('"iso": "btv"'));
    console.log("Raw contains \"iso\": \"waziri-pashto\"?", mapRaw.includes('"iso": "waziri-pashto"'));
  }
  const map = JSON.parse(mapRaw);

  const mixByIso = new Map();
  for (const m of mixes) {
    if (!m || !m.iso) continue;
    mixByIso.set(String(m.iso), m);
  }

  const entries = map
    .filter(e => e && e.iso && Array.isArray(e.bases) && e.bases.length)
    .map(e => ({ iso: String(e.iso), bases: e.bases }));

  // Only count catalog languages (skip map entries not in catalog, and skip family macros).
  const catalogEntries = entries.filter(e => {
    const lang = mixByIso.get(e.iso);
    if (!lang) return false;
    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) return false;
    return true;
  });

  const baseKeyCounts = new Map();
  const baseIndexCounts = new Map();

  for (const e of catalogEntries) {
    const key = toKey(e.bases);
    baseKeyCounts.set(key, (baseKeyCounts.get(key) || 0) + 1);

    for (const n of (e.bases || []).map(Number)) {
      if (!Number.isFinite(n)) continue;
      baseIndexCounts.set(n, (baseIndexCounts.get(n) || 0) + 1);
    }
  }

  const targetIsos = isos.length
    ? isos
    : [
        "btv",
        "bhe",
        "dmk",
        "ghr",
        "gig",
        "gwf",
        "jnd",
        "jog",
        "kbu",
        "xka",
        "nlm",
        "sdg",
        "sbn",
        "wne",
        "waziri-pashto"
      ];

  // Candidate pool: rare base indices, derived from what already exists in the map (so it's valid).
  const rareBaseIndices = Array.from(baseIndexCounts.entries())
    .sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]))
    .map(([idx]) => idx);

  const mapByIso = new Map(entries.map(e => [e.iso, e]));

  console.log("=== suggest-unique-base-sets ===");
  console.log("Catalog languages considered:", catalogEntries.length);
  console.log("Distinct base sets:", baseKeyCounts.size);
  console.log("\nTargets:");

  for (const iso of targetIsos) {
    const entry = mapByIso.get(iso);
    if (!entry) {
      console.log(`- ${iso}: NOT FOUND IN MAP`);
      continue;
    }

    const currentKey = toKey(entry.bases);
    const currentCount = baseKeyCounts.get(currentKey) || 0;
    console.log(`\n${iso}: current bases=[${currentKey}] (globalCount=${currentCount})`);

    // Generate candidates by adding up to maxAdditions rare bases not already in the set.
    const currentSet = new Set((entry.bases || []).map(Number).filter(n => Number.isFinite(n)));

    const candidates = [];
    for (const idx of rareBaseIndices) {
      if (candidates.length >= maxCandidates) break;
      if (currentSet.has(idx)) continue;

      const nextBases = Array.from(currentSet);
      nextBases.push(idx);
      const key = toKey(nextBases);

      const count = baseKeyCounts.get(key) || 0;
      if (count === 0) {
        candidates.push({ key, added: [idx] });
      }
    }

    // If we didn't find enough with single additions, allow 2-3 additions.
    if (candidates.length < maxCandidates && maxAdditions >= 2) {
      for (let i = 0; i < rareBaseIndices.length && candidates.length < maxCandidates; i++) {
        const a = rareBaseIndices[i];
        if (currentSet.has(a)) continue;
        for (let j = i + 1; j < rareBaseIndices.length && candidates.length < maxCandidates; j++) {
          const b = rareBaseIndices[j];
          if (currentSet.has(b)) continue;
          const nextBases = Array.from(currentSet);
          nextBases.push(a, b);
          const key = toKey(nextBases);
          const count = baseKeyCounts.get(key) || 0;
          if (count === 0) candidates.push({ key, added: [a, b] });
        }
      }
    }

    if (candidates.length < maxCandidates && maxAdditions >= 3) {
      for (let i = 0; i < rareBaseIndices.length && candidates.length < maxCandidates; i++) {
        const a = rareBaseIndices[i];
        if (currentSet.has(a)) continue;
        for (let j = i + 1; j < rareBaseIndices.length && candidates.length < maxCandidates; j++) {
          const b = rareBaseIndices[j];
          if (currentSet.has(b)) continue;
          for (let k = j + 1; k < rareBaseIndices.length && candidates.length < maxCandidates; k++) {
            const c = rareBaseIndices[k];
            if (currentSet.has(c)) continue;
            const nextBases = Array.from(currentSet);
            nextBases.push(a, b, c);
            const key = toKey(nextBases);
            const count = baseKeyCounts.get(key) || 0;
            if (count === 0) candidates.push({ key, added: [a, b, c] });
          }
        }
      }
    }

    if (!candidates.length) {
      console.log("  No unused base-set candidates found (within constraints). Try increasing --max-add.");
      continue;
    }

    for (const c of candidates.slice(0, maxCandidates)) {
      console.log(`  candidate bases=[${c.key}] (added ${c.added.join(",")})`);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}
