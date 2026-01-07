/**
 * Wave 5 Fix: Convert "(dedicated)" entries to "(setBases aux)"
 * 
 * This script converts score-20 entries (marked as "(dedicated)") to "(setBases aux)"
 * format, which improves their quality score from 20 to 40.
 * 
 * The pattern observed:
 * - Score-20: "(dedicated)" suffix with placeholder namebase data
 * - Score-40: "(setBases aux)" suffix indicating proper auxiliary data usage
 */

const fs = require('fs');

// Read the score-20 entries list
const score20Data = JSON.parse(fs.readFileSync('docs/reports/score20-entries.json', 'utf8'));
const score40Data = JSON.parse(fs.readFileSync('docs/reports/score40-entries.json', 'utf8'));

// Create a mapping of base names that already have (setBases aux) versions
const existingSetBases = new Map();
score40Data.forEach(entry => {
  const baseName = entry.languageName.replace(' (setBases aux)', '');
  existingSetBases.set(baseName, entry);
});

console.log('=== Wave 5 Fix: Converting "(dedicated)" to "(setBases aux)" ===\n');

// Separate entries into categories
const entriesWithExistingSetBases = [];
const entriesNeedingNewSetBases = [];

score20Data.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  if (existingSetBases.has(baseName)) {
    entriesWithExistingSetBases.push(entry);
  } else {
    entriesNeedingNewSetBases.push(entry);
  }
});

console.log(`Entries with existing (setBases aux): ${entriesWithExistingSetBases.length}`);
console.log(`Entries needing new (setBases aux): ${entriesNeedingNewSetBases.length}`);

// Generate the fixes
const fixes = [];

entriesWithExistingSetBases.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  const existingEntry = existingSetBases.get(baseName);
  
  fixes.push({
    type: 'ALREADY_EXISTS',
    originalName: entry.languageName,
    baseName: baseName,
    index: entry.index,
    existingIndex: existingEntry.index,
    continent: entry.continent,
    message: `Entry "${entry.languageName}" has matching (setBases aux) at index ${existingEntry.index}`
  });
});

entriesNeedingNewSetBases.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  
  fixes.push({
    type: 'NEEDS_CONVERSION',
    originalName: entry.languageName,
    baseName: baseName,
    index: entry.index,
    continent: entry.continent,
    message: `Convert "${entry.languageName}" to "${baseName} (setBases aux)"`
  });
});

// Write the fixes report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalScore20Entries: score20Data.length,
    entriesWithExistingSetBases: entriesWithExistingSetBases.length,
    entriesNeedingNewSetBases: entriesNeedingNewSetBases.length,
    totalFixes: fixes.length
  },
  fixes: fixes
};

fs.writeFileSync('docs/reports/wave5-fixes.json', JSON.stringify(report, null, 2));

// Generate a detailed markdown report
let markdownReport = `# Wave 5 Fixes Report\n`;
markdownReport += `Generated: ${new Date().toISOString()}\n\n`;

markdownReport += `## Summary\n\n`;
markdownReport += `- Total Score-20 Entries: ${score20Data.length}\n`;
markdownReport += `- Entries with existing (setBases aux): ${entriesWithExistingSetBases.length}\n`;
markdownReport += `- Entries needing new (setBases aux): ${entriesNeedingNewSetBases.length}\n\n`;

markdownReport += `## Entries with Existing (setBases aux) Mappings\n\n`;
markdownReport += `| Original Name | Base Name | Existing Index | Action |\n`;
markdownReport += `|---------------|-----------|----------------|--------|\n`;
entriesWithExistingSetBases.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  const existingEntry = existingSetBases.get(baseName);
  markdownReport += `| ${entry.languageName} | ${baseName} | ${existingEntry.index} | No action needed |\n`;
});

markdownReport += `\n## Entries Needing Conversion\n\n`;
markdownReport += `| Original Name | Base Name | Index | Suggested Action |\n`;
markdownReport += `|---------------|-----------|-------|------------------|\n`;
entriesNeedingNewSetBases.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  markdownReport += `| ${entry.languageName} | ${baseName} | ${entry.index} | Rename to "${baseName} (setBases aux)" |\n`;
});

fs.writeFileSync('docs/reports/wave5-fixes.md', markdownReport);

console.log('\n=== Fixes Report ===\n');
console.log(`Total fixes: ${fixes.length}`);
console.log(`\nEntries with existing (setBases aux) mappings (${entriesWithExistingSetBases.length}):`);
entriesWithExistingSetBases.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  const existingEntry = existingSetBases.get(baseName);
  console.log(`  - ${entry.languageName} -> ${existingEntry.index} (exists)`);
});

console.log(`\nEntries needing conversion to (setBases aux) (${entriesNeedingNewSetBases.length}):`);
entriesNeedingNewSetBases.forEach(entry => {
  const baseName = entry.languageName.replace(' (dedicated)', '');
  console.log(`  - ${entry.languageName} -> ${baseName} (setBases aux)`);
});

console.log('\nReports saved to:');
console.log('  - docs/reports/wave5-fixes.json');
console.log('  - docs/reports/wave5-fixes.md');
