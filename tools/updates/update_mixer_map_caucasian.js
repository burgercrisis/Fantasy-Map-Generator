"use strict";

/**
 * Caucasian Language Mixer Map Updater
 * 
 * Updates the language-mixer-map.json with correct base indices for Caucasian languages.
 * Specifically fixes Abkhaz, Adyghe, Chechen, Kva, and Ava language entries.
 * 
 * Usage:
 *   node tools/updates/update_mixer_map_caucasian.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', 'config');
const mixerMapPath = path.join(CONFIG_DIR, 'language-mixer-map.json');
let mixerMap = JSON.parse(fs.readFileSync(mixerMapPath, 'utf8'));

const updates = {
  'abkhaz': [13969],
  'adyghe': [13974],
  'chechen': [8617],
  'kva': [13917],
  'ava': [20583]
};

mixerMap.forEach(entry => {
  if (updates[entry.iso]) {
    console.log(`Updating ${entry.iso}: ${JSON.stringify(entry.bases)} -> ${JSON.stringify(updates[entry.iso])}`);
    entry.bases = updates[entry.iso];
  }
});

fs.writeFileSync(mixerMapPath, JSON.stringify(mixerMap, null, 2), 'utf8');
console.log('Successfully updated language-mixer-map.json');
