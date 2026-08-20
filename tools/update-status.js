const fs = require('fs');

let content = fs.readFileSync('modules/namebases-africa.js', 'utf8');

function updateStatus(entryName, newStatus) {
  const regex = new RegExp(
    '("name": "\\s*' + entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*"[\\s\\S]*?"status":\\s*")[^"]*(")',
    'g'
  );
  
  const newContent = content.replace(regex, '$1' + newStatus + '$2');
  
  if (newContent === content) {
    console.log(`WARNING: No status match found for ${entryName}`);
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