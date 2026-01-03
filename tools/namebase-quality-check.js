#!/usr/bin/env node

/**
 * Comprehensive Namebase Quality Check Script
 * 
 * This script performs a thorough quality check of all namebase files
 * and generates a detailed report of any issues found.
 */

const fs = require('fs');
const path = require('path');

const namebaseFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js', 
  'modules/namebases-creole.js',
  'modules/namebases-europe.js',
  'modules/namebases-fantasy.js',
  'modules/namebases-global.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

// Issues tracking
const issues = {
  totalFiles: 0,
  totalLanguages: 0,
  totalPlacenames: 0,
  fileIssues: [],
  languageIssues: [],
  placenameIssues: [],
  encodingIssues: [],
  duplicateIssues: [],
  placeholderIssues: [],
  structuralIssues: []
};

// Suspected fake/misspelled language names (expanded list)
const suspiciousNames = [
  'Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus',
  'Sextus', 'Septimus', 'Octavus', 'Nonus', 'Decimus',
  'Riang', 'BPh', 'Big Flowery', 'Français Tirailleur',
  'Tày Bôi Pidgin French', 'Bole Chadic language',
  'BiuΓÇôMandara', 'Cavineña', 'Yuracaré', 'Fulniô', 'Nivaclé',
  'Bjarmian S├ími', 'Borgarm├Ñlet', 'Baur├⌐', 'Cof├ín', 'Fran├ºais',
  'Central Erzya', 'H (dedicated)', 'He (dedicated)', 'Han (dedicated)',
  'Ha (dedicated)', 'Ham (dedicated)', 'Haro (dedicated)', 'Has (dedicated)',
  'G (dedicated)', 'A (dedicated)', 'B (dedicated)', 'C (dedicated)',
  'D (dedicated)', 'E (dedicated)', 'F (dedicated)', 'I (dedicated)',
  'J (dedicated)', 'K (dedicated)', 'L (dedicated)', 'M (dedicated)',
  'N (dedicated)', 'O (dedicated)', 'P (dedicated)', 'Q (dedicated)',
  'R (dedicated)', 'S (dedicated)', 'T (dedicated)', 'U (dedicated)',
  'V (dedicated)', 'W (dedicated)', 'X (dedicated)', 'Y (dedicated)',
  'Z (dedicated)'
];

// Encoding issue patterns
const encodingPatterns = [
  /├/g, /┌/g, /┐/g, /└/g, /┘/g, /│/g, /═/g, /╔/g, /╗/g, /╚/g, /╝/g,
  /Γ/g, /Ç/g, /ô/g, /⌐/g, /º/g
];

// Placeholder patterns
const placeholderPatterns = [
  /_unq\d+/g, /_u\d+/g, /placeholder/gi, /TODO/gi, /FIXME/gi
];

function checkFileIntegrity(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    
    issues.totalFiles++;
    
    return {
      path: filePath,
      size: stats.size,
      lines: content.split('\n').length,
      valid: true,
      content
    };
  } catch (error) {
    issues.fileIssues.push({
      file: filePath,
      error: error.message
    });
    return null;
  }
}

function parseNamebaseEntry(line) {
  // Match pattern: { name: "Language Name", i: 123, b: "name1,name2,name3", ... }
  const match = line.match(/\{[^}]*name:\s*"([^"]+)"[^}]*\}/);
  if (!match) return null;
  
  const entry = { name: match[1], raw: line };
  
  // Extract other properties
  const iMatch = line.match(/i:\s*(\d+)/);
  if (iMatch) entry.index = parseInt(iMatch[1]);
  
  const bMatch = line.match(/b:\s*"([^"]+)"/);
  if (bMatch) {
    entry.placenames = bMatch[1].split(',').map(s => s.trim());
  }
  
  // Extract min/max if present
  const minMatch = line.match(/min:\s*(\d+)/);
  const maxMatch = line.match(/max:\s*(\d+)/);
  if (minMatch) entry.minLength = parseInt(minMatch[1]);
  if (maxMatch) entry.maxLength = parseInt(maxMatch[1]);
  
  return entry;
}

