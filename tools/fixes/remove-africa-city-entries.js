const fs = require('fs');
let content = fs.readFileSync('modules/namebases-africa.js', 'utf8');

// Get all names and their positions
const nameRegex = /"name": "([^"]+)"/g;
let match;
let names = [];
while ((match = nameRegex.exec(content)) !== null) {
  names.push({name: match[1], index: match.index});
}
console.log('Total entries:', names.length);

const invalidNames = new Set([
  'Mbour', 'Louga', 'Thies', 'Kaffrine', 'Koungheul', 'Tambacounda', 'Kedougou', 'Sedhiou', 'Kolda', 'Ziguinchor',
  'Banjul', 'Freetown', 'Bo', 'Kenema', 'Makeni', 'Koidu', 'Kumasi', 'Tamale', 'Ho', 'Sokode', 'Kpalime', 'Dapaong',
  'Cotonou', 'Abomey', 'Parakou', 'Kandi', 'Natitingou', 'Djougou', 'Save', 'Lokossa', 'Porto-Novo', 'Ouidah', 'Bohicon', 'Abomey-Calavi',
  'Niamey', 'Zinder', 'Maradi', 'Tahoua', 'Diffa', 'Agadez', 'Dosso', 'Tillaberi',
  'Moundou', 'Sarh', 'Abéché', 'Koumra', 'Bongor', 'Kousserie', 'Faya-Largeau', 'Mao', 'Bardaï', 'Am Timan',
  'Kinshasa', 'Mbuji-Mayi', 'Kananga', 'Lubumbashi', 'Kisangani', 'Goma', 'Beni', 'Butembo', 'Mbandaka', 'Bumba',
  'Gbadolite', 'Isiro', 'Bunia', 'Kalemie', 'Kongolo', 'Kolwezi', 'Likasi', 'Kasongo', 'Uvira', 'Bukavu', 'Kindu',
  'Boende', 'Tshikapa', 'Dilolo', 'Sakania', 'Pweto', 'Kabalo', 'Befale', 'Lokutu', 'Bafwasende', 'Aru', 'Avak',
  'Baidoa', 'Bardera', 'Beledweyne', 'Bulo Burte', 'Burco', 'Ceydhio', 'Dhuusamarreeb', 'Galkayo', 'Garowe', 'Giohar',
  'Hobyo', 'Jalalaqsi', 'Jowhar', 'Kismaayo', 'Kulob', 'Luuq', 'Marka', 'Mogadishu', 'Qardho', 'Qasahdhare', 'Shalambood', 'Wajid', 'Wanla Weyn',
  'Ada', 'Aflao', 'Akatsi', 'Akim Oda', 'Akwatia', 'Asamang', 'Asankrangwa', 'Asebu', 'Axim',
  'Bawku', 'Bawku West', 'Bebianiha', 'Berekum', 'Bianouar', 'Bolgatanga', 'Bongo', 'Bonsu', 'Cape Coast', 'Damongo',
  'Dunkwa', 'Duase', 'Ebibiani', 'Edubiase', 'Ejura', 'Elmina', 'Fmua', 'Gomoa', 'Gyapa', 'Jemaa',
  'Keta', 'Kete Krachi', 'Kintampo', 'Koforidua', 'Kpando', 'Lawra', 'Mampong', 'Mankrado', 'Navrongo', 'Nkoranza',
  'Nungua', 'Obuasi', 'Prestea', 'Savelugu', 'Sekondi', 'Sefwi', 'Sunyani', 'Tarkwa', 'Tegna', 'Tema', 'Wa', 'Wenchiki',
  'Winneba', 'Yendi', 'Zabzugu', 'Abeche', 'Ati', 'Bahr Sign', 'Bao', 'Barda', 'Batha', 'Benoy', 'Bodo', 'Bokoro', 'Bol',
  'Bousso', 'Chari', 'Dababa', 'Dakhla', 'Danamadji', 'Darfur', 'Dehane', 'Doba', 'Dourbali', 'Fada',
  'Fianga', 'Goundi', 'Gounou', 'Guera', 'Haraze', 'Iriba', 'Kabs', 'Kelo', 'Koussou', 'Kyabe',
  'Laï', 'Lere', 'Massenya', 'Mbaïboum', 'Ngui', 'Pala', 'Ra', 'Sokaba', 'Tandjile', 'Tibati',
  'Tobo', 'Touloum', 'Trin', 'Wadi', 'Yagoua', 'Yam', 'Yao', 'Yokadouma', 'Yorosserie', 'Zakouma', 'Zemio',
  'Abidjan', 'Bouake', 'Daloa', 'Yamoussoukro', 'Man', 'Korhogo', 'San-Pedro',
  'Divo', 'Bouafle', 'Daoukro', 'Guiglo', 'Odienne', 'Soubre', 'Touba', 'Boundiali', 'Tengrer', 'Seguela',
  'Aboisso', 'Adzope', 'Alepe', 'Attie', 'Bongouanou', 'Dabou', 'Fresco', 'Gagnoa', 'Grand-Lahou', 'Jacqueville',
  'Toulepleu', 'Touleupleu', 'Biankouma', 'Danane', 'Bangolo', 'Duekoue', 'Tinhou', 'Logouale',
  'Oyem', 'Mouila', 'Lambarene', 'Makokou', 'Koulamoutou', 'Bitam', 'Dolisie', 'Nkayi', 'Impfondo', 'Ouesso', 'Sibiti', 'Madingou',
  'Nyundu', 'Mouroum', "N'Djamena",
  'Ghana', 'Niger', 'Mali', 'Gambia', 'Congo',
  'ECHO', 'Dender',
  'Bure', 'Buwal', 'Bukusu', 'Baka', 'Shabo', 'Mansoanka', 'Koniaka', 'Bijago',
  'Grebo', 'Loko', 'Mandjia', 'Gbaya', 'Sogav', 'Dassenech', 'Bum', 'Sotho', 'Tswana', 'Yaka', 'Sunda',
  'Pende', 'Kongo', 'Lari', "M'Boshi", 'Teke', 'Mundang', 'Dschang', 'Noni', 'Koidoumba', 'Kpem',
  'Nda', 'Ngi', 'Bung', 'Kutin', 'Cwa', 'Noy', 'Bile'
]);

