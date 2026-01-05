const fs = require('fs');
const vm = require('vm');

const window = {};
const context = vm.createContext({ console, window });

const files = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-real.js'
];

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  vm.runInContext(code, context);
}

const realWorldNameBases = window.realWorldNameBases;

// Renumber i values to be consecutive starting from 0
for (let i = 0; i < realWorldNameBases.length; i++) {
  realWorldNameBases[i].i = i;
}

console.log('Renumbered all i values to be 0 to', realWorldNameBases.length - 1);

// Now write back to the regional files
const regionalFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js',
];

const varNames = ['Africa', 'Asia', 'Europe', 'NorthAmerica', 'Oceania', 'SouthAmerica'];

for (let i = 0; i < regionalFiles.length; i++) {
  const file = regionalFiles[i];
  const varName = 'realWorldNameBases' + varNames[i];
  const array = window[varName];
  const code = '"use strict";\n\nwindow.' + varName + ' = ' + JSON.stringify(array, null, 2) + ';';
  fs.writeFileSync(file, code);
  console.log('Updated', file);
}

console.log('All i values have been renumbered to be unique and consecutive.');