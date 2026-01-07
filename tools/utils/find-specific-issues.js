"use strict";

/**
 * Specific Issue Search Script
 *
 * Searches for known problematic entries by name patterns.
 * Used for debugging and verifying specific known issues.
 *
 * Usage:
 *   node tools/utils/find-specific-issues.js
 */

const fs = require('fs');
const path = require('path');

const namebaseFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

const searchPatterns = ['Big Flowery', 'BPh', 'Bum', 'Ita'];

console.log('\n=== SEARCHING FOR SPECIFIC ISSUES ===\n');

let totalFound = 0;

namebaseFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(content.match(/window\.\w+NameBases = (\[[\s\S]*?\]);/)?.[1] || '[]');

  entries.forEach(entry => {
    const isMatch = searchPatterns.some(p => entry.name.includes(p));
    if (isMatch) {
      console.log(`[${path.basename(filePath)}] Found: ${entry.name}`);
      totalFound++;
    }
  });
});

console.log(`\n=== FOUND ${totalFound} ISSUES ===\n`);
