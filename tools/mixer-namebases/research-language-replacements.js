#!/usr/bin/env node

/**
 * Language Research and Replacement Strategy
 * 
 * This script creates a research plan for languages needing authentic placenames
 * Based on linguistic classification and geographic distribution data
 */

const fs = require('fs');
const path = require('path');

// Read namebases-real.js
const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
const content = fs.readFileSync(namebasePath, 'utf-8');

// Parse to find Primus-only languages
const primusLanguages = [];
const lines = content.split('\n');

for (const line of lines) {
  const match = line.match(/\{ name: "([^"]+)".*?b: "Primus"/);
  if (match) {
    primusLanguages.push(match[1]);
  }
}

console.log(`Found ${primusLanguages.length} languages with Primus-only placeholders`);

// Prioritize by language family and research feasibility
const languagePriorities = {
  // HIGH PRIORITY: Major languages with clear geographic ranges
  high: [
    'Matlatzinca', 'Mixtec', 'Otomí', 'Zapotec',
    'Mesmes', 'Muher', 'Nahuatl', 'Maya',
    'Ainu', 'Akan', 'Aleut', 'Navajo', 'Hopi'
  ],
  
  // MEDIUM PRIORITY: Indigenous/minority languages with documented regions
  medium: [
    'Comanche', 'Shoshoni', 'Kumeyaay', 'Wushi',
    'Koda', 'Cebuano', 'Ginuman', 'Kachi Koli',
    'Simaa', 'Tonga Malawi', 'Tshivenda', 'Venda'
  ],
  
  // LOW PRIORITY: Suspicious/possibly fake languages
  low: [
    'Riang', 'BPh', 'Big Flowery', 'Ginuman', 'Kachi Koli',
    'Glavda language', 'Gobasi', 'Goemai language', 'Goguryeo Korean', 'Goji language'
  ],
  
  // DELETE: Redundant/generic/suspicious entries
  delete: [
    'Gola', 'Gulin', 'Gurung', 'Gula', 'Guwa', 'Gurani', 'Guarayu', 'Guat', // Too generic
    'Hebrew (dedicated)', 'Hebrew (dedicated) (2)', // 2+ duplicates
    'Ham (dedicated)', 'Ham (dedicated) (2)', // 2+ duplicates
    'H (dedicated)', 'H (dedicated)', '2)', // Too generic
    'Ha (dedicated)', 'Ha (dedicated) (2)', // Too generic
    'German (dedicated)', 'French (dedicated)', // Generic country names
    'English (dedicated)', 'Spanish (dedicated)', // Generic country names
    'Chinese (dedicated)', 'Japanese (dedicated)' // Generic country names
  ]
};

// Research strategy for each language
function createResearchPlan(languageName) {
  const strategy = {
    high: () => [
      `Research ${languageName} actual geographic range`,
      `Find major cities/towns/villages where ${languageName} is spoken`,
      `Verify authenticity of language name (is it a typo or legit?)`,
      `Check if this is a dialect of another major language and inherit those placenames`
    ],
    medium: () => [
      `Research ${languageName} on ethnologue.org or academic sources`,
      `Find administrative divisions/regions where spoken`,
      `Locate 3-5 major settlements in that region`
    ],
    low: () => [
      `Verify if ${languageName} is a real language or typo`,
      `If legit, find geographic range (often very small)`,
      `Consider merging with related language or marking for deletion`
    ],
    delete: () => [
      `Delete ${languageName} entry - likely fake/generic`,
      `Cross-reference to see if legitimate language exists with similar name`
    ]
  };
  
  const priority = Object.keys(languagePriorities).find(p => languagePriorities[priority].includes(languageName));
  return priority ? strategy[priority]() : strategy.medium();
}

// Generate research tasks
console.log('\n' + '='.repeat(80));
console.log('RESEARCH TASK GENERATION');
console.log('='.repeat(80) + '\n');

const highPriorityTasks = languagePriorities.high.filter(l => primusLanguages.includes(l));
const mediumPriorityTasks = languagePriorities.medium.filter(l => primusLanguages.includes(l));
const lowPriorityTasks = languagePriorities.low.filter(l => primusLanguages.includes(l));
const deleteTasks = languagePriorities.delete.filter(l => primusLanguages.includes(l));

console.log(`HIGH PRIORITY (${highPriorityTasks.length} languages):`);
highPriorityTasks.forEach((lang, i) => {
  console.log(`  ${i + 1}. ${lang}`);
  console.log(`      - ${createResearchPlan(lang)[0]}`);
  console.log(`      - ${createResearchPlan(lang)[1]}`);
  console.log(`      - ${createResearchPlan(lang)[2]}`);
});

