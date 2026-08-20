const fs = require('fs');

const content = fs.readFileSync('modules/namebases-africa.js', 'utf8');

function extractNames(entryName) {
  const regex = new RegExp('"name": "' + entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[\\s\\S]*?"b": "([^"]*)"');
  const match = content.match(regex);
  if (match) {
    const names = match[1].split(',').map(n => n.trim()).filter(n => n.length > 0);
    return names;
  }
  return [];
}

function extractEntry(entryName) {
  const regex = new RegExp('\\{\\s*"name": "' + entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[\\s\\S]*?\\},\\s*(?=\\{|\\])');
  const match = content.match(regex);
  return match ? match[0] : null;
}

const entries = ['Batu', 'Balo', 'Bangi', 'Bina', 'Tshiluba'];

entries.forEach(name => {
  const names = extractNames(name);
  console.log(`\n=== ${name} (${names.length} names) ===`);
  names.forEach((n, i) => console.log(`${i+1}. ${n}`));
});