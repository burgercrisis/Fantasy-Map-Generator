"use strict";

/**
 * Click Language Entry Restorer
 * 
 * Restores corrupted click language entries in the Africa continent namebase file.
 * Fetches original entries from a known good git commit and replaces corrupted versions.
 * Click languages are primarily African languages.
 * 
 * Usage:
 *   node tools/utils/restore-click-namebases.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AFRICA_FILE = path.resolve(__dirname, '..', 'modules', 'namebases-africa.js');

const corruptedEntries = [
  "Kx'a Click A",
  "Kx'a Click B", 
  "Kx'a Click C",
  "Taa Click",
  "Nǁng Click",
  "Nama Click",
  "Naro Click",
  "Gǁui Click",
  "Ju/'hoan Click",
  "Hadza Click",
  "Sandawe Click"
];

console.log('Fetching good version from git...');
const goodFileContent = execSync('git show 29f000cd:modules/namebases-africa.js', { encoding: 'utf-8' });

const currentFileContent = fs.readFileSync(AFRICA_FILE, 'utf-8');

function extractEntries(content) {
  const lines = content.split('\n');
  const entries = new Map();
  
  for (const line of lines) {
    for (const name of corruptedEntries) {
      if (line.includes(`"name": "${name}"`)) {
        const startIdx = line.lastIndexOf('{');
        if (startIdx >= 0) {
          let objStr = line.substring(startIdx);
          if (objStr.endsWith('},') || objStr.endsWith('}')) {
            entries.set(name, objStr);
          }
        }
      }
    }
  }
  return entries;
}

const goodEntries = extractEntries(goodFileContent);
console.log(`Found ${goodEntries.size} good entries in git version`);

const currentLines = currentFileContent.split('\n');
const newLines = [];

for (const line of currentLines) {
  let replaced = false;
  for (const name of corruptedEntries) {
    if (line.includes(`"name": "${name}"`)) {
      const goodEntry = goodEntries.get(name);
      if (goodEntry) {
        console.log(`Restoring ${name}`);
        newLines.push(goodEntry);
        replaced = true;
        break;
      }
    }
  }
  if (!replaced) {
    newLines.push(line);
  }
}

const newContent = newLines.join('\n');
fs.writeFileSync(AFRICA_FILE, newContent, 'utf-8');
console.log('✓ Restored corrupted click language namebases in namebases-africa.js');
