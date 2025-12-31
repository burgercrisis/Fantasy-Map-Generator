#!/usr/bin/env node

/**
 * Fix Inaccurate Indigenous Language Names
 * 
 * This script replaces Spanish colonial names with authentic indigenous names.
 * Focus on Nahuatl and other Mexican indigenous languages.
 */

const fs = require('fs');
const path = require('path');

// Function to fix Nahuatl namebase
function fixNahuatl(namebase) {
  const names = namebase.split(',');
  const fixed = names.map(name => {
    const trimmed = name.trim();
    // Replace Mexico with Mexihco (Nahuatl spelling)
    if (trimmed === 'Mexico') return 'Mexihco';
    // Replace Oaxaca with Huaxyacac
    if (trimmed === 'Oaxaca') return 'Huaxyacac';
    return trimmed;
  });
  return fixed.join(',');
}

// Function to fix Quechua namebase
function fixQuechua(namebase) {
  const names = namebase.split(',');
  const fixed = names.map(name => {
    const trimmed = name.trim();
    // Replace colonial spellings with standard Quechua
    if (trimmed === 'Cusco' || trimmed === 'Cuzco') return 'Qosqo';
    return trimmed;
  });
  return fixed.join(',');
}

// Function to fix Purépecha namebase
function fixPurepecha(namebase) {
  const names = namebase.split(',');
  const fixed = names.map(name => {
    const trimmed = name.trim();
    // Replace Spanish colonial name with Purépecha
    if (trimmed === 'Morelia') return 'Urendaro';
    return trimmed;
  });
  return fixed.join(',');
}

// Function to fix Huichol namebase (remove Spanish names, keep authentic ones)
function fixHuichol(namebase) {
  const names = namebase.split(',');
  const fixed = names.filter(name => {
    const trimmed = name.trim();
    // Remove Spanish city names, keep only Huichol/Wixarika names
    if (['Guadalajara', 'León', 'Zacatecas', 'San Luis Potosí'].includes(trimmed)) {
      return false;
    }
    return true;
  });
  return fixed.join(',');
}

// Function to fix Mixtec namebase (remove Spanish compound names)
function fixMixtec(namebase) {
  const names = namebase.split(',');
  const fixed = names.filter(name => {
    const trimmed = name.trim();
    // Remove Spanish compound names with "de"
    if (trimmed.includes(' de ')) {
      return false;
    }
    return true;
  });
  return fixed.join(',');
}

// Function to fix Zapotec namebase
function fixZapotec(namebase) {
  const names = namebase.split(',');
  const fixed = names.map(name => {
    const trimmed = name.trim();
    // Replace Spanish names with Zapotec equivalents
    if (trimmed === 'Oaxaca City') return 'Xoo';
    if (trimmed === 'Juchitan de Zaragoza') return 'Xichu';
    if (trimmed.includes(' de ')) return null; // Remove compound Spanish names
    return trimmed;
  }).filter(n => n !== null);
  return fixed.join(',');
}

