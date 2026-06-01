"use strict";
const { execSync } = require("node:child_process");
const fs = require("node:fs");

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const a = args.find(x => x.startsWith(flag + "=")); return a ? a.split("=")[1] : null; };
const has = (flag) => args.includes(flag);

// Build the base command
let cmd = "node tools/mixer-diagnostics/report-language-mixer-premix-grades.js";
const outputDefault = "premix_report.txt";

// Mode: --below=<n> (low premix grades) or --only-isos=<list> (specific ISOs)
if (get("below")) cmd += ` --below=${get("below")}`;
if (get("only-isos")) cmd += ` --only-isos=${get("only-isos")}`;
if (get("limit")) cmd += ` --limit=${get("limit")}`;

const outputFile = get("output") || outputDefault;

try {
  const output = execSync(cmd, { encoding: "utf8" });
  fs.writeFileSync(outputFile, output);
  console.log(`Report saved to ${outputFile}`);
} catch (error) {
  const errorFile = outputFile.replace(".txt", "_error.txt");
  fs.writeFileSync(errorFile, error.stdout || error.message);
  console.error(`Error running premix report. Details saved to ${errorFile}`);
}
