"use strict";

const fs = require("fs");

// Read the Asia namebase file
const asiaFile = "modules/namebases-asia.js";
let content = fs.readFileSync(asiaFile, "utf8");

const fixes = [
  // Encoding fixes
  { pattern: /â•¦Ã‡Azd dialect /g, replacement: "ƁAzd dialect" },
  { pattern: /â”¼â•—ejtun dialect /g, replacement: "Ħejtun dialect" },
  
  // Trailing space removals (specific patterns)
  { pattern: /"â•¦Ã‡Azd dialect "/g, replacement: "\"ƁAzd dialect\"" },
  { pattern: /"â”¼â•—ejtun dialect "/g, replacement: "\"Ħejtun dialect\"" },
  { pattern: /"A Ou "/g, replacement: "\"A Ou\"" },
  { pattern: /"Abba Gorgoryos "/g, replacement: "\"Abba Gorgoryos\"" },
];

// Apply fixes
let fixCount = 0;
for (const fix of fixes) {
  const matches = content.match(fix.pattern);
  if (matches) {
    fixCount += matches.length;
    content = content.replace(fix.pattern, fix.replacement);
  }
}

// Also remove trailing spaces from language names
const namePattern = /"name": "([^"]+) "/g;
let match;
const trailingSpaces = [];
while ((match = namePattern.exec(content)) !== null) {
  trailingSpaces.push(match[1]);
}

if (trailingSpaces.length > 0) {
  console.log("Languages with trailing spaces found:");
  trailingSpaces.forEach(name => console.log(`  - ${name}`));
}

// Remove all trailing spaces from language names
content = content.replace(/"name": "([^"]+) "/g, '"name": "$1"');

// Write back
fs.writeFileSync(asiaFile, content, "utf8");

console.log(`\nFixed ${fixCount} encoding issues`);
console.log(`Removed trailing spaces from ${trailingSpaces.length} language names`);
console.log("\nFile updated successfully!");
