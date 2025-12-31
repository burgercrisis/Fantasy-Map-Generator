"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING PLACEHOLDERS (Lines 497, 525-539) ===\n');

const replacements = [
  {
    line: 497,
    name: "Messinese",
    oldBase: "messinesea,messineseb,messinesec,messinesed,messinesee,messinesef,messineseg,messineseeh,messinesei,messinesej,messinesek,messinesel",
    newBase: "Messina,Taormina,Barcellona Pozzo di Gotto,Milazo,Patti,Sant'Agata di Militello,Capo d'Orlando,Milazzo,Rocca di Capri Leone"
  },
  {
    line: 525,
    name: "Champenois",
    oldBase: "champenoisa,champenoisb,champenoisc,champenoisd,champenoise,champenoisf,champenoisg,champenoish,champenoisi,champenoisj,champenoisk,champenoisl",
    newBase: "Troyes,Châlons-en-Champagne,Reims,Épernay,Sézanne,Châlons-sur-Marne,Vitry-le-François,Saint-Dizier,Château-Thierry"
  },
  {
    line: 526,
    name: "Poitevin",
    oldBase: "poitevina,poitevinb,poitevinc,poitevind,poitevine,poitevinf,poiteving,poitevinh,poitevini,poitevinj,poitevink,poitevinl",
    newBase: "Poitiers,Niort,La Rochelle,Rochefort,Parthenay,Châtellerault,Saint-Jean-d'Angély,Angoulême,Cognac,Jarnac"
  },
  {
    line: 527,
    name: "Saintongeais",
    oldBase: "saintongeaisa,saintongeaisb,saintongeaisc,saintongeaisd,saintongeaise,saintongeaisf,saintongeaisg,saintongeaish,saintongeaisi,saintongeaisj,saintongeaisk,saintongeaisl",
    newBase: "Saintes,Royan,Rochefort,Saint-Jean-d'Angély,Saintes,Marennes,Jonzac,Pons,Montendre,Tonnay-Charente"
  },
  {
    line: 528,
    name: "Aas-whistled",
    oldBase: "aaswhistleda,aaswhistledb,aaswhistledc,aaswhistledd,aaswhistlede,aaswhistledf,aaswhistledg,aaswhistledh,aaswhistledi,aaswhistledj,aaswhistledk,aaswhistledl",
    newBase: "Orthez,Bidache,Saint-Palais,Tardets,Mont-de-Marsan,Hasparren,Aire-sur-l'Adour,Navarrenx"
  },
  {
    line: 529,
    name: "Aranese",
    oldBase: "aranesea,araneseb,aranesec,aranesed,aranesee,aranesef,araneseg,araneseh,aranesei,aranesej,aranesek,araneseel",
    newBase: "Vielha,Les,Bausèr,Bòrdes,Naut Aran,Salardú,Arties,Bagergue,Sent Julian,Naut Aran,Canejan"
  },
  {
    line: 530,
    name: "B-arnese",
    oldBase: "barnesea,barneseb,barnesec,barnesed,barnesee,barnesef,barneseg,barneseh,barnesei,barnesej,barnesek,barnesel",
    newBase: "Barnesley,Middlesbrough,Rotherham,Doncaster,Sheffield,Leeds,Bradford,Huddersfield,Halifax,Scarborough"
  },
  {
    line: 531,
    name: "Abruzzese",
    oldBase: "abruzzesea,abruzzeseb,abruzzesec,abruzzesed,abruzzesee,abruzzesef,abruzzeseg,abruzzeseh,abruzzesei,abruzzesej,abruzzesek,abruzzesel",
    newBase: "L'Aquila,Pescara,Chieti,Teramo,Ortona,Vasto,Sulmona,Avezzano,Chieti,Ortona,Vasto,Sulmona,L'Aquila"
  },
  {
    line: 532,
    name: "Arianese",
    oldBase: "arianesea,arianeseb,arianesec,arianesed,arianesee,arianesef,arianeseg,arianeseh,arianesei,arianesej,arianesek,arianesel",
    newBase: "Ariano,Irpinia,Benevento,Avellino,Sant'Arcangelo,Avellino,Ariano,Irpinia,Baronissi,Benevento,Avellino"
  },
  {
    line: 533,
    name: "Barese",
    oldBase: "baresea,bareseb,baresec,baresed,baresee,baresef,bareseg,bareseh,baresei,baresej,baresek,baresel",
    newBase: "Bari,Bitonto,Altamura,Andria,Barletta,Bisceglie,Corato,Molfetta,Mola di Bari,Gravina,Bisceglie"
  },
  {
    line: 534,
    name: "Basilicatine",
    oldBase: "basilicatinea,basilicatineb,basilicatinec,basilicatined,basilicatinee,basilicatinef,basilicatineg,basilicatineh,basilicatinei,basilicatinej,basilicatinek,basilicatinel",
    newBase: "Potenza,Matera,Bari,Altamura,Andria,Barletta,Trani,Brindisi,Taranto,Lecce,Foggia,Bari"
  },
  {
    line: 535,
    name: "Benevento",
    oldBase: "beneventoa,beneventob,beneventoc,beneventod,beneventoe,beneventof,beneventog,beneventoh,beneventoi,beneventoj,beneventok,beneventol",
    newBase: "Benevento,Avellino,Baronissi,Sant'Arcangelo,Ariano,Irpinia,Avellino,Benevento,Ceppaloni,Apice,Sant'Agata"
  },
  {
    line: 537,
    name: "Cilentan",
    oldBase: "cilentana,cilentanb,cilentanc,cilentand,cilentane,cilentanf,cilentang,cilentanh,cilentani,cilentanj,cilentank,cilentanl",
    newBase: "Agropoli,Vallo della Lucania,Salerno,Nocera,Policastro,Sapri,Trentinara,Roccadaspide,Praiano,Amalfi"
  },
  {
    line: 538,
    name: "Cosentino",
    oldBase: "cosentinoa,cosentinob,cosentinoc,cosentinod,cosentinoe,cosentinof,cosentinog,cosentinoh,cosentinoi,cosentinoj,cosentinok,cosentinol",
    newBase: "Cosenza,Rende,Corigliano,Castrovillari,Roggiano Gravina,Acri,Rossano,San Marco Argentano,Paola,Cassano all'Ionio"
  },
  {
    line: 539,
    name: "Joual",
    oldBase: "jouala,joualb,joualc,jouald,jouale,joualf,joualg,joualh,jouali,joualj,joualk,jouall",
    newBase: "Saint John,Miramichi,Moncton,Bathurst,Fredericton,Edmundston,Tracadie,Dieppe,Shediac,Campobello Island"
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
      console.log(`- Line ${r.line}: ${r.name} (already fixed)`);
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ FIXED ${replaced} placeholders with authentic cities\n`);
} else {
  console.log('\nNo changes needed\n');
}
