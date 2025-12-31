"use strict";

const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = content.split('\n');

console.log('\n=== SEARCHING FOR SPECIFIC ISSUES ===\n');

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (line.includes('Big Flowery')) {
    console.log(`Line ${lineNum}: ${line.substring(0, 100)}...`);
  }
  if (line.includes('BPh')) {
    console.log(`Line ${lineNum}: ${line.substring(0, 100)}...`);
  }
  if (line.includes('name: "Bum')) {
    console.log(`Line ${lineNum}: ${line.substring(0, 100)}...`);
  }
  if (line.includes('name: "Ita')) {
    console.log(`Line ${lineNum}: ${line.substring(0, 100)}...`);
  }
});
