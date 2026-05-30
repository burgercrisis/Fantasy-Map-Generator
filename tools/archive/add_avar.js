const fs = require('fs');
const path = require('path');

const namebasesPath = path.resolve(__dirname, 'modules/namebases-real.js');
let content = fs.readFileSync(namebasesPath, 'utf8');

const avarEntry = `    {name: "Avar (dedicated)", i: 20583, min: 4, max: 11, d: "lnrt", m: 0, b: "Khunzakh,Gunib,Chokh,Sogratl,Gimry,Untsukul,Gergebil,Gotsatl,Koroda,Tidib,Tlokh,Batlaich,Archi,Rugudzha,Teletl,Karata,Mehelta,Dylym,Inkhokvari,Khushtada,Magharul,Bolmac,Gamzatov,Shamil,Hadji Murad"},
`;

const insertPos = content.lastIndexOf('    ];');
if (insertPos !== -1) {
  content = content.substring(0, insertPos) + avarEntry + content.substring(insertPos);
  fs.writeFileSync(namebasesPath, content, 'utf8');
  console.log('Successfully added Avar (dedicated) entry to namebases-real.js');
} else {
  console.error('Could not find insertion point in namebases-real.js');
}