console.log(`\nMEDIUM PRIORITY (${mediumPriorityTasks.length} languages):`);
mediumPriorityTasks.forEach((lang, i) => {
  console.log(`  ${i + 1}. ${lang}`);
  console.log(`      - ${createResearchPlan(lang)[0]}`);
  console.log(`      - ${createResearchPlan(lang)[1]}`);
});

console.log(`\nLOW PRIORITY (${lowPriorityTasks.length} languages):`);
lowPriorityTasks.forEach((lang, i) => {
  console.log(`  ${i + 1}. ${lang}`);
  console.log(`      - ${createResearchPlan(lang)[0]}`);
});

console.log(`\nDELETE/SUSPICIOUS (${deleteTasks.length} entries):`);
deleteTasks.forEach((lang, i) => {
  console.log(`  ${i + 1}. ${lang} - DELETE/VERIFY`);
});

console.log('\n' + '='.repeat(80));
console.log('ESTIMATED TIME');
console.log('='.repeat(80) + '\n');

const totalLanguages = highPriorityTasks.length + mediumPriorityTasks.length + lowPriorityTasks.length + deleteTasks.length;
const avgTimePerLanguage = 5; // minutes
const totalTimeMinutes = totalLanguages * avgTimePerLanguage;
const totalHours = totalTimeMinutes / 60;

console.log(`Total languages to process: ${totalLanguages}`);
console.log(`Estimated research time: ${totalHours.toFixed(1)} hours`);
console.log(`Recommended approach: Batch research in groups of 20 languages`);

console.log('\n' + '='.repeat(80));
console.log('IMMEDIATE ACTION RECOMMENDATIONS');
console.log('='.repeat(80) + '\n');

console.log('1. DELETE SUSPICIOUS ENTRIES:');
console.log('   These are likely typos or fake languages:');
deleteTasks.forEach(lang => {
  console.log(`   - ${lang}`);
});

console.log('\n2. FIX ENCODING ISSUES:');
console.log('   Many language names have UTF-8 Mojibake corruption');
console.log('   Examples: "Cavineña" → "Cavineña", "Yuracaré" → "Yuracaré"');
console.log('   Need to manually fix these in the file');

console.log('\n3. HIGH PRIORITY LANGUAGES:');
console.log('   These are well-documented with clear geographic ranges:');
highPriorityTasks.slice(0, 10).forEach(lang => {
  console.log(`   - ${lang}`);
});

console.log('\n4. AUTHENTICITY VERIFICATION:');
console.log('   Use these authoritative sources:');
console.log('   - Ethnologue: https://www.ethnologue.com/');
console.log   - Glottolog: https://glottolog.org/');
console.log('   - Wikipedia: For language verification and geography');
console.log('   - Academic papers: For geographic ranges');

console.log('\n' + '='.repeat(80));
console.log('RESEARCH FORMAT');
console.log('='.repeat(80) + '\n');

console.log(`For each language, document:`);
console.log(`1. Language Family: (e.g., Mixtec: Oto-Manguean, Otomanguean)`);
console.log(`2. Geographic Range: (e.g., Oaxaca state, Mixteca region)`);
console.log(`3. Major Settlements: 8-12 cities/towns/villages`);
console.log(`4. Language Varieties: (if applicable, merge with parent language)`);
console.log(`5. Verification: Source URLs confirming authenticity`);

console.log('\n' + '='.repeat(80));
console.log('NEXT STEPS');
console.log('='.repeat(80) + '\n');

console.log('1. Use this script to generate research tasks');
console.log('2. Research 5-10 languages at a time');
console.log('3. For each language, verify:');
console.log('   - Language actually exists (not a typo)');
console.log('   - Geographic range is accurate');
console.log('   - Placenames are in that region');
console.log('4. Add placenames to namebases-real.js');
console.log('5. Run verification scripts:');
console.log('   - node tools/mixer-namebases/verify-language-authenticity.js');
console.log('   - node tools/mixer-namebases/check-namebase-lengths.js');
console.log('   - node tools/mixer-namebases/dedupe-namebase-duplicates.js');

console.log('\n' + '='.repeat(80));
console.log('CANCELL IF:');
console.log('='.repeat(80) + '\n');

console.log('- You prefer to delete all questionable entries');
console.log('- You want to use a more conservative approach');
console.log('- You want different prioritization');

console.log('\n');
