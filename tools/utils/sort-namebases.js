"use strict";

/**
 * Continent Namebase Sorter
 * 
 * Sorts namebase entries within each continent file by index.
 * Creates backups before modifying.
 * 
 * Usage:
 *   node tools/utils/sort-namebases.js
 */

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];

function sortContinentFile(filename) {
  const filepath = path.join(__dirname, '..', 'modules', filename);
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filename}`);
    return null;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Extract array content
  const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*\[([\s\S]*?)\];?\s*$/);
  if (!arrayMatch) {
    console.error(`Could not find namebase array in ${filename}`);
    return null;
  }

  // Parse entries
  const entries = [];
  const entryRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*(\d+),\s*"max":\s*(\d+),\s*"d":\s*"([^"]*)",\s*"m":\s*([^,]+),\s*"b":\s*"([^"]*)"\s*\}/g;
  
  let match;
  while ((match = entryRegex.exec(arrayMatch[1])) !== null) {
    entries.push({
      name: match[1],
      i: parseInt(match[2]),
      min: parseInt(match[3]),
      max: parseInt(match[4]),
      d: match[5],
      m: parseFloat(match[6]),
      b: match[7]
    });
  }

  // Sort by index
  entries.sort((a, b) => a.i - b.i);

  // Check if already sorted
  const wasSorted = entries.every((e, i) => i === 0 || e.i > entries[i - 1].i);
  if (wasSorted) {
    console.log(`${filename}: Already sorted`);
    return null;
  }

  // Rebuild array
  const newArrayContent = '\n' + entries.map(e => {
    return `  {\n    "name": "${e.name}",\n    "i": ${e.i},\n    "min": ${e.min},\n    "max": ${e.max},\n    "d": "${e.d}",\n    "m": ${e.m},\n    "b": "${e.b}"\n  }`;
  }).join(',\n') + '\n';

  // Determine array variable name
  const arrayName = filename.replace('namebases-', '').replace('.js', '');
  const varName = arrayName.charAt(0).toUpperCase() + arrayName.slice(1) + 'NameBases';

  const newContent = `window.${varName} = [${newArrayContent}];\n`;

  // Create backup
  const backupFile = path.join(__dirname, '..', 'modules', `${filename}.backup-${Date.now()}`);
  fs.writeFileSync(backupFile, content);

  // Write sorted content
  fs.writeFileSync(filepath, newContent);

  return {
    filename,
    entryCount: entries.length,
    backupFile: path.basename(backupFile)
  };
}

console.log('=== Sorting Continent Namebase Files ===\n');

const results = [];
for (const filename of CONTINENT_FILES) {
  const result = sortContinentFile(filename);
  if (result) {
    results.push(result);
    console.log(`Sorted ${filename}: ${result.entryCount} entries (backup: ${result.backupFile})`);
  }
}

console.log(`\nTotal files sorted: ${results.length}`);

// Save report
if (results.length > 0) {
  fs.writeFileSync(
    path.join(__dirname, 'sort-namebases-report.json'),
    JSON.stringify(results, null, 2)
  );
  console.log(`Report saved to: sort-namebases-report.json`);
}
