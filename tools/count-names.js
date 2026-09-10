const fs = require('fs');
const continents = ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania', 'fantasy'];
let allLangs = [];
for (const c of continents) {
  const content = fs.readFileSync(`public/modules/namebases-${c}.js`, 'utf8');
  const match = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*?\]);/);
  if (match) {
    const arr = eval(match[1]);
    allLangs.push(...arr);
  }
}
let under25 = 0, under10 = 0, under5 = 0, under2 = 0, total = 0;
const details = [];
for (const nb of allLangs) {
  const names = nb.b ? nb.b.split(',').filter(n => n.trim()).length : 0;
  total++;
  if (names < 25) under25++;
  if (names < 10) under10++;
  if (names < 5) under5++;
  if (names < 2) under2++;
  if (names < 25) {
    details.push({ name: nb.name, i: nb.i, count: names });
  }
}
console.log('Total languages:', total);
console.log('Languages with <25 names:', under25);
console.log('Languages with <10 names:', under10);
console.log('Languages with <5 names:', under5);
console.log('Languages with <2 names:', under2);
console.log('\nDetails (first 50):');
details.slice(0, 50).forEach(d => console.log(`  ${d.name} (i=${d.i}): ${d.count} names`));
if (details.length > 50) {
  console.log(`  ... and ${details.length - 50} more`);
}