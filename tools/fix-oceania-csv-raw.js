#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const csvPath = "docs/reports/language-quality-metrics.csv";
const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Fix rows with encoding issues - Oceania languages with TRUE in has_encoding_issue column
  // Check if this is an Oceania row with encoding issue
  if (line.includes(',Oceania,namebases-oceania.js') && line.includes(',TRUE,')) {
    const parts = line.split(',');
    
    // Row 2299: AsmatÎ"Ã‡Ã´Kamoro (index 199)
    if (parts[1] === '199' && parts[0].includes('Asmat')) {
      parts[0] = 'Asmat-Citam-Kamoro';
      parts[11] = 'FALSE';  // has_encoding_issue
      // Also fix the extra FALSE that got added
      const lastFew = parts.slice(-3).join(',');
      if (lastFew === 'FALSE,FALSE,nic-GH') {
        parts[11] = 'FALSE';
      }
      console.log('Fixed row 2299: Asmat-Citam-Kamoro');
    }
    
    // Row 2355: Cemuhâ"œÂ« (index 1420)
    if (parts[1] === '1420' && parts[0].includes('Cemuh')) {
      parts[0] = 'Cemuhi';
      parts[11] = 'FALSE';
      console.log('Fixed row 2355: Cemuhi');
    }
    
    // Row 2575: Māori (dedicated) (index 20094)
    if (parts[1] === '20094' && parts[0].includes('ri (dedicated)')) {
      parts[0] = 'Maori (dedicated)';
      parts[11] = 'FALSE';
      console.log('Fixed row 2575: Maori (dedicated)');
    }
    
    // Row 2594: Cook Islands Māori Pidgin (dedicated) (index 1634)
    if (parts[1] === '1634' && parts[0].includes('ri Pidgin')) {
      parts[0] = 'Cook Islands Maori Pidgin (dedicated)';
      parts[11] = 'FALSE';
      console.log('Fixed row 2594: Cook Islands Maori Pidgin (dedicated)');
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
