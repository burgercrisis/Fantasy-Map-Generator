"use strict";

/**
 * Fantasy Namebases Closing Fragment
 * 
 * This file contains the closing syntax for the fantasyNameBases array.
 * Used when integrating fantasy namebase entries from tools/data/fantasy-new.js and tools/data/fantasy-fallback.js.
 * 
 * Integration order:
 *   1. Concatenate modules/namebases-fantasy.js header
 *   2. Append tools/data/fantasy-new.js entries
 *   3. Append tools/data/fantasy-fallback.js entries  
 *   4. Append this file (tools/data/fantasy-closing.js) to close
 * 
 * Or use the integration script: node tools/data/integrate-fantasy-namebases.js
 */

];

if (typeof module !== "undefined" && module.exports) module.exports = window.fantasyNameBases;
