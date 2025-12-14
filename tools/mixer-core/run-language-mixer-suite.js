"use strict";

// Run the core language mixer maintenance tools as a small suite.
// By default it will execute:
//   - tools/fix-language-mixer-mappings.js
//   - tools/check-language-mixer-coverage.js
//   - tools/check-language-mixer-failures.js
//   - optionally tools/report-language-mixer-name-counts.js
//   - tools/generate-language-mixer.js (rebuilds mixer bundles)
// and then print a short summary of each tool's stdout.
//
// You can control which tools run and whether summaries are truncated
// via CLI flags. See --help for details.

const path = require("path");
const {execFileSync} = require("child_process");

// Run a single Node script under tools/ and capture its stdout.
// Optional extraArgs are forwarded as CLI arguments to the child script.
function runScript(relativePath, extraArgs) {
  const scriptPath = path.join(__dirname, relativePath);
  const args = [scriptPath].concat(extraArgs || []);
  try {
    return {ok: true, output: execFileSync("node", args, {encoding: "utf8"})};
  } catch (err) {
    console.error(`Error running ${relativePath}:`, err.message || err);
    if (err.stdout) console.error(String(err.stdout));
    if (err.stderr) console.error(String(err.stderr));
    process.exitCode = 1;
    const out = [err.stdout, err.stderr].filter(Boolean).map(String).join("\n");
    return {ok: false, output: out};
  }
}

// Print a heading and either a short summary (first paragraph) or full output.
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

  // Simple tooltip / help output.
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node tools/run-language-mixer-suite.js [options]\n");
    console.log(
      "Runs the core language mixer maintenance tools, regenerates the mixer bundles, and prints a summary of each.\n"
    );
    console.log("Options:");
    console.log("  --no-fix           Skip fix-language-mixer-mappings.js");
    console.log("  --no-coverage      Skip check-language-mixer-coverage.js");
    console.log("  --no-failures      Skip check-language-mixer-failures.js");
    console.log("  --full-output      Show full stdout from each tool instead of only the first paragraph");
    console.log("  --name-counts      Also run report-language-mixer-name-counts.js and include it in the summaries");
    console.log("  --name-counts-sort=FIELD  Pass --sort=FIELD to report-language-mixer-name-counts.js (implies --name-counts)");
    console.log("                         Useful fields include: unique, raw, bases, duplicates, dupRatio, iso, name, region, family, category");
    console.log("  --wiki-devplan     Refresh DEVplans/Languages-Status.md wiki list snapshots (default behavior)");
    console.log("  --no-wiki-devplan  Skip refreshing DEVplans/Languages-Status.md wiki list snapshots");
    console.log("  --wiki-filter=SUBSTR  When used with --wiki-devplan, only refresh lists whose JSON path contains SUBSTR");
    console.log("");
    console.log("Examples:");
    console.log("  node tools/run-language-mixer-suite.js");
    console.log("  node tools/run-language-mixer-suite.js --no-fix --full-output");
    console.log("  node tools/run-language-mixer-suite.js --name-counts --name-counts-sort=duplicates");
    console.log("  node tools/run-language-mixer-suite.js --wiki-devplan --wiki-filter=asia-official");
    return;
  }

  const runFix = !args.includes("--no-fix");
  const runCoverage = !args.includes("--no-coverage");
  const runFailures = !args.includes("--no-failures");
  const showFull = args.includes("--full-output");
  const hasNameCountsFlag = args.includes("--name-counts");
  const runWikiDevplan = args.includes("--wiki-devplan") || !args.includes("--no-wiki-devplan");
  const wikiFilterArg = args.find(a => a.startsWith("--wiki-filter="));

  const nameCountsSortArg = args.find(a => a.startsWith("--name-counts-sort="));
  const nameCountsSortField = nameCountsSortArg ? nameCountsSortArg.split("=")[1] : null;
  const runNameCounts = hasNameCountsFlag || !!nameCountsSortField;

  const nameCountsArgs = [];
  if (nameCountsSortField) {
    nameCountsArgs.push("--sort=" + nameCountsSortField);
  }

  const wikiDevplanArgs = ["--no-base-uniqueness"];
  if (wikiFilterArg) {
    wikiDevplanArgs.push("--filter=" + wikiFilterArg.slice("--wiki-filter=".length));
  }

  console.log("Running language mixer maintenance suite...\n");

  const fixResult = runFix ? runScript("fix-language-mixer-mappings.js") : {ok: true, output: ""};
  if (!fixResult.ok) {
    summarize("fix-language-mixer-mappings.js", fixResult.output, showFull);
    return;
  }

  const coverageResult = runCoverage ? runScript("check-language-mixer-coverage.js") : {ok: true, output: ""};
  if (!coverageResult.ok) {
    summarize("check-language-mixer-coverage.js", coverageResult.output, showFull);
    return;
  }

  const failuresResult = runFailures ? runScript("check-language-mixer-failures.js") : {ok: true, output: ""};
  if (!failuresResult.ok) {
    summarize("check-language-mixer-failures.js", failuresResult.output, showFull);
    return;
  }

  const nameCountsResult = runNameCounts
    ? runScript("report-language-mixer-name-counts.js", nameCountsArgs)
    : {ok: true, output: ""};
  if (!nameCountsResult.ok) {
    summarize("report-language-mixer-name-counts.js", nameCountsResult.output, showFull);
    return;
  }

  const generateResult = runScript("generate-language-mixer.js");
  if (!generateResult.ok) {
    summarize("generate-language-mixer.js", generateResult.output, showFull);
    return;
  }

  const wikiDevplanResult = runWikiDevplan
    ? runScript("run-wikipedia-list-helpers.js", wikiDevplanArgs)
    : {ok: true, output: ""};
  if (!wikiDevplanResult.ok) {
    summarize("run-wikipedia-list-helpers.js", wikiDevplanResult.output, showFull);
    return;
  }

  console.log("\n=== Combined summaries ===\n");
  if (runFix) summarize("fix-language-mixer-mappings.js", fixResult.output, showFull);
  if (runCoverage) summarize("check-language-mixer-coverage.js", coverageResult.output, showFull);
  if (runFailures) summarize("check-language-mixer-failures.js", failuresResult.output, showFull);
  if (runNameCounts) summarize("report-language-mixer-name-counts.js", nameCountsResult.output, showFull);
  summarize("generate-language-mixer.js", generateResult.output, showFull);
  if (runWikiDevplan) summarize("run-wikipedia-list-helpers.js", wikiDevplanResult.output, showFull);
}

if (require.main === module) {
  main();
}
