const fs = require('fs');
const path = require('path');

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const modulesPath = 'e:/code/Fantasy-Map-Generator/modules';

function parseJSArray(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf(']');
  if (startIndex === -1 || endIndex === -1) return [];
  const jsStr = content.substring(startIndex, endIndex + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    try {
      const stripped = jsStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      return new Function(`return ${stripped}`)();
    } catch (e2) {
      return [];
    }
  }
}

const allBases = [];
continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const bases = parseJSArray(filePath);
    console.log(`Loaded ${bases.length} bases from ${file}`);
    bases.forEach(b => {
      b.sourceFile = file;
      allBases.push(b);
    });
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log(`Total bases: ${allBases.length}`);

const nameMap = new Map();
const duplicates = [];

allBases.forEach(base => {
  const normalizedName = base.name.trim().toLowerCase();
  if (nameMap.has(normalizedName)) {
    duplicates.push({
      name: base.name,
      normalized: normalizedName,
      i: base.i,
      file: base.sourceFile,
      existing: nameMap.get(normalizedName)
    });
  } else {
    nameMap.set(normalizedName, { i: base.i, name: base.name, file: base.sourceFile });
  }
});

if (duplicates.length > 0) {
  console.log('Duplicate Names Found (normalized):');
  duplicates.forEach(d => {
    console.log(`- "${d.name}" (i:${d.i}) in ${d.file} duplicates "${d.existing.name}" (i:${d.existing.i}) in ${d.existing.file}`);
  });
} else {
  console.log('No duplicate names found.');
}
