
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
const allBases = [];

function parseJSArray(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the start of the array assignment
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf(']');
  
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error(`Could not find array in ${filePath}`);
    return [];
  }
  
  const jsStr = content.substring(startIndex, endIndex + 1);
  
  try {
    // We use a function wrapper to safely evaluate the JS array literal
    const array = new Function(`return ${jsStr}`)();
    if (!Array.isArray(array)) {
      console.error(`Parsed content from ${filePath} is not an array`);
      return [];
    }
    return array;
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e.message);
    // Try a fallback: strip comments and try again
    try {
      const stripped = jsStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const array = new Function(`return ${stripped}`)();
      if (Array.isArray(array)) return array;
    } catch (e2) {
      console.error(`Fallback parsing also failed for ${filePath}:`, e2.message);
    }
    return [];
  }
}

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const bases = parseJSArray(filePath);
    console.log(`Loaded ${bases.length} bases from ${file}`);
    allBases.push(...bases);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

const indices = new Map();
const names = new Map();
const collisions = [];
const duplicateNames = [];

allBases.forEach(base => {
  if (indices.has(base.i)) {
    collisions.push({ index: base.i, base1: indices.get(base.i), base2: base.name });
  }
  indices.set(base.i, base.name);

  if (names.has(base.name)) {
    duplicateNames.push(base.name);
  }
  names.set(base.name, base.i);
});

console.log(`Total bases loaded: ${allBases.length}`);
const allIndices = allBases.map(b => b.i);
const maxIndex = Math.max(...allIndices);
console.log(`Highest index: ${maxIndex}`);
console.log(`Unique indices: ${indices.size}`);
console.log(`Unique names: ${names.size}`);

if (collisions.length > 0) {
  console.error('Index Collisions found:', collisions);
} else {
  console.log('No index collisions found.');
}

if (duplicateNames.length > 0) {
  console.warn('Duplicate names found:', duplicateNames);
} else {
  console.log('No duplicate names found.');
}

// Check for Harari-Argobba specifically
const harari = allBases.find(b => b.name === 'Harari-Argobba');
if (harari) {
  console.log('Harari-Argobba found:', harari);
} else {
  console.error('Harari-Argobba NOT found!');
}

// Check for Human Generic (index 32)
const index32 = allBases.find(b => b.i === 32);
if (index32) {
  console.log('Base at index 32:', index32);
} else {
  console.log('No base at index 32 found in loaded files.');
}

// Verification: Try to generate names for a few indices
console.log('\n--- Generation Test ---');
const testIndices = [32, 33, 312, 20226]; // Human Generic, Elven, Harari-Argobba, Australian Aboriginal
testIndices.forEach(i => {
  const base = allBases.find(b => b.i === i);
  if (base) {
    console.log(`Index ${i} (${base.name}): ${base.b.slice(0, 50)}...`);
  } else {
    console.warn(`Index ${i} not found in any file!`);
  }
});

