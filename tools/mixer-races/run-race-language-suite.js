"use strict";

// Run a small suite of race-related language diagnostics.
// This orchestrator wraps several helpers that inspect raceLanguageProfiles
// and race ↔ language coverage, and prints summarized outputs.

const path = require("path");
const {execFileSync} = require("child_process");

function runScript(relativePath, extraArgs) {
  const scriptPath = path.join(__dirname, relativePath);
  const args = [scriptPath].concat(extraArgs || []);
  try {
    return execFileSync("node", args, {encoding: "utf8"});
  } catch (err) {
    console.error(`Error running ${relativePath}:`, err.message || err);
    if (err.stdout) console.error(String(err.stdout));
    if (err.stderr) console.error(String(err.stderr));
    process.exitCode = 1;
    return "";
  }
}

function summarize(label, output, showFull) {
  console.log(`=== ${label} summary ===`);

  if (!output) {
    console.log("(no output)\n");
    return;
  }

  const trimmed = output.trim();

  if (showFull) {
    console.log(trimmed);
    console.log("");
    return;
  }

  const doubleBreakIndex = trimmed.indexOf("\n\n");
  const summary = doubleBreakIndex === -1 ? trimmed : trimmed.slice(0, doubleBreakIndex);

  console.log(summary);
  console.log("");
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node tools/run-race-language-suite.js [options]\n");
    console.log("Runs race-related language diagnostics and prints summarized outputs from:\n" +
                "  - check-race-language-profiles.js\n" +
                "  - list-race-languages.js\n" +
                "  - report-race-language-coverage.js\n");
    console.log("\nOptions:");
    console.log("  --no-profiles   Skip check-race-language-profiles.js");
    console.log("  --no-list       Skip list-race-languages.js");
    console.log("  --no-coverage   Skip report-race-language-coverage.js");
    console.log("  --full-output   Show full stdout from each tool instead of only the first paragraph");
    console.log("");
    console.log("Examples:");
    console.log("  node tools/run-race-language-suite.js");
    console.log("  node tools/run-race-language-suite.js --full-output");
    console.log("  node tools/run-race-language-suite.js --no-list");
    return;
  }

  const runProfiles = !args.includes("--no-profiles");
  const runList = !args.includes("--no-list");
  const runCoverage = !args.includes("--no-coverage");
  const showFull = args.includes("--full-output");

  console.log("Running race language diagnostics suite...\n");

  const profilesOutput = runProfiles ? runScript("check-race-language-profiles.js") : "";
  const listOutput = runList ? runScript("list-race-languages.js") : "";
  const coverageOutput = runCoverage ? runScript("report-race-language-coverage.js") : "";

  console.log("\n=== Race diagnostics summaries ===\n");
  if (runProfiles) summarize("check-race-language-profiles.js", profilesOutput, showFull);
  if (runList) summarize("list-race-languages.js", listOutput, showFull);
  if (runCoverage) summarize("report-race-language-coverage.js", coverageOutput, showFull);
}

if (require.main === module) {
  main();
}
