/**
 * @fileoverview Continent Namebase File Loading Validation Test
 * @module tools/tests/test-namebases
 * 
 * @description
 * Validates that all continent namebase files can be loaded
 * without syntax errors or module resolution issues.
 * 
 * @tests
 * - File require() call execution for each continent file
 * - Error handling and exit on failure
 * - Aggregated loading validation
 * 
 * @validation
 * Ensures each continent namebase module is syntactically valid and can be
 * evaluated successfully. Exits with code 1 on any error.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const CONTINENT_FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-southAmerica.js"
];

const CONTINENT_GLOBALS = [
  "AfricaNameBases",
  "AsiaNameBases", 
  "EuropeNameBases",
  "NorthAmericaNameBases",
  "OceaniaNameBases",
  "SouthAmericaNameBases"
];

let successCount = 0;
let failCount = 0;
const errors = [];

for (let i = 0; i < CONTINENT_FILES.length; i++) {
  const file = CONTINENT_FILES[i];
  const globalName = CONTINENT_GLOBALS[i];
  
  try {
    const fullPath = path.resolve(__dirname, "..", file);
    const content = fs.readFileSync(fullPath, "utf8");
    
    const match = content.match(/window\.(\w+)NameBases\s*=\s*\[/);
    if (!match) {
      errors.push(`${file}: Missing window.${globalName} declaration`);
      failCount++;
      continue;
    }
    
    const result = eval(content);
    const globalVar = window[globalName];
    
    if (!Array.isArray(globalVar)) {
      errors.push(`${file}: ${globalName} is not an array`);
      failCount++;
      continue;
    }
    
    console.log(`SUCCESS: ${file} (${globalVar.length} entries)`);
    successCount++;
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
    failCount++;
  }
}

if (errors.length > 0) {
  console.error("\nERRORS:");
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\nSUCCESS: All ${successCount} continent files loaded without errors!`);
}
