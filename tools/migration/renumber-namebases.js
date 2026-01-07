"use strict";

const fs = require('fs');
const path = require('path');

// List of namebase files
const files = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

let currentIndex = 0;

files.forEach(file => {
  console.log(`Processing ${file}...`);
  const content = fs.readFileSync(file, 'utf8');

  // Extract the array
  const match = content.match(/window\.\w+ = \[([\s\S]*?)\];/);
  if (!match) {
    console.error(`No array found in ${file}`);
    return;
  }

  let arrayContent = match[1];

  // Split into entries
  const entries = arrayContent.split(/},\s*\n\s*\{/);

  for (let i = 0; i < entries.length; i++) {
    // Replace the i value
    entries[i] = entries[i].replace(/"i": \d+/, `"i": ${currentIndex}`);
    currentIndex++;
  }

  // Rejoin
  let newArrayContent = entries.join('},\n  {');

  // Replace in content
  const newContent = content.replace(/window\.\w+ = \[([\s\S]*?)\];/, (match, p1) => {
    return match.replace(p1, newArrayContent);
  });

  fs.writeFileSync(file, newContent);
  console.log(`Updated ${file} with indices ${currentIndex - entries.length} to ${currentIndex - 1}`);
});

console.log(`Total entries renumbered to ${currentIndex}`);