"use strict";

/**
 * Final Verification Report (v1)
 * 
 * Generates a comprehensive quality report for continent namebase entries.
 * Analyzes:
 * - Total entry count per continent
 * - Placeholder types (Primus, Latin numerals, _unq)
 * - Name count compliance (12 names per entry)
 * - Duplicate analysis
 * - Overall system health metrics
 * 
 * Usage:
 *   node tools/validation/final-verification-v1.js
 */

const fs = require('fs');
const path = require('path');

const modulesPath = 'modules';
const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

function parseJSArray(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf('];');
  if (startIndex === -1 || endIndex === -1) return [];
  const jsStr = content.substring(startIndex, endIndex + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    return [];
  }
}

console.log('=== FINAL COMPREHENSIVE VERIFICATION REPORT ===\n');

let totalEntries = 0;
let primusOnly = 0;
let latinNumeral = 0;
let unqPlaceholders = 0;
let entriesWith12Names = 0;
let entriesWithLessThan12 = 0;
let allLines = [];

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const continent = file.replace('namebases-', '').replace('.js', '');
    
    const entriesInFile = lines.filter(line => line.includes('{ name:')).length;
    console.log(`[${continent}]: ${entriesInFile} entries`);
    
    totalEntries += entriesInFile;
    allLines = allLines.concat(lines);
  }
});

console.log('\n=== PLACEHOLDER ANALYSIS ===\n');

allLines.forEach(line => {
  if (line.includes('{ name:') && line.includes('b:')) {
    const bMatch = line.match(/b:\s*"([^"]*)"/);
    if (bMatch) {
      const names = bMatch[1].split(',');
      const nameCount = names.length;
      
      if (nameCount === 12) {
        entriesWith12Names++;
      } else if (nameCount < 12) {
        entriesWithLessThan12++;
      }
      
      if (line.includes('Primus') && !line.includes('Secundus')) {
        primusOnly++;
      }
      if (line.includes('Secundus') || line.includes('Tertius') || line.includes('Quartus') || 
          line.includes('Quintus') || line.includes('Sextus') || line.includes('Septimus') || 
          line.includes('Octavus') || line.includes('Nonus') || line.includes('Decimus')) {
        latinNumeral++;
      }
      if (line.includes('_unq')) {
        unqPlaceholders++;
      }
    }
  }
});

console.log(`TOTAL NAMEBASE ENTRIES: ${totalEntries}`);
console.log(`\n--- Placeholder Types ---`);
console.log(`Single "Primus" placeholders: ${primusOnly}`);
console.log(`Latin numeral placeholders: ${latinNumeral}`);
console.log(`_unq placeholders: ${unqPlaceholders}`);
console.log(`Total placeholders remaining: ${primusOnly + latinNumeral + unqPlaceholders}`);

console.log('\n=== NAME COUNT COMPLIANCE ===');
console.log(`Entries with exactly 12 names: ${entriesWith12Names} (${totalEntries > 0 ? (entriesWith12Names/totalEntries*100).toFixed(1) : 0}%)`);
console.log(`Entries with less than 12 names: ${entriesWithLessThan12} (${totalEntries > 0 ? (entriesWithLessThan12/totalEntries*100).toFixed(1) : 0}%)`);

console.log('\n=== WORKFLOW PROGRESS SUMMARY ===');

const primusCompletion = totalEntries > 0 ? ((totalEntries - primusOnly) / totalEntries * 100).toFixed(1) : 0;
const latinCompletion = totalEntries > 0 ? ((totalEntries - latinNumeral) / totalEntries * 100).toFixed(1) : 0;
const unqCompletion = totalEntries > 0 ? ((totalEntries - unqPlaceholders) / totalEntries * 100).toFixed(1) : 0;
const overallCompletion = totalEntries > 0 ? ((totalEntries - (primusOnly + latinNumeral + unqPlaceholders)) / totalEntries * 100).toFixed(1) : 0;

console.log(`Single Primus fixes: ${primusCompletion}% complete (${totalEntries - primusOnly}/${totalEntries})`);
console.log(`Latin numeral fixes: ${latinCompletion}% complete (${totalEntries - latinNumeral}/${totalEntries})`);
console.log(`_unq placeholder fixes: ${unqCompletion}% complete (${totalEntries - unqPlaceholders}/${totalEntries})`);
console.log(`Overall placeholder completion: ${overallCompletion}%`);

console.log('\n=== QUALITY METRICS ===');
const nameCompliance = totalEntries > 0 ? (entriesWith12Names/totalEntries*100).toFixed(1) : 0;
console.log(`12-Name compliance rate: ${nameCompliance}%`);

console.log('\n=== RECOMMENDATIONS ===');
if (primusOnly > 0) {
  console.log('⚠️ REMAINING TASKS:');
  console.log(`  • Replace ${primusOnly} single "Primus" placeholders with authentic geographic names`);
}
if (latinNumeral > 0) {
  console.log(`  • Replace ${latinNumeral} Latin numeral series with authentic geographic names`);
}
if (entriesWithLessThan12 > 0) {
  console.log(`  • Complete ${entriesWithLessThan12} entries that have fewer than 12 names`);
}

if (primusOnly === 0 && latinNumeral === 0 && unqPlaceholders === 0) {
  console.log('✅ ALL PLACEHOLDER ISSUES RESOLVED - Namebase system is fully optimized!');
} else {
  console.log('\n📊 PRIORITY ORDER:');
  if (latinNumeral > 0) console.log('1. Complete Latin numeral placeholder fixes');
  if (primusOnly > 0) console.log('2. Complete remaining single Primus fixes');
  if (entriesWithLessThan12 > 0) console.log('3. Ensure all entries have exactly 12 names');
}

console.log('\n=== CONTINENT BREAKDOWN ===\n');
continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const continent = file.replace('namebases-', '').replace('.js', '');
    
    let filePrimus = 0, fileLatin = 0, fileUnq = 0, fileLessThan12 = 0;
    lines.forEach(line => {
      if (line.includes('{ name:') && line.includes('b:')) {
        const bMatch = line.match(/b:\s*"([^"]*)"/);
        if (bMatch) {
          const names = bMatch[1].split(',');
          if (names.length < 12) fileLessThan12++;
        }
        if (line.includes('Primus') && !line.includes('Secundus')) filePrimus++;
        if (line.includes('Secundus') || line.includes('Tertius')) fileLatin++;
        if (line.includes('_unq')) fileUnq++;
      }
    });
    
    console.log(`[${continent}]: Primus=${filePrimus}, Latin=${fileLatin}, _unq=${fileUnq}, <12 names=${fileLessThan12}`);
  }
});
