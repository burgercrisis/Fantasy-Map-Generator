"use strict";

const fs = require('fs');
const fileContent = fs.readFileSync('modules/namebases-real.js', 'utf8');

const arrayMatch = fileContent.match(/\[([\s\S]+)\];/s);
if (!arrayMatch) {
  console.error('Could not find array');
  process.exit(1);
}

const arrayContent = arrayMatch[1];
const entries = [];

const regex = /{ name:\s*"([^"]+)",\s*i:\s*(\d+),/g;
let match;
while ((match = regex.exec(arrayContent)) !== null) {
  entries.push({
    name: match[1],
    index: parseInt(match[2]),
    fullMatch: match[0]
  });
}

const namebases = entries.map(e => e.fullMatch);

console.log('\n=== SMALL BASES (< 5 cities) ===\n');
const smallBases = [];
entries.forEach((e, idx) => {
  const fullEntry = namebases[idx];
  const bMatch = fullEntry.match(/b:\s*"([^"]*)"/);
  if (bMatch) {
    const cities = bMatch[1].split(',');
    if (cities.length < 5 && cities.length > 0) {
      smallBases.push({name: e.name, count: cities.length, cities: bMatch[1]});
    }
  }
});

console.log(`Found ${smallBases.length} languages with < 5 cities:\n`);
smallBases.slice(0, 30).forEach(nb => {
  console.log(`- ${nb.name} (${nb.count} cities): ${nb.cities.substring(0, 60)}...`);
});

console.log('\n=== DUPLICATE INDICES ===\n');
const indexMap = {};
const duplicates = [];
entries.forEach((e, idx) => {
  if (indexMap[e.index]) {
    duplicates.push({name: e.name, index: e.index, existing: indexMap[e.index]});
  } else {
    indexMap[e.index] = e.name;
  }
});

if (duplicates.length > 0) {
  console.log(`Found ${duplicates.length} duplicate indices:\n`);
  duplicates.slice(0, 20).forEach(d => {
    console.log(`- Index ${d.index}: ${d.name} conflicts with ${d.existing}`);
  });
} else {
  console.log('No duplicate indices found\n');
}

console.log('\n=== ANALYSIS COMPLETE ===\n');
