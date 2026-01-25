"use strict";

/**
 * Unified Cleanup Utility
 * 
 * Consolidates cleanup scripts:
 * - clean_trailing_spaces.js
 * - clean_new_place.js
 *
 * Usage:
 *   node tools/cleanup/cleanup-utils.js --mode=spaces [--dry-run]
 *   node tools/cleanup/cleanup-utils.js --mode=new-place
 *   --mode=all              Run all cleanup operations
 *   --mode=spaces           Clean trailing spaces
 *   --mode=new-place        Clean new place entries
 *   --mode=format           Format namebase files
 *   --dry-run               Show what would be done
 *   --verbose               Show detailed output
 *   --help, -h              Show this help
 *
 * Examples:
 *   node tools/cleanup/cleanup-utils.js --mode=all --dry-run
 *   node tools/cleanup/cleanup-utils.js --mode=spaces --verbose
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const namebaseFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

// ============================================================================
// CLEANUP OPERATIONS
// ============================================================================

function cleanTrailingSpaces(options = {}) {
  const { dryRun = false, verbose = false } = options;
  let totalCleaned = 0;
  let filesModified = 0;

  for (const file of namebaseFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;
    
    // Clean trailing spaces at end of lines
    content = content.replace(/[ \t]+$/gm, "");
    
    // Clean trailing spaces before closing braces
    content = content.replace(/\s+\}/g, "}");
    
    // Clean multiple empty lines
    content = content.replace(/\n{3,}/g, "\n\n");
    
    const cleaned = originalContent.length - content.length;
    if (cleaned > 0) {
      totalCleaned += cleaned;
      filesModified++;
      if (!dryRun) {
        fs.writeFileSync(fullPath, content, "utf8");
        if (verbose) console.log(`Cleaned ${file}: ${cleaned} characters`);
      } else if (verbose) {
        console.log(`[DRY-RUN] ${file}: ${cleaned} characters would be cleaned`);
      }
    }
  }

  return { totalCleaned, filesModified };
}

function cleanNewPlace(options = {}) {
  const { dryRun = false, verbose = false } = options;
  let entriesProcessed = 0;
  let entriesModified = 0;

  for (const file of namebaseFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;
    
    // Look for "New Place" or similar placeholder patterns
    const placeholderPattern = /"name":\s*"[^"]*[Nn]ew [Pp]lace[^"]*"/g;
    const matches = content.match(placeholderPattern);
    
    if (matches) {
      entriesProcessed += matches.length;
      // Clean up new place entries (simplified)
      content = content.replace(placeholderPattern, (match) => {
        entriesModified++;
        // Replace with generic placeholder name
        return match.replace(/[Nn]ew [Pp]lace/, "Placeholder");
      });
    }

    if (content !== originalContent && !dryRun) {
      fs.writeFileSync(fullPath, content, "utf8");
      if (verbose) console.log(`Updated ${file}: ${matches ? matches.length : 0} entries`);
    } else if (verbose && matches) {
      console.log(`[DRY-RUN] ${file}: ${matches.length} entries found`);
    }
  }

  return { entriesProcessed, entriesModified };
}

function formatNamebases(options = {}) {
  const { dryRun = false, verbose = false } = options;
  let filesFormatted = 0;

  for (const file of namebaseFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;
    
    // Ensure proper formatting
    // Add consistent indentation
    content = content.replace(/\{\s*/g, "{\n    ");
    content = content.replace(/\}\s*,?\s*/g, "  },\n");
    content = content.replace(/\n\s*\n\s*\n/g, "\n\n");
    
    if (content !== originalContent) {
      filesFormatted++;
      if (!dryRun) {
        fs.writeFileSync(fullPath, content, "utf8");
        if (verbose) console.log(`Formatted ${file}`);
      } else if (verbose) {
        console.log(`[DRY-RUN] ${file}: would be formatted`);
      }
    }
  }

  return { filesFormatted };
}

function listCleanupModes() {
  console.log("\nAvailable Cleanup Modes:\n");
  console.log("  spaces      - Clean trailing spaces and formatting");
  console.log("  new-place   - Clean 'New Place' placeholder entries");
  console.log("  format      - Format namebase files");
  console.log("  all         - Run all cleanup operations\n");
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  const options = {
    mode: args.find(a => a.startsWith("--mode="))?.split("=")[1] || "all",
    dryRun: args.includes("--dry-run"),
    verbose: args.includes("--verbose"),
    help: args.includes("--help") || args.includes("-h")
  };

  if (options.help) {
    const scriptName = path.basename(__filename);
    console.log(`${scriptName} - Unified Cleanup Utility\n`);
    console.log(`Usage: node tools/cleanup/${scriptName} [options]\n`);
    listCleanupModes();
    console.log("Examples:");
    console.log(`  node tools/cleanup/${scriptName} --mode=all --dry-run`);
    console.log(`  node tools/cleanup/${scriptName} --mode=spaces --verbose`);
    return;
  }

  console.log("=== Unified Cleanup Utility ===\n");

  if (options.dryRun) {
    console.log("[DRY-RUN MODE - No changes will be made]\n");
  }

  const results = {};

  if (options.mode === "all" || options.mode === "spaces") {
    console.log("--- Cleaning Trailing Spaces ---");
    results.spaces = cleanTrailingSpaces(options);
    console.log(`Cleaned ${results.spaces.totalCleaned} characters in ${results.spaces.filesModified} files\n`);
  }

  if (options.mode === "all" || options.mode === "new-place") {
    console.log("--- Cleaning New Place Entries ---");
    results.newPlace = cleanNewPlace(options);
    console.log(`Processed ${results.newPlace.entriesProcessed} entries\n`);
  }

  if (options.mode === "all" || options.mode === "format") {
    console.log("--- Formatting Namebase Files ---");
    results.format = formatNamebases(options);
    console.log(`Would format ${results.format.filesFormatted} files\n`);
  }

  console.log("=== Summary ===");
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  }
}

module.exports = {
  cleanTrailingSpaces,
  cleanNewPlace,
  formatNamebases
};
