"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const replacements = [
  {
    line: 437,
    name: "Franco-Ontarian",
    oldBase: "francoontariana,francoontarianb,francoontarianc,francoontariand,francoontariane,francoontarianf,francoontariang,francoontarianh,francoontariani,francoontarianj,francoontariank,francoontarianl",
    newBase: "Toronto,Ottawa,Hamilton,Mississauga,Brampton,Kitchener,London,Windsor,Barrie,Sudbury,Sault Ste Marie"
  },
  {
    line: 438,
    name: "Franco-Provençal",
    oldBase: "francoprovenala,francoprovenalb,francoprovenalc,francoprovenald,francoprovenale,francoprovenalf,francoprovenalg,francoprovenalh,francoprovenali,francoprovenalj,francoprovenalk,francoprovenall",
    newBase: "Marseille,Aix-en-Provence,Arles,Avignon,Toulon,Nîmes,Nice,Orange,Aubagne,La Ciotat,Cannes"
  },
  {
    line: 439,
    name: "Frenchville French",
    oldBase: "frenchvillefrencha,frenchvillefrenchb,frenchvillefrenchc,frenchvillefrenchd,frenchvillefrenche,frenchvillefrenchf,frenchvillefrenchg,frenchvillefrenchh,frenchvillefrenchi,frenchvillefrenchj,frenchvillefrenchk,frenchvillefrenchl",
    newBase: "Paris,Lyon,Marseille,Toulouse,Lille,Bordeaux,Nantes,Strasbourg,Reims,Le Havre,Nancy,Rouen"
  },
  {
    line: 443,
    name: "Galician-Asturian",
    oldBase: "galicianasturiana,galicianasturianb,galicianasturianc,galicianasturiand,galicianasturiane,galicianasturianf,galicianasturiang,galicianasturianh,galicianasturiani,galicianasturianj,galicianasturiank,galicianasturianl",
    newBase: "Oviedo,Gijón,Avilés,Mieres,Luanco,Cangas del Narcea,Pola de Siero,Siero,Tineo,Allande,Villaviciosa"
  },
  {
    line: 444,
    name: "Gallo-Italic of Basilicata",
    oldBase: "galloitalicbasilicataa,galloitalicbasilicatab,galloitalicbasilicatac,galloitalicbasilicatad,galloitalicbasilicatae,galloitalicbasilicataf,galloitalicbasilicatag,galloitalicbasilicatah,galloitalicbasilicatai,galloitalicbasilicataj,galloitalicbasilicatak,galloitalicbasilicatal",
    newBase: "Potenza,Matera,Bari,Altamura,Andria,Barletta,Trani,Brindisi,Taranto,Lecce,Foggia"
  },
  {
    line: 445,
    name: "Gallo-Italic of Sicily",
    oldBase: "galloitalicsicilya,galloitalicsicilyb,galloitalicsicilyc,galloitalicsicilyd,galloitalicsicilye,galloitalicsicilyf,galloitalicsicilyg,galloitalicsicilyh,galloitalicsicilyi,galloitalicsicilyj,galloitalicsicilyk,galloitalicsicilyl",
    newBase: "Palermo,Catania,Messina,Syracuse,Trapani,Agrigento,Enna,Caltanissetta,Ragusa,Palermo,Gela"
  },
  {
    line: 446,
    name: "Gallo-Picene",
    oldBase: "gallopicenea,gallopiceneb,gallopicenec,gallopicened,gallopicenee,gallopicenef,gallopiceneg,gallopiceneh,gallopicenei,gallopicenej,gallopicenek,gallopicenel",
    newBase: "Amiens,Laon,Saint-Quentin,Beauvais,Compiègne,Cambrai,Arras,Lens,Valenciennes,Soissons,Châlons-en-Champagne"
  },
  {
    line: 447,
    name: "Gallurese",
    oldBase: "galluresea,gallureseb,galluresec,galluresed,galluresee,galluresef,gallureseg,gallureseh,galluresei,galluresej,galluresek,galluresel",
    newBase: "Tempio Pausania,San Teodoro,Santa Teresa Gallura,Olbia,La Maddalena,Arzachena,Tempio,Corsica,Aggius,Bonifacio"
  },
  {
    line: 478,
    name: "Ligurian",
    oldBase: "liguriana,ligurianb,ligurianc,liguriand,liguriane,ligurianf,liguriang,ligurianh,liguriani,ligurianj,liguriank,ligurianl",
    newBase: "Genova,La Spezia,Imperia,Savona,Sestri Levante,Cogoleto,Boglietto,Chiavari,Lavagna,Casanova"
  },
  {
    line: 479,
    name: "Limousin",
    oldBase: "limousina,limousinb,limousinc,limousind,limousine,limousinf,limousing,limousinh,limousini,limousinj,limousink,limousinl",
    newBase: "Limoges,Brive-la-Gaillarde,Tulle,Guéret,Aubusson,Nontron,Excideuil,Meymac,La Souterraine,Haute-Vienne"
  },
  {
    line: 482,
    name: "Lombard",
    oldBase: "lombarda,lombardb,lombardc,lombardd,lombarde,lombardf,lombardg,lombardh,lombardi,lombardj,lombardk,lombardl",
    newBase: "Milan,Brescia,Bergamo,Brescia,Como,Varese,Monza,Mantua,Pavia,Cremona,Lodi"
  },
  {
    line: 492,
    name: "Manduriano",
    oldBase: "mandurianoa,mandurianob,mandurianoc,mandurianod,mandurianoe,mandurianof,mandurianog,mandurianoh,mandurianoi,mandurianoj,mandurianok,mandurianol",
    newBase: "Mantua,Crema,Suzzara,Viadana,Curtatone,Marcigno,Motteggiana,Volta Mantovana,Goito,Quistello,Sabbioneta"
  },
  {
    line: 497,
    name: "Messinese",
    oldBase: "messinesea,messineseb,messinesec,messinesed,messinesee,messinesef,messineseg,messineseeh,messinesei,messinesej,messinesek,messinesel",
    newBase: "Messina,Taormina,Barcellona Pozzo di Gotto,Milazzo,Patti,Sant'Agata di Militello,Capo d'Orlando,Milazzo,Rocca di Capri Leone"
  },
  {
    line: 499,
    name: "Milanese",
    oldBase: "milanesea,milaneseb,milanesec,milanesed,milanesee,milanesef,milaneseg,milaneseh,milanesei,milanesej,milanesek,milanesel",
    newBase: "Milano,Busto Arsizio,Sesto San Giovanni,Legnano,Rho,Monza,Bergamo,Cinisello Balsamo,Paderno Dugnano,Cormano"
  }
];

console.log('\n=== REPLACING PLACEHOLDERS (BATCH 2: Lines 437-499) ===\n');
let replaced = 0;

replacements.forEach(r => {
  if (lines[r.line - 1] && lines[r.line - 1].includes(r.name)) {
    const oldLine = lines[r.line - 1];
    const newLine = oldLine.replace(r.oldBase, r.newBase);
    if (oldLine !== newLine) {
      lines[r.line - 1] = newLine;
      console.log(`✓ Line ${r.line}: ${r.name} - Replaced placeholder`);
      console.log(`  Added: ${r.newBase.substring(0, 60)}...`);
      replaced++;
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ Replaced ${replaced} placeholders in Batch 2\n`);
} else {
  console.log('\nNo placeholders replaced\n');
}
