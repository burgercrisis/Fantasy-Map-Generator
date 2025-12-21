const fs = require('fs');
const files = fs.readdirSync('modules').filter(f => f.startsWith('namebases-') && f.endsWith('.js'));
const indexMap = {};
const collisions = [];
files.forEach(f => {
  const content = fs.readFileSync('modules/' + f, 'utf8');
  const matches = [...content.matchAll(/name:\s*["']([^"']+)["'],\s*i:\s*(\d+)/g)];
  console.log(`Found ${matches.length} matches in ${f}`);
  for (const match of matches) {
    const name = match[1];
    const id = match[2];
    if (indexMap[id]) {
      collisions.push({ id, existing: indexMap[id], incoming: { name, file: f } });
    } else {
      indexMap[id] = { name, file: f };
    }
  }
});
collisions.forEach(c => console.log(`Collision at ${c.id}: ${c.existing.name} (${c.existing.file}) vs ${c.incoming.name} (${c.incoming.file})`));
