"use strict";

(function () {
  // If no base arrays exist, check for continent files and merge them
  if (!window.realWorldNameBases && !window.fantasyNameBases) {
    // Collect all continent namebases
    const continentArrays = [];
    
if (window.africaNameBases) continentArrays.push(...window.africaNameBases);
    if (window.asiaNameBases) continentArrays.push(...window.asiaNameBases);
    if (window.europeNameBases) continentArrays.push(...window.europeNameBases);
    if (window.northAmericaNameBases) continentArrays.push(...window.northAmericaNameBases);
    if (window.southAmericaNameBases) continentArrays.push(...window.southAmericaNameBases);
    if (window.oceaniaNameBases) continentArrays.push(...window.oceaniaNameBases);
    if (window.unknownNameBases) continentArrays.push(...window.unknownNameBases);
    
    // All continent data goes into realWorldNameBases for now
    window.realWorldNameBases = continentArrays;
  }
  
  if (!Array.isArray(window.realWorldNameBases)) window.realWorldNameBases = [];
  if (!Array.isArray(window.fantasyNameBases)) window.fantasyNameBases = [];

  // Merge all bases and sort by their declared index i so that
  // nameBases[base] lines up with the i values used in configs.
  const all = window.realWorldNameBases.concat(window.fantasyNameBases);
  all.sort((a, b) => {
    const ai = typeof a.i === "number" ? a.i : 0;
    const bi = typeof b.i === "number" ? b.i : 0;
    return ai - bi;
  });

  let maxIndex = all.reduce((max, b) => {
    if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) return max;
    return b.i > max ? b.i : max;
  }, 0);

  const byIndex = new Array(maxIndex + 1);
  const collisions = [];

  for (const b of all) {
    if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) continue;
    const i = b.i;
    if (byIndex[i]) {
      collisions.push({ i, existing: byIndex[i].name, incoming: b.name });
      // relocate to next free slot beyond current maxIndex
      let j = maxIndex + 1;
      while (byIndex[j]) j++;
      byIndex[j] = b;
      maxIndex = j > maxIndex ? j : maxIndex;
      continue;
    }
    byIndex[i] = b;
  }

  if (collisions.length) {
    console.warn(
      "Namebase index collisions detected. Only the first base per index is used:",
      collisions
    );
  }

  window.defaultNameBases = byIndex;
  window.nameBases = byIndex;
  window.defaultNameBaseIds = byIndex.reduce((ids, b, i) => {
    if (b) ids.push(i);
    return ids;
  }, []);
})();
