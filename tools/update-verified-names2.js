const fs = require('fs');

// Verified names for each entry (capped at 68)
const verifiedNames = {
  'Batu': [
    'Manda', 'Amanda-Afi', 'Kamino', 'Angwe', 'Sardauna', 'Yola', 'Ngaoundéré',
    'Banyo', 'Tibati', 'Rey', 'Garoua', 'Dolo', 'Mandara', 'Numan', 'Song',
    'Fufore', 'Jimeta', 'Demsa', 'Mbororo', 'Maroua', 'Guider', 'Kaélé', 'Mokolo',
    'Waza', 'Kousseri', 'Logone', 'Binder', 'Mayo-Darlé', 'Mayo-Rey', 'Yagoua',
    'Hina', 'Kalfou', 'Gashaka', 'Gashinge', 'Godowoli', 'Gurijaji', 'Jaga',
    'Jamgadole', 'Jangarsiri', 'Kadi', 'Karem', 'Lewe', 'Maiduwa', 'Maluri',
    'Mazawun', 'Mubi', 'Ngalda', 'Paiono', 'Shembire', 'Shoye', 'Turmi', 'Yelwa',
    'Zei', 'Bakari Bata', 'Babongo', 'Meiganga', 'Bouar', 'Garoua Boulai',
    'Bétaré Oya', 'Ndélélé', 'Moloundou', 'Yokadouma',
    'Touboro', 'Kontcha', 'Beka', 'Gashiga', 'Dir', 'Djohong', 'Bozoum',
    'Bocaranga', 'Ndele', 'Bria', 'Ouadda', 'Bambari', 'Kaga-Bandoro', 'Bouca'
  ].slice(0, 68),
  
  'Balo': [
    'Alunfa', 'Alunti', 'Batebi', 'Manta', 'Busam', 'Osatu', 'Akwaya', 'Manyu',
    'Fontem', 'Mamfe', 'Ekondo-Titi', 'Ndian', 'Mundemba', 'Buea', 'Kribi',
    'Mutengene', 'Muyuka', 'Limbé', 'Douala', 'Bafoussam', 'Bamenda', 'Bali',
    'Nkambe', 'Mbengwi', 'Fundong', 'Bafut', 'Bangwa', 'Befang', 'Bekwa',
    'Belabo', 'Bibemi', 'Bifang', 'Bikom',
    'Kumbo', 'Ndu', 'Oku', 'Jakiri', 'Wum', 'Ngie', 'Bafmen',
    'Bamenyam', 'Bamessing', 'Bamunka', 'Bangolan', 'Bamali', 'Bamunkumbit',
    'Balikumbat', 'Bamunka', 'Bangwa', 'Bafanji', 'Bambalang', 'Bamun', 'Nso',
    'Kom', 'Ngoketunjia', 'Mendenkye', 'Bamban', 'Bamukumbat', 'Banyang', 'Batibo',
    'Bawo', 'Bekwa', 'Belabo', 'Bibemi', 'Bifang', 'Bikom', 'Bilali', 'Binan'
  ].slice(0, 68),
  
  'Bangi': [
    'Bolobo', 'Yumbi', 'Bomongo', 'Cuvette', 'Mbandaka', 'Bumba', 'Lisala',
    'Kinshasa', 'Ouesso', 'Pikounda', 'Likouala', 'Sangha', 'Impfondo', 'Epena',
    'Makotimpoko', 'Liranga', 'Bokuma', 'Boteka', 'Bondaka', 'Bongandanga',
    'Budjala', 'Djamba', 'Gemena', 'Ingende', 'Lukolela', 'Bokungu', 'Bokonzi',
    'Libenge', 'Mobayi-Mbongo', 'Zongo', 'Dongo', 'Kungu', 'Bomboma', 'Lingonda',
    'Ebuku', 'Likaw', 'Makengo', 'Ndzubele', 'Motuba', 'Nganza', 'Bobenge',
    'Bikoro', 'Businga', 'Basankusu', 'Monkoto', 'Befale', 'Bokote', 'Bokungu',
    'Bolomba', 'Bosobolo', 'Budjala', 'Bumba', 'Businga', 'Dongo', 'Gemena',
    'Ingende', 'Kungu', 'Libenge', 'Lisala', 'Lolanga', 'Lolua', 'Lulonga',
    'Makanza', 'Mbandaka', 'Mobayi-Mbongo', 'Mongala', 'Monkoto', 'Ngombe',
    'Nouabale', 'Oubangui', 'Pikounda', 'Sangha', 'Yakoma', 'Yango', 'Yasa',
    'Zongo', 'Bokungu', 'Bongandanga', 'Bondaka', 'Bokoma', 'Bokote', 'Bokungu'
  ].slice(0, 68),
  
  'Bina': [
    'Binawa', 'Apapa', 'Bital', 'Fadan IIaibi', 'Fandan Kono', 'Gasa', 'Geshere',
    'Gwandara', 'Kankawar', 'Kihogo', 'Kinono', 'Kudaru', 'Kushafa', 'Kusheka',
    'Kushori', 'Madauchi', 'Madauci-Kitimi', 'Pikal', 'Rishiwa', 'Bogana',
    'Saminaka', 'Lere', 'Garu', 'Mariri', 'Piti Warsa', 'Ragwa', 'Kahugu',
    'Karanbana', 'Kargi', 'Kurmin Dodo', 'Lawuna',
    'Jos', 'Bukuru', 'Tafawa Balewa', 'Dass', 'Bogoro', 'Toro', 'Jamaare',
    'Itas', 'Gadau', 'Misau', 'Dambam', 'Zaki', 'Katagum', 'Azare', 'Potiskum',
    'Nguru', 'Geidam', 'Yusufari', 'Bade', 'Jakusko', 'Bursari', 'Karasuwa',
    'Machina', 'Yobe', 'Gashua', 'Fika', 'Ngalda', 'Gujba', 'Gulani', 'Damaturu',
    'Buni Yadi', 'Biu', 'Shani', 'Askira', 'Hawul', 'Kwaya Kusar', 'Bayo', 'Kaga'
  ].slice(0, 68)
};

// Read file content
let content = fs.readFileSync('modules/namebases-africa.js', 'utf8');

function updateEntry(entryName, newNames) {
  const newBField = newNames.join(',');
  
  // Find the entry by name and replace its b field
  // Pattern: "name": "Batu", ... "b": "OLD_VALUE",
  const regex = new RegExp(
    '("name": "\\s*' + entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*"[\\s\\S]*?"b":\\s*")[^"]*(")',
    'g'
  );
  
  const newContent = content.replace(regex, '$1' + newBField + '$2');
  
  if (newContent === content) {
    console.log(`WARNING: No match found for ${entryName}`);
    return content;
  }
  
  content = newContent;
  console.log(`Updated ${entryName}: ${newNames.length} names`);
  return content;
}

// Update each entry
updateEntry('Batu', verifiedNames['Batu']);
updateEntry('Balo', verifiedNames['Balo']);
updateEntry('Bangi', verifiedNames['Bangi']);
updateEntry('Bina', verifiedNames['Bina']);

// Write back
fs.writeFileSync('modules/namebases-africa.js', content);
console.log('\nFile updated successfully');