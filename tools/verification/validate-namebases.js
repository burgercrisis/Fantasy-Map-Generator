"use strict";

/**
 * Validate all namebase files
 * Checks JSON syntax and reports any issues
 */

const fs = require("node:fs");
const path = require("node:path");

const namebaseFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

function validateNamebase(filePath) {
  const errors = [];
  
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: "File not found" };
  }
  
  try {
    const content = fs.readFileSync(filePath, "utf8");
    
    // Check for JSON structure
    const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (!arrayMatch) {
      errors.push("No valid namebase array found");
    } else {
      try {
        JSON.parse(arrayMatch[1]);
      } catch (e) {
        errors.push(`JSON parse error: ${e.message}`);
      }
    }
    
    // Check for encoding issues
    const encodingIssues = content.match(/Ã[©¨ª âäöüñ]/g);
    if (encodingIssues) {
      errors.push(`Found ${encodingIssues.length} potential encoding issues (Ã patterns)`);
    }
    
    // Check for placeholder names
    const placeholders = content.match(/English French Spanish German Italian Portuguese/g);
    if (placeholders && placeholders.length > 10) {
      errors.push(`Found ${placeholders.length} placeholder language names`);
    }
    
    return { valid: errors.length === 0, errors };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

function main() {
  console.log("=== NAMEBASE VALIDATION ===\n");
  
  let allValid = true;
  
  for (const file of namebaseFiles) {
    const result = validateNamebase(file);
    
    if (result.valid) {
      console.log(`✅ ${path.basename(file)}`);
    } else {
      console.log(`❌ ${path.basename(file)}`);
      allValid = false;
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.errors) {
        result.errors.forEach(e => console.log(`   - ${e}`));
      }
    }
  }
  
  console.log("\n" + (allValid ? "✅ All namebases valid!" : "❌ Some namebases have issues"));
}

main();