const fs = require('fs');
const d = fs.readFileSync('modules/namebases-real.js', 'utf8');
const patterns = ['andalusiromancea','ansoa','balearica','banataa','barranquenhoa','benasquesea','berciana','bergamasquea','bolivianspanisha','bolognesea','bragoneana','brazilianportuguesea','brianzo','brivasca','britishlatina','bukoviniana','burgundiana','canzesa','cantabriana','castiliana','castilianoleon','catalana'];
let found = patterns.filter(p => d.includes(p));
console.log('Patterns found: ' + found.length);
found.forEach(p => console.log('- ' + p));
