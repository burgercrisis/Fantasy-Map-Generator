const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Purépecha entry
const fixedLine = '  {\n    "name": "Purépecha",\n    "i": 71,\n    "min": 5,\n    "max": 12,\n    "d": "nic-GH",\n    "m": 0,\n    "b": "Morelia,Uruapan,Zamora,Patzcuaro,Tzintzuntzan,Cheran,Paracho,LosReyes,Angamacutiro,Angangueo,Apatzingan,Acuitzio,Aguililla,Arteaga,Ario,Brisenas,Buenavista,Caracuaro,Charapan,Charo,Chavinda,Chilchota,Chinicuila,Chucandiro,Churintzio,Churumuco,Coahuayana,Coalcoman,Coeneo,Cojumatlan,Contepec,Copandaro,Cotija,Cuitzeo,Ecuandureo,Erongaricuaro,GabrielZamora,Hidalgo,Huandacareo,Huaniqueo,Huetamo,Huiramba,Indaparapeo,Irimbo,Ixtlan,Jacona,Jimenez,Jiquilpan,Jungapeo,Lagunillas,LaPiedad,Maravatio,Morelos"\n  },';

// Find the entry and replace
const startMarker = '    "i": 71';
const idx = content.indexOf(startMarker);
if (idx > 0) {
  // Go back to find the opening {
  const objStart = content.lastIndexOf('  {', idx);
  if (objStart > 0) {
    const endIdx = content.indexOf('},', idx);
    const newContent = content.substring(0, objStart) + fixedLine + content.substring(endIdx + 2);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
    console.log('Purépecha fixed');
    console.log('Removed', endIdx + 2 - objStart, 'characters');
  }
}
