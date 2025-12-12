"use strict";

// Report duplicate names inside each default namebase used by the Language Mixer.
// This helps identify bases whose `b` string contains repeated entries.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// __dirname => tools/mixer-namebases; need project root to reach modules/
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
      throw new Error("Failed to read " + full + ": " + (e && e.message ? e.message : e));
    }

    try {
      vm.runInContext(src, context, {filename: full});
    } catch (e) {
      throw new Error("Failed to execute " + full + ": " + (e && e.message ? e.message : e));
    }
  }

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated; did namebases-all.js run?");
  }

  return bases;
}

function splitNames(blob) {
  if (!blob || typeof blob !== "string") return [];
  return blob
    .split(",")
    .map(n => n.trim())
    .filter(Boolean);
}

function main() {
  const bases = loadDefaultNameBases();

  const results = [];

  for (const base of bases) {
    if (!base || typeof base.i !== "number") continue;
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

    results.push({
      index: base.i,
      name: base.name || "",
      raw,
      unique: uniqueCount,
      duplicates,
      dupNames
    });
  }

  if (!results.length) {
    console.log("No duplicate names found in any base.");
    return;
  }

  results.sort((a, b) => b.duplicates - a.duplicates || a.index - b.index);

  console.log("=== Namebase duplicate report ===");
  console.log("Bases with internal duplicate names:", results.length);
  console.log("");

  for (const r of results) {
    console.log(
      `i=${r.index.toString().padStart(3, " ")} | dups=${r.duplicates.toString().padStart(3, " ")} | raw=${r.raw.toString().padStart(4, " ")} | unique=${r.unique.toString().padStart(4, " ")} | name=${r.name}`
    );

    const preview = r.dupNames
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 10)
      .map(d => `${d.name} (x${d.count})`)
      .join(", ");

    console.log("   duplicate names:", preview);
    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while reporting namebase duplicates:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
