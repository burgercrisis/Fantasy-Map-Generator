const fs = require('fs');

const csvContent = fs.readFileSync('docs/reports/language-quality-metrics.csv', 'utf-8');
const lines = csvContent.trim().split('\n');

const header = lines[0].split(',');
const continentIdx = header.findIndex(h => h.includes('continent'));
const langNameIdx = header.findIndex(h => h.includes('language_name'));
const cityCountIdx = header.findIndex(h => h.includes('city_count'));
const qualityCatIdx = header.findIndex(h => h.includes('quality_category'));
const qualityScoreIdx = header.findIndex(h => h.includes('quality_score'));

console.log('Header indices:', { continentIdx, langNameIdx, cityCountIdx, qualityCatIdx, qualityScoreIdx });

const criticalPoorLanguages = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const values = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const continent = values[continentIdx];
  const qualityCategory = values[qualityCatIdx];

  if (continent === 'Europe' && (qualityCategory === 'Critical' || qualityCategory === 'Poor')) {
    criticalPoorLanguages.push({
      name: values[langNameIdx],
      cityCount: parseInt(values[cityCountIdx]),
      qualityScore: parseInt(values[qualityScoreIdx]),
      qualityCategory: qualityCategory
    });
  }
}

console.log('\n=== European Critical/Poor Languages ===');
console.log(JSON.stringify(criticalPoorLanguages, null, 2));
console.log(`\nTotal: ${criticalPoorLanguages.length} languages`);
