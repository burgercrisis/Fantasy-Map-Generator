"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const replacements = [
  {
    line: 431,
    name: "Fiuman",
    oldBase: "fiumana,fiumanb,fiumanc,fiumand,fiumane,fiumanf,fiumang,fiumanh,fiumani,fiumanj,fiumank,fiumanl",
    newBase: "Fiumicino,Fontana Nuova,Capena,Roccasecca,Villa Santa Lucia,Mazzano,Prato,Carmignano"
  },
  {
    line: 434,
    name: "Fornes",
    oldBase: "fornesa,fornesb,fornesc,fornesd,fornese,fornesf,fornesg,fornesh,fornesi,fornesj,fornesk,fornesl",
    newBase: "Ornes,Varennes,Jarny,Clamecy,Châlons-en-Champagne,Saint-Dizier,Bar-sur-Aube"
  },
  {
    line: 452,
    name: "Grossetano",
    oldBase: "grossetanoa,grossetanob,grossetanoc,grossetanod,grossetanoe,grossetanof,grossetanog,grossetanoh,grossetanoi,grossetanoj,grossetanok,grossetanol",
    newBase: "Grosseto,Orbetello,Castel del Piano,Castiglione d'Orcia,San Quirico d'Orcia,Scansano,Paganico"
  },
  {
    line: 453,
    name: "Haketia",
    oldBase: "haketiaa,haketiab,haketiac,haketiad,haketiae,haketiaf,haketiag,haketiah,haketiai,haketiaj,haketiak,haketial",
    newBase: "Halle,Wittenberg,Bielefeld,Hameln,Minden,Herford,Detmold,Lemgo"
  },
  {
    line: 456,
    name: "Istriot",
    oldBase: "istriota,istriotb,istriotc,istriotd,istriote,istriotf,istriotg,istrioth,istrioti,istriotj,istriotk,istriotl",
    newBase: "Pula,Rovinj,Pazin,Poreč,Motovun,Buje,Labin,Novigrad"
  },
  {
    line: 458,
    name: "Jauer",
    oldBase: "jauera,jauerb,jauerc,jauerd,jauere,jauerf,jauerg,jauerh,jaueri,jauerj,jauerk,jauerl",
    newBase: "St. Gallen,Wattwil,Uzwil,Herisau,Gossau,Wilen,Flawil,Altstätten"
  },
  {
    line: 460,
    name: "Judeo-Aragonese",
    oldBase: "judeoaragonesea,judeoaragoneseb,judeoaragonesec,judeoaragonesed,judeoaragonesee,judeoaragonesef,judeoaragoneseg,judeoaragoneseh,judeoaragonesei,judeoaragonesej,judeoaragonesek,judeoaragonesel",
    newBase: "Braga,Barbastro,Fraga,Monzón,Zaragoza,Teruel,Tudela,Binéfar,Lérida,Alcañiz"
  },
  {
    line: 461,
    name: "Judeo-Catalan",
    oldBase: "judeocatalana,judeocatalanb,judeocatalanc,judeocataland,judeocatalane,judeocatalanf,judeocatalang,judeocatalanh,judeocatalani,judeocatalanj,judeocatalank,judeocatalanl",
    newBase: "Barcelona,Girona,Tarragona,Lleida,Lleida,Tortosa,Reus,Vic,Figueres"
  },
  {
    line: 462,
    name: "Judeo-Gascon",
    oldBase: "judeogascona,judeogasconb,judeogasconc,judeogascond,judeogascone,judeogasconf,judeogascong,judeogasconh,judeogasconi,judeogasconj,judeogasconk,judeogasconl",
    newBase: "Bayonne,Biarritz,Dax,Mont-de-Marsan,Agen,Perigueux,Bergerac"
  },
  {
    line: 463,
    name: "Judeo-Italian",
    oldBase: "judeoitaliana,judeoitalianb,judeoitalianc,judeoitaliand,judeoitaliane,judeoitalianf,judeoitaliang,judeoitalianh,judeoitaliani,judeoitalianj,judeoitaliank,judeoitalianl",
    newBase: "Rome,Venice,Trieste,Milan,Florence,Livorno,Ancona,Genoa"
  },
  {
    line: 464,
    name: "Judeo-Mantuan",
    oldBase: "judeomantuana,judeomantuanb,judeomantuanc,judeomantuand,judeomantuane,judeomantuanf,judeomantuang,judeomantuanh,judeomantuani,judeomantuanj,judeomantuank,judeomantuanl",
    newBase: "Mantova,Cremona,Verona,Brescia,Bergamo,Sirmione,Viadana,Suzzara"
  },
  {
    line: 466,
    name: "Judeo-Piedmontese",
    oldBase: "judeopiedmontesea,judeopiedmonteseb,judeopiedmontesec,judeopiedmontesed,judeopiedmontesee,judeopiedmontesef,judeopiedmonteseg,judeopiedmonteseh,judeopiedmontesei,judeopiedmontesej,judeopiedmontesek,judeopiedmontesel",
    newBase: "Turin,Nice,Asti,Alessandria,Cuneo,Novara,Verbania,Biella"
  },
  {
    line: 467,
    name: "Judeo-Portuguese",
    oldBase: "judeoportuguesea,judeoportugueseb,judeoportuguesec,judeoportuguesed,judeoportuguesee,judeoportuguesef,judeoportugueseg,judeoportugueseh,judeoportuguesei,judeoportuguesej,judeoportuguesek,judeoportuguesel",
    newBase: "Porto,Lisbon,Faro,Braga,Coimbra,Évora,Beja,Funchal"
  },
  {
    line: 468,
    name: "Judeo-Provençal",
    oldBase: "judeoprovenala,judeoprovenalb,judeoprovenalc,judeoprovenald,judeoprovenale,judeoprovenalf,judeoprovenalg,judeoprovenalh,judeoprovenali,judeoprovenalj,judeoprovenalk,judeoprovenall",
    newBase: "Avignon,Marseille,Aix-en-Provence,Arles,Toulon,Nîmes,Apt"
  },
  {
    line: 469,
    name: "Judeo-Spanish",
    oldBase: "judeospanisha,judeospanishb,judeospanishc,judeospanishd,judeospanishe,judeospanishf,judeospanishg,judeospanishh,judeospanishi,judeospanishj,judeospanishk,judeospanishl",
    newBase: "Madrid,Barcelona,Valencia,Sevilla,Granada,Málaga,Zaragoza,Bilbao"
  }
];

console.log('\n=== REPLACING PLACEHOLDERS (BATCH 4: Lines 431-469) ===\n');
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
  console.log(`\n✓ Replaced ${replaced} placeholders in Batch 4\n`);
} else {
  console.log('\nNo placeholders replaced\n');
}
