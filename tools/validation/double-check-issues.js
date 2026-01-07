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

console.log('\n=== SEARCHING FOR ISSUES ===\n');

let hasBigFlowery = false;
let hasBPh = false;
let totalEntries = 0;
let primusCount = 0;
const issuesByContinent = {};

for (const filePath of CONTINENT_FILES) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const continent = path.basename(filePath, '.js').replace('namebases-', '');
  const lines = content.split('\n');

  issuesByContinent[continent] = { bigFlowery: false, bph: false, lines: [] };

  lines.forEach((line, idx) => {
    if (line.includes('Flowery')) {
      hasBigFlowery = true;
      issuesByContinent[continent].bigFlowery = true;
      issuesByContinent[continent].lines.push({ line: idx + 1, content: line.trim() });
    }
    if (line.includes('name: "BPh') || line.includes('name: "Bph')) {
      hasBPh = true;
      issuesByContinent[continent].bph = true;
      issuesByContinent[continent].lines.push({ line: idx + 1, content: line.trim() });
    }
  });

  const entries = lines.filter(l => l.includes('{ name:'));
  totalEntries += entries.length;

  const primusMatches = content.match(/Primus/g);
  primusCount += primusMatches ? primusMatches.length : 0;
}

for (const [continent, data] of Object.entries(issuesByContinent)) {
  if (data.lines.length > 0) {
    console.log(`\n--- ${continent} ---`);
    data.lines.forEach(item => {
      console.log(`Line ${item.line}: ${item.content.substring(0, 80)}`);
    });
  }
}

console.log('\n=== RESULTS ===\n');
console.log(`Has Big Flowery: ${hasBigFlowery}`);
console.log(`Has BPh: ${hasBPh}`);
console.log(`Total entries: ${totalEntries}`);
console.log(`Primus placeholders: ${primusCount}`);
