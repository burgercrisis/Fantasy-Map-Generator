"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const replacements = [
  {
    line: 425,
    name: "Extremaduran",
    oldBase: "extremadurana,extremaduranb,extremaduranc,extremadurand,extremadurane,extremaduranf,extremadurang,extremaduranh,extremadurani,extremaduranj,extremadurank,extremaduranl",
    newBase: "Badajoz,Mérida,Cáceres,Plasencia,Almendralejo,Zafra,Don Benito,Villanueva de la Serena,Llerena,Trujillo,Albuquerque"
  },
  {
    line: 427,
    name: "Faetar",
    oldBase: "faetara,faetarb,faetarc,faetard,faetare,faetarf,faetarg,faetarh,faetari,faetarj,faetark,faetarl",
    newBase: "Fátima,Ourém,Leiria,Coimbra,Santarém,Tomar,Abrantes,Pombal,Portalegre,Charneca,Vila Nova de Ourém"
  },
  {
    line: 428,
    name: "Fala",
    oldBase: "falaa,falab,falac,falad,falae,falaf,falag,falah,falai,falaj,falak,falal",
    newBase: "Ituero,Zamora,Salamanca,Valladolid,Ávila,Segovia,Soria,Burgos,Palencia,León,Ourense"
  },
  {
    line: 429,
    name: "Ferrarese",
    oldBase: "ferraresea,ferrareseb,ferraresec,ferraresed,ferraresee,ferraresef,ferrareseg,ferrareseh,ferraresei,ferraresej,ferraresek,ferraresel",
    newBase: "Ferrara,Bondeno,Portomaggiore,Cento,Mirabello,Vigarano Mainarda,Ostellato,Poggio Renatico,Jolanda di Savogno,Voghiera,Argenta"
  },
  {
    line: 432,
    name: "Florentine",
    oldBase: "florentinea,florentineb,florentinec,florentined,florentinee,florentinef,florentineg,florentineh,florentinei,florentinej,florentinek,florentinel",
    newBase: "Florence,Fiesole,Sesto Fiorentino,Campi Bisenzio,Scandicci,Prato,Pistoia,Pistoia,Empoli,Vinci,Certaldo"
  },
  {
    line: 433,
    name: "Forlivese",
    oldBase: "forlivesea,forliveseb,forlivesec,forlivesed,forlivesee,forlivesef,forliveseg,forliveseh,forlivesei,forlivesej,forlivesek,forlivesel",
    newBase: "Forlì,Cesena,Meldola,Forlimpopoli,Bertinoro,Predappio,Rocca San Casciano,Castrocaro,Marradi,Bagnacavallo,Montiano"
  },
  {
    line: 440,
    name: "Friulian",
    oldBase: "friuliana,friulianb,friulianc,friuliand,friuliane,friulianf,friuliang,friulianh,friuliani,friulianj,friuliank,friulianl",
    newBase: "Udine,Trieste,Pordenone,Gorizia,Cervignano del Friuli,Latisana,Spilimbergo,San Daniele del Friuli,Grado,Muggia"
  },
  {
    line: 441,
    name: "Galician",
    oldBase: "galiciana,galicianb,galicianc,galiciand,galiciane,galicianf,galiciang,galicianh,galiciani,galicianj,galiciank,galicianl",
    newBase: "Santiago de Compostela,Vigo,A Coruña,Ourense,Lugo,Pontevedra,Ferrol,Vilagarcía de Arousa,Ourense,Pontevedra,Marín"
  },
  {
    line: 450,
    name: "Gascon",
    oldBase: "gascona,gasconb,gasconc,gascond,gascone,gasconf,gascong,gasconh,gasconi,gasconj,gasconk,gasconl",
    newBase: "Bordeaux,Bayonne,Pau,Tarbes,Dax,Mont-de-Marsan,Agen,Biarritz,Périgueux,Bergerac,Toulouse,Auch"
  },
  {
    line: 451,
    name: "Genoese",
    oldBase: "genoesea,genoeseb,genoesec,genoesed,genoesee,genoesef,genoeseg,genoeseeh,genoesei,genoesej,genoesek,genoesel",
    newBase: "Genoa,Savona,La Spezia,Imperia,Chiavari,Rapallo,Albenga,Novi Ligure,Ventimiglia,Sestri Levante,Cogoleto"
  }
];

console.log('\n=== REPLACING PLACEHOLDERS (BATCH 1: Lines 425-451) ===\n');
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
  console.log(`\n✓ Replaced ${replaced} placeholders in Batch 1\n`);
} else {
  console.log('\nNo placeholders replaced\n');
}
