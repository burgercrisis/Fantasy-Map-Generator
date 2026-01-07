"use strict";

/**
 * Namebase Entry Generator
 * 
 * Generates and appends new namebase entries to continent-based files.
 * Supports specifying which continent file to add entries to.
 * 
 * Usage:
 *   node tools/updates/update-namebases.js [continent]
 *   Example: node tools/updates/update-namebases.js africa
 *   Default: Adds to africa namebase
 */

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = {
  'africa': 'namebases-africa.js',
  'asia': 'namebases-asia.js',
  'europe': 'namebases-europe.js',
  'northamerica': 'namebases-northAmerica.js',
  'southamerica': 'namebases-southAmerica.js',
  'oceania': 'namebases-oceania.js'
};

const args = process.argv.slice(2);
const targetContinent = args[0] ? args[0].toLowerCase() : 'africa';

if (!CONTINENT_FILES[targetContinent]) {
  console.error(`Unknown continent: ${targetContinent}`);
  console.error(`Valid options: ${Object.keys(CONTINENT_FILES).join(', ')}`);
  process.exit(1);
}

const targetFile = CONTINENT_FILES[targetContinent];
const filepath = path.join(__dirname, '..', 'modules', targetFile);

if (!fs.existsSync(filepath)) {
  console.error(`File not found: ${filepath}`);
  process.exit(1);
}

const content = fs.readFileSync(filepath, 'utf-8');

// Get current max index in this continent
const entries = [];
const entryRegex = /"i":\s*(\d+)/g;
let match;
while ((match = entryRegex.exec(content)) !== null) {
  entries.push(parseInt(match[1]));
}

const currentMaxIndex = entries.length > 0 ? Math.max(...entries) : 0;
const startIdx = currentMaxIndex + 1;

console.log(`Current max index in ${targetFile}: ${currentMaxIndex}`);
console.log(`New entries will start from index: ${startIdx}`);

// Sample language data to add
const isos = [
  'new-lang-1', 'new-lang-2', 'new-lang-3', 'new-lang-4', 'new-lang-5',
  'new-lang-6', 'new-lang-7', 'new-lang-8', 'new-lang-9', 'new-lang-10',
  'new-lang-11', 'new-lang-12', 'new-lang-13', 'new-lang-14', 'new-lang-15',
  'new-lang-16', 'new-lang-17', 'new-lang-18', 'new-lang-19', 'new-lang-20',
  'new-lang-21', 'new-lang-22', 'new-lang-23', 'new-lang-24', 'new-lang-25'
];

let newEntries = '';
isos.forEach((iso, i) => {
  const idx = startIdx + i;
  const name = iso.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  
  const seeds = [];
  for (let j = 1; j <= 10; j++) {
    seeds.push(`${iso}_${idx}_seed${j}`);
  }
  const b = seeds.join(',');
  
  newEntries += `  {\n    "name": "${name}",\n    "i": ${idx},\n    "min": 4,\n    "max": 11,\n    "d": "lnrt",\n    "m": 0,\n    "b": "${b}"\n  },\n`;
});

// Remove trailing comma and add closing
newEntries = newEntries.replace(/,\n$/, '\n');

// Find insertion point (before closing ])
const insertPos = content.lastIndexOf('];');
if (insertPos !== -1) {
  const updatedContent = content.slice(0, insertPos) + ',\n' + newEntries + content.slice(insertPos);
  
  fs.writeFileSync(filepath, updatedContent);
  console.log(`\nAppended 25 entries to ${targetFile} starting from index ${startIdx}`);
} else {
  console.error('Could not find insertion point in the file');
  process.exit(1);
}
