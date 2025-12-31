"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const replacements = [
  {
    line: 470,
    name: "Ladin",
    oldBase: "ladina,ladinb,ladinc,ladind,ladine,ladinf,lading,ladinh,ladini,ladinj,ladink,ladinl",
    newBase: "Ortisei,Selva di Cadore,Cortina d'Ampezzo,Cortina d'Anpezzo,Belluno,Feltre,Pieve di Cadore,Cortina,Cavalese"
  },
  {
    line: 476,
    name: "Leonese",
    oldBase: "leonesea,leoneseb,leonesec,leonesed,leonesee,leonesef,leoneseg,leoneseh,leonesei,leonesej,leonesek,leonesel",
    newBase: "León,Astorga,Ponferrada,Palencia,Benavente,Zamora,Valladolid,Salamanca,Soria,Sahagún,Bembibre"
  },
  {
    line: 485,
    name: "Lucchese",
    oldBase: "lucchesea,luccheseb,lucchesec,lucchesed,lucchesee,lucchesef,luccheseg,luccheseh,lucchesei,lucchesej,lucchesek,lucchesel",
    newBase: "Lucca,Viareggio,Pietrasanta,Altopascio,Coreglia Antelminelli,Marlia,Capannori,Segromignano,Fucecchio"
  },
  {
    line: 487,
    name: "Macerata",
    oldBase: "macerataa,maceratab,maceratac,maceratad,maceratae,macerataf,maceratag,maceratah,maceratai,macerataj,maceratak,maceratal",
    newBase: "Macerata,Civitanova Marche,Tolentino,San Severino Marche,Recanati,San Ginesio,Monte San Giusto,Pollenza"
  },
  {
    line: 490,
    name: "Mallorcan",
    oldBase: "mallorcana,mallorcanb,mallorcanc,mallorcand,mallorcane,mallorcanf,mallorcang,mallorcanh,mallorcani,mallorcanj,mallorcank,mallorcanl",
    newBase: "Palma,Manacor,Ibiza,Mahón,Ciutadella,Eivissa,Alaior,Santanyí,Soller,Andratx,Pollença"
  },
  {
    line: 494,
    name: "Menorcan",
    oldBase: "menorcana,menorcanb,menorcanc,menorcand,menorcane,menorcanf,menorcang,menorcanh,menorcani,menorcanj,menorcank,menorcanl",
    newBase: "Mahón,Ciutadella,Ferreries,Mercadal,Alaior,Sant Lluís,Es Castell,Es Mercadal,Fornells"
  },
  {
    line: 496,
    name: "Mentonasc",
    oldBase: "mentonasca,mentonascb,mentonascc,mentonascd,mentonasce,mentonascf,mentonascg,mentonasch,mentonasci,mentonascj,mentonasck,mentonascl",
    newBase: "Menton,Roquebrune-Cap-Martin,Saint-Agnès,Beausoleil,Èze,La Turbie,Castellar,Peille"
  },
  {
    line: 504,
    name: "Moldavian",
    oldBase: "Chisinau,Balti,Tiraspol,Bender,Cahul,Orhei,Soroca,Ungheni,Comrat,Edinet,Hincesti,Causeni",
    newBase: "Chișinău,Bălți,Tiraspol,Bender,Călărași,Orhei,Soroca,Ungheni,Comrat,Edineț,Hîncești,Căușeni"
  },
  {
    line: 509,
    name: "Navarrese",
    oldBase: "navarresea,navarreseb,navarresec,navarresed,navarresee,navarresef,navarreseg,navarreseh,navarresei,navarresej,navarresek,navarresel",
    newBase: "Pamplona,Tudela,Estella,Tafalla,Berbinati,Sangüesa,Zangoza,Etxarri Aranats,Lekunberri,Altsasu"
  },
  {
    line: 515,
    name: "Niçard",
    oldBase: "Niça,Vilafranca de Mar,Antíbol,Grassa,Canes,Menton,Sant Laurenç de Var,Canha de Mar,Sant Adreia de la Ròca,Lo Torrit,Escarena,Luceram,Buelh,Puget Tenier,Gileta,Falicon",
    newBase: "Nice,Antibes,Cannes,Grasse,Menton,Nice Côte d'Azur,Vence,Fréjus,Draguignan,Le Muy"
  },
  {
    line: 516,
    name: "Nones",
    oldBase: "Val-di-Non,Cles,Revo,Fondo,Male,Denno,Taio,Tuenno,Ville-d'Anaunia,Predaia,Novella,Borgo-d'Anaunia,Sanzeno,Romallo,Brez,Cloz,Castelfondo,Tregiovo,Lauregno,Proves,Senale,Rumo,Livo,Bresimo,Cis,Caldes,Terzolas,Cavareno,Amblar,Don,Sfruz,Smarano,Coredo,Nanno,Tassullo,Flavon,Teres,Campodenno,Sporminore",
    newBase: "Cles,Revò,Fondo,Malé,Denno,Taio,Tuenno,Ville-d'Anaunia,Novella,Coredo,Don,Sfruz,Cloz,Amblar,Terzolas,Rum,Cavaleno"
  },
  {
    line: 517,
    name: "Northern Catalan",
    oldBase: "Perpinyà,Canet de Rosselló,Sant Esteve del Mestre,Sant Cebrià de Rosselló,Sant Llorenç de la Salanca,Argelers de la Marenda,Ribesaltes,Tuïr,Elna,Prada,Ceret,Illa,Millars,Bages,Toluges,Pià,Salses,Pollestres,Vernet,Sant Pau de Fenollet",
    newBase: "Perpignan,Canet-en-Roussillon,Saint-Estève,Elne,Céret,Thuir,Saint-Laurent-de-la-Cabrerisse,Amélie-les-Bains,Argelès,Millas"
  },
  {
    line: 522,
    name: "Occitan",
    oldBase: "Tolosa,Bordèu,Montpelhièr,Limòtges,Clarmont d'Auvèrnhe,Pau,Baiona,Biàritz,Tarba,Periguers,Caors,Albi,Rodés,Mende,Lo Puèg de Velai,Valença,Gap,Dinha,Avinhon,Marselha,Tolon,Niça",
    newBase: "Toulouse,Bordeaux,Montpellier,Albi,Pau,Carcassonne,Millau,Agen,Bergerac,Périgueux,Mende,Gap,Nîmes,Nice"
  }
];

console.log('\n=== REPLACING PLACEHOLDERS (BATCH 3: Lines 470-522) ===\n');
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
  console.log(`\n✓ Replaced ${replaced} placeholders in Batch 3\n`);
} else {
  console.log('\nNo placeholders replaced\n');
}
