"use strict";

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-fantasy.js'
];

let totalPrimusCount = 0;
const primusByContinent = {};

console.log('\n=== PRIMUS PLACEHOLDER SCAN ===\n');

for (const filePath of CONTINENT_FILES) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const continent = path.basename(filePath, '.js').replace('namebases-', '');
  const lines = content.split('\n');

  let continentPrimusCount = 0;
  const primusLines = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('b: "Primus"')) {
      continentPrimusCount++;
      primusLines.push({ line: i + 1, content: lines[i].trim() });
    }
  }

  if (continentPrimusCount > 0) {
    primusByContinent[continent] = primusLines;
    totalPrimusCount += continentPrimusCount;
  }
}

console.log(`Total Primus entries across all continents: ${totalPrimusCount}\n`);

for (const [continent, lines] of Object.entries(primusByContinent)) {
  console.log(`--- ${continent}: ${lines.length} entries ---`);
  const displayLimit = lines.length <= 30 ? lines.length : 30;
  lines.slice(0, displayLimit).forEach(p => {
    console.log(`Line ${p.line}: ${p.content.substring(0, 80)}`);
  });
  if (lines.length > 30) {
    console.log(`... and ${lines.length - 30} more`);
  }
  console.log('');
}

if (totalPrimusCount === 0) {
  console.log('✓ No Primus placeholders found in any continent file');
}
