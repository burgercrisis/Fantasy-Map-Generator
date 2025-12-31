const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let primusCount = 0;
let primusLines = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('b: "Primus"')) {
    primusCount++;
    primusLines.push({ line: i + 1, content: lines[i].trim() });
  }
}

console.log(`Total Primus entries in file: ${primusCount}`);

if (primusLines.length > 0 && primusLines.length <= 30) {
  console.log('\nPrimus entries:');
  primusLines.forEach(p => {
    console.log(`Line ${p.line}: ${p.content.substring(0, 80)}`);
  });
} else if (primusLines.length > 30) {
  console.log('\nFirst 20 Primus entries:');
  primusLines.slice(0, 20).forEach(p => {
    console.log(`Line ${p.line}: ${p.content.substring(0, 80)}`);
  });
}