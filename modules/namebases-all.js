"use strict";

(function () {
  if (!Array.isArray(window.realWorldNameBases)) window.realWorldNameBases = [];
  if (!Array.isArray(window.fantasyNameBases)) window.fantasyNameBases = [];
  if (!Array.isArray(window.creoleNameBases)) window.creoleNameBases = [];

  // Merge all bases and sort by their declared index i so that
  // nameBases[base] lines up with the i values used in configs.
  const all = window.realWorldNameBases.concat(window.fantasyNameBases, window.creoleNameBases);
  all.sort((a, b) => {
    const ai = typeof a.i === "number" ? a.i : 0;
    const bi = typeof b.i === "number" ? b.i : 0;
    return ai - bi;
  });

  const maxIndex = all.reduce((max, b) => {
    if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) return max;
    return b.i > max ? b.i : max;
  }, 0);

  const byIndex = new Array(maxIndex + 1);
  const collisions = [];

  for (const b of all) {
    if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) continue;
    const i = b.i;
    if (byIndex[i]) {
      collisions.push({i, existing: byIndex[i].name, incoming: b.name});
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
  window.defaultNameBaseIds = byIndex.reduce((ids, b, i) => {
    if (b) ids.push(i);
    return ids;
  }, []);
})();
