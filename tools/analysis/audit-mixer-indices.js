const fs = require('fs');
const path = require('path');

// Load all namebases
const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const namebases = {};
continentFiles.forEach(file => {
  const content = fs.readFileSync(path.join('modules', file), 'utf8');
  const match = content.match(/\[([\s\S]*?)\]/);
  if (match) {
    try {
      const bases = JSON.parse(`[${match[1]}]`);
      bases.forEach(b => {
        namebases[b.i] = b;
      });
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  }
});

// Load mixer map
const mixerMap = JSON.parse(fs.readFileSync(path.join('config', 'language-mixer-map.json'), 'utf8'));

const issues = [];

mixerMap.forEach(entry => {
  entry.bases.forEach(baseIndex => {
    if (!namebases[baseIndex]) {
      issues.push(`ISO ${entry.iso} maps to non-existent index ${baseIndex}`);
    } else {
      const base = namebases[baseIndex];
      // Check for potential misalignments
      if (entry.iso.includes('gurage') && baseIndex !== 31 && baseIndex !== 312) {
        issues.push(`ISO ${entry.iso} maps to ${base.name} (i: ${baseIndex}) but might expect Gurage (i: 31)`);
      }
      if (entry.iso.includes('harari') && baseIndex !== 312) {
        issues.push(`ISO ${entry.iso} maps to ${base.name} (i: ${baseIndex}) but might expect Harari-Argobba (i: 312)`);
      }
    }
  });
});

console.log('--- Mixer Map Audit Results ---');
issues.forEach(issue => console.log(issue));
if (issues.length === 0) console.log('No issues found.');
