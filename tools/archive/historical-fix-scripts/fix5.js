const fs = require('fs');
let content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Convert to array of characters for easier manipulation
const chars = [...content];

// Find the exact position of the corruption by looking for the pattern
let startCorrupt = -1;
let endCorrupt = -1;

for (let i = 0; i < chars.length - 10; i++) {
  if (chars[i] === 'B' && chars[i+1] === 'é' && chars[i+2] === 'b' && chars[i+3] === 'o' && chars[i+4] === 't' && chars[i+5] === 'o') {
    // Found Béboto
    // Now find the closing quote
    for (let j = i + 6; j < i + 100; j++) {
      if (chars[j] === '"') {
        startCorrupt = j + 1;
        console.log('Start of corruption:', startCorrupt, 'char:', JSON.stringify(chars[j]));
        break;
      }
    }
  }
}

if (startCorrupt > 0) {
  // Find the end of corruption - look for },{
  for (let i = startCorrupt; i < Math.min(startCorrupt + 200, chars.length); i++) {
    if (chars[i] === '}' && chars[i+1] === ',' && chars[i+2] === '{') {
      endCorrupt = i;
      console.log('End of corruption:', endCorrupt);
      break;
    }
  }
}

if (startCorrupt > 0 && endCorrupt > startCorrupt) {
  // Remove corruption and add closing quote
  const newContent = [
    ...chars.slice(0, startCorrupt),  // up to but not including corruption
    '"',                               // add closing quote
    ...chars.slice(endCorrupt)         // rest of file
  ].join('');
  
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
  console.log('Fixed! Removed', endCorrupt - startCorrupt, 'characters');
} else {
  console.log('Could not find corruption');
}
