const fs = require('fs');

// Investigate Bete (Congo) fair quality entry
console.log('=== Investigating Bete (Congo) Fair Quality Entry ===\n');

const content = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const lines = content.split('\n');

let foundEntry = false;
let entryDetails = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('"name": "Bete (Congo)"')) {
    foundEntry = true;
    
    // Find the entry block
    const entryBlock = [];
    let braceCount = 0;
    
    for (let j = i; j < lines.length; j++) {
      if (line.includes('"name":')) {
        braceCount++;
      }
      if (line.includes('}') && braceCount === 1) {
        // End of entry block
        break;
      }
      entryBlock.push(lines[j]);
    }
    
    console.log('Found Bete (Congo) entry:');
    entryBlock.forEach((blockLine, k) => {
      if (k < 5) {
        console.log(`  ${k}: ${blockLine}`);
      }
    });
    
    break;
  }
}

if (foundEntry && entryBlock) {
  // Analyze the entry details
  const nameLine = entryBlock.find(l => l.includes('"name":'));
  const indexLine = entryBlock.find(l => l.includes('"i":'));
  const baseLine = entryBlock.find(l => l.includes('"base":'));
  const cityLine = entryBlock.find(l => l.includes('"b":'));
  
  console.log('\nEntry Analysis:');
  if (nameLine) console.log(`  Name: ${nameLine.trim()}`);
  if (indexLine) console.log(`  Index: ${indexLine.trim()}`);
  if (baseLine) console.log(`  Base: ${baseLine.trim()}`);
  if (cityLine) console.log(`  Cities: ${cityLine.trim()}`);
  
  // Check for potential issues
  if (cityLine) {
    const cityMatch = cityLine.match(/"b":\s*"([^"]+)"/);
    if (cityMatch) {
      const cities = cityMatch[1].split(',');
      console.log(`  City Count: ${cities.length}`);
      
      // Check for generic names
      const generic = cities.filter(c => 
        c.includes('River') || c.includes('Lake') || c.includes('Mountain') || 
        c.includes('Valley') || c.includes('Town') || c.includes('Village') ||
        c.includes('District') || c.includes('Province') || c.includes('Capital')
      );
      
      if (generic.length > 0) {
        console.log(`  ⚠️  Generic city names found: ${generic.slice(0, 3).join(', ')}`);
      }
      
      // Check for very few cities (quality issue indicator)
      if (cities.length < 5) {
        console.log(`  ⚠️  Very few cities (${cities.length}) - this likely causes the low quality score`);
      }
    }
  }
} else {
  console.log('❌ Bete (Congo) entry not found');
}