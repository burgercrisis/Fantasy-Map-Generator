#!/usr/bin/env node

/**
 * Remove Invalid/Extranous Entries from Namebase Files
 *
 * This script removes entries identified as invalid by the verification script
 */

const fs = require('fs');
const path = require('path');

// Suspected fake/misspelled language names (from verification script)
const suspiciousNames = [
  'Riang', 'BPh', 'Big Flowery', 'Français Tirailleur', 'Tày Bôi Pidgin French', 'Bole Chadic language', 'BiuΓÇôMandara', 'Cavineña', 'Yuracaré', 'Fulniô', 'Nivaclé', 'Bjarmian S├ími', 'Borgarm├Ñlet', 'Baur├⌐', 'Cof├ín', 'Fran├ºais', 'Central Erzya',
  'Kodi (dedicated)', 'Ginuman (dedicated)', 'Gobasi (dedicated)', 'Goemai language (dedicated)', 'Goguryeo Korean (dedicated)', 'Goji language (dedicated)', 'Gola (dedicated)', 'Golin (dedicated)', 'Gongduk (dedicated)', 'Gorakor (dedicated)', 'Gorontalo (dedicated)', 'Gorova (dedicated)', 'Gozarkhani (dedicated)', 'Grass Koi (dedicated)', 'Grassfields Bantu (dedicated)', 'Gua (dedicated)', 'Guaicuru (dedicated)', 'Guajiro (dedicated)', 'Guambiano (dedicated)', 'Guaraní (dedicated)', 'Guarani (dedicated)', 'Guaraní Aquidabana (dedicated)', 'Guaraní Boliviano (dedicated)', 'Guaraní Eastern Bolivian (dedicated)', 'Guaraní Mbyá (dedicated)', 'Guaraní Occidental (dedicated)', 'Guaraní Paraguayan (dedicated)', 'Guaraní Western Bolivian (dedicated)', 'Guarayu (dedicated)', 'Guató (dedicated)', 'Gubu (dedicated)', 'Gudanji (dedicated)', 'Gugu Badhun (dedicated)', 'Gugu Bimil (dedicated)', 'Gugubera (dedicated)', 'Guguyimidjir (dedicated)', 'Gula (dedicated)', 'Gulbang (dedicated)', 'Gun (dedicated)', 'Gunwinggu (dedicated)', 'Gunwinigu (dedicated)', 'Gur (dedicated)', 'Gur languages (dedicated)', 'Gur (dedicated) (2)', 'Gur (dedicated) (3)', 'Gura (dedicated)', 'Gurani (dedicated)', 'Gurdjar (dedicated)', 'Gurgula (dedicated)', 'Gurindji (dedicated)', 'Gurinji (dedicated)', 'Gurung (dedicated)', 'Gusii (dedicated)', 'Gusii (dedicated) (2)', 'Guwa (dedicated)', 'Guwar (dedicated)', 'Guya (dedicated)', 'Guya language (dedicated)', 'Guya (dedicated) (2)', 'Guyanese Creole (dedicated)', 'Guyanese Creole (dedicated) (2)', 'Gwahatike (dedicated)', 'Gwak (dedicated)', 'Gweda (dedicated)', 'Gweno (dedicated)', 'Gwibari (dedicated)', 'Gwin├ú (dedicated)', 'Gyele (dedicated)', 'Gyem (dedicated)', 'H (dedicated)', 'H (dedicated) (2)', 'Ha (dedicated)', 'Ha (dedicated) (2)', 'Ha (dedicated) (3)', 'Ha (dedicated) (4)', 'Ha (dedicated) (5)', 'Ha (dedicated) (6)', 'Haab (dedicated)', 'Haanya (dedicated)', 'Hadiyya (dedicated)', 'Hadithi Arabic (dedicated)', 'Hadrami Arabic (dedicated)', 'Hadramautic Arabic (dedicated)', 'Hadza (dedicated)', 'Hadza (dedicated) (2)', 'Hae (dedicated)', 'Hae (dedicated) (2)', 'Haka (dedicated)', 'Haka (dedicated) (2)', 'Haka (dedicated) (3)', 'Halabi Arabic (dedicated)', 'Halang (dedicated)', 'Halbi (dedicated)', 'Halkomelem (dedicated)', 'Halia (dedicated)', 'Halh (dedicated)', 'Halkomelem (dedicated) (2)', 'Ham (dedicated)', 'Ham (dedicated) (2)', 'Ham (dedicated) (3)', 'Ham (dedicated) (4)', 'Hamer (dedicated)', 'Hamer (dedicated) (2)', 'Hamer (dedicated) (3)', 'Hammer-Banna (dedicated)', 'Hani (dedicated)', 'Hani (dedicated) (2)', 'Hani (dedicated) (3)', 'Hani (dedicated) (4)', 'Hano (dedicated)', 'Hano (dedicated) (2)', 'Han (dedicated)', 'Han (dedicated) (2)', 'Han (dedicated) (3)', 'Hanunoo (dedicated)', 'Haraic (dedicated)', 'Harari (dedicated)', 'Harari (dedicated) (2)', 'Harari (dedicated) (3)', 'Harari (dedicated) (4)', 'Harauti (dedicated)', 'Harau (dedicated)', 'Haredo (dedicated)', 'Harizmi (dedicated)', 'Harmba (dedicated)', 'Harnai (dedicated)', 'Haroi (dedicated)', 'Haroi (dedicated) (2)', 'Harua (dedicated)', 'Harnai (dedicated) (2)', 'Haronai (dedicated)', 'Haronai (dedicated) (2)', 'Haro (dedicated)', 'Haro (dedicated) (2)', 'Haro (dedicated) (3)', 'Haroi (dedicated) (3)', 'Haru (dedicated)', 'Haryanvi (dedicated)', 'Harza (dedicated)', 'Haryanvi (dedicated) (2)', 'Hari (dedicated)', 'Hari (dedicated) (2)', 'Hari (dedicated) (3)', 'Hari (dedicated) (4)', 'Haroi (dedicated) (4)', 'Haryanvi (dedicated) (3)', 'Haryanvi (dedicated) (4)', 'Has (dedicated)', 'Has (dedicated) (2)', 'Hassaniya Arabic (dedicated)', 'Hassaniya Arabic (dedicated) (2)', 'Hassaniya Arabic (dedicated) (3)', 'Hassaniya Arabic (dedicated) (4)', 'Hattic (dedicated)', 'Hattic (dedicated) (2)', 'Haua (dedicated)', 'Haya (dedicated)', 'Hazaragi (dedicated)', 'Hazaragi (dedicated) (2)', 'He (dedicated)', 'He (dedicated) (2)', 'He (dedicated) (3)', 'He (dedicated) (4)', 'He (dedicated) (5)', 'He (dedicated) (6)', 'He (dedicated) (7)', 'He (dedicated) (8)', 'Hebrew (dedicated)', 'Hebrew (dedicated) (2)', 'Hebrew (dedicated) (3)', 'Hebrew (dedicated) (4)', 'Hebrew (dedicated) (5)', 'Hebrew (dedicated) (6)', 'Hebrew (dedicated) (7)', 'Hebrew (dedicated) (8)', 'Hebrew (dedicated) (9)', 'Hebrew (dedicated) (10)', 'Hebrew (dedicated) (11)', 'Hebrew (dedicated) (12)', 'Hebrew (dedicated) (13)', 'Hebrew (dedicated) (14)', 'Hebrew (dedicated) (15)', 'Hebrew (dedicated) (16)', 'Hebrew (dedicated) (17)', 'Hebrew (dedicated) (18)', 'Hebrew (dedicated) (19)', 'Hebrew (dedicated) (20)', 'Hebrew (dedicated) (21)', 'Hebrew (dedicated) (22)', 'Hebrew (dedicated) (23)', 'Hebrew (dedicated) (24)', 'Hebrew (dedicated) (25)', 'Hebrew (dedicated) (26)', 'Hebrew (dedicated) (27)', 'Hebrew (dedicated) (28)', 'Hebrew (dedicated) (29)', 'Hebrew (dedicated) (30)', 'Hebrew (dedicated) (31)', 'Hebrew (dedicated) (32)', 'Hebrew (dedicated) (33)', 'Hebrew (dedicated) (34)', 'Hebrew (dedicated) (35)', 'Hebrew (dedicated) (36)', 'Hebrew (dedicated) (37)', 'Hebrew (dedicated) (38)', 'Hebrew (dedicated) (39)', 'Hebrew (dedicated) (40)', 'Hebrew (dedicated) (41)', 'Hebrew (dedicated) (42)', 'Hebrew (dedicated) (43)', 'Hebrew (dedicated) (44)', 'Hebrew (dedicated) (45)', 'Hebrew (dedicated) (46)', 'Hebrew (dedicated) (47)', 'Hebrew (dedicated) (48)', 'Hebrew (dedicated) (49)', 'Hebrew (dedicated) (50)', 'Hebrew (dedicated) (51)', 'Hebrew (dedicated) (52)', 'Hebrew (dedicated) (53)', 'Hebrew (dedicated) (54)', 'Hebrew (dedicated) (55)', 'Hebrew (dedicated) (56)', 'Hebrew (dedicated) (57)',
  'Be',
  'E'
];

