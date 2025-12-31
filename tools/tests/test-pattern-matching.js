const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Test specific patterns
console.log('Testing han-samhan pattern:');
const testRegex1 = /han-samhan_\d{5}_unq\d+/g;
const matches1 = content.match(testRegex1);
console.log(`Matches with /han-samhan_\\d{5}_unq\\d+/: ${matches1 ? matches1.length : 0}`);
if (matches1) {
  console.log('First match:', matches1[0]);
}

console.log('\nTesting hayeren_modern pattern:');
const testRegex2 = /hayeren_modern_\d{5}_unq\d+/g;
const matches2 = content.match(testRegex2);
console.log(`Matches with /hayeren_modern_\\d{5}_unq\\d+/: ${matches2 ? matches2.length : 0}`);
if (matches2) {
  console.log('First match:', matches2[0]);
}

// Find lines with unq to debug
console.log('\nLines containing unq:');
const lines = content.split('\n');
let count = 0;
for (let i = 0; i < lines.length && count < 5; i++) {
  if (lines[i].includes('unq')) {
    console.log(`Line ${i}: ${lines[i].substring(0, 150)}`);
    count++;
  }
}