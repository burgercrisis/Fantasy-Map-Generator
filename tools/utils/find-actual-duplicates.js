"use strict";

/**
 * Actual Duplicate City Detector
 * 
 * Identifies entries with true duplicate city names (same city repeated).
 * Distinguishes from entries with many unique cities that may be intentional.
 * Works with continent-based namebase files.
 * 
 * Usage:
 *   node tools/utils/find-actual-duplicates.js
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

function parseContinentFile(filename) {
  const filepath = path.join(__dirname, '..', 'modules', filename);
  if (!fs.existsSync(filepath)) {
    return { filename, entries: [], error: 'File not found' };
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*\[([\s\S]*?)\];?\s*$/);
  
  if (!arrayMatch) {
    return { filename, entries: [], error: 'Array pattern not found' };
  }

  const entries = [];
  const entryRegex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),/g;
  let match;
  
  while ((match = entryRegex.exec(arrayMatch[1])) !== null) {
    const fullEntryMatch = extractFullEntry(arrayMatch[1], match.index);
    if (fullEntryMatch) {
      entries.push({
        name: match[1],
        index: parseInt(match[2], 10),
        line: fullEntryMatch,
        continent: filename.replace('namebases-', '').replace('.js', '')
      });
    }
  }

  return { filename, entries, error: null };
}

function extractFullEntry(content, startIndex) {
  let depth = 0;
  let start = -1;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      if (start === -1) start = i;
      depth++;
    } else if (content[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        return content.substring(start, i + 1);
      }
    }
  }
  
  return null;
}

function findDuplicates(entries) {
  const problematicLines = [];

  entries.forEach(entry => {
    const entryData = JSON.parse(entry.line);
    if (entryData.b) {
      const cities = entryData.b.split(',');
      const uniqueCities = new Set(cities);

      if (uniqueCities.size < cities.length) {
        problematicLines.push({
          continent: entry.continent,
          lineNum: entry.index,
          name: entryData.name,
          totalCities: cities.length,
          uniqueCities: uniqueCities.size,
          duplicates: cities.length - uniqueCities.size,
          b: entryData.b
        });
      }
    }
  });

  return problematicLines;
}

console.log('Scanning continent namebase files for actual duplicate city names...\n');

let allEntries = [];
let totalFiles = 0;

for (const filename of CONTINENT_FILES) {
  const result = parseContinentFile(filename);
  if (result.entries.length > 0) {
    allEntries = allEntries.concat(result.entries);
    totalFiles++;
    console.log(`Processed ${filename}: ${result.entries.length} entries`);
  } else if (!result.error) {
    console.log(`Processed ${filename}: 0 entries`);
  }
}

console.log(`\nScanning ${allEntries.length} total entries across ${totalFiles} files...\n`);

const problematicLines = findDuplicates(allEntries);

console.log(`Found ${problematicLines.length} entries with actual duplicate city names:\n`);

problematicLines.forEach((item, i) => {
  console.log(`${i + 1}. [${item.continent}] "${item.name}" (index: ${item.lineNum})`);
  console.log(`   Total: ${item.totalCities}, Unique: ${item.uniqueCities}, Duplicates: ${item.duplicates}`);
  console.log(`   First 100 chars: ${item.b.substring(0, 100)}\n`);
});

console.log(`\nTotal problematic entries to fix: ${problematicLines.length}`);
