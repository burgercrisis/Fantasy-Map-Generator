/**
 * Targeted Encoding Issues Scanner
 * 
 * DEPRECATED: Use `node tools/encoding/scan-encoding.js --mojibake` instead.
 * This script is kept for backward compatibility only.
 *
 * Looks for specific encoding problems including:
 * - Missing diacritics in expected positions
 * - Mojibake (garbled UTF-8)
 * - Inconsistent transliteration
 *
 * Usage:
 *   node tools/encoding/targeted-encoding-scanner.js
 */

const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function main() {
  console.log("NOTE: This script is deprecated. Use 'node tools/encoding/scan-encoding.js --mojibake' instead.\n");
  
  try {
    const result = execFileSync("node", [path.join(root, "tools/encoding/scan-encoding.js"), "--mojibake", "--detailed"], {
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