// Main function to apply all fixes
function applyFixes() {
  const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
  const content = fs.readFileSync(namebasePath, 'utf8');
  
  const lines = content.split('\n');
  const changes = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let modified = false;
    let newNamebase = null;
    let language = null;
    
    // Fix Nahuatl
    if (line.includes('name: "Nahuatl"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixNahuatl(original);
        language = 'Nahuatl';
        if (newNamebase !== original) modified = true;
      }
    }
    
    // Fix Quechua
    else if (line.includes('name: "Quechua"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixQuechua(original);
        language = 'Quechua';
        if (newNamebase !== original) modified = true;
      }
    }
    
    // Fix Purepecha (may have special character in name)
    else if (line.match(/name: "Pur.*pecha"/)) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixPurepecha(original);
        language = 'Purepecha';
        if (newNamebase !== original) modified = true;
      }
    }
    
    // Fix Huichol
    else if (line.includes('name: "Huichol"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixHuichol(original);
        language = 'Huichol';
        if (newNamebase !== original) modified = true;
      }
    }
    
    // Fix Mixtec
    else if (line.includes('name: "Mixtec"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixMixtec(original);
        language = 'Mixtec';
        if (newNamebase !== original) modified = true;
      }
    }
    
    // Fix Zapotec
    else if (line.includes('name: "Zapotec"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixZapotec(original);
        language = 'Zapotec';
        if (newNamebase !== original) modified = true;
      }
    }
    
    // Apply changes if any
    if (modified && newNamebase) {
      lines[i] = line.replace(/b: "[^"]+"/, `b: "${newNamebase}"`);
      const originalMatch = line.match(/b: "([^"]+)"/);
      if (originalMatch) {
        changes.push({
          language,
          originalLength: originalMatch[1].split(',').length,
          newLength: newNamebase.split(',').length
        });
      }
    }
  }
  
  // Write fixed content
  fs.writeFileSync(namebasePath, lines.join('\n'), 'utf8');
  
  // Also update names-generator.js
  const generatorPath = path.join(__dirname, '../../modules/names-generator.js');
  const generatorContent = fs.readFileSync(generatorPath, 'utf8');
  const generatorLines = generatorContent.split('\n');
  
  for (let i = 0; i < generatorLines.length; i++) {
    const line = generatorLines[i];
    let modified = false;
    let newNamebase = null;
    
    if (line.includes('name: "Nahuatl"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixNahuatl(original);
        if (newNamebase !== original) modified = true;
      }
    }
    else if (line.includes('name: "Quechua"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixQuechua(original);
        if (newNamebase !== original) modified = true;
      }
    }
    else if (line.match(/name: "Pur.*pecha"/)) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixPurepecha(original);
        if (newNamebase !== original) modified = true;
      }
    }
    else if (line.includes('name: "Huichol"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixHuichol(original);
        if (newNamebase !== original) modified = true;
      }
    }
    else if (line.includes('name: "Mixtec"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixMixtec(original);
        if (newNamebase !== original) modified = true;
      }
    }
    else if (line.includes('name: "Zapotec"')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const original = match[1];
        newNamebase = fixZapotec(original);
        if (newNamebase !== original) modified = true;
      }
    }
    
    if (modified && newNamebase) {
      generatorLines[i] = line.replace(/b: "[^"]+"/, `b: "${newNamebase}"`);
    }
  }
  
  fs.writeFileSync(generatorPath, generatorLines.join('\n'), 'utf8');
  
  return changes;
}

// Run fixes
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║   FIXING INACCURATE INDIGENOUS LANGUAGE NAMES                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const changes = applyFixes();

if (changes.length === 0) {
  console.log('✅ No changes needed - all names are already accurate!\n');
} else {
  console.log('✅ Applied the following fixes:\n');
  
  changes.forEach(change => {
    console.log(`📝 ${change.language}:`);
    console.log(`   Original namebase size: ${change.originalLength} names`);
    console.log(`   New namebase size: ${change.newLength} names`);
    console.log(`   Removed ${change.originalLength - change.newLength} inaccurate Spanish names\n`);
  });
  
  console.log(`\n✅ Total languages fixed: ${changes.length}`);
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('Summary of fixes:');
console.log('  - Nahuatl: Mexico → Mexihco, Oaxaca → Huaxyacac');
console.log('  - Quechua: Cusco/Cuzco → Qosqo');
console.log('  - Purepecha: Morelia → Urendaro');
console.log('  - Huichol: Removed Spanish city names (Guadalajara, León, etc.)');
console.log('  - Mixtec: Removed Spanish compound names (e.g., "Huajuapan de León")');
console.log('  - Zapotec: Replaced Spanish names with Zapotec equivalents');
console.log('\nNext steps:');
console.log('1. Start HTTP server: python3 -m http.server 8000');
console.log('2. Open http://localhost:8000 in browser');
console.log('3. Generate a new map to verify names work correctly');
console.log('4. Test with languages that use indigenous names');
