const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../../modules');
const files = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-unknown.js'
];

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
      if (obj.name && obj.i !== undefined) {
        entries.push(obj);
      }
    } catch (e) {}
  }
  return entries;
}

function main() {
  console.log('Loading all namebases...');
  const fileEntries = {};
  const allEntries = [];

  files.forEach(file => {
    const entries = extractEntries(file);
    fileEntries[file] = entries;
    entries.forEach(e => {
      e._sourceFile = file; // Tag source
      allEntries.push(e);
    });
    console.log(`  ${file}: ${entries.length} entries`);
  });

  const groups = {};
  allEntries.forEach(entry => {
    const name = entry.name.trim();
    if (!groups[name]) groups[name] = [];
    groups[name].push(entry);
  });

  let removedCount = 0;
  const newFileEntries = {};
  files.forEach(f => newFileEntries[f] = []);

  Object.keys(groups).forEach(name => {
    const group = groups[name];
    
    // Score entries
    const scored = group.map(entry => {
      let score = 0;
      if (entry.d === 'nic-GH' || entry.d === 'lnrt') {
        if (entry.d === 'nic-GH') score -= 50;
        if (entry.d === 'lnrt') score += 10;
      } else {
        score += 50;
      }
      if (entry.b) {
        score += entry.b.split(',').length;
      }
      // Prefer regional files over unknown
      if (entry._sourceFile === 'namebases-unknown.js') score -= 20;
      
      // Tie-breaker: If Asia vs Africa, maybe prefer Asia for "Mongolic"? 
      // Hard to generalize. 
      // Prefer first file in list? (Africa). 
      // Let's rely on content score.
      
      return { entry, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0].entry;
    
    if (group.length > 1) {
      // console.log(`Duplicate: ${name}. Winner: ${winner._sourceFile}. Losers: ${group.filter(e => e !== winner).map(e => e._sourceFile).join(', ')}`);
      removedCount += (group.length - 1);
    }

    // Add winner to its source file list (or NEW home? No, keep source home to avoid moving)
    // If we want to move 'Mandarin' from Africa to Asia, we need to know Asia is better.
    // The winner logic picks the *best entry*. If Asia entry is better, it picks Asia.
    // If they are identical, it picks one (stable sort?).
    // If identical, we might want to prioritize based on file list order (Africa > Asia...).
    // To fix 'Mandarin' in Africa: duplicates usually imply one is a copy.
    // If they are identical copies, score is equal.
    // If score is equal, we keep the one encountered first?
    
    // Let's just keep the winner in its ORIGINAL file.
    newFileEntries[winner._sourceFile].push(winner);
  });

  console.log(`Global deduplication complete.`);
  console.log(`  Removed ${removedCount} duplicates globally.`);

  // Write back
  files.forEach(filename => {
    const entries = newFileEntries[filename];
    // Sort by index
    entries.sort((a, b) => a.i - b.i);
    
    // Determine variable name
    let varName = 'unknownNameBases';
    if (filename.includes('africa')) varName = 'africaNameBases';
    else if (filename.includes('asia')) varName = 'asiaNameBases';
    else if (filename.includes('europe')) varName = 'europeNameBases';
    else if (filename.includes('northAmerica')) varName = 'northAmericaNameBases';
    else if (filename.includes('southAmerica')) varName = 'southAmericaNameBases';
    else if (filename.includes('oceania')) varName = 'oceaniaNameBases';

    // Remove internal _sourceFile prop
    entries.forEach(e => delete e._sourceFile);

    const newContent = `"use strict";\n\nwindow.${varName} = ${JSON.stringify(entries, null, 2)};\n`;
    fs.writeFileSync(path.join(modulesDir, filename), newContent, 'utf8');
    console.log(`  Saved ${filename}: ${entries.length} entries.`);
  });
}

main();
