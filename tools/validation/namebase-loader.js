"use strict";

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CONTINENT_FILES = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-fantasy.js'
];

const CONTINENT_MAP = {
  'modules/namebases-africa.js': 'Africa',
  'modules/namebases-asia.js': 'Asia',
  'modules/namebases-europe.js': 'Europe',
  'modules/namebases-northAmerica.js': 'NorthAmerica',
  'modules/namebases-southAmerica.js': 'SouthAmerica',
  'modules/namebases-oceania.js': 'Oceania',
  'modules/namebases-fantasy.js': 'Fantasy'
};

function loadAllNamebases() {
  const allNamebases = [];
  const metadata = [];

  for (const file of CONTINENT_FILES) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const context = { module: { exports: {} }, window: {} };
      vm.runInContext(content, context, { filename: file });

      const continentName = CONTINENT_MAP[file];
      const arrayName = continentName + 'NameBases';
      const entries = context.window[arrayName];

      if (entries && Array.isArray(entries)) {
        for (const entry of entries) {
          allNamebases.push({
            ...entry,
            _continent: continentName,
            _sourceFile: path.basename(file)
          });
        }
        metadata.push({
          file: path.basename(file),
          continent: continentName,
          count: entries.length
        });
      }
    } catch (error) {
      console.error(`Error loading ${file}: ${error.message}`);
    }
  }

  return { allNamebases, metadata };
}

function loadContinentNamebases(continentFile) {
  const content = fs.readFileSync(continentFile, 'utf-8');
  const context = { module: { exports: {} }, window: {} };
  vm.runInContext(content, context, { filename: continentFile });

  const baseName = path.basename(continentFile, '.js');
  const continentName = baseName.replace('namebases-', '').replace(/([A-Z])/g, ' $1').trim();
  const arrayName = continentName.replace(/ /g, '') + 'NameBases';

  return {
    entries: context.window[arrayName] || [],
    continent: continentName,
    file: baseName
  };
}

module.exports = { loadAllNamebases, loadContinentNamebases, CONTINENT_FILES, CONTINENT_MAP };
