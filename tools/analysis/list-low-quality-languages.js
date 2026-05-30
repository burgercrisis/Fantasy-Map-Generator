const fs = require('fs');
const csv = fs.readFileSync('docs/reports/language-metrics/language-quality-metrics.csv', 'utf8');
const lines = csv.split('\n');
const headers = lines[0].split(',');
const cityCountIdx = headers.indexOf('city_count');
const langNameIdx = headers.indexOf('language_name');
const fileIdx = headers.indexOf('source_file');
const scoreIdx = headers.indexOf('quality_score');
const indexIdx = headers.indexOf('index');

// Languages with 5 cities (worst offenders)
console.log('=== Languages with 5 cities (need immediate expansion) ===\n');
const fiveCity = lines.filter(l => l.split(',')[cityCountIdx] === '5');
fiveCity.forEach(l => {
  const cols = l.split(',');
  console.log(`  ${cols[langNameIdx]} (i: ${cols[indexIdx]}, file: ${cols[fileIdx]}, score: ${cols[scoreIdx]})`);
});

console.log(`\nTotal: ${fiveCity.length} languages with only 5 cities\n`);

// Languages with 6 cities
console.log('=== Languages with 6 cities ===\n');
const sixCity = lines.filter(l => l.split(',')[cityCountIdx] === '6');
sixCity.forEach(l => {
  const cols = l.split(',');
  console.log(`  ${cols[langNameIdx]} (i: ${cols[indexIdx]}, file: ${cols[fileIdx]}, score: ${cols[scoreIdx]})`);
});

console.log(`\nTotal: ${sixCity.length} languages with only 6 cities\n`);

// Total Score 85 (all need 10+ cities)
console.log('=== Total Score 85 entries ===\n');
const score85 = lines.filter(l => {
  const cols = l.split(',');
  return cols[scoreIdx] === '85';
});
console.log(`Total: ${score85.length} languages with Score 85\n`);
