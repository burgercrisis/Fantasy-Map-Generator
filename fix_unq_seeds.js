const fs = require('fs');
const path = require('path');

/**
 * Script to replace _unq placeholders in namebases-real.js with real seeds.
 * Usage: node fix_unq_seeds.js --iso=iso-code --seeds="Seed1,Seed2,Seed3"
 */

const args = process.argv.slice(2);
const isoArg = args.find(a => a.startsWith('--iso='));
const seedsArg = args.find(a => a.startsWith('--seeds='));

if (!isoArg || !seedsArg) {
  console.error('Usage: node fix_unq_seeds.js --iso=iso-code --seeds="Seed1,Seed2,Seed3"');
  process.exit(1);
}

const iso = isoArg.split('=')[1];
const seeds = seedsArg.split('=')[1].split(',').map(s => s.trim()).filter(s => s);

if (seeds.length < 5) {
  console.warn(`Warning: Only ${seeds.length} seeds provided for ${iso}. Quality might be low.`);
}

const namebasesPath = path.resolve(__dirname, 'modules/namebases-real.js');
let content = fs.readFileSync(namebasesPath, 'utf8');

// Find the dedicated entry for this ISO
// It usually looks like {name: "Language Name (dedicated)", i: 21122, ..., b: "iso_21122_unq1,..."}
// Or it might use the ISO directly in the name if we changed it.
// We'll search for the ISO in the seeds first to find the index.

const unqRegex = new RegExp(`b: "(${iso}_(\\d+)_unq1,.*?)"`, 'g');
let match = unqRegex.exec(content);

if (!match) {
  // Try searching by name in the dedicated entry
  // We need the index from language-mixer-map.json first if possible
  const mixerMapPath = path.resolve(__dirname, 'config/language-mixer-map.json');
  const mixerMap = JSON.parse(fs.readFileSync(mixerMapPath, 'utf8'));
  const mapEntry = mixerMap.find(e => e.iso === iso);
  
  if (mapEntry && mapEntry.bases && mapEntry.bases.length > 0) {
    const index = mapEntry.bases[0];
    const indexRegex = new RegExp(`{name: ".*?", i: ${index},.*?, b: "(.*?)"}`, 'g');
    match = indexRegex.exec(content);
  }
}

if (!match) {
  console.error(`Could not find dedicated entry for ISO: ${iso}`);
  process.exit(1);
}

const oldSeeds = match[1];
const newSeeds = seeds.join(',');

content = content.replace(oldSeeds, newSeeds);

fs.writeFileSync(namebasesPath, content, 'utf8');
console.log(`Successfully updated ${iso} with ${seeds.length} real seeds.`);
