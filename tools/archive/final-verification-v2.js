"use strict";

eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));

const namebases = window.realWorldNameBases;
console.log('\n=== FINAL VERIFICATION ===\n');

let smallBases = 0;
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

for (let i = 0; i < namebases.length; i++) {
  const nb = namebases[i];
  if (!nb || !nb.b) continue;
  
  const cities = nb.b.split(',');
  
  placeholderPatterns.some(p => cities[0].includes(p))
}

console.log(`\n=== PLACEHOLDER COUNT ===\n`);
console.log(`Potential placeholders found: ${smallBases.length}\n`);

if (smallBases.length > 0) {
  console.log('Potential placeholders:');
  smallBases.slice(0, 30).forEach(nb => {
    console.log(`  Line ${nb.i + 1}: ${nb.name} (${nb.b.split(',').length} cities)`);
    console.log(`  First: ${nb.b.split(',')[0].substring(0, 40)}...`);
  });
}

console.log(`\n=== SUMMARY ===\n`);
console.log(`Total namebases: ${namebases.length}`);
console.log(`With <5 cities: ${smallBases.length}`);
console.log(`Authentic quality: ${Math.round((namebases.length - smallBases.length) / namebases.length * 100)}%\n`);
