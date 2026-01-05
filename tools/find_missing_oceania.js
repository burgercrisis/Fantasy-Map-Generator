const fs = require('fs');

function getEntries(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const blocks = content.match(/\{[\s\S]*?\}/g);
  const entries = [];
  if (blocks) {
    blocks.forEach(block => {
      const nameMatch = block.match(/"name":\s*"(.*?)"/);
      const indexMatch = block.match(/"i":\s*(\d+)/);
      if (nameMatch && indexMatch) {
        entries.push({ name: nameMatch[1], i: indexMatch[1], block });
      }
    });
  }
  return entries;
}

const currentOceania = getEntries('modules/namebases-oceania.js');
const backupReal = getEntries('modules/namebases-real.backup-20251228-221152.js');

const oceaniaNames = new Set(currentOceania.map(e => e.name.toLowerCase().trim()));
const oceaniaIndices = new Set(currentOceania.map(e => e.i));

// Keywords to identify Oceania languages in the backup
const keywords = ['hawaii', 'maori', 'fiji', 'tonga', 'tahiti', 'samoa', 'cook islands', 'papua', 'melanesia', 'micronesia', 'polynesia', 'tuvalu', 'vanuatu', 'nauru', 'kiribati', 'solomon', 'palau', 'guam', 'aboriginal', 'warlpiri', 'pijin', 'bislama', 'tok pisin'];

const missingFromOceania = backupReal.filter(e => {
  const name = e.name.toLowerCase();
  const isOceanic = keywords.some(k => name.includes(k));
  return isOceanic && !oceaniaNames.has(name.trim()) && !oceaniaIndices.has(e.i);
});

console.log('Missing Oceania Entries from Backup:', missingFromOceania.length);
missingFromOceania.forEach(e => {
  console.log(`${e.i}: ${e.name}`);
});
