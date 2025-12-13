"use strict";

// Orchestrator for running Wikipedia list helpers across all lists
// registered in DEVplans/Languages-Status.md §8.
//
// For each `- **JSON file:** ` entry, this script can:
//   - refresh the devplan snapshot via `update-wikipedia-list-coverage-in-devplan.js`, and
//   - print base-uniqueness / Nonunique Bases via `report-wikipedia-list-base-uniqueness.js`.
//
// Usage (from project root):
//   node tools/mixer-core/run-wikipedia-list-helpers.js [DEVPLAN_REL] [options]
//
// Options:
//   --list-only          List discovered JSON paths and exit (no helpers run)
//   --no-devplan         Do not run update-wikipedia-list-coverage-in-devplan.js
//   --no-base-uniqueness Do not run report-wikipedia-list-base-uniqueness.js
//   --filter=SUBSTR      Only run helpers for JSON paths containing SUBSTR
//
// DEVPLAN_REL defaults to DEVplans/Languages-Status.md if omitted.

const fs = require("fs");
const path = require("path");
const {execFileSync} = require("child_process");

const root = path.resolve(__dirname, "..", "..");

let helperErrorCount = 0;

function hasNullBytes(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.includes(0);
}

function isNonCanonicalList(relPath) {
  const baseName = path.basename(relPath);
  return /seed|major|subset/i.test(baseName);
}

function readDevplan(devplanRel) {
  const devplanPath = path.join(root, devplanRel);
  const raw = fs.readFileSync(devplanPath, "utf8");
  return {devplanPath, raw};
}

function extractJsonPaths(markdown) {
  const lines = markdown.split(/\r?\n/);
  const paths = new Set();
  const re = /- \*\*JSON file:\*\* `([^`]+\.json)`/;

  for (const line of lines) {
    const m = line.match(re);
    if (m && m[1]) {
      paths.add(m[1]);
    }
  }

  return Array.from(paths);
}

function runNodeScript(scriptRel, args) {
  const scriptPath = path.join(__dirname, scriptRel);
  const fullArgs = [scriptPath].concat(args || []);
  try {
    const out = execFileSync("node", fullArgs, {encoding: "utf8"});
    if (out && out.trim()) {
      console.log(out.trim());
      console.log("");
    }
  } catch (err) {
    console.error(`Error running ${scriptRel}:`, err && err.message ? err.message : err);
    if (err && err.stdout) console.error(String(err.stdout));
    if (err && err.stderr) console.error(String(err.stderr));
    helperErrorCount++;
  }
}

function main() {
  const argv = process.argv.slice(2);

  let devplanRel = "DEVplans/Languages-Status.md";
  if (argv[0] && !argv[0].startsWith("--")) {
    devplanRel = argv.shift();
  }

  const listOnly = argv.includes("--list-only");
  const runDevplan = !argv.includes("--no-devplan");
  const runBaseUniq = !argv.includes("--no-base-uniqueness");

  const filterArg = argv.find(a => a.startsWith("--filter="));
  const filterSubstr = filterArg ? filterArg.slice("--filter=".length) : "";

  if (!runDevplan && !runBaseUniq && !listOnly) {
    console.error("Nothing to do: both --no-devplan and --no-base-uniqueness are set.");
    process.exitCode = 1;
    return;
  }

  const {devplanPath, raw} = readDevplan(devplanRel);
  const jsonPaths = extractJsonPaths(raw);

  if (!jsonPaths.length) {
    console.log("No Wikipedia JSON file entries found in", devplanPath);
    return;
  }

  console.log("Using devplan:", devplanPath.replace(/\\\\/g, "/"));
  console.log("Discovered", jsonPaths.length, "JSON file entries under the Wikipedia registry.\n");

  const filtered = jsonPaths.filter(p => {
    if (!filterSubstr) return true;
    return p.includes(filterSubstr);
  });

  if (!filtered.length) {
    console.log("No JSON paths matched filter:", filterSubstr);
    return;
  }

  console.log("Target JSON files:");
  for (const rel of filtered) {
    console.log("  -", rel);
  }
  console.log("");

  if (listOnly) return;

  for (const rel of filtered) {
    const fullJsonPath = path.join(root, rel);
    if (!fs.existsSync(fullJsonPath)) {
      console.warn("Skipping (JSON file not found):", rel);
      continue;
    }

    if (hasNullBytes(fullJsonPath)) {
      console.warn("Skipping (JSON file contains null bytes; likely non-UTF8):", rel);
      continue;
    }

    console.log("=== Running helpers for:", rel, "===");

    if (runDevplan) {
      console.log("-> update-wikipedia-list-coverage-in-devplan.js");
      if (isNonCanonicalList(rel)) {
        console.warn("Skipping devplan snapshot update for non-canonical seed/subset/major list:", rel);
      } else {
        runNodeScript("update-wikipedia-list-coverage-in-devplan.js", [rel, devplanRel]);
      }
    }

    if (runBaseUniq) {
      console.log("-> report-wikipedia-list-base-uniqueness.js");
      runNodeScript("report-wikipedia-list-base-uniqueness.js", [rel, "--no-devplan"]);
    }
  }

  if (helperErrorCount) {
    console.warn(`Completed with ${helperErrorCount} helper error(s). See logs above.`);
  }
}

if (require.main === module) {
  main();
}
