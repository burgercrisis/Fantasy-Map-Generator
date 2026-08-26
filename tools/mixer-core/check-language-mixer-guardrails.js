"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {execFileSync} = require("node:child_process");

const root = path.resolve(__dirname, "..", "..");

let failCount = 0;

// ISOs explicitly allowed to be removed from the mixer map (vs HEAD append-only).
// Reconstructed/placeholder entries that should never have been in the map.
const ALLOWED_REMOVALS = new Set([
  "proto-ainu", "proto-austroasiatic", "proto-berber", "proto-eastern-romance",
  "proto-finnic", "proto-georgian-zan", "proto-hakka", "proto-hlai",
  "proto-hmong-mien", "proto-hmongic", "proto-hokkaido-kuril", "proto-hungarian",
  "proto-kam-sui", "proto-karelian", "proto-karenic", "proto-kartvelian",
  "proto-koreanic", "proto-kra", "proto-kra-dai", "proto-loloish",
  "proto-mari", "proto-mienic", "proto-min", "proto-mongolic",
  "proto-mordvinic", "proto-ob-ugric", "proto-permic", "proto-romance",
  "proto-ron", "proto-sakhalin", "proto-sami", "proto-samoyedic",
  "proto-sino-tibetan", "proto-tai", "proto-tibeto-burman", "proto-uralic",
  "proto-warji"
]);

  function decodeTextFile(buf) {
   if (!Buffer.isBuffer(buf)) return "";

   if (buf.length >= 2) {
     if (buf[0] === 0xff && buf[1] === 0xfe) {
       return buf.slice(2).toString("utf16le");
     }
     if (buf[0] === 0xfe && buf[1] === 0xff) {
       const len = buf.length - (buf.length % 2);
       const swapped = Buffer.allocUnsafe(len - 2);
       for (let i = 2, j = 0; i + 1 < len; i += 2, j += 2) {
         swapped[j] = buf[i + 1];
         swapped[j + 1] = buf[i];
       }
       return swapped.toString("utf16le");
     }
   }

   let nulEven = 0;
   let nulOdd = 0;
   const sampleLen = Math.min(buf.length, 8192);
   for (let i = 0; i < sampleLen; i++) {
     if (buf[i] !== 0x00) continue;
     if (i % 2 === 0) nulEven++;
     else nulOdd++;
   }

   if (nulOdd > 16 && nulOdd > nulEven * 2) {
     return buf.toString("utf16le");
   }

   if (nulEven > 16 && nulEven > nulOdd * 2) {
     const len = buf.length - (buf.length % 2);
     const swapped = Buffer.allocUnsafe(len);
     for (let i = 0; i + 1 < len; i += 2) {
       swapped[i] = buf[i + 1];
       swapped[i + 1] = buf[i];
     }
     return swapped.toString("utf16le");
   }

   const raw = buf.toString("utf8");
   return raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
 }

function toPosix(relPath) {
  return String(relPath).replaceAll("\\", "/");
}

function readFileBuffer(relPath) {
  const full = path.join(root, relPath);
  return fs.readFileSync(full);
}

function hasUtf8Bom(buf) {
  return (
    Buffer.isBuffer(buf) &&
    buf.length >= 3 &&
    buf[0] === 0xef &&
    buf[1] === 0xbb &&
    buf[2] === 0xbf
  );
}

function parseJsonUtf8(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const s = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(s);
}

function gitShowHead(relPath) {
  const spec = `HEAD:${toPosix(relPath)}`;
  try {
    return execFileSync("git", ["show", spec], {encoding: "utf8"});
  } catch (e) {
    if (e && (e.code === "ENOENT" || typeof e.status === "number")) return null;
    throw e;
  }
}

function isoSetFromMixerMap(map) {
  const set = new Set();
  const dupes = new Set();
  for (const row of Array.isArray(map) ? map : []) {
    if (row?.iso == null) continue;
    const iso = String(row.iso);
    if (set.has(iso)) dupes.add(iso);
    set.add(iso);
  }
  return {set, dupes};
}

function isoSetFromCatalog(list) {
  const set = new Set();
  const dupes = new Set();
  for (const row of Array.isArray(list) ? list : []) {
    if (row?.iso == null) continue;
    const iso = String(row.iso);
    if (set.has(iso)) dupes.add(iso);
    set.add(iso);
  }
  return {set, dupes};
}

function diffMissing(baselineSet, currentSet) {
  const missing = [];
  for (const k of baselineSet) {
    if (!currentSet.has(k)) missing.push(k);
  }
  missing.sort((a, b) => a.localeCompare(b));
  return missing;
}

