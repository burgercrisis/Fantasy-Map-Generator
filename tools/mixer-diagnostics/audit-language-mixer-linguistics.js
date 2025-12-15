"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const clean = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(clean);
}

function parseArgs(argv) {
  const args = argv.slice(2);

  const includeFamilies = args.includes("--include-families");
  const checkFamilyBaseMissing = args.includes("--check-family-base-missing");

  const onlyArg = args.find(a => a.startsWith("--only="));
  const onlyIsosArg = args.find(a => a.startsWith("--only-isos="));
  const onlyIsos = onlyArg
    ? onlyArg
        .split("=")
        .slice(1)
        .join("=")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    : onlyIsosArg
      ? onlyIsosArg
          .split("=")
          .slice(1)
          .join("=")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      : [];

  const limitArg = args.find(a => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 200;

  const minBaseSamplesArg = args.find(a => a.startsWith("--min-base-samples="));
  const minBaseSamples = minBaseSamplesArg ? parseInt(minBaseSamplesArg.split("=")[1], 10) : 6;

  const minTopShareArg = args.find(a => a.startsWith("--min-top-share="));
  const minTopShare = minTopShareArg ? parseFloat(minTopShareArg.split("=")[1]) : 0.7;

  const help = args.includes("--help") || args.includes("-h");
  const json = args.includes("--json");

  return {includeFamilies, checkFamilyBaseMissing, onlyIsos, limit, minBaseSamples, minTopShare, help, json};
}

function printUsage() {
  console.log("Usage:");
  console.log("  node tools/mixer-diagnostics/audit-language-mixer-linguistics.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  --include-families     Include tags:[\"family\"] catalog entries.");
  console.log("  --check-family-base-missing  Enable strict check that family implies a specific namebase index (off by default).");
  console.log("  --only=iso1,iso2       Restrict to specified ISO codes.");
  console.log("  --only-isos=...        Alias for --only=.");
  console.log("  --limit=N              Max rows to print (default: 200).");
  console.log("  --min-base-samples=N   Minimum ISO samples for a base before outlier checks apply (default: 6).");
  console.log("  --min-top-share=F      Minimum top-family share for a base to be considered family-anchored (default: 0.7).");
  console.log("  --json                 Output JSON report (suppresses formatted output).");
}

function loadDefaultNameBases() {
  const sandbox = {window: {}};
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js")
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
  }

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated; did namebases-all.js run?");
  }

  return bases;
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function makeBaseNameIndex(nameBases) {
  const byName = new Map();
  for (let i = 0; i < nameBases.length; i++) {
    const b = nameBases[i];
    if (!b || !b.name) continue;
    const key = String(b.name).toLowerCase();
    if (!byName.has(key)) byName.set(key, i);
  }
  return byName;
}

function resolveBaseByNameLike(byName, name) {
  if (!name) return null;
  const raw = String(name).trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const variants = [];

  variants.push(lower);

  const stripped = lower.replace(/\s+(language|languages|creole|creoles|family|group|dialect|dialects)$/g, "").trim();
  if (stripped && stripped !== lower) variants.push(stripped);

  const dehyphen = lower.replace(/[-–]+/g, " ").trim();
  if (dehyphen && dehyphen !== lower) variants.push(dehyphen);

  const prefixStripped = lower
    .replace(/^(proto|old|middle|ancient)\s+/, "")
    .replace(/^(proto|old|middle|ancient)-/, "")
    .trim();
  if (prefixStripped && prefixStripped !== lower) variants.push(prefixStripped);

  for (const v of variants) {
    const idx = byName.get(v);
    if (typeof idx === "number") return idx;
  }

  return null;
}

function normalizeFamilyKey(family) {
  if (!family) return "";
  const raw = String(family).trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  const idx = lower.indexOf("-based");
  if (idx === -1) return raw;
  return raw.slice(0, idx).replace(/[-–]+$/g, "").trim();
}

function intersect(a, b) {
  const setB = new Set(b);
  return a.filter(x => setB.has(x));
}

function addCount(map, key, label) {
  if (!label) return;
  let inner = map.get(key);
  if (!inner) {
    inner = new Map();
    map.set(key, inner);
  }
  inner.set(label, (inner.get(label) || 0) + 1);
}

