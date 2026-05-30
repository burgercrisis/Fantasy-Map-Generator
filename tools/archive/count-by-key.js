"use strict";

var fs = require("fs");
var root = "E:/code/Fantasy-Map-Generator";

// Read catalog
var catData = fs.readFileSync(root + "/config/language-mixes.json", "utf8");
var cat = JSON.parse(catData);

// Count entries using different approach
var count = 0;
for (var k in cat) count++;

fs.writeFileSync(root + "/catalog-total.txt", "Count: " + count);
console.log("Catalog: " + count);