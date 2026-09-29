"use strict";

/**
 * Repoint tools that read the stale shadow tree at public/modules/, which is
 * what actually ships.
 *
 * Run:  node tools/namebase-tools/repoint-shadow-tree.js --check
 *       node tools/namebase-tools/repoint-shadow-tree.js --write
 *
 * There are two namebase trees in this repo:
 *
 *   public/modules/   the one src/index.html loads. vite's publicDir is
 *                     "../public", so a src-relative "modules/x.js" resolves
 *                     here at runtime, and stamp-assets.js computes the ?v=
 *                     query params from here. 3,802 entries.
 *   modules/          a git-tracked duplicate that nothing serves. 4,746
 *                     entries, 24% larger, diverged long ago.
 *
 * Two of the tools reading the shadow tree are the ones this work has trusted
 * most: check-language-mixer-guardrails.js and check-mixer-health.js both do
 * path.join(root, "modules"). Every "guardrails OK" reported during this work
 * was therefore validating a dataset the app never loads.
 *
 * The edit is deliberately narrow. It only rewrites a `"modules"` string
 * literal that is an argument to a path.join(...) call whose own argument list
 * does NOT already contain "public" or "dist". That excludes the two cases that
 * must not change:
 *
 *   path.join(root, "public", "modules")   already correct
 *   path.join(dist, "modules", ...)        dist/ is the build output
 *
 * Nothing is deleted here. Removing the shadow tree is a separate step.
 */

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..", "..");

const write = process.argv.includes("--write");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(js|ts)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = [];
for (const d of ["tools", "src", "scripts"]) {
  const p = path.join(root, d);
  if (fs.existsSync(p)) files.push(...walk(p));
}

// Never rewrite this tool or the probe that reports on the shadow tree.
const SELF = new Set(["tools\\namebase-tools\\repoint-shadow-tree.js", "tools\\namebase-tools\\probe-shadow-tree.js"]);

/**
 * True when the offset falls inside a line comment or a block comment.
 *
 * A previous version of this tool blanked comments with a regex and then wrote
 * the blanked text back, which destroyed a multi-line string in
 * regenerate-mixer-map-v2.js: the "https://" inside a generated banner matched
 * the comment regex, and the blanked version was what got saved. So nothing is
 * blanked here. Each candidate match is checked against the original text and
 * only the real ones are rewritten.
 */
function inComment(src, index) {
  const lineStart = src.lastIndexOf("\n", index) + 1;
  const line = src.slice(lineStart, index);
  const blockOpen = src.lastIndexOf("/*", index);
  const blockClose = src.lastIndexOf("*/", index);
  if (blockOpen > blockClose) return true;
  // A // that is not preceded by a colon, a slash or a quote is a comment.
  const m = /\/\/(?![^\n]*["'`])/g;
  m.lastIndex = 0;
  let c;
  while ((c = m.exec(line)) !== null) {
    if (c.index + 2 >= line.length) return true;
  }
  return false;
}

const JOIN = /path\.join\(([^;]{0,400}?)\)/g;
const changed = [];
const skipped = [];

for (const f of files) {
  const rel = path.relative(root, f);
  if (rel.startsWith("modules" + path.sep)) continue;
  if (SELF.has(rel)) continue;

  const src = fs.readFileSync(f, "utf8");
  if (!/namebase/i.test(src)) continue;

  // Collect edits as index ranges against the ORIGINAL source, then splice.
  const edits = [];
  JOIN.lastIndex = 0;
  let m;
  while ((m = JOIN.exec(src)) !== null) {
    if (inComment(src, m.index)) continue;
    const args = m[1];
    if (!/["'`]modules["'`]/.test(args)) continue;
    if (/["'`]public["'`]/.test(args)) { skipped.push(`${rel}: already public/`); continue; }
    if (/\bdist\b/.test(args)) { skipped.push(`${rel}: build output (dist)`); continue; }
    const inner = /(["'`])modules\1/;
    const im = inner.exec(args);
    if (!im) continue;
    const start = m.index + m[0].indexOf(args) + im.index;
    edits.push({start, end: start + im[0].length, text: `${im[1]}public/modules${im[1]}`});
  }

  if (!edits.length) continue;
  let next = src;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    next = next.slice(0, e.start) + e.text + next.slice(e.end);
  }
  changed.push({rel, hits: edits.length});
  if (write) fs.writeFileSync(f, next, "utf8");
}

console.log("");
console.log("repoint-shadow-tree " + (write ? "(APPLIED)" : "(dry run)"));
console.log("========================================");
console.log(`  files repointed to public/modules : ${changed.length}`);
for (const c of changed) console.log(`  ${c.rel}  (${c.hits})`);
console.log("");
console.log(`  left alone because already qualified : ${skipped.length}`);
for (const s of skipped) console.log(`  ${s}`);
console.log("");
console.log(write
  ? "Now re-run the guardrails - they were reading the wrong tree."
  : "Dry run. Re-run with --write to apply.");
