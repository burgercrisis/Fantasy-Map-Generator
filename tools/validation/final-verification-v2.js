"use strict";

/**
 * Final Verification Report (v2)
 * 
 * Alternative verification script checking for known placeholder patterns.
 * Scans all continent namebase files for generated city name patterns.
 * Reports on entries with potential placeholder data.
 * 
 * Usage:
 *   node tools/validation/final-verification-v2.js
 */

const fs = require('fs');
const path = require('path');

const modulesPath = 'modules';
const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const placeholderPatterns = [
  'fabrianob,fabrianoc,fabrianod,fabrianoe,fabrianof',
  'faetara,faetarb,faetarc,faetard,faetare',
  'falaa,falab,falac,falad,falae,falaf',
  'ferraresea,ferrareseb,ferraresec,ferraresed,ferraresee',
  'fiumana,fiumanb,fiumanc,fiumand,fiumane,fiumanf',
  'fiumiano,fiumianb,fiumianc,fumiand,fumiane,fiumianf',
  'florentinea,florentineb,florentinec,florentined,florentinee,florentinef',
  'forlivese,forliveseb,forlivesec,forlivesed,forlivesee',
  'galliopicenea,gallopiceneb,gallopicenec,gallopicened,gallopicenee',
  'galluresea,gallureseb,galluresec,galluresed,galluresee,galluresef',
  'gardiola,gardiolb,gardiolc,gardiold,gardioloe,gardiolof',
  'gascon,gasconb,gasconc,gascond,gascod,gascone,gasconf',
  'genoese,genoeseb,genoesec,genoesed,genoesee,genoesef',
  'grossetano,grossetanob,grossetanoc,grossetanod,grossetanoe',
  'grossetan,grossetanob,grossetanoc,grossetanod,grossetanoe,grossetanef',
  'haketia,haketiaa,haketiac,haketiad,haketiae,haketiaf',
  'intemelio,intemeliob,intemelioc,intemeliod,intemelioe,intemeliof',
  'istriot,istriota,istriotb,istriotc,istriotd,istriote',
  'italoaustralian,italoaustraliana,italoaustralianb,italoaustralianc',
  'jauer,jauera,jauerb,jauerc,jauerd,jauere'
];

function parseJSArray(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf('];');
  if (startIndex === -1 || endIndex === -1) return [];
  const jsStr = content.substring(startIndex, endIndex + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    return [];
  }
}

console.log('\n=== FINAL VERIFICATION (v2) ===\n');

let totalEntries = 0;
let smallBases = 0;
let patternMatches = 0;
const potentialPlaceholders = [];

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (!fs.existsSync(filePath)) return;
  
  const entries = parseJSArray(filePath);
  const continent = file.replace('namebases-', '').replace('.js', '');
  
  console.log(`Checking ${file}: ${entries.length} entries`);
  
  entries.forEach(nb => {
    if (!nb || !nb.b) return;
    totalEntries++;
    
    const cities = nb.b.split(',');
    
    if (cities.length < 5) {
      smallBases++;
      potentialPlaceholders.push({ name: nb.name, i: nb.i, count: cities.length, continent, file });
    }
    
    const firstCity = cities[0] || '';
    const matchesPattern = placeholderPatterns.some(p => firstCity.includes(p.substring(0, 10)));
    if (matchesPattern) {
      patternMatches++;
      potentialPlaceholders.push({ name: nb.name, i: nb.i, count: cities.length, continent, file, reason: 'pattern' });
    }
  });
});

console.log('\n=== PLACEHOLDER COUNT ===\n');
console.log(`Total entries scanned: ${totalEntries}`);
console.log(`Entries with <5 cities: ${smallBases}`);
console.log(`Pattern matches: ${patternMatches}`);
console.log(`Total potential placeholders: ${potentialPlaceholders.length}`);

console.log('\n=== QUALITY SCORE ===\n');
const authenticQuality = totalEntries > 0 ? Math.round((totalEntries - potentialPlaceholders.length) / totalEntries * 100) : 0;
console.log(`Authentic quality: ${authenticQuality}%`);

if (potentialPlaceholders.length > 0) {
  console.log('\n=== TOP POTENTIAL PLACEHOLDERS ===\n');
  potentialPlaceholders.slice(0, 20).forEach(p => {
    console.log(`  [${p.continent}] ${p.name} (i=${p.i}, cities=${p.count})`);
  });
}

console.log('\n=== CONTINENT BREAKDOWN ===\n');
const continentStats = {};
continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (!fs.existsSync(filePath)) return;
  
  const entries = parseJSArray(filePath);
  const continent = file.replace('namebases-', '').replace('.js', '');
  
  let continentSmall = 0;
  entries.forEach(nb => {
    if (nb && nb.b) {
      const cities = nb.b.split(',');
      if (cities.length < 5) continentSmall++;
    }
  });
  
  console.log(`  ${continent}: ${entries.length} entries, ${continentSmall} with <5 cities`);
});
