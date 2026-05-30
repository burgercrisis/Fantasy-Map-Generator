/**
 * Extract score-20 and score-40 entries from the quality metrics CSV
 */
const fs = require('fs');

const csvContent = fs.readFileSync('docs/reports/language-quality-metrics.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const header = lines[0].split(',');

// Find the quality_score column index
const qualityScoreIndex = header.findIndex(h => h.includes('quality_score'));
console.log(`Quality score column index: ${qualityScoreIndex}`);

const score20Entries = [];
const score40Entries = [];

lines.slice(1).forEach((line, index) => {
  const parts = line.split(',');
  if (parts.length > qualityScoreIndex) {
    const qualityScore = parseInt(parts[qualityScoreIndex], 10);
    const languageName = parts[0];
    const index = parts[1];
    const continent = parts[2];
    
    if (qualityScore === 20) {
      score20Entries.push({ languageName, index, continent });
    } else if (qualityScore === 40) {
      score40Entries.push({ languageName, index, continent });
    }
  }
});

console.log('\n=== Score-20 Entries (Highest Priority) ===');
console.log(`Total: ${score20Entries.length}`);
score20Entries.forEach((entry, i) => {
  console.log(`${i + 1}. ${entry.languageName} (index: ${entry.index}, ${entry.continent})`);
});

console.log('\n=== Score-40 Entries (Using Auxiliary Base Data) ===');
console.log(`Total: ${score40Entries.length}`);
score40Entries.forEach((entry, i) => {
  console.log(`${i + 1}. ${entry.languageName} (index: ${entry.index}, ${entry.continent})`);
});

// Write results to files
fs.writeFileSync('docs/reports/score20-entries.json', JSON.stringify(score20Entries, null, 2));
fs.writeFileSync('docs/reports/score40-entries.json', JSON.stringify(score40Entries, null, 2));

console.log('\nResults saved to docs/reports/score20-entries.json and docs/reports/score40-entries.json');
