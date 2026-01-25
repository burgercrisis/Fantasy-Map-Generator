/**
 * Comprehensive Encoding Verification Script
 * 
 * DEPRECATED: Use `node tools/encoding/scan-encoding.js --deep` instead.
 * This script is kept for backward compatibility only.
 *
 * Performs deep analysis of all namebase files for encoding issues
 *
 * Usage:
 *   node tools/encoding/comprehensive-encoding-verification.js
 */

const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function main() {
  console.log("NOTE: This script is deprecated. Use 'node tools/encoding/scan-encoding.js --deep' instead.\n");
  
  try {
    const result = execFileSync("node", [path.join(root, "tools/encoding/scan-encoding.js"), "--deep", "--scripts", "--detailed"], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    console.log(result);
  } catch (err) {
    console.error("Error running unified encoding scanner:", err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