// Find indices of entries to remove
let toRemove = [];
names.forEach((n, idx) => {
  if (invalidNames.has(n.name)) {
    toRemove.push({name: n.name, index: n.index, idx: idx});
  }
});
console.log('Invalid entries to remove:', toRemove.length);

// Now find each entry's full extent and remove
// Entry format: "  {\n    "name": "...",..."
let newContent = content;
let removed = 0;

// Process from end to beginning
toRemove.sort((a, b) => b.index - a.index);

for (let item of toRemove) {
  // Find the start of this entry (look back for "\n  {\n")
  let searchStart = Math.max(0, item.index - 50);
  let before = newContent.slice(searchStart, item.index);
  let startMatch = before.match(/\n  \{\n$/);
  let entryStart = startMatch ? searchStart + startMatch.index + 1 : item.index - 1;
  
  // Find the end of this entry (look forward for "},\n  {" or "}\n];")
  let rest = newContent.slice(item.index);
  let endMatch = rest.match(/\n  \},\n/);
  let entryEnd = endMatch ? item.index + endMatch.index + endMatch[0].length : newContent.length;
  
  // Remove
  newContent = newContent.slice(0, entryStart) + newContent.slice(entryEnd);
  removed++;
}

let remaining = (newContent.match(/"name":/g) || []).length;
console.log('Removed:', removed);
console.log('Remaining:', remaining);

fs.writeFileSync('modules/namebases-africa.js', newContent);
console.log('File saved');
