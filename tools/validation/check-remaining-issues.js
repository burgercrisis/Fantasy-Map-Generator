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

function getContinentName(filePath) {
  const basename = path.basename(filePath, '.js');
  const match = basename.match(/namebases-(.+)/);
  if (match) {
    const continent = match[1];
    return continent.replace(/([A-Z])/g, ' $1').trim();
  }
  return 'Unknown';
}

function readAllNamebaseFiles() {
  const allContent = {};
  let totalEntries = 0;

  for (const filePath of CONTINENT_FILES) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const continent = getContinentName(filePath);
      allContent[continent] = content;

      const entries = content.split('\n').filter(l => l.includes('{ name:'));
      totalEntries += entries.length;
    } else {
      console.log(`Warning: ${filePath} not found`);
    }
  }

  return { allContent, totalEntries };
}

console.log('\n=== CHECKING FOR REMAINING ISSUES ===\n');

const { allContent, totalEntries } = readAllNamebaseFiles();

for (const [continent, content] of Object.entries(allContent)) {
  console.log(`\n--- ${continent} ---`);

  if (content.includes('Big Flowery')) {
    console.log('✗ "Big Flowery" still exists');
  } else {
    console.log('✓ "Big Flowery" removed');
  }

  if (content.includes('BPh')) {
    console.log('✗ "BPh" still exists');
  } else {
    console.log('✓ "BPh" removed');
  }

  if (content.includes('Riangular')) {
    console.log('✗ "Riangular" still exists');
  } else {
    console.log('✓ "Riangular" removed');
  }

  const entries = content.split('\n').filter(l => l.includes('{ name:'));
  console.log(`Entries: ${entries.length}`);

  const primus = content.match(/Primus/g);
  if (primus) {
    console.log(`✗ Found ${primus.length} Primus placeholders`);
  } else {
    console.log('✓ No Primus placeholders');
  }

  const dedicated = content.match(/\(dedicated\)/g);
  if (dedicated) {
    console.log(`✗ Found ${dedicated.length} "(dedicated)" suffixes`);
  } else {
    console.log('✓ No "(dedicated)" suffixes');
  }
}

console.log(`\n=== TOTAL: ${totalEntries} entries across all continents ===\n`);
