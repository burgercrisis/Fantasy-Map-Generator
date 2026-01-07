"use strict";

/**
 * Lost Namebase Restorer
 * 
 * Restores namebase entries that were previously lost.
 * Reads from tmp/reports/root/truly_lost_namebases.txt and appends to continent-based files.
 * 
 * Usage:
 *   node tools/updates/restore_namebases.js [continent]
 *   Example: node tools/updates/restore_namebases.js africa
 *   Default: Adds to africa namebase
 */

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = {
  'africa': 'namebases-africa.js',
  'asia': 'namebases-asia.js',
  'europe': 'namebases-europe.js',
  'northamerica': 'namebases-northAmerica.js',
  'southamerica': 'namebases-southAmerica.js',
  'oceania': 'namebases-oceania.js'
};

const repoRoot = path.join(__dirname, '..', '..');
const lostFile = path.join(repoRoot, 'tmp', 'reports', 'root', 'truly_lost_namebases.txt');

const args = process.argv.slice(2);
const targetContinent = args[0] ? args[0].toLowerCase() : 'africa';

if (!CONTINENT_FILES[targetContinent]) {
  console.error(`Unknown continent: ${targetContinent}`);
  console.error(`Valid options: ${Object.keys(CONTINENT_FILES).join(', ')}`);
  process.exit(1);
}

const targetFilename = CONTINENT_FILES[targetContinent];
const targetFile = path.join(repoRoot, 'modules', targetFilename);

try {
  // Read lost namebases
  if (!fs.existsSync(lostFile)) {
    console.error(`Lost namebases file not found: ${lostFile}`);
    console.error('Please ensure the file exists at: tmp/reports/root/truly_lost_namebases.txt');
    process.exit(1);
  }

  const lostContent = fs.readFileSync(lostFile, 'utf8');
  const lostLines = lostContent.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.substring(1).trim()); // Remove the '-' prefix

  if (lostLines.length === 0) {
    console.log('No lost namebases found to restore.');
    process.exit(0);
  }

  console.log(`Found ${lostLines.length} lost namebase entries to restore.`);
  console.log(`Target continent: ${targetContinent}`);
  console.log(`Target file: ${targetFilename}`);

  // Read target file
  if (!fs.existsSync(targetFile)) {
    console.error(`Target file not found: ${targetFile}`);
    process.exit(1);
  }

  const targetContent = fs.readFileSync(targetFile, 'utf8');
  const targetLines = targetContent.split('\n');

  // Find the closing ];
  const closingIndex = targetLines.findIndex(line => line.trim() === '];');

  if (closingIndex !== -1) {
    // Convert lost entries to JSON format if needed
    const formattedEntries = lostLines.map(line => {
      // Try to parse as JSON first
      try {
        const entry = JSON.parse(line);
        return `  {\n    "name": "${entry.name}",\n    "i": ${entry.i},\n    "min": ${entry.min},\n    "max": ${entry.max},\n    "d": "${entry.d}",\n    "m": ${entry.m},\n    "b": "${entry.b}"\n  }`;
      } catch {
        // If not JSON, try to parse as old format and convert
        const nameMatch = line.match(/name:\s*"([^"]+)"/);
        const iMatch = line.match(/i:\s*(\d+)/);
        const minMatch = line.match(/min:\s*(\d+)/);
        const maxMatch = line.match(/max:\s*(\d+)/);
        const dMatch = line.match(/d:\s*"([^"]*)"/);
        const mMatch = line.match(/m:\s*([^,}]+)/);
        const bMatch = line.match(/b:\s*"([^"]+)"/);
        
        if (nameMatch && iMatch) {
          return `  {\n    "name": "${nameMatch[1]}",\n    "i": ${iMatch[1]},\n    "min": ${minMatch ? minMatch[1] : 4},\n    "max": ${maxMatch ? maxMatch[1] : 10},\n    "d": "${dMatch ? dMatch[1] : ''}",\n    "m": ${mMatch ? mMatch[1].trim() : 0},\n    "b": "${bMatch ? bMatch[1] : ''}"\n  }`;
        }
        return `  ${line}`;
      }
    });

    // Insert lost lines before the closing ];
    targetLines.splice(closingIndex, 0, ...formattedEntries.map(e => e + ','));

    // Fix the last comma (replace last "  }," with "  }")
    const lastClosingIndex = targetLines.findIndex((line, i) => 
      i > closingIndex && line.trim().startsWith('}') && line.trim().endsWith(',')
    );
    if (lastClosingIndex !== -1) {
      targetLines[lastClosingIndex] = targetLines[lastClosingIndex].replace(',', '');
    }

    fs.writeFileSync(targetFile, targetLines.join('\n'), 'utf8');
    console.log(`\nSuccessfully restored ${lostLines.length} namebases to ${targetFilename}`);
  } else {
    console.error(`Could not find the closing ]; in ${targetFile}`);
    process.exit(1);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
