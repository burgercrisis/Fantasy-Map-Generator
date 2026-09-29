"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

function loadDefaultNameBases() {
  // The continental namebase files replaced the legacy namebases-real.js /
  // namebases-creole.js pair. The shared loader runs the real files and the
  // real aggregator, so this tool sees exactly what the browser sees.
  const {loadNameBases} = require("../namebase-tools/load-namebases");

  return loadNameBases().nameBases;
}

function splitNames(blob) {
  if (!blob || typeof blob !== "string") return [];
  return blob
    .split(",")
    .map(n => n.trim())
    .filter(Boolean);
}

function dedupeList(str) {
  const parts = splitNames(str);
  const seen = new Set();
  const out = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }

  return {
    origCount: parts.length,
    newCount: out.length,
    value: out.join(",")
  };
}

function main() {
  const bases = loadDefaultNameBases();

  const duplicatesMap = new Map();

  for (const base of bases) {
    if (!base || typeof base.i !== "number" || !base.b) continue;

    const names = splitNames(base.b);
    if (!names.length) continue;

    const freq = new Map();
    for (const name of names) {
      freq.set(name, (freq.get(name) || 0) + 1);
    }

    const uniqueCount = [...freq.keys()].length;
    const raw = names.length;
    const duplicates = raw - uniqueCount;
    if (duplicates <= 0) continue;

    const dupNames = [];
    for (const [name, count] of freq.entries()) {
      if (count > 1) dupNames.push({name, count});
    }

    duplicatesMap.set(base.i, {
      index: base.i,
      name: base.name || "",
      raw,
      unique: uniqueCount,
      duplicates,
      dupNames,
      origB: base.b
    });
  }

  const sourceFiles = [
    "public/modules/namebases-africa.js",
    "public/modules/namebases-asia.js",
    "public/modules/namebases-europe.js",
    "public/modules/namebases-northAmerica.js",
    "public/modules/namebases-southAmerica.js",
    "public/modules/namebases-oceania.js",
    "public/modules/namebases-fantasy.js"
  ];

  let totalProcessed = 0;
  let totalDeduped = 0;

  for (const rel of sourceFiles) {
    const full = path.join(root, rel);
    let src;
    try {
      src = fs.readFileSync(full, "utf8");
    } catch (e) {
      console.warn("Cannot read", rel);
      continue;
    }

    let changed = false;
    let fileProcessed = 0;
    let fileDeduped = 0;

    for (const [idx, info] of duplicatesMap) {
      const dedup = dedupeList(info.origB);
      if (dedup.newCount === dedup.origCount) continue;

      // The continental files store entries as JSON, so the keys are quoted:
      // "i": 123, "b": "A,B". Accept the quoted and unquoted spellings.
      const re = new RegExp(
        String.raw`\{[^}]*["']?i["']?\s*:\s*` + idx + String.raw`[^}]*["']?b["']?\s*:\s*"([^"]+)"`
      );

      const m = re.exec(src);
      if (!m) continue;

      const before = m[0];
      // Splice the new value into the captured "b" slot rather than string
      // matching on `b: "..."`, which does not exist in the quoted JSON form.
      const after = before.replace(
        /(["']?b["']?\s*:\s*")([^"]*)(")$/,
        (_full, pre, _value, post) => pre + dedup.value + post
      );
      if (after === before) continue;

      src = src.slice(0, m.index) + after + src.slice(m.index + before.length);
      changed = true;
      fileProcessed++;
      fileDeduped += dedup.origCount - dedup.newCount;

      console.log(
        `Deduped i=${idx} name=${info.name} in ${rel}: ${dedup.origCount} -> ${dedup.newCount} (removed ${dedup.origCount - dedup.newCount})`
      );
      duplicatesMap.delete(idx);
    }

    if (changed) {
      fs.writeFileSync(full, src, "utf8");
      console.log(`Wrote ${rel} (processed ${fileProcessed} bases, removed ${fileDeduped} duplicates)\n`);
      totalProcessed += fileProcessed;
      totalDeduped += fileDeduped;
    }
  }

  if (duplicatesMap.size > 0) {
    console.warn(`WARNING: ${duplicatesMap.size} bases with duplicates could not be deduped (not found in source files):`);
    for (const [idx, info] of duplicatesMap) {
      console.warn(`  i=${idx} name=${info.name} (${info.duplicates} dups)`);
    }
  }

  console.log(`Total: Deduped ${totalDeduped} names from ${totalProcessed} bases`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}