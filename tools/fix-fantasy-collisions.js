const fs = require('fs');
const path = require('path');

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];

const fantasyIndices = new Set([32, 33, 34, 35, 36, 37, 38, 39, 40, 41]);
let nextIndex = 20219;
const remapped = new Map(); // oldIndex -> newIndex

function parseJSArray(content) {
  try {
    const match = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!match) return null;
    return new Function(`return ${match[0]}`)();
  } catch (e) {
    console.error("Error parsing JS array:", e);
    return null;
  }
}

// First pass: identify real-world bases that need relocation
continentFiles.forEach(file => {
  const filePath = path.join('e:/code/Fantasy-Map-Generator/modules', file);
  const content = fs.readFileSync(filePath, 'utf8');
  const bases = parseJSArray(content);
  
  if (bases) {
    bases.forEach(base => {
      if (fantasyIndices.has(base.i)) {
        console.log(`Relocating ${base.name} from index ${base.i} to ${nextIndex}`);
        remapped.set(base.i, nextIndex);
        base.i = nextIndex;
        nextIndex++;
      }
    });
    
    // Write back updated continent file
    const variableName = file.replace('namebases-', '').replace('.js', '');
    const capitalizedVariable = variableName.charAt(0).toUpperCase() + variableName.slice(1) + 'NameBases';
    const updatedContent = `"use strict";\n\nwindow.${capitalizedVariable} = ${JSON.stringify(bases, null, 2)};\n`;
    fs.writeFileSync(filePath, updatedContent);
  }
});

// Update language-mixer-map.json
if (remapped.size > 0) {
  const mapPath = 'e:/code/Fantasy-Map-Generator/config/language-mixer-map.json';
  const mixerMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  let updated = false;

  mixerMap.forEach(m => {
    if (m.bases) {
      m.bases = m.bases.map(b => {
        if (remapped.has(b)) {
          updated = true;
          return remapped.get(b);
        }
        return b;
      });
    }
  });

  if (updated) {
    fs.writeFileSync(mapPath, JSON.stringify(mixerMap, null, 2));
    console.log("Updated language-mixer-map.json with remapped indices.");
  }
}

console.log("Relocation complete.");
