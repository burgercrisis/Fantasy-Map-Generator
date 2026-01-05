const fs = require('fs');

function getEntries(filePath, isAggregated = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  let blocks;
  if (isAggregated) {
    const basesMatch = content.match(/"bases":\s*(\[[\s\S]*?\])/);
    blocks = basesMatch[1].match(/\{[\s\S]*?\}/g);
  } else {
    blocks = content.match(/\{[\s\S]*?\}/g);
  }
  
  const entries = [];
  blocks.forEach(block => {
    const nameMatch = block.match(/"name":\s*"(.*?)"/);
    const indexMatch = block.match(/"i":\s*(\d+)/);
    if (nameMatch && indexMatch) {
      entries.push({ name: nameMatch[1], i: indexMatch[1], block });
    }
  });
  return entries;
}

const aggregated = getEntries('tools/data/namebase-aggregated.js', true);
const oceania = getEntries('modules/namebases-oceania.js');

const aggMap = {};
aggregated.forEach(e => aggMap[e.i] = e.name);

const oceaniaMap = {};
oceania.forEach(e => oceaniaMap[e.i] = e.name);

console.log('--- Oceania Entries Audit ---');

const toFix = [];
const missing = [];

oceania.forEach(e => {
  if (aggMap[e.i]) {
    if (aggMap[e.i] !== e.name) {
      toFix.push({ type: 'mismatch', i: e.i, oceaniaName: e.name, aggName: aggMap[e.i] });
    } else {
      // console.log(`${e.i}: Match (${e.name})`);
    }
  } else {
    // If it's not in aggregator, check if the index is used by something else in aggregator
    // (Already checked via aggMap[e.i])
    // So this is just an Oceania-only entry.
    // toFix.push({ type: 'only-in-oceania', i: e.i, name: e.name });
  }
});

// Keywords for Oceanic languages
const keywords = ['hawaiian', 'pijin', 'bislama', 'tok pisin', 'samoan', 'maori', 'fiji', 'tonga', 'tahiti', 'cook islands', 'micronesian', 'papuan', 'port jackson', 'queensland', 'yapese', 'maisin', 'norfuk', 'pitkern', 'unserdeutsch', 'kriol', 'laragia', 'wagiman', 'gaagudju', 'warlpiri', 'aboriginal'];

aggregated.forEach(e => {
  if (!oceaniaMap[e.i]) {
    const isOceanic = keywords.some(k => e.name.toLowerCase().includes(k));
    if (isOceanic) {
      missing.push(e);
    }
  }
});

console.log('Mismatches (Index shared with different name in aggregator):');
console.log(JSON.stringify(toFix, null, 2));

console.log('\nMissing Oceanic Entries (In aggregator but not in oceania.js):');
console.log(JSON.stringify(missing.map(e => ({ i: e.i, name: e.name })), null, 2));

const aggNames = new Set(aggregated.map(e => e.name.toLowerCase()));
const oceaniaOnly = oceania.filter(e => !aggNames.has(e.name.toLowerCase()));
console.log('\nOceania-only Entries (Not in aggregator by name):');
console.log(JSON.stringify(oceaniaOnly.map(e => ({ i: e.i, name: e.name })), null, 2));