function topLabel(counts) {
  if (!counts || !counts.size) return null;
  let top = null;
  for (const [label, count] of counts.entries()) {
    if (!top || count > top.count) top = {label, count};
  }
  return top;
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    printUsage();
    return;
  }

  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();
  const baseByName = makeBaseNameIndex(nameBases);

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c || !c.iso) continue;
    catalogByIso.set(String(c.iso), c);
  }

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r || !r.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(String(r.iso), r.bases);
  }

  const targetIsos = [];
  for (const [iso, entry] of catalogByIso.entries()) {
    if (!parsed.includeFamilies && isFamilyEntry(entry)) continue;
    targetIsos.push(iso);
  }

  if (parsed.onlyIsos && parsed.onlyIsos.length) {
    const only = new Set(parsed.onlyIsos);
    targetIsos.splice(0, targetIsos.length, ...targetIsos.filter(iso => only.has(iso)));
  }

  targetIsos.sort((a, b) => a.localeCompare(b));

  const comparisonIsos = [];
  for (const [iso] of mapByIso.entries()) {
    const entry = catalogByIso.get(iso);
    if (entry && isFamilyEntry(entry)) continue;
    comparisonIsos.push(iso);
  }

  const baseUseCount = new Map();
  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;
    for (const b of bases) {
      if (typeof b !== "number") continue;
      baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
    }
  }

  const baseFamilyCounts = new Map(); // base -> Map(family -> count)
  const baseFamilyTotals = new Map(); // base -> total

  for (const iso of comparisonIsos) {
    const entry = catalogByIso.get(iso);
    const family = entry?.family ? String(entry.family) : "";
    if (!family) continue;

    const bases = mapByIso.get(iso);
    if (!bases) continue;

    for (const b of bases) {
      if (typeof b !== "number") continue;
      if ((baseUseCount.get(b) || 0) <= 1) continue; // skip dedicated or unused
      addCount(baseFamilyCounts, b, family);
      baseFamilyTotals.set(b, (baseFamilyTotals.get(b) || 0) + 1);
    }
  }

  const baseFamilyStats = new Map();
  for (const [base, counts] of baseFamilyCounts.entries()) {
    const total = baseFamilyTotals.get(base) || 0;
    if (total < parsed.minBaseSamples) continue;
    const top = topLabel(counts);
    if (!top) continue;
    const share = total ? top.count / total : 0;
    if (share < parsed.minTopShare) continue;
    baseFamilyStats.set(base, {topFamily: top.label, topShare: share, total});
  }

  const catalogByNameLower = new Map();
  for (const c of catalog) {
    if (!c || !c.name) continue;
    const key = String(c.name).toLowerCase();
    if (!catalogByNameLower.has(key)) catalogByNameLower.set(key, c);
  }

  function resolveCatalogEntryByNameOrIso(s) {
    if (!s) return null;
    const raw = String(s).trim();
    if (!raw) return null;

    const byIso = catalogByIso.get(raw);
    if (byIso) return byIso;

    const byName = catalogByNameLower.get(raw.toLowerCase());
    if (byName) return byName;

    return null;
  }

  const issues = [];

  function pushIssue(kind, iso, details) {
    issues.push({kind, iso, ...details});
  }

  for (const iso of targetIsos) {
    const entry = catalogByIso.get(iso);
    const bases = mapByIso.get(iso) || null;

    if (!bases) {
      pushIssue("missing_mapping", iso, {
        name: entry?.name || "",
        category: entry?.category || "",
        family: entry?.family || "",
        lexifier: entry?.lexifier || ""
      });
      continue;
    }

    const invalidBases = bases.filter(b => typeof b !== "number" || !nameBases[b]);
    if (invalidBases.length) {
      pushIssue("invalid_base_index", iso, {
        name: entry?.name || "",
        category: entry?.category || "",
        family: entry?.family || "",
        lexifier: entry?.lexifier || "",
        bases,
        invalidBases
      });
    }

    const dedicatedBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) === 1);
    const sharedBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) > 1);

    const category = entry?.category || "";
    const tags = Array.isArray(entry?.tags) ? entry.tags : [];
    const isCreoleLike =
      category === "Creole" ||
      category === "Pidgin" ||
      category === "Mixed" ||
      tags.includes("creole") ||
      tags.includes("pidgin") ||
      tags.includes("mixed");

    if (isCreoleLike && !entry?.lexifier) {
      pushIssue("missing_lexifier", iso, {
        name: entry?.name || "",
        category: entry?.category || "",
        family: entry?.family || "",
        bases,
        sharedBases,
        dedicatedBases
      });
    }

    if (entry?.lexifier) {
      const lexEntry = resolveCatalogEntryByNameOrIso(entry.lexifier);
      if (!lexEntry || !lexEntry.iso) {
        pushIssue("lexifier_unresolved", iso, {
          name: entry?.name || "",
          category: entry?.category || "",
          family: entry?.family || "",
          lexifier: entry?.lexifier || "",
          bases,
          sharedBases,
          dedicatedBases
        });
      } else {
        const lexBases = mapByIso.get(String(lexEntry.iso)) || [];
        const lexShared = lexBases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) > 1);
        if (lexShared.length) {
          const overlap = intersect(sharedBases, lexShared);
          if (!overlap.length) {
            pushIssue("lexifier_base_mismatch", iso, {
              name: entry?.name || "",
              category: entry?.category || "",
              family: entry?.family || "",
              lexifier: entry?.lexifier || "",
              lexifierIso: String(lexEntry.iso),
              bases,
              sharedBases,
              dedicatedBases,
              lexifierSharedBases: lexShared
            });
          }
        }
      }
    }

    const isoFamily = entry?.family ? String(entry.family) : "";
    if (isoFamily && sharedBases.length) {
      const outliers = [];
      for (const b of sharedBases) {
        const stat = baseFamilyStats.get(b);
        if (!stat) continue;
        if (stat.topFamily === isoFamily) continue;
        outliers.push({base: b, ...stat});
      }
      outliers.sort((a, b) => b.topShare - a.topShare || b.total - a.total || a.base - b.base);
      for (const o of outliers.slice(0, 3)) {
        pushIssue("base_family_outlier", iso, {
          name: entry?.name || "",
          category: entry?.category || "",
          family: isoFamily,
          lexifier: entry?.lexifier || "",
          bases,
          sharedBases,
          dedicatedBases,
          base: o.base,
          baseName: nameBases[o.base] ? nameBases[o.base].name : "",
          baseTopFamily: o.topFamily,
          baseTopShare: o.topShare,
          baseTotal: o.total
        });
      }
    }

    if (parsed.checkFamilyBaseMissing) {
      const familyKey = normalizeFamilyKey(entry?.family || "");
      if (familyKey) {
        const expected = resolveBaseByNameLike(baseByName, familyKey);
        if (typeof expected === "number") {
          if (!bases.includes(expected)) {
            pushIssue("family_base_missing", iso, {
              name: entry?.name || "",
              category: entry?.category || "",
              family: entry?.family || "",
              lexifier: entry?.lexifier || "",
              bases,
              sharedBases,
              dedicatedBases,
              expectedBase: expected,
              expectedBaseName: nameBases[expected] ? nameBases[expected].name : ""
            });
          }
        }
      }
    }
  }

  issues.sort((a, b) => a.kind.localeCompare(b.kind) || a.iso.localeCompare(b.iso));

  if (parsed.json) {
    process.stdout.write(JSON.stringify({issues}, null, 2) + "\n");
    return;
  }

  const counts = new Map();
  for (const i of issues) counts.set(i.kind, (counts.get(i.kind) || 0) + 1);

  console.log("Linguistic accuracy audit (heuristic)");
  console.log("Targets:", targetIsos.length);
  console.log("Issues:", issues.length);

  const kinds = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [k, n] of kinds) console.log(` - ${k}: ${n}`);

  console.log("");

  const shown = issues.slice(0, parsed.limit);
  for (const i of shown) {
    const label = `${i.kind} :: ${i.iso} :: ${i.name || ""}`;
    const parts = [];
    if (i.category) parts.push(`category=${i.category}`);
    if (i.family) parts.push(`family=${i.family}`);
    if (i.lexifier) parts.push(`lexifier=${i.lexifier}`);
    if (i.lexifierIso) parts.push(`lexIso=${i.lexifierIso}`);
    if (typeof i.expectedBase === "number") parts.push(`expectedBase=${i.expectedBase}(${i.expectedBaseName || ""})`);
    if (typeof i.base === "number") {
      parts.push(`base=${i.base}(${i.baseName || ""})`);
      if (i.baseTopFamily) parts.push(`baseTopFamily=${i.baseTopFamily}`);
      if (typeof i.baseTopShare === "number") parts.push(`baseTopShare=${i.baseTopShare.toFixed(2)}`);
      if (typeof i.baseTotal === "number") parts.push(`baseTotal=${i.baseTotal}`);
    }
    console.log(label);
    if (parts.length) console.log("  " + parts.join("; "));
  }

  if (issues.length > shown.length) {
    console.log("");
    console.log(`... truncated: showing ${shown.length}/${issues.length} (use --limit=N or --json)`);
  }
}

if (require.main === module) main();
