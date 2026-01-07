/**
 * @fileoverview Pattern Matching Tests for Namebase Entry Validation
 * @module tools/tests/test-pattern-matching
 * 
 * @description
 * Validates regex patterns used to match specific language namebase entries
 * across all continent namebase files. Tests focus on verifying that
 * unique identifier patterns for han-samhan and hayeren_modern language
 * namebases are correctly recognized.
 * 
 * @tests
 * - han-samhan pattern: /han-samhan_\d{5}_unq\d+/ validates format han-samhan_XXXXX_unqN
 * - hayeren_modern pattern: /hayeren_modern_\d{5}_unq\d+/ validates format hayeren_modern_XXXXX_unqN
 * - Debug output for lines containing 'unq' substring
 * 
 * @validation
 * Confirms that regex patterns correctly match the expected unique identifier
 * format used in namebase entries. Pattern structure: [namebase]_[5 digits]_unq[number]
 */

const fs = require("fs");
const path = require("path");

const CONTINENT_FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-southAmerica.js"
];

function loadAllContent() {
  let allContent = "";
  for (const file of CONTINENT_FILES) {
    const fullPath = path.resolve(__dirname, "..", file);
    if (fs.existsSync(fullPath)) {
      allContent += fs.readFileSync(fullPath, "utf8") + "\n";
    }
  }
  return allContent;
}

const content = loadAllContent();

console.log("Testing han-samhan pattern:");
const testRegex1 = /han-samhan_\d{5}_unq\d+/g;
const matches1 = content.match(testRegex1);
console.log(`Matches with /han-samhan_\\d{5}_unq\\d+/: ${matches1 ? matches1.length : 0}`);
if (matches1 && matches1.length > 0) {
  console.log("First match:", matches1[0]);
  console.log("Last match:", matches1[matches1.length - 1]);
}

console.log("\nTesting hayeren_modern pattern:");
const testRegex2 = /hayeren_modern_\d{5}_unq\d+/g;
const matches2 = content.match(testRegex2);
console.log(`Matches with /hayeren_modern_\\d{5}_unq\\d+/: ${matches2 ? matches2.length : 0}`);
if (matches2 && matches2.length > 0) {
  console.log("First match:", matches2[0]);
  console.log("Last match:", matches2[matches2.length - 1]);
}

const lines = content.split("\n");
let unqCount = 0;
console.log("\nLines containing 'unq' (up to 5 samples):");
for (let i = 0; i < lines.length && unqCount < 5; i++) {
  if (lines[i].includes("unq")) {
    console.log(`File line ${i}: ${lines[i].substring(0, 150)}`);
    unqCount++;
  }
}

console.log("\n=== Pattern Matching Summary ===");
console.log(`Total 'unq' pattern matches: ${(matches1 ? matches1.length : 0) + (matches2 ? matches2.length : 0)}`);
