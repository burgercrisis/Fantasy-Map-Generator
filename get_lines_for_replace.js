const fs = require('fs');
const src = fs.readFileSync('modules/namebases-real.js', 'utf8');
const indices = [490, 454, 455, 471, 472, 473, 497, 481, 509, 468];
indices.forEach(i => {
  const regex = new RegExp('\\{name: "[^"]+", i: ' + i + ',[^{}]*b: "[^"]+"\\},?');
  const match = src.match(regex);
  if (match) {
    console.log(match[0]);
  }
});