function listNamebasesFiles() {
  const modulesDir = path.join(root, "modules");
  const entries = fs.readdirSync(modulesDir, {withFileTypes: true});
  const files = [];

  for (const e of entries) {
    if (!e.isFile()) continue;
    const name = e.name;
    if (!name.startsWith("namebases-") || !name.endsWith(".js")) continue;
    files.push(path.join(modulesDir, name));
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function checkDuplicateNamebaseIndices() {
  const files = listNamebasesFiles();
  const byIndex = new Map();

  // Matches: {name: "Foo", i: 123
  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;

  for (const fileAbs of files) {
    const rel = path.relative(root, fileAbs);
    let src;
    try {
      src = decodeTextFile(fs.readFileSync(fileAbs));
    } catch (e) {
      fail(`[guardrails] Failed to read ${toPosix(rel)}: ${e && e.message ? e.message : e}`);
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const baseName = m[1];
      const index = Number(m[2]);
      if (!Number.isFinite(index)) continue;

      const line = src.slice(0, m.index).split(/\r?\n/).length;
      const arr = byIndex.get(index) || [];
      arr.push({file: toPosix(rel), line, name: baseName});
      byIndex.set(index, arr);
    }
  }

  const dupes = Array.from(byIndex.entries())
    .filter(([, defs]) => defs.length > 1)
    .sort(([a], [b]) => a - b);

  if (!dupes.length) return;

  const lines = [
    `[guardrails] Duplicate namebase indices detected across modules/namebases-*.js (duplicate \`i:\` values).`,
    "[guardrails] Fix by renumbering the newly-added base(s) (append-only) to an unused index.",
    "[guardrails] Duplicates:"
  ];

  for (const [index, defs] of dupes) {
    defs.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.name.localeCompare(b.name));
    lines.push(` - i: ${index}`);
    for (const d of defs) {
      lines.push(`   - ${d.file}:${d.line} name="${d.name}"`);
    }
  }

  fail(lines.join("\n"));
}

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
  failCount++;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const allowNoGit = args.has("--allow-no-git");

  const jsonFilesNoBom = [
    "config/language-mixer-map.json",
    "config/language-mixes.json",
    "tools/mixer-diagnostics/_no_uniq_base_claims.json",
    "tools/mixer-diagnostics/_decluster_claims.json",
    "tools/mixer-deltas/_compiled-dedicated-pins.json"
  ];

  for (const rel of jsonFilesNoBom) {
    let buf;
    try {
      buf = readFileBuffer(rel);
    } catch (e) {
      // Skip missing optional files (claims file may not exist in early clones)
      if (rel.includes("_no_uniq_base_claims.json")) continue;
      if (rel.includes("_decluster_claims.json")) continue;
      if (rel.includes("_compiled-dedicated-pins.json")) continue;
      throw e;
    }

    if (hasUtf8Bom(buf)) {
      fail(`[guardrails] UTF-8 BOM detected: ${rel}. Fix in-place (rewrite as UTF-8 without BOM); do not discard content.`);
    }
  }

  // Ensure these key JSON files parse under Node's JSON.parse (after BOM stripping).
  const jsonFilesParseable = [
    "config/language-mixer-map.json",
    "config/language-mixes.json",
    "tools/mixer-diagnostics/_no_uniq_base_claims.json",
    "tools/mixer-diagnostics/_decluster_claims.json",
    "tools/mixer-deltas/_compiled-dedicated-pins.json"
  ];

  for (const rel of jsonFilesParseable) {
    try {
      parseJsonUtf8(rel);
    } catch (e) {
      // Claims file may be absent in early clones
      if (rel.includes("_no_uniq_base_claims.json")) continue;
      if (rel.includes("_decluster_claims.json")) continue;
      // Compiled pins file may be absent before delta system is introduced
      if (rel.includes("_compiled-dedicated-pins.json")) continue;
      fail(`[guardrails] Invalid JSON: ${rel}. ${e && e.message ? e.message : e}`);
    }
  }

  checkDuplicateNamebaseIndices();

  const mapCurrent = parseJsonUtf8("config/language-mixer-map.json");
  const catalogCurrent = parseJsonUtf8("config/language-mixes.json");

  const mapCur = isoSetFromMixerMap(mapCurrent);
  const catCur = isoSetFromCatalog(catalogCurrent);

  if (mapCur.dupes.size) {
    fail(`[guardrails] Duplicate ISO rows in config/language-mixer-map.json: ${Array.from(mapCur.dupes).join(", ")}`);
  }
  if (catCur.dupes.size) {
    fail(`[guardrails] Duplicate ISO rows in config/language-mixes.json: ${Array.from(catCur.dupes).join(", ")}`);
  }

  const mapHeadRaw = gitShowHead("config/language-mixer-map.json");
  const catalogHeadRaw = gitShowHead("config/language-mixes.json");

  if (mapHeadRaw == null || catalogHeadRaw == null) {
    if (!allowNoGit) {
      fail(
        "[guardrails] Could not read HEAD versions via git. Run inside a git checkout, or re-run with --allow-no-git to skip append-only checks."
      );
      return;
    }

    if (!failCount) {
      console.log(
        `[guardrails] OK (no-git mode; append-only checks skipped). map=${mapCur.set.size} catalog=${catCur.set.size}`
      );
    }
    return;
  }

  const mapHead = JSON.parse(mapHeadRaw.replace(/^\uFEFF/, ""));
  const catalogHead = JSON.parse(catalogHeadRaw.replace(/^\uFEFF/, ""));

  const mapBase = isoSetFromMixerMap(mapHead);
  const catBase = isoSetFromCatalog(catalogHead);

  const mapMissing = diffMissing(mapBase.set, mapCur.set).filter(i => !ALLOWED_REMOVALS.has(i));
  const catMissing = diffMissing(catBase.set, catCur.set).filter(i => !ALLOWED_REMOVALS.has(i));

  if (mapMissing.length) {
    fail(
      `[guardrails] Append-only violation: config/language-mixer-map.json would drop ${mapMissing.length} ISO(s) vs HEAD.\n` +
        mapMissing.map(i => ` - ${i}`).join("\n")
    );
  }

  if (catMissing.length) {
    fail(
      `[guardrails] Append-only violation: config/language-mixes.json would drop ${catMissing.length} ISO(s) vs HEAD.\n` +
        catMissing.map(i => ` - ${i}`).join("\n")
    );
  }

  if (!failCount) {
    console.log(`[guardrails] OK. map=${mapCur.set.size} catalog=${catCur.set.size}`);
  }
}

if (require.main === module) main();
