const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mixes = JSON.parse(fs.readFileSync('config/language-mixes.json', 'utf8'));
const racesSrc = fs.readFileSync('modules/races.js', 'utf8');

const marker = 'const raceLanguageProfiles';
const idx = racesSrc.indexOf(marker);
const braceStart = racesSrc.indexOf('{', idx);
let depth = 0, end = -1;
for (let i = braceStart; i < racesSrc.length; i++) {
  if (racesSrc[i] === '{') depth++;
  else if (racesSrc[i] === '}') {
    depth--;
    if (depth === 0) { end = i; break; }
  }
}
const objectLiteral = racesSrc.slice(braceStart, end + 1);
const sandbox = { module: { exports: {} }, exports: {} };
vm.runInContext('module.exports = ' + objectLiteral + ';', vm.createContext(sandbox));
const raceProfiles = sandbox.module.exports;

const langCoverage = {};

for (const [raceName, profile] of Object.entries(raceProfiles)) {
  if (!profile.categories && !profile.families) continue;
  const cats = new Set((profile.categories || []).map(c => c.toLowerCase()));
  const fams = new Set((profile.families || []).map(f => f.toLowerCase()));

  mixes.forEach(l => {
    if (l.tags && l.tags.includes('family')) return;
    const cat = (l.category || '').toLowerCase();
    const fam = (l.family || l.category || '').toLowerCase();
    if (cats.has(cat) || fams.has(fam)) {
      if (!langCoverage[l.iso]) langCoverage[l.iso] = [];
      langCoverage[l.iso].push(raceName);
    }
  });
}

const stats = Object.entries(langCoverage).map(([iso, races]) => ({
  iso,
  count: races.length,
  races: races.join(', ')
})).sort((a, b) => a.count - b.count);

const repoRoot = path.join(__dirname, '..', '..');
const outPath = path.join(repoRoot, 'tmp', 'state', 'json', 'lang_coverage_stats.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(stats, null, 2));
console.log('Total languages checked:', mixes.filter(l => !(l.tags && l.tags.includes('family'))).length);
console.log('Total languages covered:', Object.keys(langCoverage).length);
console.log('Stats saved to:', outPath);
