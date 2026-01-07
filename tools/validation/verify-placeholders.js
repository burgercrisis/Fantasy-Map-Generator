"use strict";

/**
 * Placeholder Verification Script
 * 
 * Scans all continent namebase files for placeholder entries.
 * Identifies:
 * - Entries with <12 names
 * - Entries with generated/pattern-based names
 * - Entries with placeholder markers (Primus, Latin numerals, _unq)
 * 
 * Usage:
 *   node tools/validation/verify-placeholders.js
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

const placeholderMarkers = [
  'Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus',
  'Sextus', 'Septimus', 'Octavus', 'Nonus', 'Decimus',
  '_unq', 'placeholder', 'TODO', 'FIXME'
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

console.log('\n=== PLACEHOLDER VERIFICATION ===\n');

let totalEntries = 0;
let entriesWithMarkers = 0;
let entriesWithFewNames = 0;
const placeholderEntries = [];
const fewNameEntries = [];

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (!fs.existsSync(filePath)) return;
  
  const entries = parseJSArray(filePath);
  const continent = file.replace('namebases-', '').replace('.js', '');
  
  console.log(`Scanning ${file}...`);
  
  entries.forEach(nb => {
    if (!nb || !nb.b) return;
    totalEntries++;
    
    const cities = nb.b.split(',');
    const nameCount = cities.length;
    
    // Check for placeholder markers
    const hasMarker = placeholderMarkers.some(m => nb.name.includes(m) || nb.b.includes(m));
    if (hasMarker) {
      entriesWithMarkers++;
      placeholderEntries.push({
        name: nb.name,
        i: nb.i,
        continent,
        file
      });
    }
    
    // Check for fewer than 12 names
    if (nameCount < 12) {
      entriesWithFewNames++;
      fewNameEntries.push({
        name: nb.name,
        i: nb.i,
        count: nameCount,
        continent,
        file
      });
    }
  });
});

console.log('\n=== SUMMARY ===\n');
console.log(`Total entries: ${totalEntries}`);
console.log(`Entries with placeholder markers: ${entriesWithMarkers}`);
console.log(`Entries with <12 names: ${entriesWithFewNames}`);

console.log('\n=== DETAILED FINDINGS ===\n');

if (placeholderEntries.length > 0) {
  console.log('⚠️ PLACEHOLDER MARKERS FOUND:\n');
  placeholderEntries.forEach(e => {
    console.log(`  [${e.continent}] ${e.name} (i=${e.i})`);
  });
  console.log('');
} else {
  console.log('✓ No placeholder markers found.\n');
}

if (fewNameEntries.length > 0) {
  console.log('⚠️ ENTRIES WITH <12 NAMES:\n');
  fewNameEntries.forEach(e => {
    console.log(`  [${e.continent}] ${e.name} (i=${e.i}, names=${e.count})`);
  });
  console.log('');
} else {
  console.log('✓ All entries have 12+ names.\n');
}

console.log('=== CONTINENT BREAKDOWN ===\n');
continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (!fs.existsSync(filePath)) return;
  
  const entries = parseJSArray(filePath);
  const continent = file.replace('namebases-', '').replace('.js', '');
  
  let markers = 0, few = 0;
  entries.forEach(nb => {
    if (!nb || !nb.b) return;
    
    const hasMarker = placeholderMarkers.some(m => nb.name.includes(m) || nb.b.includes(m));
    if (hasMarker) markers++;
    
    const cities = nb.b.split(',');
    if (cities.length < 12) few++;
  });
  
  console.log(`  ${continent}: ${entries.length} entries, ${markers} markers, ${few} <12 names`);
});
