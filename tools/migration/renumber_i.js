const fs = require('fs');

const continents = [
  { file: 'modules/namebases-africa.js', base: 10000 },
  { file: 'modules/namebases-asia.js', base: 20000 },
  { file: 'modules/namebases-europe.js', base: 30000 },
  { file: 'modules/namebases-northAmerica.js', base: 40000 },
  { file: 'modules/namebases-southAmerica.js', base: 50000 },
  { file: 'modules/namebases-oceania.js', base: 60000 },
];

for (const { file, base } of continents) {
  const content = fs.readFileSync(file, 'utf8');
  // Extract the array part
  const arrayMatch = content.match(/window\.\w+ = (\[[\s\S]*\]);/);
  if (!arrayMatch) {
    console.error(`Could not parse array in ${file}`);
    continue;
  }
  const arrayStr = arrayMatch[1];
  const array = JSON.parse(arrayStr);
  // Renumber i fields sequentially
  array.forEach((item, index) => {
    item.i = base + index;
  });
  // Reconstruct the content
  const newArrayStr = JSON.stringify(array, null, 2);
  const newContent = content.replace(arrayMatch[0], `window.${content.match(/window\.(\w+)/)[1]} = ${newArrayStr};`);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Renumbered ${file} with ${array.length} entries`);
}