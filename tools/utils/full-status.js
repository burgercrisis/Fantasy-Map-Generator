const fs = require("fs");

const FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-unknown.js"
];

for (const f of FILES) {
  const c = fs.readFileSync(f, "utf8");
  let o = 0, cl = 0;
  for (let i = 0; i < c.length; i++) {
    if (c[i] === '{') o++;
    if (c[i] === '}') cl++;
  }

  // Count d-field types
  const dRe = /"d":\s*"([^"]*)"/g;
  let m;
  let corrupted = 0, clean = 0, empty = 0;
  while ((m = dRe.exec(c)) !== null) {
    const d = m[1];
    if (d === "") empty++;
    else if (/^[a-z]*$/.test(d)) clean++;
    else corrupted++;
  }

  // Chinese chars
  const chinese = (c.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // Leading spaces in name
  const leadSpaces = (c.match(/"name":\s*" +/g) || []).length;

  const entries = (c.match(/"name":/g) || []).length;
  const balanced = o === cl ? "YES" : "NO";
  console.log(f.replace("modules/", "") + ": bal=" + balanced + " o=" + o + "/cl=" + cl + " entries=" + entries + " d-corrupt=" + corrupted + " d-clean=" + clean + " d-empty=" + empty + " chinese=" + chinese + " leadSp=" + leadSpaces);
}
