const fs = require('fs');
const path = require('path');

const namebasesPath = path.resolve(__dirname, 'modules/namebases-real.js');
let content = fs.readFileSync(namebasesPath, 'utf8');

const avarEntry = `    {name: "Avar (dedicated)", i: 20583, min: 4, max: 11, d: "lnrt", m: 0, b: "Khunzakh,Gunib,Chokh,Sogratl,Gimry,Untsukul,Gergebil,Gotsatl,Koroda,Tidib,Tlokh,Batlaich,Archi,Rugudzha,Teletl,Karata,Mehelta,Dylym,Inkhokvari,Khushtada,Magharul,Bolmac,Gamzatov,Shamil,Hadji Murad"},
`;

// Find the last entry that looks like an object in the array
const lines = content.split('\n');
let lastEntryLineIndex = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim().startsWith('{name:') && lines[i].trim().endsWith('},')) {
    lastEntryLineIndex = i;
    break;
  }
}

if (lastEntryLineIndex !== -1) {
  lines.splice(lastEntryLineIndex + 1, 0, avarEntry.trim());
  fs.writeFileSync(namebasesPath, lines.join('\n'), 'utf8');
  console.log('Successfully added Avar (dedicated) entry to namebases-real.js');
} else {
  console.error('Could not find last entry in namebases-real.js');
}
