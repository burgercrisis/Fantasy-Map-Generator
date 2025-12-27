"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

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
    let src;
    try {
      src = fs.readFileSync(full, "utf8");
    } catch (e) {
      continue;
    }

    try {
      vm.runInContext(src, context, {filename: full});
    } catch (e) {
      continue;
    }
  }

  return sandbox.window && sandbox.window.defaultNameBases || [];
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
    "modules/namebases-real.js",
    "modules/namebases-fantasy.js",
    "modules/namebases-creole.js"
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

      const re = new RegExp(
        String.raw`\{[^}]*i:\s*` + idx + String.raw`[^}]*b:\s*"([^"]+)"`
      );

      const m = re.exec(src);
      if (!m) continue;

      const origB = m[1];
      const before = m[0];
      const after = before.replace(`b: "${origB}"`, `b: "${dedup.value}"`);

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