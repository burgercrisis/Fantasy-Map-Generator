const fs = require('fs');

try {
  const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
  console.log('✓ File is valid UTF-8');
  
  const lines = content.split('\n');
  let clickCount = 0;
  let corruptionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Click')) {
      clickCount++;
      // Check for common corruption patterns
      if (line.includes('╟') || line.includes('╩') || line.includes('├') || line.includes('└')) {
        corruptionCount++;
        console.log(`Line ${i+1}: Still corrupted: ${line.substring(0, 80)}...`);
      }
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Click language entries found: ${clickCount}`);
  console.log(`- Potentially corrupted entries: ${corruptionCount}`);
  
} catch (error) {
  console.error(`✗ Error reading file: ${error.message}`);
}
