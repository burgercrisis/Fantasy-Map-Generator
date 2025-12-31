const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const startLine = 2150;
const endLine = 2250;

let primusInRange = 0;

for (let i = startLine - 1; i < endLine && i < lines.length; i++) {
  if (lines[i].includes('b: "Primus"')) {
    primusInRange++;
    console.log(`Line ${i + 1}: ${lines[i].trim().substring(0, 100)}`);
  }
}

console.log(`\nPrimus entries in lines ${startLine}-${endLine}: ${primusInRange}`);

// Show some sample replacements
console.log('\n--- Sample of replacements made in range ---');
for (let i = startLine - 1; i < startLine + 10 && i < lines.length; i++) {
  if (!lines[i].includes('b: "Primus"') && lines[i].includes('b: ')) {
    console.log(`Line ${i + 1}: ${lines[i].trim().substring(0, 90)}...`);
  }
}