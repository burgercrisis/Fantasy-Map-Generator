const fs = require('fs');

let content = fs.readFileSync('modules/namebases-africa.js', 'utf8');

function updateStatus(entryName, newStatus) {
  // Find the entry and replace its status field
  // Pattern: "name": "Batu", ... "status": "OLD_STATUS"
  const regex = new RegExp(
    '("name":\\s*"' + entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[\\s\\S]*?"status":\\s*")[^"]*(")',
    'g'
  );
  
  const newContent = content.replace(regex, '$1' + newStatus + '$2');
  
  if (newContent === content) {
    console.log(`WARNING: No status match found for ${entryName}`);
    // Try alternative pattern
    const altRegex = new RegExp(
      '("name":\\s*"' + entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[\\s\\S]*?)\\n\\s*"status":\\s*"[^"]*"',
      'g'
    );
    const altContent = content.replace(altRegex, '$1\n    "status": "' + newStatus + '"');
    if (altContent !== content) {
      content = altContent;
      console.log(`Updated ${entryName} status to ${newStatus} (alt pattern)`);
    }
    return content;
  }
  
  content = newContent;
  console.log(`Updated ${entryName} status to ${newStatus}`);
  return content;
}

// Update statuses
updateStatus('Batu', 'COMPLETE');
updateStatus('Balo', 'COMPLETE');
updateStatus('Bangi', 'COMPLETE');
updateStatus('Bina', 'COMPLETE');
updateStatus('Tshiluba', 'COMPLETE');

fs.writeFileSync('modules/namebases-africa.js', content);
console.log('\nStatuses updated successfully');