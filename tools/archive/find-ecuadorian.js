const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== SEARCHING FOR ECUADORIAN SPANISH ===\n');

const target = namebases.find(nb => nb.name === 'Ecuadorian Spanish');

if (target) {
  console.log(`Found at index: ${target.i}`);
  console.log(`Name: ${target.name}`);
  console.log(`Bases: ${target.b}`);
  console.log(`Cities count: ${target.b.split(',').length}`);
} else {
  console.log('Not found Ecuadorian Spanish');
  
  // Try partial match
  const partial = namebases.filter(nb => nb.name.includes('Ecuadorian'));
  console.log(`\nPartial matches for "Ecuadorian":`);
  partial.slice(0, 10).forEach(nb => console.log(`  - ${nb.name}`));
}
