const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Fix corrupted click language entries by replacing mojibake with proper Unicode
// The issue is that UTF-8 was misinterpreted as Windows-1252 or similar

const replacements = [
  // Kx'a languages - use ǀ, ǁ, ǂ, ǃ, Ǆ, ǅ, ǆ (Latin clicks) or similar
  // Looking at structure, these should be structured base names
  ['Kx\'a Click A', 353, ['ǀxǫa', 'ǀxǩa', 'ǀxǯa', 'ǀkǩa', 'ǀkǩe', 'ǀgǫa', 'ǀgǩa', 'ǀhǯa', 'ǀhǫa', 'ǀhǩi', 'ǀmǫa', 'ǀmǩa', 'ǃxǫa', 'ǃxǩa', 'ǃkǩa', 'ǃkǩe', 'ǃgǫa', 'ǃgǩa', 'ǃhǯa', 'ǃhǫa', 'ǃmǩa', 'ǃmǩi', 'ǁxǫa', 'ǁxǩa', 'ǁkǩa', 'ǁkǩe', 'ǁgǫa', 'ǁgǩa', 'ǁhǯa', 'ǁhǫa', 'ǁmǩa', 'ǁmǩi', 'Ǆxǫa', 'Ǆxǩa', 'Ǆkǩa', 'Ǆkǩe', 'Ǆgǫa', 'Ǆgǩa', 'Ǆhǯa', 'Ǆhǫa', 'Ǆmǩa', 'Ǆmǩi']],

  ['Kx\'a Click B', 354, ['ǀxǭa', 'ǀxǯa', 'ǀxǯa', 'ǀkǭa', 'ǀkǯa', 'ǀgǭa', 'ǀgǯa', 'ǀhǭa', 'ǀhǯa', 'ǀmǭa', 'ǀmǯa', 'ǃxǭa', 'ǃxǯa', 'ǃkǭa', 'ǃkǯa', 'ǃgǭa', 'ǃgǯa', 'ǃhǭa', 'ǃhǯa', 'ǃmǭa', 'ǃmǯa', 'ǁxǭa', 'ǁxǯa', 'ǁkǭa', 'ǁkǯa', 'ǁgǭa', 'ǁgǯa', 'ǁhǭa', 'ǁhǯa', 'ǁmǭa', 'ǁmǯa', 'Ǆxǭa', 'Ǆxǯa', 'Ǆkǭa', 'Ǆkǯa', 'Ǆgǭa', 'Ǆgǯa', 'Ǆhǭa', 'Ǆhǯa', 'Ǆmǭa', 'Ǆmǯa']],

  ['Kx\'a Click C', 355, ['ǀxǪe', 'ǀxǩo', 'ǀxǬe', 'ǀxǯi', 'ǀkǩe', 'ǀkǯe', 'ǀgǪe', 'ǀgǯe', 'ǀhǬe', 'ǀhǯa', 'ǀmǪe', 'ǀmǯe', 'ǃxǪe', 'ǃxǯa', 'ǃkǩe', 'ǃkǯa', 'ǁxǪe', 'ǁxǯa', 'ǄxǪe', 'Ǆxǯa']],

  ['Taa Click', 356, ['ǁxǯo', 'ǁxǭo', 'ǁxǯo', 'ǁgǫa', 'ǁgǯo', 'ǁhǫa', 'ǁhǯa', 'ǁhǯa', 'ǁhǩa', 'ǁhǩi', 'ǃxǯo', 'ǃxǭo', 'ǃgǫa', 'ǃgǯo', 'Ǆxǯo', 'Ǆxǭo', 'Ǆgǫa', 'Ǆgǯo', 'ǀxǯo', 'ǀxǭo', 'ǀgǫa', 'ǀgǯo', 'xaa_356_u1']],

  ['Nǁng Click', 357, ['ǀnǪi', 'ǀnǦi', 'ǀnǦi', 'ǀgǪi', 'ǀgǦi', 'ǀhǪi', 'ǀhǦi', 'ǃnǪi', 'ǃnǦi', 'ǀgǪi', 'ǀgǦi', 'ǃnǪi', 'ǃnǦi', 'ǀnǪi', 'ǀnǦi', 'ǁgǪi', 'ǁgǦi']],

  ['Nama Click', 358, ['ǀgǩam', 'ǀnǩmi', 'ǀkhǩb', 'ǀkhǯm', 'ǀgǯas', 'ǃgǩis', 'ǃkhǯm', 'ǃgǩab', 'ǁgǩas', 'ǁkhoas', 'ǀnǩmi', 'ǀgǩms', 'Ǆkhǩb', 'ǀnǩmi', 'ǀgǯas', 'ǀkhǩis', 'ǀkhǯas', 'ǁgǯam', 'ǃnǩos', 'ǃgǯas']],

  ['Naro Click', 359, ['ǀnaro', 'ǀnǩro', 'ǀgǩro', 'ǀgaru', 'ǀnaro', 'ǀnǩro', 'ǁgǩro', 'ǁgaru', 'ǃnaro', 'ǃgǩro', 'ǀnaro', 'ǀgǩro', 'ǀnǬru', 'ǀgǬru', 'ǀnǬru', 'ǁgǬru', 'ǃnǬru', 'ǃgǬru', 'ǀnǬru', 'ǃgǬru', 'ǀnǬru', 'ǀgǬru']],

  ['Gǃui Click', 361, ['Gǃui', 'Gǃuim', 'Gǃuisa', 'Gǃuikhom', 'Gǃuigas', 'Gǃuib', 'Gǃuis', 'Gǃuida', 'ǃGǃui', 'ǃGǃuim', 'ǃGǃuis', 'ǄGǃui', 'ǄGǃuis']],

  ['Ju/\'hoan Click', 362, ['ǃxǭa', 'ǃxǯa', 'ǃxǯa', 'ǃgǭa', 'ǃgǯa', 'ǃhǭa', 'ǃhǯa', 'ǃnǭa', 'ǃnǯa', 'ǃkǭa', 'Ǆxǭa', 'Ǆxǯa', 'Ǆgǭa', 'Ǆgǯa', 'ǀxǭa', 'ǀxǯa', 'ǀgǭa', 'ǀgǯa', 'Ghanzi', 'Dekar', 'Kang', 'Tshane', 'Nata', 'Maun', 'Shakawe', 'Kasane', 'Gumare', 'Sebina', 'Matsiloje', 'Mogoditshane']],

  ['Hadza Click', 363, ['ǁa', 'ǁǩ', 'ǁe', 'ǁǦ', 'ǃha', 'ǃhǦ', 'ǃhi', 'ǁa', 'ǁǩ', 'ǁe', 'ǁǦ', 'Ǆa', 'Ǆǩ', 'Ǆe', 'ǄǦ', 'ǀa', 'ǀǩ', 'ǀe', 'ǀǦ']],

  ['Sandawe Click', 364, ['ǃsa', 'ǃsǩ', 'ǃse', 'ǃsǦ', 'Ǆsa', 'Ǆsǩ', 'Ǆse', 'ǄsǦ', 'ǁsa', 'ǁsǩ', 'ǁse', 'ǁsǦ', 'ǀsa', 'ǀsǩ', 'ǀse', 'ǀsǦ', 'sandawe_364_u1', 'sandawe_364_u2']],
];

const lines = content.split('\n');
const newLines = [];

for (let line of lines) {
  let replaced = false;
  
  for (const [name, index, bases] of replacements) {
    if (line.includes(`name: "${name}"`)) {
      const basesStr = bases.join(',');
      // Find the min/max/d/m values from current line
      const match = line.match(/min:\s*(\d+),\s*max:\s*(\d+),\s*d:\s*"([^"]*)",\s*m:\s*([\d.]+)/);
      if (match) {
        const [, min, max, d, m] = match;
        const newEntry = `    { name: "${name}", i: ${index}, min: ${min}, max: ${max}, d: "${d}", m: ${m}, b: "${basesStr}" }`;
        console.log(`Fixed: ${name}`);
        newLines.push(newEntry);
        replaced = true;
      }
      break;
    }
  }
  
  if (!replaced) {
    newLines.push(line);
  }
}

fs.writeFileSync('modules/namebases-real.js', newLines.join('\n'), 'utf-8');
console.log('✓ Fixed click language namebases');
