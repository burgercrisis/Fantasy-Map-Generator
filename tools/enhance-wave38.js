"use strict";

const fs = require('fs');
const { validateNoTruncation, createBackup } = require('../tools/namebase-safety-guardrails.js');

const content = fs.readFileSync('./modules/namebases-all.js', 'utf8');

// Enhanced Huave entry with additional authentic municipalities
const huaveAdditional = [
  'El Espinal', 'Santiago Niltepec', 'Ciudad Ixtepec', 'Guevea de Humboldt', 'Reforma de Pineda',
  'Santa Maria Chimalapa', 'San Miguel Chimalapa', 'Magdalena Tequisistlan', 'San Juan Guichicovi'
];

// Enhanced Tuvaluan entry with additional authentic villages
const tuvaluanAdditional = [
  'Vaiaku', 'Tumaseu', 'Motufoua', 'Pepesala', 'Fangaua', 'Savave', 'Alamoni-Maiaki', 'Tanrake',
  'Matagi', 'Mataluafata', 'Amatuku', 'Fakaifou', 'Funafala', 'Aulotu', 'Asau', 'Apalolo-Saniuta',
  'Potufale', 'Maneapa', 'Hauma', 'Haumaefa', 'Kulia', 'Lolua', 'Nukualofa'
];

function enhanceEntry(content, name, additionalNames) {
  // Find the specific language entry
  const pattern = new RegExp(`\\{\\s*"name":\\s*"${name}"[^}]*"b":\\s*"([^"]*)"\\s*\\}`, 's');
  const match = content.match(pattern);
  
  if (!match) {
    console.error(`Entry not found: ${name}`);
    return null;
  }
  
  const oldNames = match[1].split(',').map(n => n.trim());
  const newNames = [...new Set([...oldNames, ...additionalNames])];
  
  console.log(`${name}: ${oldNames.length} → ${newNames.length} names`);
  
  return {
    oldEntry: match[0],
    newEntry: match[0].replace(match[1], newNames.join(',')),
    oldCount: oldNames.length,
    newCount: newNames.length
  };
}

// Enhance both entries
const huaveResult = enhanceEntry(content, 'Huave', huaveAdditional);
const tuvaluanResult = enhanceEntry(content, 'Tuvaluan', tuvaluanAdditional);

if (huaveResult && tuvaluanResult) {
  // Create enhanced content
  let newContent = content.replace(huaveResult.oldEntry, huaveResult.newEntry);
  newContent = newContent.replace(tuvaluanResult.oldEntry, tuvaluanResult.newEntry);
  
  // Validate no truncation
  validateNoTruncation('./modules/namebases-all.js', newContent, 'Wave 38 enhancement');
  
  // Create backup
  createBackup('./modules/namebases-all.js');
  
  // Write enhanced content
  fs.writeFileSync('./modules/namebases-all.js', newContent);
  
  console.log('✅ Enhancement complete!');
  console.log(`Huave: ${huaveResult.oldCount} → ${huaveResult.newCount} names (+${huaveResult.newCount - huaveResult.oldCount})`);
  console.log(`Tuvaluan: ${tuvaluanResult.oldCount} → ${tuvaluanResult.newCount} names (+${tuvaluanResult.newCount - tuvaluanResult.oldCount})`);
} else {
  console.error('❌ Enhancement failed - entries not found');
}