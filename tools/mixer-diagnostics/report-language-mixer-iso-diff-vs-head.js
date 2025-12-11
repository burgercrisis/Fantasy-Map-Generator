"use strict";

// Report ISO set differences between the current working copy of
// config/language-mixer-map.json and HEAD:config/language-mixer-map.json.
//
// Usage (from project root):
//   node tools/mixer-diagnostics/report-language-mixer-iso-diff-vs-head.js
//
// This is read-only and will never modify any files.

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

function indexIsos(arr) {
  const set = new Set();
  if (!Array.isArray(arr)) return set;
  for (const e of arr) {
    if (!e || !e.iso) continue;
    set.add(String(e.iso));
  }
  return set;
}

function main() {
  const rel = "config/language-mixer-map.json";
  const cur = readJson(rel);
  const head = readJsonFromGit("HEAD", rel);

  const curIsos = indexIsos(cur);
  const headIsos = indexIsos(head);

  const missing = [];
  for (const iso of headIsos) {
    if (!curIsos.has(iso)) missing.push(iso);
  }

  const extra = [];
  for (const iso of curIsos) {
    if (!headIsos.has(iso)) extra.push(iso);
  }

  console.log("ISO diff vs HEAD (language-mixer-map.json):");
  console.log("  missing_count (in HEAD but not current):", missing.length);
  console.log("  extra_count (in current but not HEAD):", extra.length);

  if (missing.length) {
    console.log("  missing_sample:", JSON.stringify(missing.slice(0, 30)));
  }
  if (extra.length) {
    console.log("  extra_sample:", JSON.stringify(extra.slice(0, 30)));
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while reporting ISO diff vs HEAD:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
