"use strict";

// Deduplicate repeated place-names inside selected namebases in
// modules/namebases-*.js. This only touches the `b: "..."` lists and
// preserves the original ordering of first occurrences.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const sourceFiles = [
  "modules/namebases-real.js",
  "modules/namebases-fantasy.js",
  "modules/namebases-creole.js"
];

// Indices reported by tools/report-namebase-duplicates.js
const targetIndices = new Set([5, 41, 49, 55, 59, 62, 162, 195, 196, 223, 230]);

function dedupeList(str) {
  const parts = String(str)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

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

for (const rel of sourceFiles) {
  const full = path.join(root, rel);
  let src = fs.readFileSync(full, "utf8");
  let changed = false;

  // Try to patch each targeted base index in this file
  for (const idx of Array.from(targetIndices)) {
    const re = new RegExp(
      String.raw`\{name:\s*"([^"']+)"[^}]*?i:\s*` + idx + String.raw`[^}]*?b:\s*"([^"]*)"`,
      "m"
    );

    const m = re.exec(src);
    if (!m) continue;

    const baseName = m[1];
    const origB = m[2];
    const dedup = dedupeList(origB);
    if (dedup.newCount === dedup.origCount) {
      // No actual change needed
      targetIndices.delete(idx);
      continue;
    }

    const before = m[0];
    const after = before.replace(`b: "${origB}"`, `b: "${dedup.value}"`);

    src = src.slice(0, m.index) + after + src.slice(m.index + before.length);
    changed = true;
    targetIndices.delete(idx);

    console.log(
      `Deduped i=${idx} name=${baseName} in ${rel}: ${dedup.origCount} -> ${dedup.newCount}`
    );
  }

  if (changed) {
    fs.writeFileSync(full, src, "utf8");
    console.log("Wrote", rel.replace(/\\/g, "/"));
  }
}

if (targetIndices.size) {
  console.warn(
    "Some targeted indices were not found in any source file:",
    Array.from(targetIndices).join(", ")
  );
}
