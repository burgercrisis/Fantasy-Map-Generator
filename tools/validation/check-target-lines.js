const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== CHECKING USER-MENTIONED LINES ===');

const targetLines = [406, 426, 427, 428, 429, 430, 434, 435, 438, 439, 4451, 468, 475, 480, 481, 488, 486, 491, 493, 497, 498, 500, 501, 506, 508, 510, 523, 525, 539, 359, 362, 393, 399, 400, 401, 402, 405, 406, 408, 411, 412, 414, 431, 433, 434, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418];

targetLines.forEach(lineNum => {
  if (lineNum < namebases.length) {
    const nb = namebases[lineNum];
    if (!nb || !nb.b) return;
    
    const cities = nb.b.split(',');
    const firstCity = cities[0] || '';
    
    if (cities.length < 5) {
      console.log(`Line ${lineNum + 1}: ${nb.name} (${cities.length} cities)`);
      console.log(`  First: ${firstCity}`);
      console.log(`  Full: ${nb.b.substring(0, 60)}...`);
    }
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Total namebases: ${namebases.length}`);
console.log(`Target lines checked: ${targetLines.length}`);
