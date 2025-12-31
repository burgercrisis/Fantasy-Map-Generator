#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read namebases-real.js
const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
const content = fs.readFileSync(namebasePath, 'utf-8');

// Parse to find Primus-only languages
const primusLanguages = [];
const lines = content.split('\n');

for (const line of lines) {
  const match = line.match(/\{ name: "([^"]+)".*?b: "([^"]+)"/);
  if (match) {
    const base = match[2];
    if (base === 'Primus') {
      primusLanguages.push(match[1]);
    }
  }
}

console.log('Primus-only languages requiring replacement: ' + primusLanguages.length);

// Group by research priority
const highPriority = [
  'Matlatzinca', 'Mixtec', 'Otomi', 'Zapotec', 
  'Nahuatl', 'Maya', 'Comanche', 'Hopi', 'Shoshoni'
];

const mediumPriority = [
  'Simaa', 'Tonga Malawi', 'Tshivenda', 'Venda',
  'Gobasi', 'Goemai', 'Goguryeo', 'Goji', 'Gola',
  'Sebat Bet', 'Ulbara', 'Wolane', 'Mesmes', 'Mesqan', 'Muher', 'Mayo'
];

const suspiciousNames = [
  'Riang', 'BPh', 'Big Flowery',
  'Cavinea', 'Yuracare', 'Bor Chadic language',
  'Bole Chadic language', 'Guambiano', 'Fulnio', 
  'Nivaclé', 'Bodish', 'Ginuman', 'Kachi Koli', 'Gujari', 'Glavda language'
];

console.log('\nHigh Priority (Major indigenous languages with documented ranges):');
highPriority.forEach(lang => {
  if (primusLanguages.includes(lang)) {
    console.log('  - ' + lang);
  }
});

console.log('\nMedium Priority (Regional languages):');
mediumPriority.forEach(lang => {
  if (primusLanguages.includes(lang)) {
    console.log('  - ' + lang);
  }
});

console.log('\nSuspicious Names (possibly fake/typos):');
suspiciousNames.forEach(lang => {
  if (primusLanguages.includes(lang)) {
    console.log('  - ' + lang);
  }
});

console.log('\nRecommended Actions:');
console.log('1. Delete suspicious/fake language entries');
console.log('2. Replace high priority languages with authentic placenames');
console.log('3. Verify medium priority languages are real');
console.log('4. Fix UTF-8 Mojibake encoding issues');
console.log('5. Run verification scripts after changes');

// Generate batch replacement commands for high priority languages
console.log('\nSample Research Tasks for High Priority Languages:');
highPriority.slice(0, 5).forEach((lang, i) => {
  if (primusLanguages.includes(lang)) {
    console.log(`Task ${i + 1}: ${lang}`);
    console.log(`  Research: https://www.ethnologue.com/language/${lang.toLowerCase()}`);
    console.log(`  Research: https://en.wikipedia.org/wiki/${lang}`);
  }
});
