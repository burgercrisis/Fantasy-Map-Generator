"use strict";

eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));

const namebases = window.realWorldNameBases;
console.log('\n=== FIXING EASTERN ROMANIAN ===\n');

// Find Eastern Romanian entry
const target = namebases.find(nb => nb.name.includes('Eastern Romanian'));
if (target) {
  console.log(`Found at index ${namebases.indexOf(target)}: ${target.name}`);
  console.log(`Current cities: ${target.b.substring(0, 50)}...`);
  
  const newCities = "Iași,Bacău,Suceava,Botoșani,Iași,Craiova,Bălți,Focșani,Timișoara,Brăila";
  
  target.b = newCities;
  console.log(`\n✓ Fixed: Eastern Romanian`);
  console.log(`  New cities: ${newCities}\n`);
  
  // Write updated content back
  const newContent = fs.readFileSync('modules/namebases-real.js', 'utf8').replace(
    target.b,
    newCities
  );
  
  fs.writeFileSync('modules/namebases-real.js', newContent, 'utf8');
  console.log('✓ File saved\n');
} else {
  console.log('\n✗ Eastern Romanian not found\n');
}