function checkLanguageIssues(entry, fileName) {
  const issuesFound = [];
  
  // Check for suspicious names
  if (suspiciousNames.includes(entry.name)) {
    issuesFound.push({
      type: 'suspicious_name',
      message: `Potentially fake or placeholder language name: ${entry.name}`,
      severity: 'high'
    });
  }
  
  // Check for encoding issues
  for (const pattern of encodingPatterns) {
    if (pattern.test(entry.name)) {
      issuesFound.push({
        type: 'encoding_issue',
        message: `Encoding issue detected in: ${entry.name}`,
        severity: 'high'
      });
      break;
    }
  }
  
  // Check for placeholder patterns
  for (const pattern of placeholderPatterns) {
    if (pattern.test(entry.name)) {
      issuesFound.push({
        type: 'placeholder',
        message: `Placeholder text found in: ${entry.name}`,
        severity: 'medium'
      });
      break;
    }
  }
  
  // Check for very short names (potential placeholders)
  if (entry.name.length <= 2 && !/^[A-Z]$/.test(entry.name)) {
    issuesFound.push({
      type: 'very_short_name',
      message: `Very short language name (potential placeholder): ${entry.name}`,
      severity: 'medium'
    });
  }
  
  // Check for duplicate parentheses (malformed entries)
  const parenCount = (entry.name.match(/\(/g) || []).length;
  if (parenCount !== (entry.name.match(/\)/g) || []).length) {
    issuesFound.push({
      type: 'mismatched_parens',
      message: `Mismatched parentheses in: ${entry.name}`,
      severity: 'high'
    });
  }
  
  return issuesFound;
}

function checkPlacenameIssues(entry) {
  const issuesFound = [];
  
  if (!entry.placenames) return issuesFound;
  
  issues.totalPlacenames += entry.placenames.length;
  
  // Check for single-word bases (potentially lazy)
  if (entry.placenames.length === 1) {
    issuesFound.push({
      type: 'single_placename',
      message: `Only 1 placename for ${entry.name}`,
      severity: 'low'
    });
  }
  
  // Check for very few placenames
  if (entry.placenames.length < 5) {
    issuesFound.push({
      type: 'few_placenames',
      message: `Only ${entry.placenames.length} placenames for ${entry.name}`,
      severity: 'medium'
    });
  }
  
  // Check for duplicate placenames within same base
  const uniquePlacenames = [...new Set(entry.placenames)];
  if (uniquePlacenames.length < entry.placenames.length) {
    const duplicates = entry.placenames.length - uniquePlacenames.length;
    issuesFound.push({
      type: 'duplicate_placenames',
      message: `${duplicates} duplicate placenames in ${entry.name}`,
      severity: 'medium'
    });
  }
  
  // Check for placeholder placenames
  entry.placenames.forEach((placename, index) => {
    if (placeholderPatterns.some(pattern => pattern.test(placename))) {
      issuesFound.push({
        type: 'placeholder_placename',
        message: `Placeholder placename in ${entry.name}: ${placename}`,
        severity: 'high'
      });
    }
  });
  
  return issuesFound;
}

function checkStructuralIssues(content, fileName) {
  const issuesFound = [];
  const lines = content.split('\n');
  
  // Check for proper JavaScript structure
  const hasModuleExports = content.includes('module.exports');
  const hasWindowAssignment = content.includes('window.');
  
  if (!hasModuleExports && !hasWindowAssignment) {
    issuesFound.push({
      type: 'missing_export',
      message: `No module.exports or window assignment found`,
      severity: 'high'
    });
  }
  
  // Check for proper array structure
  const arrayStart = content.indexOf('[');
  const arrayEnd = content.lastIndexOf(']');
  
  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
    issuesFound.push({
      type: 'malformed_array',
      message: `Malformed array structure`,
      severity: 'high'
    });
  }
  
  return issuesFound;
}

function analyzeNamebases() {
  console.log('🔍 Starting comprehensive namebase quality check...\n');
  
  // Check each file
  for (const file of namebaseFiles) {
    console.log(`📁 Checking ${path.basename(file)}...`);
    
    const fileData = checkFileIntegrity(file);
    if (!fileData) continue;
    
    const structuralIssues = checkStructuralIssues(fileData.content, file);
    issues.structuralIssues.push(...structuralIssues.map(issue => ({
      file,
      ...issue
    })));
    
    // Parse entries
    const lines = fileData.content.split('\n');
    let entryCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.includes('name:')) {
        const entry = parseNamebaseEntry(line);
        if (entry) {
          entryCount++;
          issues.totalLanguages++;
          
          // Check language-level issues
          const languageIssues = checkLanguageIssues(entry, file);
          languageIssues.forEach(issue => {
            issues.languageIssues.push({
              file,
              line: i + 1,
              language: entry.name,
              ...issue
            });
          });
          
          // Check placename-level issues
          const placenameIssues = checkPlacenameIssues(entry);
          placenameIssues.forEach(issue => {
            issues.placenameIssues.push({
              file,
              line: i + 1,
              language: entry.name,
              ...issue
            });
          });
        }
      }
    }
    
    console.log(`  ✓ Found ${entryCount} languages`);
  }
  
  console.log(`\n📊 Analysis complete!`);
}

