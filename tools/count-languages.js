const fs = require('fs');
const path = require('path');

const files = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js', 
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-fantasy.js'
];

let totalLanguages = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    // Count language entries by counting "i" patterns that indicate language indices
    const iMatches = content.match(/"i": \d+/g);
    if (iMatches) {
      // Each language entry has one "i" field, so count them
      const count = iMatches.length;
      totalLanguages += count;
      console.log(path.basename(file) + ': ' + count + ' language entries');
    }
  } catch (e) {
    console.log('Error reading ' + file + ': ' + e.message);
  }
});

console.log('\n--- TOTALS ---');
console.log('Total language entries: ' + totalLanguages);
console.log('Expected: 2,000-3,000 languages');
console.log('Coverage: ' + (totalLanguages / 2500 * 100).toFixed(1) + '%');
