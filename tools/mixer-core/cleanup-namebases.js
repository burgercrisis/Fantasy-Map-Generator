const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the array content
const startMarker = 'window.realWorldNameBases = [';
const endMarker = '];';
const startIndex = content.indexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find array in namebases-real.js');
  process.exit(1);
}

const arrayContent = content.substring(startIndex + startMarker.length, endIndex);

// Parse entries manually because they are not valid JSON (JS objects)
const entries = [];
const entryRegex = /\{name: "([^"]+)", i: (\d+),[^}]+\}/g;
let match;
while ((match = entryRegex.exec(arrayContent)) !== null) {
  entries.push({
    full: match[0],
    name: match[1],
    index: parseInt(match[2])
  });
}

console.log(`Found ${entries.length} entries.`);

// Deduplicate by name and index
const uniqueNames = new Set();
const uniqueIndices = new Set();
const cleanedEntries = [];

for (const entry of entries) {
  // We want to keep the "dedicated" entries but avoid duplicates
  // If we find a duplicate index, we'll keep the first one unless the second one is "more" dedicated?
  // Actually, let's just keep the first occurrence of each index and each name.
  
  if (!uniqueNames.has(entry.name) && !uniqueIndices.has(entry.index)) {
    cleanedEntries.push(entry.full);
    uniqueNames.add(entry.name);
    uniqueIndices.add(entry.index);
  } else {
    console.log(`Skipping duplicate: ${entry.name} (${entry.index})`);
  }
}

console.log(`Cleaned entries: ${cleanedEntries.length}`);

const newArrayContent = '\n    ' + cleanedEntries.join(',\n    ') + '\n';
const newContent = content.substring(0, startIndex + startMarker.length) + newArrayContent + content.substring(endIndex);

fs.writeFileSync(filePath, newContent);
console.log('Successfully cleaned namebases-real.js');
