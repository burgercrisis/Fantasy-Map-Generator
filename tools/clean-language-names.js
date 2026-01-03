#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Geographical descriptors to remove
const descriptors = [
  'Central', 'Eastern', 'Western', 'Northern', 'Southern', 'Upper', 'Lower',
  'North', 'South', 'East', 'West', 'Northwestern', 'Northeastern',
  'Southwestern', 'Southeastern', 'Central-Western', 'Central-Eastern'
];

// Continent files to process
const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

function cleanLanguageNames(content) {
  // Split into lines
  const lines = content.split('\n');
  const cleaned = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if this is a "b" field line
    if (line.includes('"b": "')) {
      // Extract the content between quotes
      const match = line.match(/"b": "([^"]*)"/);
      if (match) {
        let bContent = match[1];

        // Split by comma to get language name and locations
        const parts = bContent.split(',');
        if (parts.length > 0) {
          let languageName = parts[0].trim();

          // Remove geographical descriptors
          let originalName = languageName;
          for (const desc of descriptors) {
            // Remove descriptor followed by space
            languageName = languageName.replace(new RegExp(`^${desc}\\s+`, 'i'), '');
          }

          // Special handling for hyphenated descriptors
          languageName = languageName.replace(/^(Central|Eastern|Western|Northern|Southern|Upper|Lower|North|South|East|West)-\s*/i, '');

          // If the name changed, update it
          if (languageName !== originalName) {
            parts[0] = languageName;
            bContent = parts.join(',');
            line = line.replace(/"b": "[^"]*"/, `"b": "${bContent}"`);
            console.log(`  ${originalName} -> ${languageName}`);
          }
        }
      }
    }

    cleaned.push(line);
  }

  return cleaned.join('\n');
}

// Process each continent file
for (const file of continentFiles) {
  const filePath = path.join(__dirname, '../', file);

  if (fs.existsSync(filePath)) {
    console.log(`\nProcessing ${file}...`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const cleanedContent = cleanLanguageNames(content);

    if (cleanedContent !== content) {
      fs.writeFileSync(filePath, cleanedContent, 'utf-8');
      console.log(`  Updated ${file}`);
    } else {
      console.log(`  No changes needed for ${file}`);
    }
  } else {
    console.log(`  File ${file} not found`);
  }
}

console.log('\nLanguage name cleaning complete.');