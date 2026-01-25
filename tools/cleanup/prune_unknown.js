const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../../modules');
const regionalFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];
const unknownFile = 'namebases-unknown.js';

function extractEntries(filename) {
  const filePath = path.join(modulesDir, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /\{\s*"name":[\s\S]*?\}/g;
  const entries = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      const obj = JSON.parse(match[0]);
      if (obj.name) entries.push(obj);
    } catch (e) {}
  }
  return entries;
}

function main() {
  console.log('Loading regional namebases...');
  const knownNames = new Set();
  
  regionalFiles.forEach(file => {
    const entries = extractEntries(file);
    entries.forEach(e => knownNames.add(e.name.trim()));
    console.log(`  ${file}: ${entries.length} entries`);
  });

  console.log(`Total known unique names: ${knownNames.size}`);

  console.log(`Loading ${unknownFile}...`);
  const unknownEntries = extractEntries(unknownFile);
  console.log(`  ${unknownFile}: ${unknownEntries.length} entries`);

  const keptEntries = [];
  let prunedCount = 0;

  unknownEntries.forEach(entry => {
    const name = entry.name.trim();
    if (knownNames.has(name)) {
      prunedCount++;
      // Optional: Log if pruned entry was 'better' (e.g. higher score)?
      // For now, assume regional is canonical.
    } else {
      keptEntries.push(entry);
    }
  });

  console.log(`Pruning complete.`);
  console.log(`  Removed ${prunedCount} duplicates from ${unknownFile}.`);
  console.log(`  Retained ${keptEntries.length} entries.`);

  if (prunedCount > 0) {
    const filePath = path.join(modulesDir, unknownFile);
    // Sort for tidiness
    keptEntries.sort((a, b) => a.i - b.i);
    const newContent = `"use strict";\n\nwindow.unknownNameBases = ${JSON.stringify(keptEntries, null, 2)};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  Saved ${unknownFile}.`);
  }
}

main();
