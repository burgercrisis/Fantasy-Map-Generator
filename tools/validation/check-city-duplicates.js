"use strict";

/**
 * City Duplicate Detection Script
 *
 * Identifies namebase entries with excessive or duplicate city names in the 'b' field.
 * Flags entries that may have data quality issues requiring cleanup.
 *
 * Usage:
 *   node tools/validation/check-city-duplicates.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const modulesPath = path.join(__dirname, '..', '..', 'modules');

function parseJSArray(content) {
  const start = content.indexOf('[');
  const end = content.lastIndexOf('];');
  if (start === -1 || end === -1) return [];
  const jsStr = content.slice(start, end + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    return [];
  }
}

const problematicEntries = [];

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = parseJSArray(content);

    entries.forEach(entry => {
      if (entry && entry.b) {
        const cities = entry.b.split(',');
        const uniqueCities = new Set(cities);

        if (cities.length > 12 || (cities.length > 20 && uniqueCities.size < cities.length * 0.3)) {
          problematicEntries.push({
            file,
            name: entry.name,
            totalCities: cities.length,
            uniqueCities: uniqueCities.size,
            preview: entry.b.substring(0, 100) + '...'
          });
        }
      }
    });
  }
});

console.log(`Found ${problematicEntries.length} entries with duplicate city issues:\n`);

problematicEntries.slice(0, 20).forEach((item, i) => {
  console.log(`${i + 1}. [${item.file}] "${item.name}"`);
  console.log(`   Total cities: ${item.totalCities}, Unique: ${item.uniqueCities}`);
  console.log(`   Preview: ${item.preview}\n`);
});

if (problematicEntries.length > 20) {
  console.log(`... and ${problematicEntries.length - 20} more`);
}