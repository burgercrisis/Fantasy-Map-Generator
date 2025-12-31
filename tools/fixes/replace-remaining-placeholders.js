"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const replacements = [
  {
    line: 426,
    name: "Fabriano",
    oldBase: "fabrianoa,fabrianob,fabrianoc,fabrianod,fabrianoe,fabrianof,fabrianog,fabrianoh,fabrianoi,fabrianj,fabrianok,fabrianol",
    newBase: "Fano,Pesaro,Urbino,Fano,Cattolica,Senigallia,Osimo,Mondavio,Serra de'Conti,Marotta"
  },
  {
    line: 434,
    name: "Fornes",
    oldBase: "fornesa,fornesb,fornesc,fornesd,fornese,fornesf,fornesg,fornesh,fornesi,fornesj,fornesk,fornesl",
    newBase: "La Chapelle-Saint-Denis,Montfermeil,Lognes,Noiseau,Le Mée-sur-Seine,Villiers-sur-Marne,Saint-Mandé,Melun,Savigny"
  },
  {
    line: 435,
    name: "Franco-Italian",
    oldBase: "francoitaliana,francoitalianb,francoitalianc,francoitaliand,francoitaliane,francoitalianf,francoitaliang,francoitalianh,francoitaliani,francoitalianj,francoitaliank,francoitalianl",
    newBase: "Montreal,Toronto,Vancouver,Nice,Marseille,Naples,Rome,Genoa,Milan"
  },
  {
    line: 449,
    name: "Gardiol",
    oldBase: "gardiola,gardiolb,gardiolc,gardiold,gardiole,gardiolf,gardiolg,gardiolh,gardioli,gardiolj,gardiolk,gardioll",
    newBase: "Gardanne,Bourgoin,Jouy-le-Châtel,Brie-Comte-Robert,Pontault-Combault,Pierre-le-Bérault"
  },
  {
    line: 455,
    name: "Intemelio",
    oldBase: "intemelioa,intemeliob,intemelioc,intemeliod,intemelioe,intemeliof,intemeliog,intemelioh,intemelioi,intemelioj,intemeliok,intemeliol",
    newBase: "Trento,Rovereto,Borgo Valsugana,Pergine Valsugana,Lavis,Mori,Cavalese,Mezzocorona"
  },
  {
    line: 472,
    name: "Ladino",
    oldBase: "ladinoa,ladinob,ladinoc,ladinod,ladinoe,ladinof,ladinog,ladinoh,ladinoi,ladinoj,ladinok,ladinol",
    newBase: "Ávila,Salamanca,Valladolid,Zamora,Cáceres,Badajoz,Plasencia,Ávila de los Caballeros,Arévalo"
  },
  {
    line: 473,
    name: "Landese",
    oldBase: "landesea,landeseb,landesec,landesed,landesee,landesef,landeseg,landeseh,landesei,landesej,landesek,landesel",
    newBase: "Santander,Torrelavega,Cantabria,Camaleño,Santillana,Potes,Laredo,Sierra de Iguña,Vega de Pas"
  },
  {
    line: 474,
    name: "Languedocien",
    oldBase: "languedociena,languedocienb,languedocienc,languedociend,languedociene,languedocienf,languedocieng,languedocienh,languedocieni,languedocienj,languedocienk,languedocienl",
    newBase: "Nîmes,Montpellier,Béziers,Alès,Albi,Carcassonne,Pamiers,Narbonne,Sète,Aix-en-Provence"
  },
  {
    line: 480,
    name: "Llanito",
    oldBase: "llanitoa,llanitob,llanitoc,llanitod,llanitoe,llanitof,llanitog,llanitoh,llanitoi,llanitoj,llanitok,llanitol",
    newBase: "Llanes,Foix,Prades,Font-Romeu,Molitg-les-Bains,Vernet-les-Bains,Perpignan,Saint-Paul-de-Fenouillet"
  },
  {
    line: 481,
    name: "Logudorese",
    oldBase: "logudoresea,logudoreseb,logudoresec,logudoresed,logudoresee,logudoresef,logudoreseg,logudoreseh,logudoresei,logudoresej,logudoresek,logudoresel",
    newBase: "Nuoro,Sorgono,Orune,Macomer,Terralba,Oliena,Bosa,Posada,Aritzo"
  },
  {
    line: 486,
    name: "M-tis French",
    oldBase: "mtisfrencha,mtisfrenchb,mtisfrenchc,mtisfrenchd,mtisfrenche,mtisfrenchf,mtisfrenchg,mtisfrenchh,mtisfrenchi,mtisfrenchj,mtisfrenchk,mtisfrenchl",
    newBase: "Orléans,Blois,Tours,Chartres,Amboise,Vendôme,Châteauroux,Dreux,Argentan"
  },
  {
    line: 488,
    name: "Magoua",
    oldBase: "magouaa,magouab,magouac,magouad,magouae,magouaf,magouag,magouah,magouai,magouaj,magouak,magoual",
    newBase: "Nouméa,Païta,Mont-Dore,Dumbéa,Tchamba,Lifou,Thio,Bourail,Yaté"
  },
  {
    line: 491,
    name: "Maltese-Italian",
    oldBase: "malteseitaliana,malteseitalianb,malteseitalianc,malteseitaliand,malteseitaliane,malteseitalianf,malteseitaliang,malteseitalianh,malteseitaliani,malteseitalianj,malteseitaliank,malteseitalianl",
    newBase: "Valletta,Mdina,Victoria,Mosta,Zejtun,Żabbar,Żurrieq,Safi,Siġġiewi,Żebbuġ"
  },
  {
    line: 493,
    name: "Maramure-",
    oldBase: "maramurea,maramureb,maramurec,maramured,maramuree,maramuref,maramureg,maramureh,maramurei,maramurej,maramurek,maramurel",
    newBase: "Maramureș,Târgu Mureș,Reghin,Toplița,Sighișoara,Reghin,Sângeru,Târnăveni,Bistrița"
  },
  {
    line: 500,
    name: "Minderico",
    oldBase: "mindericoa,mindericob,mindericoc,mindericod,mindericoe,mindericof,mindericog,mindericoh,mindericoi,mindericoj,mindericok,mindericol",
    newBase: "Modena,Carpi,Nonantola,Sassuolo,Formigine,Fiorano,Finale Emilia,Bastiglia,Soliera"
  },
  {
    line: 501,
    name: "Mineiro",
    oldBase: "Belo Horizonte,Uberlandia,Juiz de Fora,Contagem,Betim,Montes Claros,Governador Valadares,Ipatinga,Sete Lagoas,Divinopolis,Varginha,Ouro Preto",
    newBase: "Belo Horizonte,Uberlândia,Juiz de Fora,Contagem,Betim,Montes Claros,Governador Valadares,Ipatinga,Sete Lagoas,Divinópolis,Varginha,Ouro Preto"
  },
  {
    line: 503,
    name: "Missouri French",
    oldBase: "Ste Genevieve,St Louis,Old Mines,Bonne Terre,Farmington,Potosi,Leadwood,Park Hills,Festus,Florissant,Perryville,Cape Girardeau",
    newBase: "Saint Louis,Florissant,Ste. Genevieve,Washington,Farmington,Kirkwood,Wildwood,Eureka,Manchester,Chesterfield"
  },
  {
    line: 507,
    name: "Murcian",
    oldBase: "murciana,murcianb,murcianc,murciand,murciane,murcianf,murciang,murcianh,murciani,murcianj,murciank,murcianl",
    newBase: "Murcia,Cartagena,Lorca,Alicante,Elche,Orihuela,Albacete,Almansa,Cieza,Yecla,Águilas"
  },
  {
    line: 508,
    name: "Muskrat French",
    oldBase: "muskratfrencha,muskratfrenchb,muskratfrenchc,muskratfrenchd,muskratfrenche,muskratfrenchf,muskratfrenchg,muskratfrenchh,muskratfrenchi,muskratfrenchj,muskratfrenchk,muskratfrenchl",
    newBase: "Muskrat,St. Joseph,Riverglen,Savannah,Kingston,Tonawanda,Clayton,Watertown,Cairo"
  },
  {
    line: 510,
    name: "Navarro-Aragonese",
    oldBase: "navarroaragonesea,navarroaragoneseb,navarroaragonesec,navarroaragonesed,navarroaragonesee,navarroaragonesef,navarroaragoneseg,navarroaragoneseh,navarroaragonesei,navarroaragonesej,navarroaragonesek,navarroaragonesel",
    newBase: "Pamplona,Tudela,Jaca,Huesca,Barbastro,Ejea de los Caballeros,Sangüesa,Estella,Tafalla,Berbinati"
  },
  {
    line: 520,
    name: "Northwestern Catalan",
    oldBase: "Lleida,Balaguer,Tàrrega,Mollerussa,Cervera,La Seu d'Urgell,Tremp,Sort,El Pont de Suert,Vielha,Andorra la Vella,Sant Julià de Lòria,Escaldes-Engordany,Encamp,Canillo,La Massana,Ordino,Solsona,Guissona,Artesa de Segre",
    newBase: "Lleida,Tàrrega,Balaguer,Mollerussa,Tremp,Sort,Lleida,Pallars,Sa Pobla de Segur"
  },
  {
    line: 521,
    name: "Novarese",
    oldBase: "Nuara,Camari,Galliate,Tracaa,Oleggio,Arona,Borgo Manero,Romagnano,Ghemme,Sizzano,Fara,Briona,Barengo,Momo,Bellinzago,Cameri,Trecate,Cerano,San Martino Siccomario",
    newBase: "Novara,Borgomanero,Ghemme,Suno,Suno,Galliate,Cameri,Barengo,Bellinzago,Oleggio,Arorna,Carpignano"
  },
  {
    line: 523,
    name: "Angevin",
    oldBase: "angevina,angevinb,angevinc,angevind,angevine,angevinf,angeving,angevinh,angevini,angevinj,angevink,angevinl",
    newBase: "Angers,Saumur,Cholet,Nantes,Le Mans,Tours,Niort,Chinon,Laval,Sablé-sur-Sarthe"
  },
  {
    line: 524,
    name: "Burgundian",
    oldBase: "burgundiana,burgundianb,burgundianc,burgundiand,burgundiane,burgundianf,burgundiang,burgundianh,burgundiani,burgundianj,burgundiank,burgundianl",
    newBase: "Dijon,Beaune,Chalon-sur-Saône,Mâcon,Auxerre,Sens,Nevers,Autun,Avalon,Avallon"
  }
];

console.log('\n=== REPLACING ALL REMAINING PLACEHOLDERS (Lines 425-539) ===\n');
console.log(`Total replacements: ${replacements.length}\n`);

let replaced = 0;
let skipped = 0;

replacements.forEach(r => {
  if (lines[r.line - 1] && lines[r.line - 1].includes(r.name)) {
    const oldLine = lines[r.line - 1];
    const newLine = oldLine.replace(r.oldBase, r.newBase);
    if (oldLine !== newLine) {
      lines[r.line - 1] = newLine;
      console.log(`✓ Line ${r.line}: ${r.name}`);
      console.log(`  ${r.newBase.substring(0, 65)}...`);
      replaced++;
    } else {
      console.log(`- Line ${r.line}: ${r.name} (already replaced)`);
      skipped++;
    }
  }
});

console.log(`\n=== SUMMARY ===\n`);
console.log(`Replaced: ${replaced}`);
console.log(`Skipped: ${skipped}`);

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ File updated\n`);
} else {
  console.log('\nNo changes made\n');
}
