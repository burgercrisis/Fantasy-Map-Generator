const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

const targetLines = [406, 426, 427, 438, 451, 468, 481, 484, 487, 488, 491, 493, 500, 506, 525, 539];

console.log('\n=== CHECKING USER-MENTIONED LINES ===\n');

const needsFixing = [];

targetLines.forEach(lineNum => {
  if (lineNum - 1 >= 0 && lineNum < namebases.length) {
    const nb = namebases[lineNum - 1];
    if (!nb || !nb.b) return;
    
    const cities = nb.b.split(',');
    const firstCity = cities[0] || '';
    const nameLower = nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    if (cities.length < 5 && firstCity.includes(nameLower + 'a,')) {
      needsFixing.push({
        line: lineNum,
        name: nb.name,
        count: cities.length,
        firstCity: firstCity,
        sample: nb.b.substring(0, 50)
      });
    }
  }
});

console.log(`\nLines checked: ${targetLines.length}`);
console.log(`Issues found: ${needsFixing.length}\n`);

if (needsFixing.length > 0) {
  console.log('\n=== ISSUES REQUIRING FIX ===\n');
  needsFixing.forEach(issue => {
    console.log(`Line ${issue.line}: ${issue.name}`);
    console.log(`  Cities: ${issue.count}`);
    console.log(`  First city: ${issue.firstCity}`);
    console.log(`  Sample: ${issue.sample}`);
  });
  console.log('');
}

if (needsFixing.length === 0) {
  console.log('✓ All user-mentioned lines already fixed!\n');
}
