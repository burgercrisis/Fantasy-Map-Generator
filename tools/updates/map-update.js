"use strict";

/**
 * Language Mixer Map Entry Updater
 * 
 * Updates the language-mixer-map.json with new base indices for multiple languages.
 * Ensures proper mapping between ISO language codes and namebase indices.
 * 
 * Usage:
 *   node tools/updates/map-update.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', 'config');
const mapPath = path.join(CONFIG_DIR, 'language-mixer-map.json');
let map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const isos = [
    "-azd-dialect", "-ejtun-dialect", "-sele", "aas-whistled", "abaza",
    "abba-gorgoryos", "abkhaz", "aboriginal-pidgin-english", "abruzzese", "acadian",
    "adeni-arabic", "adyghe", "aeolian", "aqc", "afar",
    "african-romance", "afrikaans", "afro-seminole-creole", "afroasiatic-family", "agalega-creole",
    "agaw", "ahom", "aiton", "ainu", "akan"
];

const startIdx = 13963;

isos.forEach((iso, i) => {
    const row = map.find(r => r.iso === iso);
    if (row) {
        const newIdx = startIdx + i;
        row.bases = row.bases.filter(b => typeof b !== 'number' || b < 13000);
        row.bases.push(newIdx);
    }
});

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log(`Updated 25 ISOs in language-mixer-map.json starting from index ${startIdx}`);
