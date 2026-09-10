const fs = require('fs');
const continents = ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania', 'fantasy'];
let allLangs = [];
for (const cont of continents) {
  const content = fs.readFileSync(`public/modules/namebases-${cont}.js`, 'utf8');
  const match = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*?\]);/);
  if (match) {
    const arr = eval(match[1]);
    arr.forEach(nb => {
      allLangs.push({...nb, continent: cont});
    });
  }
}
const lowNameLangs = [];
for (const nb of allLangs) {
  const names = nb.b ? nb.b.split(',').filter(n => n.trim()).length : 0;
  if (names <= 5) {
    lowNameLangs.push({ name: nb.name, i: nb.i, count: names, continent: nb.continent });
  }
}
lowNameLangs.sort((a, b) => a.count - b.count);
console.log('Languages with <=5 names:');
lowNameLangs.forEach(d => console.log(`  ${d.name} (i=${d.i}, ${d.continent}): ${d.count} names`));
console.log(`\nTotal: ${lowNameLangs.length} languages`);