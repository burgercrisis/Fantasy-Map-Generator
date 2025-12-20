
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function loadDefaultNameBases() {
  const sandbox = {window: {}, module: {exports: {}}, exports: {}, console, nameBases: []};
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, 'modules', 'namebases-real.js'),
    path.join(root, 'modules', 'namebases-fantasy.js'),
    path.join(root, 'modules', 'namebases-creole.js'),
    path.join(root, 'modules', 'namebases-all.js')
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, 'utf8');
    vm.runInContext(src, context, {filename: full});
  }

  return sandbox.window?.defaultNameBases;
}

function splitSeeds(blob) {
  if (!blob || typeof blob !== 'string') return [];
  return blob.split(',').map(s => s.trim()).filter(Boolean);
}

const nameBases = loadDefaultNameBases();
console.error('Loaded nameBases count:', nameBases.length);
const mixerMap = readJson('config/language-mixer-map.json');
console.error('Loaded mixerMap count:', Object.keys(mixerMap).length);

const results = [];
for (const entry of mixerMap) {
  if (entry.tags && entry.tags.includes('family')) continue;
  
  const iso = entry.iso;
  const bases = entry.bases || [];
  const seeds = new Set();
  for (const bIdx of bases) {
    const b = nameBases[bIdx]; // Use index directly as per namebases-all.js
    if (b && b.b) {
      splitSeeds(b.b).forEach(s => seeds.add(s));
    }
  }
  
  if (seeds.size < 50) {
    results.push({iso, name: entry.name, count: seeds.size});
  }
}

console.error('Found low premix count:', results.length);
results.sort((a, b) => a.count - b.count); // Start with lowest counts
const output = JSON.stringify(results.slice(0, 50), null, 2);
fs.writeFileSync('low_premix_list.json', output);
console.error('Wrote low_premix_list.json');