// Encoding issue pattern
const encodingPattern = /[^\\x20-\\x7E\\u00A0-\\u00FF]/;

// Continent files to check
const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

// Function to determine if a language entry should be removed
function shouldRemove(languageName, base) {
  // Primus placeholders
  if (base === 'Primus' || base === 'Primus,Secundus,Tertius,Quartus,Quintus,Sextus,Septimus,Octavus,Nonus,Decimus') {
    return true;
  }

  // Suspicious language names
  if (suspiciousNames.includes(languageName) || suspiciousNames.includes(languageName.replace(' (dedicated)', ''))) {
    return true;
  }

  // Encoding issues in name
  if (encodingPattern.test(languageName)) {
    return true;
  }

  // Single-word bases (excluding Primus which is handled above)
  const subjects = base.split(',').map(s => s.trim());
  if (subjects.length === 1) {
    return true;
  }

  return false;
}

// Process each continent file
for (const filePath of continentFiles) {
  const continentName = path.basename(filePath, '.js').replace('namebases-', '');
  const fullPath = path.join(__dirname, '../../', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    continue;
  }

  console.log(`Processing ${continentName}...`);

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  const newLines = [];
  let currentEntry = '';
  let inEntry = false;
  let entryStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inEntry && line.trim().startsWith('{')) {
      // Start of a new entry
      inEntry = true;
      entryStartLine = i;
      currentEntry = line;
    } else if (inEntry) {
      currentEntry += '\n' + line;

      if (line.trim().startsWith('}')) {
        // End of entry
        inEntry = false;

        // Parse the entry to check if it should be removed
        const nameMatch = currentEntry.match(/"name":\s*"([^"]+)"/);
        const baseMatch = currentEntry.match(/"b":\s*"([^"]*)"/);

        if (nameMatch && baseMatch) {
          const languageName = nameMatch[1];
          const base = baseMatch[1];

          if (shouldRemove(languageName, base)) {
            console.log(`  Removing: ${languageName}`);
            // Skip adding this entry to newLines
            currentEntry = '';
            continue;
          }
        }

        // Add the entry if not removed
        newLines.push(currentEntry);
        currentEntry = '';
      }
    } else {
      // Not in an entry, add the line as is
      newLines.push(line);
    }
  }

  // Write the modified content back
  const newContent = newLines.join('\n');
  fs.writeFileSync(fullPath, newContent, 'utf-8');

  console.log(`  Done processing ${continentName}`);
}

console.log('\nAll invalid entries have been removed from the namebase files.');