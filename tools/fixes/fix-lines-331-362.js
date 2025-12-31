"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING PLACEHOLDERS ===\n');

const replacements = [
  {
    line: 331,
    name: "Neapolitan",
    oldBase: "neapolitanlanga,neapolitanlangb,neapolitanlangc,neapolitanlangd,neapolitanlange,neapolitanlangf,neapolitanlangg,neapolitanlangh,neapolitanlangi,neapolitanlangj,neapolitanlangk,neapolitanlangl",
    newBase: "Naples,Sorrento,Pompei,Ercolano,Avellino,Benevento,Caserta,Salerno,Amalfi,Ravello,Positano"
  },
  {
    line: 333,
    name: "Pugliese",
    oldBase: "pugliesea,puglieseb,pugliesec,pugliesed,pugliesee,pugliesef,puglieseg,puglieseeh,puglieseei,puglieseej,puglieseek,puglieseel",
    newBase: "Bari,Bari,Brindisi,Taranto,Foggia,Lecce,Bari,Andria,Bisceglie,Bari,Altamura,Bari,Barletta"
  },
  {
    line: 334,
    name: "South Lucanian",
    oldBase: "southlucanian,southlucanianb,southlucanianc,southlucaniand,southlucaniane,southlucanianf,southlucaniang,southlucanianh,southlucaniani,southlucanianj,southlucaniank,southlucanianl",
    newBase: "Potenza,Matera,Melfi,Gravina,Benevento,Avellino,Foggia,Campobasso,Larino,Rionero,Bisceglie"
  },
  {
    line: 342,
    name: "French (fra)",
    oldBase: "fraa,frab,frac,frad,frae,fraf,frag,frah,frai,fraj,frak,fral",
    newBase: "Paris,Lyon,Marseille,Nice,Strasbourg,Bordeaux,Nantes,Toulouse,Lille,Rouen,Reims,Nancy"
  },
  {
    line: 347,
    name: "Lorrain",
    oldBase: "lorraia,lorrainb,lorrainc,lorraind,lorraine,lorrainf,lorraing,lorrainh,lorraini,lorrainj,lorraink,lorrainl",
    newBase: "Nancy,Metz,Épinal,Verdun,Thionville,Bar-le-Duc,Longwy,Vesoul,Belfort,Montbéliard,Dole"
  },
  {
    line: 349,
    name: "Meridional French",
    oldBase: "meridionalfrench_toulouse,meridionalfrench_montpellier,meridionalfrench_nimes,meridionalfrench_perpignan,meridionalfrench_beziers,meridionalfrench_narbonne,meridionalfrench_carcassonne,meridionalfrench_foix,meridionalfrench_albi,meridionalfrench_castres,meridionalfrench_rodez,meridionalfrench_mende",
    newBase: "Toulouse,Montpellier,Nimes,Perpignan,Beziers,Narbonne,Carcassonne,Foix,Albi,Castres,Rodez,Mende"
  },
  {
    line: 350,
    name: "Moselle Romance",
    oldBase: "moselleromance_metz,moselleromance_thionville,moselleromance_sarrebourg,moselleromance_sarreguemines,moselleromance_forbach,moselleromance_boulay,moselleromance_bouzonville,moselleromance_saintavold,moselleromance_bitche,moselleromance_chateau-salins,moselleromance_mo-selle,moselleromance_saulnois",
    newBase: "Metz,Thionville,Sarrebourg,Sarreguemines,Forbach,Boulay,Bouzonville,Saint-Avold,Bitche,Château-Salins,Mo-Selle,Saulnois"
  },
  {
    line: 351,
    name: "Orleanais",
    oldBase: "orleanais_orleans,orleanais_olivet,orleanais_fleury,orleanais_stjeandelabraye,orleanais_saran,orleanais_la-chapelle,orleanais_gien,orleanais_montargis,orleanais_pithiviers,orleanais_beaugency,orleanais_meung",
    newBase: "Orléans,Fleury-les-Aubrais,Saint-Jean-de-Braye,Saran,La Chapelle-Saint-Mesmin,Gien,Montargis,Pithiviers,Beaugency,Meung-sur-Loire"
  },
  {
    line: 352,
    name: "Paydret",
    oldBase: "paydret_pau,paydret_orthez,paydret_oloron,paydret_tarbes,paydret_lourdes,paydret_bagneres,paydret_bearn,paydret_bigorre,paydret_ossau,paydret_aspe,paydret_lavedan,paydret_gaves",
    newBase: "Pau,Orthez,Lourdes,Tarbes,Bagneres,Bigorre,Ossau,Aspe,Lavedan,Gaves,Béarn"
  },
  {
    line: 353,
    name: "Picard",
    oldBase: "picard_amiens,picard_arras,picard_abbeville,picard_beauvais,picard_saintquentin,picard_compiegne,picard_peronne,picard_albert,picard_doullens,picard_cambrai,picard_lens,picard_bethune",
    newBase: "Amiens,Arras,Abbeville,Beauvais,Saint-Quentin,Compiègne,Laon,Péronne,Albert,Doullens,Cambrai,Lens,Bethune,Senlis"
  },
  {
    line: 359,
    name: "Algherese",
    oldBase: "algheresea,alghereseb,algheresec,algheresed,algheresee,algheresef,alghereseg,alghereseh,alghereseei,algheresej,algheresek,algheresel",
    newBase: "Alghero,Sassari,Nuoro,Oristano,Porto Torres,Olbia,Tempio,Macomer,Bosa,La Maddalena"
  },
  {
    line: 360,
    name: "Ancona",
    oldBase: "anconaa,anconab,anconac,anconad,anconae,anconaf,anconag,anconah,anconai,anconaj,anconak,anconal",
    newBase: "Ancona,Fabriano,Jesi,Osimo,Senigallia,Camerino,Chiaravalle,Civitanova Marche,Recanati,San Severino Marche,Matelica"
  },
  {
    line: 361,
    name: "Andalus Romance",
    oldBase: "andalusiromancea,andalusiromanceb,andalusiromancec,andalusiromanced,andalusiromancee,andalusiromancef,andalusiromanceg,andalusiromanceh,andalusiromancei,andalusiromancej,andalusiromancek,andalusiromancel",
    newBase: "Córdoba,Granada,Málaga,Sevilla,Cádiz,Huelva,Zaragoza,Badajoz,Murcia,Valencia,Alicante,Almería"
  }
];

let replaced = 0;

replacements.forEach(r => {
  if (lines[r.line - 1] && lines[r.line - 1].includes(r.name)) {
    const oldLine = lines[r.line - 1];
    const newLine = oldLine.replace(r.oldBase, r.newBase);
    if (oldLine !== newLine) {
      lines[r.line - 1] = newLine;
      console.log(`✓ Line ${r.line}: ${r.name}`);
      console.log(`  ${r.newBase.substring(0, 60)}...`);
      replaced++;
    } else {
      console.log(`- Line ${r.line}: ${r.name} (no change)`);
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ FIXED ${replaced} placeholders with authentic cities\n`);
} else {
  console.log('\nNo changes made\n');
}
