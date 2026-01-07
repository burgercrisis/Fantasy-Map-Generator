"use strict";

/**
 * Namebase Verification Script
 *
 * Validates namebase files for index collisions and duplicate names.
 * Scans all continent-specific namebase files.
 *
 * Usage:
 *   node tools/validation/verify-namebases.js
 */

const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', '..', 'modules');
const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const allEntries = [];
const seenIndices = new Map();
const seenNames = new Map();

function parseJSArray(content) {
  const start = content.indexOf('[');
  const end = content.lastIndexOf('];');
  if (start === -1 || end === -1) return [];
  const jsStr = content.slice(start, end + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    console.error("Failed to parse array:", e);
    return [];
  }
}

continentFiles.forEach(file => {
  const filePath = path.join(modulesDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = parseJSArray(content);
    console.log(`Checking ${file}: ${entries.length} entries`);

    entries.forEach(entry => {
      if (!entry || typeof entry.i !== 'number') return;

      // Check for index collisions
      if (seenIndices.has(entry.i)) {
        console.error(`Collision: Index ${entry.i} used by "${seenIndices.get(entry.i)}" and "${entry.name}" (in ${file})`);
      } else {
        seenIndices.set(entry.i, entry.name);
      }

      // Check for duplicate names (case-insensitive)
      const lowerName = entry.name.toLowerCase();
      if (seenNames.has(lowerName)) {
        console.warn(`Duplicate Name: "${entry.name}" (index ${entry.i} in ${file}) already exists (index ${seenNames.get(lowerName)})`);
      } else {
        seenNames.set(lowerName, entry.i);
      }

      allEntries.push({ ...entry, file });
    });
  }
});

console.log(`\nTotal unique entries: ${allEntries.length}`);
console.log(`Total files processed: ${continentFiles.length}`);
if (seenIndices.size > 0) {
  console.log(`Max index: ${Math.max(...Array.from(seenIndices.keys()))}`);
} else {
  console.log(`Max index: N/A`);
}
