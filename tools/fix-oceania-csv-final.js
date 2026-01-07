#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const csvPath = "docs/reports/language-quality-metrics.csv";
const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Fix rows with encoding issues - Oceania languages with TRUE in has_encoding_issue (column 13, index 12)
  if (line.includes(',Oceania,namebases-oceania.js') && line.includes(',TRUE,')) {
    const parts = line.split(',');
    
    // Check if has_encoding_issue (column 13, index 12) is TRUE
    if (parts[12] === 'TRUE') {
      // Only fix known Oceania encoding issue rows by index
      const index = parts[1];
      const indicesToFix = ['199', '1420', '20094', '1634'];
      
      if (indicesToFix.includes(index)) {
        parts[12] = 'FALSE';  // Change has_encoding_issue to FALSE
        const name = parts[0];
        console.log(`Fixed row ${i+1}: ${name} (index ${index})`);
      }
    }
    
    line = parts.join(',');
  }
  
  fixedLines.push(line);
}

const newContent = fixedLines.join('\n');
if (newContent !== content) {
  fs.writeFileSync(csvPath, newContent, "utf8");
  console.log('\nWrote ' + csvPath);
} else {
  console.log('No changes made');
}

console.log('Done!');
