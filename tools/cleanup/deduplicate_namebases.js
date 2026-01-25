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

function deduplicateEntries(entries) {
  const groups = {};
  
  entries.forEach(entry => {
    if (!entry.name) return;
    const key = entry.name.trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });

  const cleaned = [];
  let droppedCount = 0;
  let keptCount = 0;
  const details = [];

  for (const name in groups) {
    const group = groups[name];
    
    if (group.length === 1) {
      cleaned.push(group[0]);
      keptCount++;
      continue;
    }

    const scored = group.map(entry => {
      let score = 0;
      
      if (entry.d === 'nic-GH' || entry.d === 'lnrt') {
        if (entry.d === 'nic-GH') score -= 50;
        if (entry.d === 'lnrt') score += 10;
      } else {
        score += 50;
      }

      if (entry.b) {
        const names = entry.b.split(',').filter(s => s.trim());
        score += names.length;
      }

      if (entry.name !== entry.name.trim()) {
        score -= 20;
      }

      // Tie-breaker: Prefer entries with valid 'b' content (not placeholder-like)
      if (entry.b && entry.b.includes('Placeholder')) score -= 100;

      return { entry, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const winner = scored[0].entry;
    // Normalize the name (remove trailing space)
    winner.name = name; 
    
    cleaned.push(winner);
    keptCount++;
    droppedCount += (group.length - 1);
    
    details.push({
      name: name,
      kept: { i: winner.i, d: winner.d, count: winner.b ? winner.b.split(',').length : 0 },
      dropped: scored.slice(1).map(s => ({ i: s.entry.i, d: s.entry.d, count: s.entry.b ? s.entry.b.split(',').length : 0 }))
    });
  }

  // Sort by index i to maintain some order
  cleaned.sort((a, b) => a.i - b.i);

  return { cleaned, droppedCount, keptCount, details };
}

async function processFile(filename) {
  const filePath = path.join(modulesDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filename} (not found)`);
    return;
  }

  console.log(`Processing ${filename}...`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract objects using regex
  // Looking for { "name": ... "b": "..." } structure
  // We use a regex that matches the standard format of these entries
  const entries = [];
  // Regex explanation:
  // \{ \s* "name" : matches start of object
  // [\s\S]*? lazy match content
  // "b" : \s* " matches b key
  // [^"]* " matches b value
  // \s* \} matches end
  // We need to be careful not to overshoot.
  // The structure seems to always have "name", "i", "min", "max", "d", "m", "b" in some order.
  // But JSON.parse on extracted strings is safer if we can isolate the {...} blocks.
  
  // Robust extraction: Find valid JSON objects starting with {"name":
  let match;
  // This regex assumes "name" is the first key, which is true for these files.
  // It matches until the closing brace.
  // Note: This relies on "b" being the last property or checking balanced braces if nested.
  // Luckily, these are flat objects. "b" is usually last.
  const regex = /\{\s*"name":[\s\S]*?\}/g;
  
  while ((match = regex.exec(content)) !== null) {
    try {
      // Try to parse the match
      const obj = JSON.parse(match[0]);
      if (obj.name && obj.i !== undefined) {
        entries.push(obj);
      }
    } catch (e) {
      // If parse fails (e.g. regex matched partial object or bad syntax), ignore or try harder
      // console.log('Failed to parse match:', match[0].substring(0, 50) + '...');
    }
  }

  if (entries.length === 0) {
    console.log(`  Error: No valid entries found in ${filename}`);
    return;
  }

  const result = deduplicateEntries(entries);
  
  if (result.droppedCount > 0) {
    console.log(`  Found ${result.droppedCount} duplicates to remove.`);
    result.details.slice(0, 10).forEach(d => { // Show first 10 details
      console.log(`    - "${d.name}": Kept i:${d.kept.i} (${d.kept.d}, ${d.kept.count}). Dropped: ${d.dropped.map(x => `i:${x.i} (${x.d})`).join(', ')}`);
    });
    if (result.details.length > 10) console.log(`    ... and ${result.details.length - 10} more.`);

    // Determine variable name
    let varName = 'unknownNameBases';
    if (filename.includes('africa')) varName = 'africaNameBases';
    else if (filename.includes('asia')) varName = 'asiaNameBases';
    else if (filename.includes('europe')) varName = 'europeNameBases';
    else if (filename.includes('northAmerica')) varName = 'northAmericaNameBases';
    else if (filename.includes('southAmerica')) varName = 'southAmericaNameBases';
    else if (filename.includes('oceania')) varName = 'oceaniaNameBases';

    // Reconstruct file content
    const newContent = `"use strict";\n\nwindow.${varName} = ${JSON.stringify(result.cleaned, null, 2)};\n`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  Saved ${filename}. Reduced from ${entries.length} to ${result.cleaned.length} entries.`);
  } else {
    console.log(`  No duplicates found in ${filename}.`);
  }
}

async function main() {
  for (const file of files) {
    await processFile(file);
  }
}

main();