function generateReport() {
  console.log('\n' + '═'.repeat(80));
  console.log('📋 NAMEBASE QUALITY CHECK REPORT');
  console.log('═'.repeat(80));
  
  console.log(`\n📈 SUMMARY STATISTICS:`);
  console.log(`  • Total files analyzed: ${issues.totalFiles}`);
  console.log(`  • Total languages: ${issues.totalLanguages}`);
  console.log(`  • Total placenames: ${issues.totalPlacenames}`);
  console.log(`  • Average placenames per language: ${(issues.totalPlacenames / issues.totalLanguages).toFixed(1)}`);
  
  // File-level issues
  if (issues.fileIssues.length > 0) {
    console.log(`\n❌ FILE-LEVEL ISSUES (${issues.fileIssues.length}):`);
    issues.fileIssues.forEach(issue => {
      console.log(`  • ${issue.file}: ${issue.error}`);
    });
  }
  
  // Structural issues
  if (issues.structuralIssues.length > 0) {
    console.log(`\n🔧 STRUCTURAL ISSUES (${issues.structuralIssues.length}):`);
    const byType = {};
    issues.structuralIssues.forEach(issue => {
      if (!byType[issue.type]) byType[issue.type] = [];
      byType[issue.type].push(issue);
    });
    
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`  • ${type}: ${items.length} instances`);
      items.slice(0, 3).forEach(item => {
        console.log(`    - ${path.basename(item.file)}: ${item.message}`);
      });
      if (items.length > 3) console.log(`    ... and ${items.length - 3} more`);
    });
  }
  
  // High severity issues
  const highSeverityIssues = [
    ...issues.languageIssues.filter(i => i.severity === 'high'),
    ...issues.placenameIssues.filter(i => i.severity === 'high')
  ];
  
  if (highSeverityIssues.length > 0) {
    console.log(`\n🚨 HIGH SEVERITY ISSUES (${highSeverityIssues.length}):`);
    highSeverityIssues.forEach(issue => {
      console.log(`  • ${path.basename(issue.file)}:${issue.line} - ${issue.language}`);
      console.log(`    ${issue.message}`);
    });
  }
  
  // Medium severity issues
  const mediumSeverityIssues = [
    ...issues.languageIssues.filter(i => i.severity === 'medium'),
    ...issues.placenameIssues.filter(i => i.severity === 'medium')
  ];
  
  if (mediumSeverityIssues.length > 0) {
    console.log(`\n⚠️  MEDIUM SEVERITY ISSUES (${mediumSeverityIssues.length}):`);
    const issueTypes = {};
    mediumSeverityIssues.forEach(issue => {
      if (!issueTypes[issue.type]) issueTypes[issue.type] = 0;
      issueTypes[issue.type]++;
    });
    
    Object.entries(issueTypes).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count} instances`);
    });
  }
  
  // Issue distribution by file
  console.log(`\n📁 ISSUES BY FILE:`);
  const fileIssueCounts = {};
  [...issues.languageIssues, ...issues.placenameIssues, ...issues.structuralIssues].forEach(issue => {
    if (!fileIssueCounts[issue.file]) fileIssueCounts[issue.file] = 0;
    fileIssueCounts[issue.file]++;
  });
  
  Object.entries(fileIssueCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([file, count]) => {
      console.log(`  • ${path.basename(file)}: ${count} issues`);
    });
  
  console.log(`\n💡 RECOMMENDATIONS:`);
  
  if (highSeverityIssues.length > 0) {
    console.log(`  1. 🚨 Address ${highSeverityIssues.length} high-severity issues immediately`);
  }
  
  const encodingIssues = issues.languageIssues.filter(i => i.type === 'encoding_issue');
  if (encodingIssues.length > 0) {
    console.log(`  2. 🔧 Fix ${encodingIssues.length} encoding issues (UTF-8 Mojibake)`);
  }
  
  const placeholderIssues = issues.languageIssues.filter(i => i.type === 'placeholder');
  if (placeholderIssues.length > 0) {
    console.log(`  3. 📝 Replace ${placeholderIssues.length} placeholder language names`);
  }
  
  const fewPlacenameIssues = issues.placenameIssues.filter(i => i.type === 'few_placenames');
  if (fewPlacenameIssues.length > 0) {
    console.log(`  4. 📈 Expand ${fewPlacenameIssues.length} language bases with more placenames`);
  }
  
  const duplicateIssues = issues.placenameIssues.filter(i => i.type === 'duplicate_placenames');
  if (duplicateIssues.length > 0) {
    console.log(`  5. 🧹 Remove ${duplicateIssues.length} duplicate placenames`);
  }
  
  console.log('\n' + '═'.repeat(80));
}

// Run the analysis
analyzeNamebases();
generateReport();