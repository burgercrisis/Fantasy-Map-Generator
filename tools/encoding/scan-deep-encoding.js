/**
 * Deep Encoding Issues Scanner
 * Looks for subtle encoding problems including:
 * - Double UTF-8 encoding
 * - Wrong character mappings
 * - Mojibake (garbled text)
 * - Invalid byte sequences
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate encoding problems
const mojibakePatterns = [
  // UTF-8 double encoding of Latin-1 characters
  { pattern: /Ã¡/g, expected: 'á', desc: 'á double-encoded' },
  { pattern: /Ã¢/g, expected: 'â', desc: 'â double-encoded' },
  { pattern: /Ã£/g, expected: 'ã', desc: 'ã double-encoded' },
  { pattern: /Ã¤/g, expected: 'ä', desc: 'ä double-encoded' },
  { pattern: /Ã§/g, expected: 'ç', desc: 'ç double-encoded' },
  { pattern: /Ã©/g, expected: 'é', desc: 'é double-encoded' },
  { pattern: /Ãª/g, expected: 'ê', desc: 'ê double-encoded' },
  { pattern: /Ã«/g, expected: 'ë', desc: 'ë double-encoded' },
  { pattern: /Ã­/g, expected: 'í', desc: 'í double-encoded' },
  { pattern: /Ã®/g, expected: 'î', desc: 'î double-encoded' },
  { pattern: /Ã¯/g, expected: 'ï', desc: 'ï double-encoded' },
  { pattern: /Ã³/g, expected: 'ó', desc: 'ó double-encoded' },
  { pattern: /Ã´/g, expected: 'ô', desc: 'ô double-encoded' },
  { pattern: /Ãµ/g, expected: 'õ', desc: 'õ double-encoded' },
  { pattern: /Ã¶/g, expected: 'ö', desc: 'ö double-encoded' },
  { pattern: /Ã¼/g, expected: 'ü', desc: 'ü double-encoded' },
  { pattern: /Ã±/g, expected: 'ñ', desc: 'ñ double-encoded' },
  { pattern: /Ã%/g, expected: '%', desc: '% double-encoded' },
  { pattern: /Ã /g, expected: ' ', desc: 'space double-encoded' },
  
  // Other common mojibake
  { pattern: /Â/g, expected: '', desc: 'U+00A2 artifact' },
  { pattern: /Ä/g, expected: 'Ä', desc: 'Potential encoding issue' },
  { pattern: /['']['']/g, expected: "'", desc: 'Smart quote issues' },
  { pattern: /"/g, expected: '"', desc: 'Smart quote issues' },
];

// Languages known to have encoding issues based on documentation
const problematicLanguages = [
  'Portuguese', 'Spanish', 'Catalan', 'Galician', // Romance languages
  'Romanian', 'French', 'Italian', // More Romance
  'German', 'Dutch', 'Afrikaans', // Germanic
  'Polish', 'Czech', 'Slovak', 'Hungarian', // Central European
  'Russian', 'Ukrainian', 'Bulgarian', 'Serbian', // Slavic (Cyrillic)
  'Arabic', 'Hebrew', // Semitic
  'Amharic', 'Tigrinya', // Ethiopian
  'Thai', 'Burmese', 'Khmer', 'Lao', // Southeast Asian
];

function analyzeLine(line, lineNum, filePath) {
  const issues = [];
  
  // Check for mojibake patterns
  mojibakePatterns.forEach(({ pattern, expected, desc }) => {
    if (pattern.test(line)) {
      const matches = line.match(new RegExp(pattern.source, 'g'));
      issues.push({
        type: 'mojibake',
        pattern: desc,
        count: matches ? matches.length : 0,
        severity: 'critical'
      });
    }
  });
  
  // Extract language entry
  const entryMatch = line.match(/\{[^}]*name:\s*"([^"]+)"[^}]*b:\s*"([^"]+)"[^}]*\}/);
  if (entryMatch) {
    const languageName = entryMatch[1];
    const cities = entryMatch[2];
    
    // Check if this is a problematic language
    const isProblematic = problematicLanguages.some(lang => 
      languageName.toLowerCase().includes(lang.toLowerCase())
    );
    
    if (isProblematic) {
      // Check for specific encoding anomalies in the cities string
      const cityList = cities.split(',');
      cityList.forEach(city => {
        // Check for ASCII-only where there should be diacritics
        const hasCommonAccents = /[áéíóúàèìòùâêîôûãõäëïöüçñ]/i.test(city);
        const hasMojibake = /[ÃÂÃÄÃ§Ã©ÃªÃ«Ã­Ã®Ã¯Ã³Ã´ÃµÃ¶Ã¼Ã±Â]/i.test(city);
        
        if (hasMojibake) {
          issues.push({
            type: 'mojibake-in-city',
            city: city,
            severity: 'critical'
          });
        }
      });
    }
  }
  
  return issues;
}

function scanFileDeep(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineNum) => {
      // Skip comments and structure lines
      if (line.trim().startsWith('//') || line.trim() === '' || 
          !line.includes('name:') || !line.includes('b:')) {
        return;
      }
      
      const lineIssues = analyzeLine(line, lineNum, filePath);
      if (lineIssues.length > 0) {
        const entryMatch = line.match(/\{[^}]*name:\s*"([^"]+)"[^}]*b:\s*"([^"]+)"[^}]*\}/);
        issues.push({
          file: path.basename(filePath),
          line: lineNum + 1,
          language: entryMatch ? entryMatch[1] : 'Unknown',
          cities: entryMatch ? entryMatch[2] : '',
          issues: lineIssues,
          raw: line.substring(0, 150)
        });
      }
    });
  } catch (err) {
    console.error(`Error scanning ${filePath}: ${err.message}`);
  }
  
  return issues;
}

console.log('=== DEEP ENCODING ISSUES SCANNER ===\n');

const namebaseFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

let allIssues = [];

namebaseFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Scanning: ${file}`);
    const issues = scanFileDeep(file);
    if (issues.length > 0) {
      console.log(`  Found ${issues.length} potential encoding issues`);
      allIssues = allIssues.concat(issues);
    } else {
      console.log(`  No issues found`);
    }
  }
});

console.log('\n=== ENCODING ISSUES FOUND ===\n');
console.log(`Total entries with issues: ${allIssues.length}\n`);

// Group by type
const byType = {};
allIssues.forEach(issue => {
  issue.issues.forEach(i => {
    if (!byType[i.type]) {
      byType[i.type] = [];
    }
    byType[i.type].push({
      language: issue.language,
      line: issue.line,
      file: issue.file,
      detail: i.city || i.pattern
    });
  });
});

Object.keys(byType).forEach(type => {
  console.log(`${type}: ${byType[type].length} occurrences`);
  byType[type].slice(0, 5).forEach(item => {
    console.log(`  - ${item.language} (${item.file}:${item.line}) ${item.detail ? '- ' + item.detail : ''}`);
  });
  console.log('');
});

// Show detailed issue entries
if (allIssues.length > 0) {
  console.log('=== DETAILED ISSUE ENTRIES ===\n');
  allIssues.slice(0, 30).forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.file}:${issue.line} - ${issue.language}`);
    issue.issues.forEach(i => {
      console.log(`   - ${i.type}: ${i.pattern || i.city}`);
    });
    console.log(`   Raw: ${issue.raw.substring(0, 100)}...`);
    console.log('');
  });
}

// Save report
const reportPath = 'deep-encoding-issues-report.json';
fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));
console.log(`\nDetailed report saved to: ${reportPath}`);
