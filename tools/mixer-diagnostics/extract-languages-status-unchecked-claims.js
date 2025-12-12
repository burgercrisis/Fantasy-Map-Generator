"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const target = path.join(root, "DEVplans", "Languages-Status.md");
const outDir = path.join(root, "tools", "mixer-diagnostics", "tmp");
const outPath = path.join(outDir, "languages-status-unchecked-claims.tsv");

const src = fs.readFileSync(target, "utf8").replace(/^\uFEFF/, "");
const lines = src.split(/\r?\n/);

const re = /\b(done|verified|complete|completed|green)\b|0 failures|no failures|unmatched=0|fully wired=\d+/i;

const out = [];
for (let i = 0; i < lines.length; i++) {
  const lineNo = i + 1;
  const line = lines[i];
  if (!/^\s*-/.test(line)) continue;
  if (/^\s*-\s*\[/.test(line)) continue;
  if (line.includes("✅")) continue;
  if (!re.test(line)) continue;
  out.push(`${lineNo}\t${line}`);
}

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(outPath, out.join("\n") + (out.length ? "\n" : ""), "utf8");
process.stdout.write(`Wrote ${out.length} lines to ${path.relative(root, outPath)}\n`);
