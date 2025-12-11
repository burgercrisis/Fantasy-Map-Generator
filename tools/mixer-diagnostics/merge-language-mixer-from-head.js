"use strict";

// One-shot helper: merge HEAD's language-mixer-map.json into the current
// working copy without deleting or overwriting any existing entries.
//
// For each ISO present in HEAD but missing in the current map, we append the
// HEAD entry. For ISOs already present now, we keep the current entry as-is.
//
// Usage (from project root):
//   node tools/mixer-diagnostics/merge-language-mixer-from-head.js
//
// This script is intentionally conservative:
//   - Never removes or edits existing rows in config/language-mixer-map.json.
//   - Only appends new rows for previously-missing ISOs.

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function readJsonFromGit(rev, relPath) {
  const repoPath = relPath.replace(/\\/g, "/");
  const cmd = `git show ${rev}:${repoPath}`;
  const raw = cp.execSync(cmd, { cwd: root, encoding: "utf8" }).replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function main() {
  const rel = "config/language-mixer-map.json";

  const current = readJson(rel);
  const head = readJsonFromGit("HEAD", rel);

  if (!Array.isArray(current) || !Array.isArray(head)) {
    throw new Error("Both current and HEAD versions of language-mixer-map.json must be JSON arrays");
  }

  const byIsoCurrent = new Map();
  const originalIsos = new Set();
  for (const entry of current) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    originalIsos.add(iso);
    if (!byIsoCurrent.has(iso)) byIsoCurrent.set(iso, entry);
  }

  let added = 0;
  for (const entry of head) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    if (byIsoCurrent.has(iso)) continue;
    current.push(entry);
    byIsoCurrent.set(iso, entry);
    added++;
  }

  const finalIsos = new Set();
  for (const entry of current) {
    if (!entry || !entry.iso) continue;
    finalIsos.add(String(entry.iso));
  }
  for (const iso of originalIsos) {
    if (!finalIsos.has(iso)) {
      console.error(
        "[merge-language-mixer-from-head] refusing to write config/language-mixer-map.json; would drop ISO",
        iso
      );
      return;
    }
  }

  const outPath = path.join(root, rel);
  fs.writeFileSync(outPath, JSON.stringify(current, null, 2) + "\n", "utf8");

  console.log("merge-language-mixer-from-head: added entries:", added);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while merging language-mixer-map from HEAD:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
