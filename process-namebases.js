"use strict";

const fs = require('fs');
const path = require('path');

// Read the backup file
const backupPath = path.join(__dirname, 'modules', 'namebases-real.backup-20251228-221152.js');
const content = fs.readFileSync(backupPath, 'utf8');

// Extract the array part
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']');
const arrayContent = content.substring(arrayStart, arrayEnd + 1);

// Parse the array
let namebases;
try {
  namebases = eval(arrayContent);
} catch (e) {
  console.error('Error parsing array:', e);
  process.exit(1);
}

console.log(`Loaded ${namebases.length} entries.`);

// Deduplicate by trimmed name
const deduped = [];
const seen = new Set();

for (const entry of namebases) {
  const trimmedName = entry.name.trim();
  if (!seen.has(trimmedName)) {
    seen.add(trimmedName);
    deduped.push({ ...entry, name: trimmedName });
  }
}

console.log(`After deduplication: ${deduped.length} entries.`);

// Now, categorize by continents
// Since many are non-standard, I'll categorize based on keywords.

const getContinent = (name) => {
  const lower = name.toLowerCase();

  // Africa
  if (lower.includes('african') || lower.includes('swahili') || lower.includes('berber') ||
      lower.includes('hausa') || lower.includes('yoruba') || lower.includes('zulu') ||
      lower.includes('amharic') || lower.includes('somali') || lower.includes('arabic') && lower.includes('sudani') ||
      lower.includes('tigr') || lower.includes('afar') || lower.includes('oromo') ||
      lower.includes('fula') || lower.includes('wolof') || lower.includes('mandinka') ||
      lower.includes('akan') || lower.includes('ewe') || lower.includes('ga') ||
      lower.includes('igbo') || lower.includes('edo') || lower.includes('nupe') ||
      lower.includes('fon') || lower.includes('ewondo') || lower.includes('dual') ||
      lower.includes('mongo') || lower.includes('lingala') || lower.includes('swahili') ||
      lower.includes('masai') || lower.includes('kikuyu') || lower.includes('luo') ||
      lower.includes('xhosa') || lower.includes('ndebele') || lower.includes('tswana') ||
      lower.includes('sesotho') || lower.includes('setswana') || lower.includes('shona') ||
      lower.includes('bemba') || lower.includes('luba') || lower.includes('swazi') ||
      lower.includes('chewa') || lower.includes('tonga') || lower.includes('lozi')) {
    return 'Africa';
  }

  // Asia
  if (lower.includes('asian') || lower.includes('chinese') || lower.includes('japanese') ||
      lower.includes('korean') || lower.includes('vietnamese') || lower.includes('thai') ||
      lower.includes('burmese') || lower.includes('cambodian') || lower.includes('laotian') ||
      lower.includes('malay') || lower.includes('indonesian') || lower.includes('filipino') ||
      lower.includes('tagalog') || lower.includes('cebuano') || lower.includes('ilokano') ||
      lower.includes('hindi') || lower.includes('urdu') || lower.includes('bengali') ||
      lower.includes('punjabi') || lower.includes('gujarati') || lower.includes('marathi') ||
      lower.includes('tamil') || lower.includes('telugu') || lower.includes('kannada') ||
      lower.includes('malayalam') || lower.includes('sinhala') || lower.includes('nepali') ||
      lower.includes('persian') || lower.includes('pashto') || lower.includes('dari') ||
      lower.includes('uzbek') || lower.includes('kazakh') || lower.includes('kyrgyz') ||
      lower.includes('tajik') || lower.includes('turkmen') || lower.includes('arabic') && !lower.includes('andalusi') ||
      lower.includes('hebrew') || lower.includes('armenian') || lower.includes('georgian') ||
      lower.includes('azerbaijani') || lower.includes('turkish') || lower.includes('mongolian') ||
      lower.includes('tibetan') || lower.includes('bhutanese') || lower.includes('uyghur')) {
    return 'Asia';
  }

  // North America
  if (lower.includes('inuit') || lower.includes('nahuatl') || lower.includes('navajo') ||
      lower.includes('apache') || lower.includes('sioux') || lower.includes('cherokee') ||
      lower.includes('creek') || lower.includes('seminole') || lower.includes('iroquois') ||
      lower.includes('algonquin') || lower.includes('blackfoot') || lower.includes('crow') ||
      lower.includes('shoshone') || lower.includes('ute') || lower.includes('hopi') ||
      lower.includes('zuni') || lower.includes('kewa') || lower.includes('tiwa') ||
      lower.includes('towa') || lower.includes('jicarilla') || lower.includes('mescalero') ||
      lower.includes('chiricahua') || lower.includes('lipan') || lower.includes('karankawa') ||
      lower.includes('coahuilteco') || lower.includes('comanche') || lower.includes('kiowa') ||
      lower.includes('arapaho') || lower.includes('cheyenne') || lower.includes('pawnee') ||
      lower.includes('oshage') || lower.includes('kansa') || lower.includes('quapaw') ||
      lower.includes('tunica') || lower.includes('biloxi') || lower.includes('choctaw') ||
      lower.includes('chickasaw') || lower.includes('muscogee') || lower.includes('seminole') ||
      lower.includes('timucua') || lower.includes('calusa') || lower.includes('apalachicola') ||
      lower.includes('north america') || lower.includes('american') && lower.includes('english') ||
      lower.includes('canadian') || lower.includes('mexican') && lower.includes('spanish')) {
    return 'North America';
  }

  // South America
  if (lower.includes('quechua') || lower.includes('guarani') || lower.includes('aymara') ||
      lower.includes('tupi') || lower.includes('guarani') || lower.includes('mapuche') ||
      lower.includes('araucanian') || lower.includes('yanomami') || lower.includes('yanomamo') ||
      lower.includes('aweti') || lower.includes('karaja') || lower.includes('xavante') ||
      lower.includes('bororo') || lower.includes('nambikwara') || lower.includes('terena') ||
      lower.includes('paresi') || lower.includes('waiwai') || lower.includes('ticuna') ||
      lower.includes('yagua') || lower.includes('shipibo') || lower.includes('ashaninka') ||
      lower.includes('machiguenga') || lower.includes('yine') || lower.includes('harakmbut') ||
      lower.includes('kakinte') || lower.includes('arawak') || lower.includes('tucano') ||
      lower.includes('guahibo') || lower.includes('pemon') || lower.includes('wari') ||
      lower.includes('chamacoco') || lower.includes('lengua') || lower.includes('toba') ||
      lower.includes('mocovi') || lower.includes('pilaga') || lower.includes('wichi') ||
      lower.includes('chorote') || lower.includes('nivacle') || lower.includes('makka') ||
      lower.includes('south america') || lower.includes('brazilian') || lower.includes('andean')) {
    return 'South America';
  }

  // Oceania
  if (lower.includes('oceania') || lower.includes('australian') || lower.includes('aboriginal') ||
      lower.includes('papuan') || lower.includes('hawaiian') || lower.includes('maori') ||
      lower.includes('samoan') || lower.includes('tahitian') || lower.includes('fijian') ||
      lower.includes('tongan') || lower.includes('niuean') || lower.includes('tokelauan') ||
      lower.includes('tuvaluan') || lower.includes('nauruan') || lower.includes('kiribati') ||
      lower.includes('marshallese') || lower.includes('palauan') || lower.includes('chamorro') ||
      lower.includes('pohnpeian') || lower.includes('chuukese') || lower.includes('kosraean') ||
      lower.includes('yapese') || lower.includes('mortlockese') || lower.includes('pingelapese') ||
      lower.includes('mokilese') || lower.includes('ngatikese') || lower.includes('woleai') ||
      lower.includes('lamotrek') || lower.includes('satawal') || lower.includes('pulawat') ||
      lower.includes('pulap') || lower.includes('namonuito') || lower.includes('hatohobei') ||
      lower.includes('sonorolese') || lower.includes('rarotongan') || lower.includes('mauke') ||
      lower.includes('aitiutaki') || lower.includes('mitiaro') || lower.includes('mauke') ||
      lower.includes('penrhyn') || lower.includes('suwarrow') || lower.includes('rakahanga') ||
      lower.includes('manuae') || lower.includes('takutea') || lower.includes('mangaia') ||
      lower.includes('aatu') || lower.includes('maupihaa') || lower.includes('motutunga') ||
      lower.includes('rangiroa') || lower.includes('tiamana') || lower.includes('marutea') ||
      lower.includes('ahe') || lower.includes('takaroa') || lower.includes('makemo') ||
      lower.includes('pukapuka') || lower.includes('nassau') || lower.includes('danger') ||
      lower.includes('kermadec') || lower.includes('raoul') || lower.includes('macquarie') ||
      lower.includes('antarctic') || lower.includes('tok pisin') || lower.includes('hiri motu') ||
      lower.includes('pidgin') && lower.includes('english') && lower.includes('pacific')) {
    return 'Oceania';
  }

  // Europe (default)
  return 'Europe';
};

