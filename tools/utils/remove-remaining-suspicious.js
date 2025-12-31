"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const result = [];
let removedCount = 0;

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.includes('name: "Big Flowery"') ||
      trimmed.includes('name: "BPh"')) {
    console.log(`Removing: ${trimmed.substring(0, 60)}...`);
    removedCount++;
  } else {
    result.push(line);
  }
});

if (removedCount > 0) {
  fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  console.log(`\n✓ Removed ${removedCount} suspicious entries\n`);
} else {
  console.log('\nNo suspicious entries found\n');
}
