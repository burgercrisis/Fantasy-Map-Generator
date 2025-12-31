"use strict";

const fs = require('fs');

const namebasesData = fs.readFileSync('modules/namebases-real.js', 'utf8');
eval(namebasesData);
const namebases = window.realWorldNameBases;

console.log(`\n=== NAMEBASE ANALYSIS ===\n`);
console.log(`Total namebases: ${namebases.length}\n`);

// Check for duplicate indices
const indexMap = {};
const duplicates = [];
namebases.forEach((nb, i) => {
  if (indexMap[nb.i]) {
    duplicates.push({ index: nb.i, name: nb.name, existing: indexMap[nb.i] });
  } else {
    indexMap[nb.i] = nb.name;
  }
});

if (duplicates.length > 0) {
  console.log(`⚠️  DUPLICATE INDICES: ${duplicates.length}`);
  duplicates.forEach(d => {
    console.log(`   Index ${d.index}: ${d.existing} | ${d.name}`);
  });
  console.log();
}

// Check for Primus placeholders
const primus = namebases.filter(nb => nb.b && nb.b.includes('Primus'));
console.log(`Primus placeholders: ${primus.length}`);

// Check for empty bases
const emptyBases = namebases.filter(nb => !nb.b || nb.b.trim() === '');
console.log(`Empty bases: ${emptyBases.length}`);

// Check bases with only 1-2 cities (potential "losses")
const smallBases = namebases.filter(nb => {
  if (!nb.b) return true;
  const cities = nb.b.split(',');
  return cities.length < 3;
});
console.log(`Bases with < 3 cities: ${smallBases.length}`);
if (smallBases.length > 0 && smallBases.length < 20) {
  console.log(`   Examples:`);
  smallBases.slice(0, 10).forEach(nb => {
    console.log(`   - ${nb.name}: ${nb.b || '(empty)'}`);
  });
}

// Check for suspicious names
const suspicious = namebases.filter(nb =>
  nb.name.includes('BPh') ||
  nb.name.includes('Riangular') ||
  nb.name.includes('Big Flowery') ||
  nb.name.match(/^[A-Z]{3}$/) // 3-letter abbreviations
);
console.log(`Suspicious names: ${suspicious.length}`);
if (suspicious.length > 0) {
  suspicious.forEach(nb => {
    console.log(`   - ${nb.name}`);
  });
}

// Check for encoding issues
const encodingIssues = namebases.filter(nb =>
  nb.name.includes('') ||
  nb.name.match(/[^\x00-\x7F]/g) !== null
);
console.log(`Encoding issues: ${encodingIssues.length}`);

// Find languages that share identical bases
const baseMap = {};
const sharedBases = [];
namebases.forEach(nb => {
  const base = nb.b || '';
  if (base && base !== 'Primus') {
    if (baseMap[base]) {
      baseMap[base].push(nb.name);
    } else {
      baseMap[base] = [nb.name];
    }
  }
});

Object.entries(baseMap).forEach(([base, names]) => {
  if (names.length > 2) {
    sharedBases.push({ base, count: names.length, languages: names.slice(0, 3) });
  }
});

console.log(`Bases shared by 3+ languages: ${sharedBases.length}`);
if (sharedBases.length > 0) {
  console.log(`   Examples:`);
  sharedBases.slice(0, 10).forEach(item => {
    console.log(`   ${item.count} languages share: "${item.base.substring(0, 40)}..."`);
    console.log(`      ${item.languages.join(', ')}`);
  });
}

console.log(`\n=== END ANALYSIS ===\n`);
