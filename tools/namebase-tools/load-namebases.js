"use strict";

/**
 * Load the namebase data the way the browser does, for use by Node tools.
 *
 *   const {loadNameBases} = require("./namebase-tools/load-namebases");
 *   const {nameBases, nameBasesByIndex, indices} = loadNameBases();
 *
 * WHY THIS EXISTS
 * ---------------
 * The namebase data used to be one file, modules/namebases-real.js, exported as
 * window.realWorldNameBases. It was split into seven per-continent files that
 * the aggregator public/modules/namebases-all.js merges into
 * window.defaultNameBases. Twenty-one tools were never updated, so all of them
 * died with ENOENT the moment they were run. Several had been used to measure
 * progress during a research project, so any number they produced is
 * untrustworthy.
 *
 * Rather than hand-copy a parsing idiom into twenty-one files, every tool that
 * needs the merged data should call this. It runs the real files in a VM
 * context, so it cannot drift from what the browser actually does - a tool
 * cannot end up disagreeing with the app because it parsed the data its own
 * way.
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {CONTINENTS, NAMEBASE_DIR, root} = require("./namebase-lib");

const AGGREGATOR = path.join(NAMEBASE_DIR, "namebases-all.js");
const MIXER_MAP = path.join(root, "public", "config", "language-mixer-map.js");

function makeSandbox() {
  const sandbox = {
    console: {log() {}, warn() {}, error() {}, info() {}, debug() {}},
    Math, Map, Set, Array, Object, JSON, String, Number, Boolean, RegExp, Error,
    Intl, isNaN, isFinite, parseInt, parseFloat
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return vm.createContext(sandbox);
}

function runSandbox(extraFiles = []) {
  const sandbox = makeSandbox();
  const files = [
    ...CONTINENTS.map(c => path.join(NAMEBASE_DIR, `namebases-${c}.js`)),
    MIXER_MAP,
    ...extraFiles,
    AGGREGATOR
  ];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, {filename: f});
  }
  return sandbox.window;
}

/**
 * @returns {{
 *   nameBases: object[],          sparse array, index-addressed, as the app sees it
 *   populated: object[],          the entries that exist, in index order
 *   nameBasesByIndex: Map<number, object>,
 *   indices: number[],
 *   window: object
 * }}
 */
function loadNameBases() {
  const win = runSandbox();
  const nameBases = Array.isArray(win.nameBases) ? win.nameBases : [];
  const populated = [];
  const byIndex = new Map();
  const indices = [];
  for (let i = 0; i < nameBases.length; i++) {
    const b = nameBases[i];
    if (!b) continue;
    indices.push(i);
    byIndex.set(i, b);
    populated.push(b);
  }
  return {nameBases, populated, nameBasesByIndex: byIndex, indices, window: win};
}

/**
 * The merged list, shaped like the old window.realWorldNameBases so existing
 * tool logic keeps working: a flat array of namebase objects, each with a
 * numeric `i`.
 *
 * @returns {object[]}
 */
function realWorldNameBases() {
  return loadNameBases().populated.map(b => ({...b}));
}

module.exports = {loadNameBases, realWorldNameBases, runSandbox, MIXER_MAP, AGGREGATOR};
