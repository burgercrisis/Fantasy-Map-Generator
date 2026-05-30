/**
 * Raw Content Analyzer
 * Examines actual file content to identify exact encoding issues
 */

const fs = require('fs');

// Sample some problematic lines from the file
function analyzeRawContent(filePath) {
  console.log(`\n=== RAW CONTENT ANALYSIS: ${filePath} ===\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for lines with "name": and "b": that might have issues
  const lines = content.split('\n');
  
  // Find lines that likely contain place names
  const nameBaseLines = lines.filter(line => 
    line.includes('"name":') && 
    line.includes('"b":') && 
    line.length > 50
  );
  
  console.log(`Found ${nameBaseLines.length} namebase entries\n`);
  
  // Look for any byte sequences that might be problematic
  // Pattern: Ã followed by any Latin character (mojibake indicator)
  const mojibakePattern = /Ã[A-Za-z]/g;
  
  let totalMatches = 0;
  const uniquePatterns = new Set();
  const samples = [];
  
  nameBaseLines.forEach((line, idx) => {
    const matches = line.match(mojibakePattern);
    if (matches) {
      matches.forEach(m => {
        uniquePatterns.add(m);
        totalMatches++;
      });
      
      // Get first few samples
      if (samples.length < 10) {
        samples.push({
          line: idx + 1,
          match: matches[0],
          context: line.substring(0, 200)
        });
      }
    }
  });
  
  console.log(`Total mojibake matches: ${totalMatches}`);
  console.log(`Unique patterns: ${uniquePatterns.size}\n`);
  
  if (samples.length > 0) {
    console.log('Sample issues found:\n');
    samples.forEach((sample, idx) => {
      console.log(`${idx + 1}. Line ${sample.line}: "${sample.match}"`);
      console.log(`   Context: ${sample.context}...`);
      console.log('');
    });
  }
  
  // Show all unique patterns
  console.log('\nAll unique mojibake patterns:');
  uniquePatterns.forEach(pattern => {
    console.log(`  "${pattern}"`);
  });
  
  return {
    totalMatches,
    uniquePatterns: Array.from(uniquePatterns),
    samples
  };
}

// Analyze the Africa file
console.log('=== ENCODING ISSUE INVESTIGATION ===\n');

const africaFile = 'modules/namebases-africa.js';
if (fs.existsSync(africaFile)) {
  analyzeRawContent(africaFile);
}

// Also check a backup file
const backupFile = 'modules/namebases-real.backup-20251228-221152.js';
if (fs.existsSync(backupFile)) {
  analyzeRawContent(backupFile);
}
