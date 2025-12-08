"use strict";

(function () {
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

  window.defaultNameBases = all;
})();
