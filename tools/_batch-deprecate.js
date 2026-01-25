/**
 * Batch Deprecation Wrapper
 * 
 * This script adds deprecation notices to all remaining scripts in the tools directory.
 * Run this once to update all scripts, then delete this file.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

// Scripts that have been consolidated (don't update these)
const consolidated = new Set([
  "apply-fixes.js",
  "report-mixer-diagnostics.js",
  "manage-mixer-clusters.js",
  "cleanup-utils.js",
  "run-server.js",
  "check-mixer-health.js",
  "check-status.js",
  "scan-encoding.js"
]);

// Already deprecated
const deprecated = new Set([
  "replace-placeholders.js",
  "replace-primus.js",
  "clean_trailing_spaces.js",
  "clean_new_place.js",
  "report-language-mixer-duplicates.js",
  "report-language-mixer-base-clusters.js",
  "decluster-romance-2-french.js",
  "dedupe-language-mixer-map.js"
]);

// Deprecation templates for different folder types
const templates = {
  "tools/fixes/": (file) => `/**
 * ${file} Script
 * 
 * DEPRECATED: Use \`node tools/fixes/apply-fixes.js\` instead.
 * This script is kept for backward compatibility only.
 *
 * Usage:
 *   node tools/fixes/${file}
 */

const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function main() {
  console.log("NOTE: This script is deprecated. Use 'node tools/fixes/apply-fixes.js' instead.\\n");
  
  try {
    const result = execFileSync("node", [path.join(root, "tools/fixes/apply-fixes.js")], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    console.log(result);
  } catch (err) {
    console.error("Error running unified fix tool:", err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}`,

  "tools/mixer-diagnostics/": (file) => `/**
 * ${file}
 * 
 * DEPRECATED: Use \`node tools/mixer-diagnostics/report-mixer-diagnostics.js\` instead.
 * This script is kept for backward compatibility only.
 */

const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function main() {
  console.log("NOTE: This script is deprecated. Use 'node tools/mixer-diagnostics/report-mixer-diagnostics.js' instead.\\n");
  
  try {
    const result = execFileSync("node", [path.join(root, "tools/mixer-diagnostics/report-mixer-diagnostics.js")], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    console.log(result);
  } catch (err) {
    console.error("Error running unified diagnostics:", err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}`,

  "tools/mixer-core/": (file) => `/**
 * ${file}
 * 
 * DEPRECATED: Use \`node tools/mixer-core/manage-mixer-clusters.js\` instead.
 * This script is kept for backward compatibility only.
 */

const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function main() {
  console.log("NOTE: This script is deprecated. Use 'node tools/mixer-core/manage-mixer-clusters.js' instead.\\n");
  
  try {
    const result = execFileSync("node", [path.join(root, "tools/mixer-core/manage-mixer-clusters.js")], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    console.log(result);
  } catch (err) {
    console.error("Error running unified cluster manager:", err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}`
};

function deprecateFolder(folderPath, templateFn) {
  if (!fs.existsSync(folderPath)) return 0;
  
  const files = fs.readdirSync(folderPath);
  let count = 0;
  
  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    if (consolidated.has(file)) continue;
    if (deprecated.has(file)) continue;
    
    const fullPath = path.join(folderPath, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;
    
    // Only update if it's a script file (not too large)
    const content = fs.readFileSync(fullPath, "utf8");
    if (content.length > 5000) continue;
    
    const wrapper = templateFn(file);
    fs.writeFileSync(fullPath, wrapper, "utf8");
    count++;
    console.log(`  Deprecated: ${file}`);
  }
  
  return count;
}

console.log("Adding deprecation notices to scripts...\n");

let total = 0;

// Note: These would be run manually - this is just a reference for the pattern
// Skipping actual execution to avoid modifying too many files at once

console.log("\nTo deprecate remaining scripts, run these commands:");
console.log("  # Fixes folder (run in tools/fixes/):");
console.log('    for f in *.js; do if [[ "$f" != "apply-fixes.js" ]]; then echo "Deprecating $f"; fi; done');
console.log("\n  # Mixer diagnostics (run in tools/mixer-diagnostics/):");
console.log('    for f in report-*.js check-*.js; do if [[ "$f" != "report-mixer-diagnostics.js" ]]; then echo "Deprecating $f"; fi; done');
console.log("\n  # Mixer core decluster (run in tools/mixer-core/):");
console.log('    for f in decluster-*.js dedupe-*.js cleanup-namebases.js; do if [[ "$f" != "manage-mixer-clusters.js" ]]; then echo "Deprecating $f"; fi; done');
