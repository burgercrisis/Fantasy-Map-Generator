"use strict";

const fs = require('fs');
const path = require('path');

const filePath = 'modules/namebases-real.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const seenIndices = new Set();
const result = [];
let duplicatesRemoved = 0;

lines.forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('"use strict"') || trimmed.startsWith('window') || trimmed === '];') {
    result.push(line);
    return;
  }

  const indexMatch = trimmed.match(/i:\s*(\d+)/);
  if (indexMatch) {
    const index = parseInt(indexMatch[1]);
    if (seenIndices.has(index)) {
      console.log(`Removing duplicate index ${index}`);
      duplicatesRemoved++;
    } else {
      seenIndices.add(index);
      result.push(line);
    }
  } else {
    result.push(line);
  }
});

const newContent = result.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`\nRemoved ${duplicatesRemoved} duplicate entries\n`);
console.log(`Original lines: ${lines.length}`);
console.log(`New lines: ${result.length}\n`);
