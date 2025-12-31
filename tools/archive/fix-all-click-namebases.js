const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Comprehensive list of all click language entries with their proper bases
const fixes = [
  {
    name: 'Kx\'a Click A',
    index: 353,
    bases: ['ǀxǫa', 'ǀxǩa', 'ǀxǯa', 'ǀkǩa', 'ǀkǩe', 'ǀgǫa', 'ǀgǩa', 'ǀhǯa', 'ǀhǫa', 'ǀhǩi', 'ǀmǫa', 'ǀmǩa', 'ǃxǫa', 'ǃxǩa', 'ǃkǩa', 'ǃkǩe', 'ǃgǫa', 'ǃgǩa', 'ǃhǯa', 'ǃhǫa', 'ǃmǩa', 'ǃmǩi', 'ǁxǫa', 'ǁxǩa', 'ǁkǩa', 'ǁkǩe', 'ǁgǫa', 'ǁgǩa', 'ǁhǯa', 'ǁhǫa', 'ǁmǩa', 'ǁmǩi', 'Ǆxǫa', 'Ǆxǩa', 'Ǆkǩa', 'Ǆkǩe', 'Ǆgǫa', 'Ǆgǩa', 'Ǆhǯa', 'Ǆhǫa', 'Ǆmǩa', 'Ǆmǩi']
  },
  {
    name: 'Kx\'a Click B',
    index: 354,
    bases: ['ǀxǭa', 'ǀxǯa', 'ǀxǯa', 'ǀkǭa', 'ǀkǯa', 'ǀgǭa', 'ǀgǯa', 'ǀhǭa', 'ǀhǯa', 'ǀmǭa', 'ǀmǯa', 'ǃxǭa', 'ǃxǯa', 'ǃkǭa', 'ǃkǯa', 'ǃgǭa', 'ǃgǯa', 'ǃhǭa', 'ǃhǯa', 'ǃmǭa', 'ǃmǯa', 'ǁxǭa', 'ǁxǯa', 'ǁkǭa', 'ǁkǯa', 'ǁgǭa', 'ǁgǯa', 'ǁhǭa', 'ǁhǯa', 'ǁmǭa', 'ǁmǯa', 'Ǆxǭa', 'Ǆxǯa', 'Ǆkǭa', 'Ǆkǯa', 'Ǆgǭa', 'Ǆgǯa', 'Ǆhǭa', 'Ǆhǯa', 'Ǆmǭa', 'Ǆmǯa']
  },
  {
    name: 'Kx\'a Click C',
    index: 355,
    bases: ['ǀxǪe', 'ǀxǩo', 'ǀxǬe', 'ǀxǯi', 'ǀkǩe', 'ǀkǯe', 'ǀgǪe', 'ǀgǯe', 'ǀhǬe', 'ǀhǯa', 'ǀmǪe', 'ǀmǯe', 'ǃxǪe', 'ǃxǯa', 'ǃkǩe', 'ǃkǯa', 'ǁxǪe', 'ǁxǯa', 'ǄxǪe', 'Ǆxǯa']
  },
  {
    name: 'Taa Click',
    index: 356,
    bases: ['ǁxǯo', 'ǁxǭo', 'ǁxǯo', 'ǁgǫa', 'ǁgǯo', 'ǁhǫa', 'ǁhǯa', 'ǁhǯa', 'ǁhǩa', 'ǁhǩi', 'ǃxǯo', 'ǃxǭo', 'ǃgǫa', 'ǃgǯo', 'Ǆxǯo', 'Ǆxǭo', 'Ǆgǫa', 'Ǆgǯo', 'ǀxǯo', 'ǀxǭo', 'ǀgǫa', 'ǀgǯo', 'taa_356_u1']
  },
  {
    name: 'Nǁng Click',
    index: 357,
    bases: ['ǀnǪi', 'ǀnǦi', 'ǀnǦi', 'ǀgǪi', 'ǀgǦi', 'ǀhǪi', 'ǀhǦi', 'ǃnǪi', 'ǃnǦi', 'ǀgǪi', 'ǀgǦi', 'ǃnǪi', 'ǃnǦi', 'ǀnǪi', 'ǀnǦi', 'ǁgǪi', 'ǁgǦi']
  },
  {
    name: 'Nama Click',
    index: 358,
    bases: ['ǀgǩam', 'ǀnǩmi', 'ǀkhǩb', 'ǀkhǯm', 'ǀgǯas', 'ǃgǩis', 'ǃkhǯm', 'ǃgǩab', 'ǁgǩas', 'ǁkhoas', 'ǀnǩmi', 'ǀgǩms', 'Ǆkhǩb', 'ǀnǩmi', 'ǀgǯas', 'ǀkhǩis', 'ǀkhǯas', 'ǁgǯam', 'ǃnǩos', 'ǃgǯas']
  },
  {
    name: 'Naro Click',
    index: 359,
    bases: ['ǀnaro', 'ǀnǩro', 'ǀgǩro', 'ǀgaru', 'ǀnaro', 'ǀnǩro', 'ǁgǩro', 'ǁgaru', 'ǃnaro', 'ǃgǩro', 'ǀnaro', 'ǀgǩro', 'ǀnǬru', 'ǀgǬru', 'ǀnǬru', 'ǁgǬru', 'ǃnǬru', 'ǃgǬru', 'ǀnǬru', 'ǃgǬru', 'ǀnǬru', 'ǃgǬru', 'ǀnǬru', 'ǃgǬru', 'ǀnǬru', 'ǀgǬru']
  },
  {
    name: 'Gǃui Click',
    index: 361,
    bases: ['Gǃui', 'Gǃuim', 'Gǃuisa', 'Gǃuikhom', 'Gǃuigas', 'Gǃuib', 'Gǃuis', 'Gǃuida', 'ǃGǃui', 'ǃGǃuim', 'ǃGǃuis', 'ǄGǃui', 'ǄGǃuis']
  },
  {
    name: 'Ju/\'hoan Click',
    index: 362,
    bases: ['ǃxǭa', 'ǃxǯa', 'ǃxǯa', 'ǃgǭa', 'ǃgǯa', 'ǃhǭa', 'ǃhǯa', 'ǃnǭa', 'ǃnǯa', 'ǃkǭa', 'Ǆxǭa', 'Ǆxǯa', 'Ǆgǭa', 'Ǆgǯa', 'ǀxǭa', 'ǀxǯa', 'ǀgǭa', 'ǀgǯa', 'Ghanzi', 'Dekar', 'Kang', 'Tshane', 'Nata', 'Maun', 'Shakawe', 'Kasane', 'Gumare', 'Sebina', 'Matsiloje', 'Mogoditshane']
  },
  {
    name: 'Hadza Click',
    index: 363,
    bases: ['ǁa', 'ǁǩ', 'ǁe', 'ǁǦ', 'ǃha', 'ǃhǦ', 'ǃhi', 'ǁa', 'ǁǩ', 'ǁe', 'ǁǦ', 'Ǆa', 'Ǆǩ', 'Ǆe', 'ǄǦ', 'ǀa', 'ǀǩ', 'ǀe', 'ǀǦ']
  },
  {
    name: 'Sandawe Click',
    index: 364,
    bases: ['ǃsa', 'ǃsǩ', 'ǃse', 'ǃsǦ', 'Ǆsa', 'Ǆsǩ', 'Ǆse', 'ǄsǦ', 'ǁsa', 'ǁsǩ', 'ǁse', 'ǁsǦ', 'ǀsa', 'ǀsǩ', 'ǀse', 'ǀsǦ', 'sandawe_364_u1', 'sandawe_364_u2']
  }
];

const lines = content.split('\n');
const newLines = [];

for (let line of lines) {
  let replaced = false;
  
  for (const fix of fixes) {
    // Match lines that start with object and contain the name (handles both corrupted and fixed names)
    const nameRegex = new RegExp(`name:\\s*"[^"]*${fix.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`);    
    const objStartRegex = /\s*\{[^}]*(i:\s*\d+,)?\s*name:\s*"[^"]*Click[^"]*"/;
    
    if (objStartRegex.test(line)) {
      const basesStr = fix.bases.join(',');
      const newEntry = `    { name: "${fix.name}", i: ${fix.index}, min: 3, max: 9, d: "lnrtkxgms", m: 0, b: "${basesStr}" }`;
      console.log(`Fixed: ${fix.name}`);
      newLines.push(newEntry);
      replaced = true;
      break;
    }
  }
  
  if (!replaced) {
    newLines.push(line);
  }
}

fs.writeFileSync('modules/namebases-real.js', newLines.join('\n'), 'utf-8');
console.log('✓ Fixed all click language namebases');
