const fs = require('fs');
const src = fs.readFileSync('modules/namebases-real.js', 'utf8');
const results = [];
const indices = [490, 454, 455, 471, 472, 473, 497, 481, 509, 468];
indices.forEach(i => {
  const regex = new RegExp('\\{name: "([^"]+)", i: ' + i + ',[^{}]*b: "([^"]+)"');
  const match = src.match(regex);
  if (match) {
    results.push({name: match[1], i, b: match[2]});
  } else {
    results.push({i, error: 'not found'});
  }
});
fs.writeFileSync('batch_bases_content.json', JSON.stringify(results, null, 2));
