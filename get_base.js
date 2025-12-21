const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const regex = /{name: ".*?", i: 1234,.*?, b: "(.*?)"}/;
const match = content.match(regex);
if (match) {
  console.log(match[1]);
}
