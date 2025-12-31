// Test script to check regex pattern
const testLine = "b: \"Macuna_6653Town,Macuna_6653City,Macuna_6653Village\"";
const pattern = /([A-Za-z0-9\-_ΓÇÖ├½╠▒]+)_(\d+)(Town|City|Village|Port|Haven|Bridge|Ford|Hill|Valley|Field|Grove|Creek)/g;

console.log("Testing regex on:", testLine);
let match;
while ((match = pattern.exec(testLine)) !== null) {
  console.log("Found match:", match);
  console.log("  langName:", match[1]);
  console.log("  number:", match[2]);
  console.log("  suffix:", match[3]);
}