// Now categorize
const continents = {
  Africa: [],
  Asia: [],
  Europe: [],
  'North America': [],
  'South America': [],
  Oceania: []
};

for (const entry of deduped) {
  const continent = getContinent(entry.name);
  continents[continent].push(entry);
}

console.log('Categorization counts:');
for (const [cont, arr] of Object.entries(continents)) {
  console.log(`${cont}: ${arr.length}`);
}

// Now, write continent files
for (const [cont, arr] of Object.entries(continents)) {
  const filename = `modules/namebases-${cont.replace(' ', '').toLowerCase()}.js`;
  const content = `"use strict";

window.${cont.replace(' ', '')}NameBases = ${JSON.stringify(arr, null, 2)};
`;
  fs.writeFileSync(path.join(__dirname, filename), content);
  console.log(`Written ${filename}`);
}

// Now, concatenate all into namebases-real.js with unique ranges per continent
const continentOrder = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const rangeSize = 1000; // Allocate 1000 slots per continent

const all = [];
let currentIndex = 0;

for (const cont of continentOrder) {
  const entries = continents[cont];
  for (let i = 0; i < entries.length; i++) {
    entries[i].i = currentIndex + i;
  }
  all.push(...entries);
  currentIndex += rangeSize;
}

const mainContent = `"use strict";

window.realWorldNameBases = ${JSON.stringify(all, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'modules', 'namebases-real.js'), mainContent);
console.log(`Updated modules/namebases-real.js with ${all.length} entries.`);

// Verify count
console.log(`Final count: ${all.length}`);