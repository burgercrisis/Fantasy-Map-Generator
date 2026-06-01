"use strict";
const fs = require("fs");
const path = require("path");

const MODULES_DIR = "modules";
const CONFIG_DIR = "config";
const CONTINENT_FILES = [
  "namebases-africa.js","namebases-asia.js","namebases-europe.js",
  "namebases-northAmerica.js","namebases-southAmerica.js","namebases-oceania.js","namebases-unknown.js"
];

const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));
const catalogByName = new Map();
for (const c of catalog) { if (!catalogByName.has(c.name)) catalogByName.set(c.name, c); }

const allEntries = [];
for (const f of CONTINENT_FILES) {
  const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
  const re = /"i":\s*(\d+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const idx = parseInt(m[1], 10);
    const entryStart = content.lastIndexOf('{', m.index);
    const entryEnd = content.indexOf('}', m.index) + 1;
    if (entryStart === -1 || entryEnd === 0) continue;
    const entryStr = content.slice(entryStart, entryEnd);
    const nameMatch = entryStr.match(/"name":\s*"([^"]+)"/);
    const bMatch = entryStr.match(/"b":\s*"([^"]*)"/);
    if (!nameMatch) continue;
    const entryName = nameMatch[1].trim();
    const b = bMatch ? bMatch[1] : '';
    const seeds = b.split(',').map(s => s.trim()).filter(s => s);
    allEntries.push({ idx, name: entryName, file: f.replace("namebases-","").replace(".js",""), seeds, catInfo: catalogByName.get(entryName) || null });
  }
}

// Known corrupted entries (manual inspection revealed these specific swaps)
// Format: [index, correctSeedSource] where correctSeedSource is the index of the entry that has the right seeds
const KNOWN_CORRUPTIONS = {};
// We'll detect programmatically

// Detect seeds that are completely wrong for the language:
// If >50% of seeds match a pattern from a different family, flag it
const ARABIC_PATTERN = /^(Mecca|Medina|Jeddah|Cairo|Baghdad|Damascus|Beirut|Amman|Riyadh|Abu Dhabi|Doha|Kuwait|Muscat|Sanaa|Aden|Taiz|Hodeidah|Basra|Mosul|Erbil|Najaf|Karbala|Nasiriyah|Diwaniyah|Kut|Hilla|Ramadi|Fallujah|Tikrit|Kirkuk|Sulaymaniyah|Duhok|Sahara|Arabian)$/i;
const WEST_AFRICAN_PATTERN = /^(Niamey|Maradi|Tahoua|Zinder|Niger|Lagos|Kano|Ibadan|Abuja|Port Harcourt|Benin City|Kaduna|Nigerian|West Africa|Sahel|Igbo|Yoruba|Hausa|Fulani|Wolof|Mandinka)$/i;
const ETHIOPIAN_PATTERN = /^(Addis Ababa|Dire Dawa|Mekele|Gondar|Hawassa|Bahir Dar|Jimma|Dessie|Jijiga|Shashamane|Arba Minch|Hosaena|Sodo|Ambo|Nekemte|Asella|Debre Markos|Debre Birhan|Debre Tabor|Kombolcha|Harar|Axum|Lalibela|Gonder|Ethiopia|Eritrea|Amharic|Oromo|Somali|Gurage|Tigrinya)$/i;

const suspicious = [];
for (const entry of allEntries) {
  if (entry.seeds.length < 3) continue;
  const cat = entry.catInfo;
  if (!cat) continue;

  let arabicCount = 0, westAfricanCount = 0, ethiopianCount = 0;
  for (const seed of entry.seeds) {
    if (ARABIC_PATTERN.test(seed)) arabicCount++;
    if (WEST_AFRICAN_PATTERN.test(seed)) westAfricanCount++;
    if (ETHIOPIAN_PATTERN.test(seed)) ethiopianCount++;
  }

  const family = cat.family || '';
  const region = cat.region || '';
  let corrupted = false;
  let reason = '';

  // Ethiopian/Ethiosemitic entries should NOT have mostly West African seeds
  if ((family.includes('Ethio-Semitic') || family.includes('Ethiopian') || entry.name.includes('Gurage') || entry.name.includes('Amharic')) && westAfricanCount > 2 && westAfricanCount > ethiopianCount) {
    corrupted = true;
    reason = 'Ethiopian entry has ' + westAfricanCount + ' West African seeds vs ' + ethiopianCount + ' Ethiopian';
  }
  // West African entries should NOT have mostly Ethiopian seeds
  if (region === 'Africa' && family.includes('Niger-Congo') && ethiopianCount > 2 && ethiopianCount > westAfricanCount) {
    corrupted = true;
    reason = 'Niger-Congo entry has ' + ethiopianCount + ' Ethiopian seeds vs ' + westAfricanCount + ' West African';
  }
  // Arabic entries should NOT have mostly Ethiopian/West African seeds
  if ((family.includes('Semitic') || family.includes('Arabic')) && !entry.name.includes('Ethio') && !entry.name.includes('Eritrean') && westAfricanCount > 3 && westAfricanCount > arabicCount) {
    corrupted = true;
    reason = 'Arabic entry has ' + westAfricanCount + ' West African seeds vs ' + arabicCount + ' Arabic';
  }

  if (corrupted) {
    suspicious.push({ name: entry.name, idx: entry.idx, file: entry.file, family, region, seeds: entry.seeds.length, reason, sample: entry.seeds.slice(0, 8).join(', ') });
  }
}

console.log("Corrupted b-fields found:", suspicious.length);
for (const s of suspicious) {
  console.log("  [" + s.idx + "] '" + s.name + "' (" + s.file + "): " + s.reason);
  console.log("    " + s.sample);
}
