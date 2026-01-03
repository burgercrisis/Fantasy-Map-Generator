#!/usr/bin/env node
"use strict";

/**
 * Fix encoding issues in continent namebase files
 * This script corrects mojibake (corrupted UTF-8) characters
 */

const fs = require("fs");
const path = require("path");

function fixEncoding(text) {
  let fixed = text;
  
  // Most common mojibake patterns
  const replacements = [
    // Basic Latin accents
    ["Ã¡", "á"], ["Ã©", "é"], ["Ã­", "í"], ["Ã³", "ó"], ["Ãº", "ú"],
    ["Ã ", "à"], ["Ã¢", "â"], ["Ã¤", "ä"], ["Ã«", "ë"], ["Ã¬", "ì"], 
    ["Ã®", "î"], ["Ã´", "ô"], ["Ã¶", "ö"], ["Ã¹", "ù"], ["Ã»", "û"],
    ["ÃŸ", "ß"], ["Ãœ", "Ü"], ["Ã¿", "ÿ"],
    
    // Spanish and Portuguese
    ["Ã±", "ñ"], ["Ã§", "ç"],
    
    // French
    ["Ã¨", "è"], ["Ã§", "ç"],
    
    // German
    ["Ã„", "Ä"], ["Ã–", "Ö"], ["Ãœ", "Ü"], ["Ã¤", "ä"], ["Ã¶", "ö"], ["Ã¼", "ü"],
    
    // Nordic languages
    ["Ã¥", "å"], ["Ã¦", "æ"], ["Ã¸", "ø"], ["Ã…", "Å"],
    
    // Common patterns found in the data
    ["Ã ", "à"], ["Ã²", "ò"], ["Ã³", "ó"], ["Ã¹", "ù"], ["Ãº", "ú"],
    
    // Special cases
    ["â€", ""], // Remove problematic smart quotes
    ["Â", ""],  // Remove problematic spaces
  ];
  
  // Apply all replacements
  for (const [corrupted, correct] of replacements) {
    fixed = fixed.split(corrupted).join(correct);
  }
  
  return fixed;
}

function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    
    // Fix encoding issues
    content = fixEncoding(content);
    
    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed encoding in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No encoding issues found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const continentFiles = [
    "modules/namebases-africa.js",
    "modules/namebases-asia.js", 
    "modules/namebases-europe.js",
    "modules/namebases-northAmerica.js",
    "modules/namebases-southAmerica.js",
    "modules/namebases-oceania.js"
  ];
  
  console.log("🔧 Fixing encoding issues in continent namebase files...\n");
  
  let fixedCount = 0;
  let totalFiles = 0;
  
  for (const file of continentFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      totalFiles++;
      if (processFile(filePath)) {
        fixedCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files with encoding fixes: ${fixedCount}`);
  console.log(`   Files unchanged: ${totalFiles - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log(`\n✅ Encoding fixes applied successfully!`);
    console.log(`   Please restart the server to see the improvements.`);
  } else {
    console.log(`\nℹ️  No encoding issues found in any files.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixEncoding };