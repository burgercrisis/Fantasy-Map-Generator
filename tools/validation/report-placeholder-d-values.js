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

console.log('\n=== PLACEHOLDER "d" VALUE ANALYSIS ===\n');

let totalLnrtCount = 0;
let totalDCount = 0;
const dCounts = {};
const dByContinent = {};

for (const filePath of CONTINENT_FILES) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const continent = path.basename(filePath, '.js').replace('namebases-', '');

  const lnrtMatches = content.match(/d:\s*"lnrt"/g);
  const lnrtCount = lnrtMatches ? lnrtMatches.length : 0;

  const dMatches = content.match(/d:\s*"[^"]*"/g);
  const dCount = dMatches ? dMatches.length : 0;

  totalLnrtCount += lnrtCount;
  totalDCount += dCount;

  dByContinent[continent] = { lnrt: lnrtCount, total: dCount };

  content.replace(/d:\s*"([^"]*)"/g, (match, d) => {
    dCounts[d] = (dCounts[d] || 0) + 1;
  });
}

console.log('=== BY CONTINENT ===\n');
for (const [continent, data] of Object.entries(dByContinent)) {
  const pct = data.total > 0 ? ((data.lnrt / data.total) * 100).toFixed(1) : '0.0';
  console.log(`${continent}: ${data.lnrt}/${data.total} lnrt (${pct}%)`);
}

console.log('\n=== OVERALL STATISTICS ===\n');
console.log(`Entries with d: "lnrt": ${totalLnrtCount}`);
console.log(`Total d entries: ${totalDCount}`);
console.log(`Percentage: ${((totalLnrtCount / totalDCount) * 100).toFixed(1)}%`);

console.log('\n=== GLOBAL d VALUE DISTRIBUTION ===\n');
Object.entries(dCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([d, count]) => {
    console.log(`  "${d}": ${count}`);
  });
