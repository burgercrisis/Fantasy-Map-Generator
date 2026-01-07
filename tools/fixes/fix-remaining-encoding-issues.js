"use strict";

/**
 * Fix encoding issues in namebase files
 * 
 * Common encoding patterns to fix:
 * 1. `Ã©` → `é` (e-acute)
 * 2. `Ã±` → `ñ` (n-tilde)
 * 3. `Ã§` → `ç` (c-cedilla)
 * 4. `Ã¼` → `ü` (u-umlaut)
 * 5. `Ã¶` → `ö` (o-umlaut)
 * 6. `Ã„` → `Ä` (A-umlaut)
 * 7. `â”œ` → `` (various punctuation - remove)
 * 8. Control characters
 */

const fs = require("node:fs");
const path = require("node:path");

const ENCODING_FIXES = [
  // Common UTF-8 garbled sequences
  { pattern: /Ã©/g, replacement: "é" },
  { pattern: /Ã±/g, replacement: "ñ" },
  { pattern: /Ã§/g, replacement: "ç" },
  { pattern: /Ã¼/g, replacement: "ü" },
  { pattern: /Ã¶/g, replacement: "ö" },
  { pattern: /Ã„/g, replacement: "Ä" },
  { pattern: /Ã–/g, replacement: "Ö" },
  { pattern: /Ã«/g, replacement: "ë" },
  { pattern: /Ã®/g, replacement: "î" },
  { pattern: /Ã®/g, replacement: "î" },
  { pattern: /Ã­/g, replacement: "í" },
  { pattern: /Ã³/g, replacement: "ó" },
  { pattern: /Ã¡/g, replacement: "á" },
  { pattern: /Ã /g, replacement: "à" },
  { pattern: /Ã¨/g, replacement: "è" },
  { pattern: /Ã‰/g, replacement: "É" },
  { pattern: /Ã„/g, replacement: "Ä" },
  { pattern: /Ã/g, replacement: "" }, // Incomplete sequences
  
  // Garbled punctuation and control characters
  { pattern: /â”œ/g, replacement: "" },
  { pattern: /â•”/g, replacement: "-" },
  { pattern: /â”‚/g, replacement: "," },
  { pattern: /âŒ/g, replacement: "" },
  { pattern: /â€/g, replacement: "–" },
  { pattern: /â€-/g, replacement: "–" },
  { pattern: /â€™/g, replacement: "'" },
  { pattern: /â€"œ/g, replacement: "–" },
  { pattern: /â•¦/g, replacement: "" },
  { pattern: /â•¢/g, replacement: "" },
  { pattern: /â•£/g, replacement: "" },
  { pattern: /â”œÂ®|â”œÂ¬/g, replacement: "" },
  { pattern: /â”œÃ«/g, replacement: "ê" },
  { pattern: /â”œÃ®/g, replacement: "î" },
  { pattern: /â”œÃ³/g, replacement: "ô" },
  { pattern: /â”œÃ­/g, replacement: "í" },
  { pattern: /â”œâ”‚/g, replacement: "," },
  { pattern: /â”œâ”œ/g, replacement: "-" },
  { pattern: /â”œâ”œ/g, replacement: "-" },
  { pattern: /â–'/g, replacement: "-" },
  { pattern: /â–'/g, replacement: "-" },
  { pattern: /â”œâŒ/g, replacement: "" },
  { pattern: /â”œâŒ/g, replacement: "" },
  { pattern: /â”œâ€/g, replacement: "–" },
  { pattern: /â”œÂª/g, replacement: "ê" },
  { pattern: /â”œÂ«/g, replacement: "ë" },
  { pattern: /â”œÂ®/g, replacement: "î" },
  { pattern: /â”œÂ¯/g, replacement: "ï" },
  { pattern: /â”œÂ°/g, replacement: "°" },
  { pattern: /â•—/g, replacement: "" },
  { pattern: /â•–,/g, replacement: "," },
  { pattern: /â•',/g, replacement: "," },
  { pattern: /â•'/g, replacement: "" },
  { pattern: /â•',/g, replacement: "," },
  { pattern: /â–'/g, replacement: "-" },
  { pattern: /â••,/g, replacement: "," },
  { pattern: /â••/g, replacement: "" },
  { pattern: /â”¤,/g, replacement: "," },
  { pattern: /â”¤/g, replacement: "" },
  { pattern: /â€/g, replacement: "–" },
  { pattern: /â•'/g, replacement: "" },
  { pattern: /â•'/g, replacement: "" },
  { pattern: /â•'/g, replacement: "" },
  { pattern: /â•‘/g, replacement: "" },
  { pattern: /â–'/g, replacement: "" },
  { pattern: /â–'/g, replacement: "" },
  { pattern: /â”ž/g, replacement: "" },
  { pattern: /â”¢/g, replacement: "" },
  { pattern: /â”´/g, replacement: "" },
  { pattern: /â”§/g, replacement: "" },
  { pattern: /â”ª/g, replacement: "" },
  { pattern: /â”°/g, replacement: "" },
  { pattern: /â”±/g, replacement: "" },
  { pattern: /â”²/g, replacement: "" },
  { pattern: /â”³/g, replacement: "" },
  { pattern: /â”´/g, replacement: "" },
  { pattern: /â”µ/g, replacement: "" },
  { pattern: /â”¶/g, replacement: "" },
  { pattern: /â”·/g, replacement: "" },
  { pattern: /â”¹/g, replacement: "" },
  { pattern: /â”»/g, replacement: "" },
  { pattern: /â”¼/g, replacement: "" },
  { pattern: /â”½/g, replacement: "" },
  { pattern: /â”¾/g, replacement: "" },
  { pattern: /â”¿/g, replacement: "" },
  
  // Specific patterns found in remaining issues
  { pattern: /â€/g, replacement: "" },
  { pattern: /â–'/g, replacement: "ñ" }, // â–’ should be ñ in Coruña
  
  // Control characters
  { pattern: /\u0011/g, replacement: "" },
  { pattern: /\u001a/g, replacement: "" },
  
  // Specific name fixes
  { pattern: /BoleÎ"Ã‡Ã´Tangale/g, replacement: "Bole-Tangale" },
  { pattern: /BoleÃ‡Ã´Tangale/g, replacement: "Bole-Tangale" },
  { pattern: /BoleÃƒÂ´Tangale/g, replacement: "Bole-Tangale" },
];

// Specific corrections based on context inspection
const SPECIFIC_CORRECTIONS = [
  // Europe - Coruña should be Coruña (with ñ)
  { pattern: /A Coruâ–’a/g, replacement: "A Coruña" },
  // Europe - Santoña (valid Spanish name)
  { pattern: /Santoâ–’a/g, replacement: "Santoña" },
  // Europe - Ribeño pattern
  { pattern: /Ribereâ–’o/g, replacement: "Ribereño" },
];

function countOccurrences(str, pattern) {
  const regex = new RegExp(pattern, 'g');
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

function applyEncodingFixes(content) {
  let fixes = 0;
  let workingContent = content;
  
  for (const fix of ENCODING_FIXES) {
    const count = countOccurrences(workingContent, fix.pattern.source);
    if (count > 0) {
      fixes += count;
      workingContent = workingContent.replace(fix.pattern, fix.replacement);
    }
  }
  
  return { content: workingContent, fixes };
}

function applySpecificCorrections(content) {
  let fixes = 0;
  for (const fix of SPECIFIC_CORRECTIONS) {
    const count = countOccurrences(content, fix.pattern.source);
    if (count > 0) {
      fixes += count;
      content = content.replace(fix.pattern, fix.replacement);
    }
  }
  return { content, fixes };
}

function processFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ERROR: File not found`);
    return { success: false, fixes: 0, error: "File not found" };
  }
  
  const content = fs.readFileSync(filePath, "utf8");
  let workingContent = content;
  
  // Apply encoding fixes
  const { content: afterFixes, fixes: generalFixes } = applyEncodingFixes(workingContent);
  workingContent = afterFixes;
  
  // Apply specific corrections
  const { content: afterSpecific, fixes: specificFixes } = applySpecificCorrections(workingContent);
  workingContent = afterSpecific;
  
  const totalFixes = generalFixes + specificFixes;
  
  // Count remaining issues
  const remainingIssues = [];
  const issuePatterns = [
    { pattern: /Ã[^\s]/g, name: "Incomplete UTF-8 sequence" },
    { pattern: /â/g, name: "Garbled punctuation" },
  ];
  
  for (const issue of issuePatterns) {
    const matches = workingContent.match(issue.pattern);
    if (matches && matches.length > 0) {
      remainingIssues.push({ name: issue.name, count: matches.length });
    }
  }
  
  // Write back if content changed
  const contentChanged = workingContent !== content;
  if (contentChanged) {
    fs.writeFileSync(filePath, workingContent, "utf8");
    console.log(`  ✓ Applied ${totalFixes} fixes (${generalFixes} general + ${specificFixes} specific)`);
  } else {
    console.log(`  ✓ No changes needed`);
  }
  
  if (remainingIssues.length > 0) {
    console.log(`  ⚠ ${remainingIssues.length} issues require manual review`);
    for (const issue of remainingIssues) {
      console.log(`    - ${issue.name}: ${issue.count} occurrences`);
    }
  }
  
  return { 
    success: true, 
    fixes: totalFixes, 
    contentChanged,
    remainingIssues 
  };
}

function main() {
  const files = [
    "modules/namebases-africa.js",
    "modules/namebases-asia.js", 
    "modules/namebases-europe.js"
  ];
  
  console.log("=".repeat(60));
  console.log("Encoding Issue Fix Script for Namebase Files");
  console.log("=".repeat(60));
  
  const results = [];
  let totalFixes = 0;
  
  for (const file of files) {
    const result = processFile(file);
    results.push({ file, ...result });
    totalFixes += result.fixes || 0;
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Files processed: ${files.length}`);
  console.log(`Total fixes applied: ${totalFixes}`);
  
  for (const result of results) {
    const status = result.contentChanged ? "✓ Modified" : "○ Unchanged";
    console.log(`  ${status}: ${result.file} (${result.fixes} fixes)`);
  }
  
  return results;
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { applyEncodingFixes, applySpecificCorrections, processFile };
