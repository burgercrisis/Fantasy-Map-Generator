const fs = require('fs');

try {
  const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
  console.log('✓ File is valid UTF-8');
  
  // Try to parse it
  const vm = require('vm');
  const context = { module: { exports: {} } };
  vm.runInContext(content, context, { filename: 'modules/namebases-real.js' });
  
  console.log('✓ File is syntactically valid JavaScript');
  
  // Count click languages
  const lines = content.split('\n');
  let clickCount = 0;
  for (const line of lines) {
    if (line.includes('Click') && line.includes('i:')) {
      clickCount++;
    }
  }
  
  console.log(`✓ Found ${clickCount} click language entries`);
  
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}
