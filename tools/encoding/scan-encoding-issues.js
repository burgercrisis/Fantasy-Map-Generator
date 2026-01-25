/**
 * Encoding Issues Scanner
 * 
 * DEPRECATED: Use `node tools/encoding/scan-encoding.js` instead.
 * This script is kept for backward compatibility only.
 *
 * Scans namebase files for encoding problems and identifies specific entries.
 *
 * Usage:
 *   node tools/encoding/scan-encoding-issues.js
 */

const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function main() {
  console.log("NOTE: This script is deprecated. Use 'node tools/encoding/scan-encoding.js' instead.\n");
  
  try {
    const result = execFileSync("node", [path.join(root, "tools/encoding/scan-encoding.js"), "--shallow"], {
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
