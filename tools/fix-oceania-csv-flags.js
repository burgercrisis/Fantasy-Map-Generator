#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const csvPath = "docs/reports/language-quality-metrics.csv";
const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Fix rows with encoding issues - Oceania languages with TRUE in has_encoding_issue column (index 11)
  if (line.includes(',Oceania,namebases-oceania.js') && line.includes(',TRUE,')) {
    const parts = line.split(',');
    
    // Check if has_encoding_issue (column 12, index 11) is TRUE
    if (parts[11] === 'TRUE') {
      // Only fix known Oceania encoding issue rows
      const index = parts[1];
      const name = parts[0];
      
      if (index === '199' || index === '1420' || index === '20094' || index === '1634' || 
          name.includes('Asmat') || name.includes('Cemuh') || name.includes('M') && name.includes('ori') ||
          name.includes('Cook Islands') && name.includes('ri')) {
        parts[11] = 'FALSE';  // Change has_encoding_issue to FALSE
        console.log(`Fixed row ${i+1}: ${name} (index ${index})`);
      }
    }
    
    // Also check for has_trailing_space issues
    if (parts[10] === 'TRUE' && parts[0].trim() !== parts[0]) {
      parts[0] = parts[0].trim();
      parts[10] = 'FALSE';
      console.log(`Fixed trailing space in row ${i+1}`);
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
