const fs = require('fs');
const path = require('path');

const files = [
  'modules/namebases-all.js',
  'modules/namebases-creole.js',
  'modules/namebases-fantasy.js',
  'modules/namebases-real.js'
];

const indexMap = {};
const collisions = [];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  // Match i: followed by numbers, but try to handle surrounding context to avoid false positives
  const matches = content.matchAll(/i:\s*(\d+)/g);
  
  for (const match of matches) {
    const id = match[1];
    const lineIndex = content.substring(0, match.index).split('\n').length;
    
    // Try to find the name: property in the same object
    // This is a bit naive but should work for the standard format
    const startOfObject = content.lastIndexOf('{', match.index);
    const endOfObject = content.indexOf('}', match.index);
    const objectContent = content.substring(startOfObject, endOfObject);
    const nameMatch = objectContent.match(/name:\s*["']([^"']+)["']/);
    const name = nameMatch ? nameMatch[1] : 'Unknown';

    if (indexMap[id]) {
      collisions.push({
        id,
        existing: indexMap[id],
        incoming: { name, file, line: lineIndex }
      });
    } else {
      indexMap[id] = { name, file, line: lineIndex };
    }
  }
});

if (collisions.length > 0) {
  console.log('--- COLLISIONS FOUND ---');
  collisions.forEach(c => {
    console.log(`Collision at index ${c.id}:`);
    console.log(`  1. ${c.existing.name} (${c.existing.file}:${c.existing.line})`);
    console.log(`  2. ${c.incoming.name} (${c.incoming.file}:${c.incoming.line})`);
  });
} else {
  console.log('No index collisions found.');
}
