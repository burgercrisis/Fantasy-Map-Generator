"use strict";

// Run a read-only diagnostics suite over the language mixer configuration.
// This orchestrator wraps several existing helpers and prints a summarized
// view of their outputs so you can quickly assess mixer health without
// modifying any files.

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
    console.log("Usage: node tools/run-language-mixer-health.js [options]\n");
    console.log("Runs a read-only diagnostics suite over the language mixer catalog and mapping,\n" +
                "aggregating the outputs of several health check helpers.\n");
    console.log("By default it runs:\n" +
                "  - diff-language-families.js\n" +
                "  - check-language-mixer-coverage.js\n" +
                "  - check-language-mixer-failures.js\n" +
                "  - check-language-mixer-name-duplicates.js\n" +
                "  - report-language-mixer-duplicates.js\n" +
                "  - report-language-mixer-base-clusters.js\n");
    console.log("\nOptions:");
    console.log("  --no-family-diff     Skip diff-language-families.js");
    console.log("  --no-coverage        Skip check-language-mixer-coverage.js");
    console.log("  --no-failures        Skip check-language-mixer-failures.js");
    console.log("  --no-name-dups       Skip check-language-mixer-name-duplicates.js");
    console.log("  --no-fuzzy-dups      Skip report-language-mixer-duplicates.js");
    console.log("  --no-base-clusters   Skip report-language-mixer-base-clusters.js");
    console.log("  --full-output        Show full stdout from each tool instead of only the first paragraph");
    console.log("  --base-min-size=N    Pass --min-size=N to report-language-mixer-base-clusters.js");
    console.log("  --base-family=VALUE  Pass --family=VALUE to report-language-mixer-base-clusters.js");
    console.log("  --base-category=VAL  Pass --category=VAL to report-language-mixer-base-clusters.js");
    console.log("  --base-region=VALUE  Pass --region=VALUE to report-language-mixer-base-clusters.js");
    console.log("");
    console.log("Examples:");
    console.log("  node tools/run-language-mixer-health.js");
    console.log("  node tools/run-language-mixer-health.js --full-output");
    console.log("  node tools/run-language-mixer-health.js --base-min-size=4 --base-family=Uralic");
    return;
  }

  function findPrefixedArg(prefix) {
    return args.find(a => a.startsWith(prefix + "="));
  }

  const runFamilyDiff = !args.includes("--no-family-diff");
  const runCoverage = !args.includes("--no-coverage");
  const runFailures = !args.includes("--no-failures");
  const runNameDups = !args.includes("--no-name-dups");
  const runFuzzyDups = !args.includes("--no-fuzzy-dups");
  const runBaseClusters = !args.includes("--no-base-clusters");
  const showFull = args.includes("--full-output");

  const baseMinSizeArg = findPrefixedArg("--base-min-size");
  const baseFamilyArg = findPrefixedArg("--base-family");
  const baseCategoryArg = findPrefixedArg("--base-category");
  const baseRegionArg = findPrefixedArg("--base-region");

  const baseClustersArgs = [];
  if (baseMinSizeArg) baseClustersArgs.push("--min-size=" + baseMinSizeArg.split("=")[1]);
  if (baseFamilyArg) baseClustersArgs.push("--family=" + baseFamilyArg.split("=")[1]);
  if (baseCategoryArg) baseClustersArgs.push("--category=" + baseCategoryArg.split("=")[1]);
  if (baseRegionArg) baseClustersArgs.push("--region=" + baseRegionArg.split("=")[1]);

  console.log("Running language mixer health diagnostics...\n");

  const familyDiffOutput = runFamilyDiff ? runScript("diff-language-families.js") : "";
  const coverageOutput = runCoverage ? runScript("check-language-mixer-coverage.js") : "";
  const failuresOutput = runFailures ? runScript("check-language-mixer-failures.js") : "";
  const nameDupsOutput = runNameDups
    ? runScript("../mixer-diagnostics/check-language-mixer-name-duplicates.js")
    : "";
  const fuzzyDupsOutput = runFuzzyDups
    ? runScript("../mixer-diagnostics/report-language-mixer-duplicates.js")
    : "";
  const baseClustersOutput = runBaseClusters
    ? runScript("../mixer-diagnostics/report-language-mixer-base-clusters.js", baseClustersArgs)
    : "";

  console.log("\n=== Diagnostics summaries ===\n");
  if (runFamilyDiff) summarize("diff-language-families.js", familyDiffOutput, showFull);
  if (runCoverage) summarize("check-language-mixer-coverage.js", coverageOutput, showFull);
  if (runFailures) summarize("check-language-mixer-failures.js", failuresOutput, showFull);
  if (runNameDups) summarize("check-language-mixer-name-duplicates.js", nameDupsOutput, showFull);
  if (runFuzzyDups) summarize("report-language-mixer-duplicates.js", fuzzyDupsOutput, showFull);
  if (runBaseClusters) summarize("report-language-mixer-base-clusters.js", baseClustersOutput, showFull);
}

if (require.main === module) {
  main();
}
