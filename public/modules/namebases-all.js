"use strict";

(function () {
  // Filter out proto languages and resolve duplicates by name
  // (keep the entry with more names, or the "Expanded" version)
  function filterNameBases(bases) {
    const byName = new Map(); // name -> best entry

    for (const b of bases) {
      if (!b || typeof b !== "object") continue;

      // Remove proto languages
      if (typeof b.name === "string" && b.name.toLowerCase().includes("proto")) {
        continue;
      }

      // Resolve duplicates by name
      if (typeof b.name === "string") {
        const nameLower = b.name.toLowerCase().trim();
        if (byName.has(nameLower)) {
          const existing = byName.get(nameLower);
          const existingCount = existing.b ? existing.b.split(',').length : 0;
          const newCount = b.b ? b.b.split(',').length : 0;
          const existingIsExpanded = existing.name.toLowerCase().includes('expanded');
          const newIsExpanded = b.name.toLowerCase().includes('expanded');

          // Keep the better one
          if (newIsExpanded && !existingIsExpanded) {
            // New is expanded, keep it
            byName.set(nameLower, b);
          } else if (!newIsExpanded && existingIsExpanded) {
            // Existing is expanded, keep it
          } else if (newCount > existingCount) {
            // New has more names, keep it
            byName.set(nameLower, b);
          }
          // else: existing is better or equal, keep it
        } else {
          byName.set(nameLower, b);
        }
      } else {
        // No name, keep it
        byName.set(Math.random(), b);
      }
    }

    return Array.from(byName.values());
  }

  // Filter each continent array FIRST (removes proto + within-continent duplicates)
  if (Array.isArray(window.africaNameBases)) window.africaNameBases = filterNameBases(window.africaNameBases);
  if (Array.isArray(window.asiaNameBases)) window.asiaNameBases = filterNameBases(window.asiaNameBases);
  if (Array.isArray(window.europeNameBases)) window.europeNameBases = filterNameBases(window.europeNameBases);
  if (Array.isArray(window.northAmericaNameBases)) window.northAmericaNameBases = filterNameBases(window.northAmericaNameBases);
  if (Array.isArray(window.southAmericaNameBases)) window.southAmericaNameBases = filterNameBases(window.southAmericaNameBases);
  if (Array.isArray(window.oceaniaNameBases)) window.oceaniaNameBases = filterNameBases(window.oceaniaNameBases);
  if (Array.isArray(window.fantasyNameBases)) window.fantasyNameBases = filterNameBases(window.fantasyNameBases);
  if (Array.isArray(window.dedicatedNameBases)) window.dedicatedNameBases = filterNameBases(window.dedicatedNameBases);
  if (Array.isArray(window.researchNameBases)) window.researchNameBases = filterNameBases(window.researchNameBases);

  // Build realWorldNameBases from FILTERED continent arrays, then filter again
  // to resolve cross-continent duplicates
  if (!window.realWorldNameBases) {
    const continentArrays = [];

    if (window.africaNameBases) continentArrays.push(...window.africaNameBases);
    if (window.asiaNameBases) continentArrays.push(...window.asiaNameBases);
    if (window.europeNameBases) continentArrays.push(...window.europeNameBases);
    if (window.northAmericaNameBases) continentArrays.push(...window.northAmericaNameBases);
    if (window.southAmericaNameBases) continentArrays.push(...window.southAmericaNameBases);
    if (window.oceaniaNameBases) continentArrays.push(...window.oceaniaNameBases);
    if (window.unknownNameBases) continentArrays.push(...window.unknownNameBases);

    // Filter again to resolve cross-continent duplicates
    window.realWorldNameBases = filterNameBases(continentArrays);
  }

  // Merge all bases and sort by their declared index i so that
  // nameBases[base] lines up with the i values used in configs.
  const dedicated = window.dedicatedNameBases || [];
  const research = window.researchNameBases || [];
  const all = window.realWorldNameBases.concat(window.fantasyNameBases).concat(dedicated).concat(research);
  all.sort((a, b) => {
    const ai = typeof a.i === "number" ? a.i : 0;
    const bi = typeof b.i === "number" ? b.i : 0;
    return ai - bi;
  });

  let maxIndex = all.reduce((max, b) => {
    if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) return max;
    return b.i > max ? b.i : max;
  }, 0);

  const byIndex = new Map();
  const skipped = []; // Type B: same-name duplicates
  const reassigned = []; // Type C: different-name collisions

  for (const b of all) {
    if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) continue;
    const i = b.i;

    if (byIndex.has(i)) {
      const existing = byIndex.get(i);

      if (existing.name === b.name) {
        // Type B: same name, same data — skip the duplicate
        skipped.push({ i, name: b.name, file: b.file || "?" });
        continue;
      }

      // Type C: different name — assign a new unique index
      let j = maxIndex + 1;
      while (byIndex.has(j)) j++;
      byIndex.set(j, b);
      maxIndex = j > maxIndex ? j : maxIndex;
      reassigned.push({ oldI: i, newI: j, name: b.name, displacedBy: existing.name });
      continue;
    }

    byIndex.set(i, b);
  }

  // Convert Map to sparse array for backward compatibility
  const maxKey = Math.max(...byIndex.keys());
  const byIndexArray = new Array(maxKey + 1);
  byIndex.forEach((v, k) => { byIndexArray[k] = v; });

  if (skipped.length || reassigned.length) {
    console.warn(
      "Namebase index collisions resolved:",
      skipped.length, "duplicate(s) skipped,",
      reassigned.length, "reassigned."
    );
    if (reassigned.length) {
      reassigned.forEach((r) => {
        console.warn("  i=" + r.oldI + " -> " + r.newI + ': "' + r.name + '" (displaced by "' + r.displacedBy + '")');
      });
    }
  }

  // defaultNameBases gets a snapshot copy so runtime pushes to
  // window.nameBases (culture-mixer, race-mixer, editor) do not
  // mutate the backup used for save/restore gap-filling.
  window.defaultNameBases = byIndexArray.slice();
  window.nameBases = byIndexArray;
  window.defaultNameBaseIds = byIndexArray.reduce((ids, b, i) => {
    if (b) ids.push(i);
    return ids;
  }, []);

  // Rebuild defaultNameBaseIds after culture/race-mixer or editor bases are pushed.
  window.refreshDefaultNameBaseIds = function () {
    window.defaultNameBaseIds = window.nameBases.reduce((ids, b, i) => {
      if (b) ids.push(i);
      return ids;
    }, []);
  };
})();
