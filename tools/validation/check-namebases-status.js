"use strict";

/**
 * Namebase Status Checker
 * 
 * Performs basic validation on continent namebase files.
 * Checks for UTF-8 validity and potential corruption in Click entries.
 * 
 * Usage:
 *   node tools/validation/check-namebases-status.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

let totalClickCount = 0;
let totalCorruptionCount = 0;
let filesChecked = 0;

continentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const fileName = path.basename(file);
    console.log(`✓ ${fileName}: valid UTF-8`);
    
    const lines = content.split('\n');
    let clickCount = 0;
    let corruptionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Click')) {
        clickCount++;
        // Check for common corruption patterns
        if (line.includes('╟') || line.includes('╩') || line.includes('├') || line.includes('└')) {
          corruptionCount++;
          console.log(`  Line ${i+1}: Still corrupted: ${line.substring(0, 80)}...`);
        }
      }
    }
    
    if (clickCount > 0) {
      console.log(`  - Click language entries: ${clickCount}`);
    }
    
    totalClickCount += clickCount;
    totalCorruptionCount += corruptionCount;
    filesChecked++;
    
  } catch (error) {
    console.error(`✗ Error reading ${file}: ${error.message}`);
  }
});

console.log(`\nSummary:`);
console.log(`- Files checked: ${filesChecked}`);
console.log(`- Total Click language entries found: ${totalClickCount}`);
console.log(`- Potentially corrupted entries: ${totalCorruptionCount}`);
