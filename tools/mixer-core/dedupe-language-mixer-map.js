const fs = require('fs');
const path = require('path');

(function main() {
  const file = path.join(__dirname, '..', '..', 'config', 'language-mixer-map.json');
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse language-mixer-map.json:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error('Expected language-mixer-map.json to be an array');
    process.exit(1);
  }

  const lastIndexByIso = new Map();
  data.forEach((entry, idx) => {
    if (!entry || typeof entry.iso !== 'string') return;
    lastIndexByIso.set(entry.iso, idx);
  });

  const deduped = data.filter((entry, idx) => {
    if (!entry || typeof entry.iso !== 'string') return true;
    return lastIndexByIso.get(entry.iso) === idx;
  });

  const origIsos = new Set();
  const newIsos = new Set();

  data.forEach(entry => {
    if (entry && typeof entry.iso === 'string') origIsos.add(entry.iso);
  });

  deduped.forEach(entry => {
    if (entry && typeof entry.iso === 'string') newIsos.add(entry.iso);
  });

  if (origIsos.size !== newIsos.size) {
    console.error('ISO set size mismatch after dedupe:', origIsos.size, 'vs', newIsos.size);
    process.exit(1);
  }

  for (const iso of origIsos) {
    if (!newIsos.has(iso)) {
      console.error('ISO missing after dedupe:', iso);
      process.exit(1);
    }
  }

  fs.writeFileSync(file, JSON.stringify(deduped, null, 2) + '\n', 'utf8');
  console.log('Deduped language-mixer-map.json entries from', data.length, 'to', deduped.length, 'while preserving', origIsos.size, 'ISOs.');
})();
