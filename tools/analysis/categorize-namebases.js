"use strict";

const fs = require('node:fs');
const path = require('node:path');

// Load the namebases
const namebasesPath = path.join(__dirname, 'modules', 'namebases-real.js');
const content = fs.readFileSync(namebasesPath, 'utf8');

// Extract the array
const match = content.match(/window\.realWorldNameBases\s*=\s*\[([\s\S]*)\];/);
if (!match) {
  console.error('Could not find the namebases array');
  process.exit(1);
}

const arrayContent = match[1];
const namebases = eval(`[${arrayContent}]`);

// Define continent categories
const continents = {
  africa: [],
  asia: [],
  europe: [],
  northAmerica: [],
  southAmerica: [],
  oceania: [],
  global: []
};

// Function to categorize based on name
function categorize(name) {
  const lower = name.toLowerCase();

  // Global
  if (lower.includes('global') || lower === 'old english' || lower === 'middle english') {
    return 'global';
  }

  // Africa
  if (lower.includes('berber') || lower.includes('nigerian') || lower.includes('berta') || lower.includes('gurage') || lower.includes('harari') || lower.includes('sekele') || lower.includes('taa click') || lower.includes('ng click') || lower.includes('nama click') || lower.includes('naro click') || lower.includes('papuan') || lower.includes('kgalagadi') || lower.includes('hadza') || lower.includes('sandawe') || lower.includes('enga') || lower.includes('dani') || lower.includes('central pacific') || lower.includes('new caledonia') || lower.includes('micronesian') || lower.includes('tuvaluan') || lower.includes('nauruan') || lower.includes('tokelauan')) {
    return 'africa'; // Oceania is part of Africa in some classifications, but let's put Oceania separately
  }

  // Oceania
  if (lower.includes('hawaiian') || lower.includes('central pacific') || lower.includes('new caledonia') || lower.includes('micronesian') || lower.includes('tuvaluan') || lower.includes('nauruan') || lower.includes('tokelauan') || lower.includes('vanuatu') || lower.includes('melanesian') || lower.includes('papuan') || lower.includes('australian aboriginal') || lower.includes('tasmanian')) {
    return 'oceania';
  }

  // Asia
  if (lower.includes('korean') || lower.includes('chinese') || lower.includes('japanese') || lower.includes('iranian') || lower.includes('mesopotamian') || lower.includes('arabic') || lower.includes('turkish') || lower.includes('mongolian') || lower.includes('tungusic') || lower.includes('southern mongolic') || lower.includes('mandara chadic') || lower.includes('bauchi chadic') || lower.includes('east chadic') || lower.includes('malay') || lower.includes('minangkabau') || lower.includes('lampung') || lower.includes('bima') || lower.includes('rejang') || lower.includes('basap') || lower.includes('selaru') || lower.includes('land dayak') || lower.includes('flores-lembata') || lower.includes('kei-tanimbar') || lower.includes('timoric') || lower.includes('sumba-flores') || lower.includes('tomini-tolitoli') || lower.includes('muna-buton') || lower.includes('minahasan') || lower.includes('sangiric') || lower.includes('kayan-murik') || lower.includes('melanau-kajang') || lower.includes('north sarawakan') || lower.includes('sabahan') || lower.includes('north borneo') || lower.includes('greater north borneo') || lower.includes('makassar branch') || lower.includes('south sulawesi') || lower.includes('northern south sulawesi') || lower.includes('central south sulawesi') || lower.includes('kaili-wolio') || lower.includes('saluan-banggai') || lower.includes('seko-badaic') || lower.includes('moklenic') || lower.includes('nasal') || lower.includes('northwest sumatra barrier islands') || lower.includes('sumatran') || lower.includes('shwng') || lower.includes('barito') || lower.includes('bali sasak sumbawa') || lower.includes('alor malay') || lower.includes('ambonese malay') || lower.includes('malaysian mandarin') || lower.includes('malayo-chamic') || lower.includes('malayo-polynesian') || lower.includes('western malayo-polynesian')) {
    return 'asia';
  }

  // Europe
  if (lower.includes('german') || lower.includes('english') || lower.includes('french') || lower.includes('italian') || lower.includes('castillian') || lower.includes('nordic') || lower.includes('greek') || lower.includes('roman') || lower.includes('finnic') || lower.includes('hungarian') || lower.includes('basque') || lower.includes('lechitic') || lower.includes('czech-slovak') || lower.includes('south slavic bcs') || lower.includes('bulgarian') || lower.includes('ukrainian') || lower.includes('gondi') || lower.includes('kui-kuvi dravidian') || lower.includes('koya-konda-manda-pengo') || lower.includes('bemba-bembe-fwe') || lower.includes('irish gaelic') || lower.includes('scottish gaelic') || lower.includes('south estonian a') || lower.includes('south estonian b') || lower.includes('middle english') || lower.includes('spanish global')) {
    return 'europe';
  }

  // North America
  if (lower.includes('inuit') || lower.includes('nahuatl') || lower.includes('seri') || lower.includes('huave') || lower.includes('shipibo-conibo') || lower.includes('warao') || lower.includes('yanomami') || lower.includes('purâ”œâŒpecha') || lower.includes('angolar sâ”œÃºo') || lower.includes('annobonese') || lower.includes('forro')) {
    return 'northAmerica';
  }

  // South America
  if (lower.includes('quechua') || lower.includes('swahili') || lower.includes('vietnamese') || lower.includes('cantonese') || lower.includes('arch')) {
    return 'southAmerica';
  }

  // Default to global if unsure
  return 'global';
}

// Categorize each namebase
namebases.forEach((nb, index) => {
  const continent = categorize(nb.name);
  continents[continent].push({
    originalIndex: nb.i,
    entry: nb
  });
});

// Output the categorization
console.log('Categorization Summary:');
Object.keys(continents).forEach(cont => {
  console.log(`${cont}: ${continents[cont].length} entries`);
  continents[cont].forEach(item => {
    console.log(`  ${item.entry.name} (i: ${item.originalIndex})`);
  });
});

// Now, to generate files, renumber indices within each continent
const fileContents = {};

Object.keys(continents).forEach(cont => {
  const entries = continents[cont].map((item, idx) => ({
    ...item.entry,
    i: idx // renumber from 0
  }));

  const content = `"use strict";

window.realWorldNameBases${cont.charAt(0).toUpperCase() + cont.slice(1)} = [
${entries.map(entry => `  ${JSON.stringify(entry, null, 2).replace(/\n/g, '\n  ')}`).join(',\n')}
];
`;

  fileContents[`namebases-${cont}.js`] = content;
});

console.log('\nFile Contents Generated:');
Object.keys(fileContents).forEach(filename => {
  console.log(`Generated ${filename}`);
  // Write files
  fs.writeFileSync(path.join(__dirname, 'modules', filename), fileContents[filename]);
});