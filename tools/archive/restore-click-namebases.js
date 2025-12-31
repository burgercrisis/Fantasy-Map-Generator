const { execSync } = require('child_process');
const fs = require('fs');

// List of corrupted click language entries from the file
const corruptedEntries = [
  'Kx\'a Click A',
  'Kx\'a Click B', 
  'Kx\'a Click C',
  'Taa Click',
  'Nǁng Click',
  'Nama Click',
  'Naro Click',
  'Gǁui Click',
  'Ju/\'hoan Click',
  'Hadza Click',
  'Sandawe Click'
];

// Get good version of the file from before the bad commit
console.log('Fetching good version from git...');
const goodFileContent = execSync('git show 29f000cd:modules/namebases-real.js', { encoding: 'utf-8' });

// Get current file
const currentFileContent = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Parse both files to extract the click language entries
function extractEntries(content) {
  const lines = content.split('\n');
  const entries = new Map();
  
  for (const line of lines) {
    for (const name of corruptedEntries) {
      if (line.includes(`name: "${name}"`)) {
        // Find the full object
        const startIdx = line.lastIndexOf('{');
        if (startIdx >= 0) {
          let objStr = line.substring(startIdx);
          // Make sure we capture the closing brace
          if (objStr.endsWith('},') || objStr.endsWith('}')) {
            entries.set(name, objStr);
          }
        }
      }
    }
  }
  return entries;
}

const goodEntries = extractEntries(goodFileContent);
console.log(`Found ${goodEntries.size} good entries`);

// Now create a new version with restored entries
const currentLines = currentFileContent.split('\n');
const newLines = [];

for (const line of currentLines) {
  let replaced = false;
  for (const name of corruptedEntries) {
    if (line.includes(`name: "${name}"`)) {
      const goodEntry = goodEntries.get(name);
      if (goodEntry) {
        console.log(`Restoring ${name}`);
        newLines.push(goodEntry);
        replaced = true;
        break;
      }
    }
  }
  if (!replaced) {
    newLines.push(line);
  }
}

// Write back
const newContent = newLines.join('\n');
fs.writeFileSync('modules/namebases-real.js', newContent, 'utf-8');
console.log('✓ Restored corrupted click language namebases');
