const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

const replacements = {
  'Modern Armenian': 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Gavar,Goris,Hrazdan,Ijevan,Dilijan,Noyemberyan',
  'Modern Western Armenian': 'Istanbul,Izmir,Ankara,Mersin,Gaziantep,Antakya,Kayseri,Sivas,Diyarbakır,Erzurum,Kars',
  'Old Cilician Armenian': 'Adana,Tarsus,Mersin,Antakya,Kayseri,Diyarbakır,Erzurum,Gyumri,Yerevan,Van',
  'Han-Samhan': 'Yancheng,Jinzhong,Linfen,Wenshui,Changzhi,Houma,Xiangyuan,Qinshui,Pingluo,Zhashui,Qinxian',
  'Castilian': 'Madrid,Toledo,Segovia,Ávila,Valladolid,Burgos,Zamora,Salamanca,Benavente,Cáceres,Badajoz',
  'Old Catalan': 'Barcelona,Girona,Tarragona,Lleida,Tortosa,Vic,Manresa,Urgell,Empúries,Besalú,Cervera,Puigcerdà',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Nîmes,Toulouse,Bordeaux,Strasbourg,Limoges,Tours,Bourges',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada,Benavente,Oviedo,Gijón,Avilés,Mieres',
  'Old Lombard': 'Milan,Monza,Brescia,Bergamo,Como,Lecco,Pavia,Cremona,Mantua,Varese,Sondrio'
};

let replacedCount = 0;

for (const [name, cities] of Object.entries(replacements)) {
  const regex = new RegExp(`\\{ name: "${name}"[^}]+b: "([^"]+)"`, 's');
  
  content = content.replace(regex, (match, cities) => {
    replacedCount++;
    return match.replace(`b: "${cities}"`, `b: "${cities}"`);
  });
}

if (replacedCount > 0) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf8');
  console.log(`Replaced ${replacedCount} placeholder entries`);
} else {
  console.log('No replacements made - check pattern matching');
}

// Check for remaining placeholder patterns
const unqPattern = /,\s*"[^"]+_unq\d+"/g;
const modernPattern = /,\s*"[^"]+modern_[^"]+_\d+_unq\d+"/g;
const ancientPattern = /,\s*"[^"]+ancient_[^"]+_\d+_unq\d+"/g;
const protoPattern = /,\s*"[^"]+proto_[^"]+_\d+_unq\d+"/g;
const oldPattern = /,\s*"[^"]+old_[^"]+_\d+_unq\d+"/g;

console.log('Remaining unq patterns:', (content.match(unqPattern) || []).length);
console.log('Remaining modern patterns:', (content.match(modernPattern) || []).length);
console.log('Remaining ancient patterns:', (content.match(ancientPattern) || []).length);
console.log('Remaining proto patterns:', (content.match(protoPattern) || []).length);
console.log('Remaining old patterns:', (content.match(oldPattern) || []).length);
