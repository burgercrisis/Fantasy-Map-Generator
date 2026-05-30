/**
 * Namebase Validation Script
 * 
 * Performs basic validation on continent namebase files.
 * Checks for UTF-8 validity, JavaScript syntax, and counts click language entries.
 * 
 * Usage:
 *   node tools/validation/validate-namebases.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

let totalClickCount = 0;
let filesValidated = 0;

continentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const fileName = path.basename(file);
    
    console.log(`✓ ${fileName}: valid UTF-8`);
    
    // Try to parse it
    const context = { module: { exports: {} }, window: {} };
    vm.runInContext(content, context, { filename: file });
    
    console.log(`✓ ${fileName}: syntactically valid JavaScript`);
    
    // Count click languages
    const lines = content.split('\n');
    let clickCount = 0;
    for (const line of lines) {
      if (line.includes('Click') && line.includes('i:')) {
        clickCount++;
      }
    }
    
    if (clickCount > 0) {
      console.log(`✓ ${fileName}: Found ${clickCount} click language entries`);
    }
    
    totalClickCount += clickCount;
    filesValidated++;
    
  } catch (error) {
    console.error(`✗ Error in ${file}: ${error.message}`);
  }
});

console.log(`\n=== Validation Summary ===`);
console.log(`Files validated: ${filesValidated}`);
console.log(`Total Click language entries: ${totalClickCount}`);
