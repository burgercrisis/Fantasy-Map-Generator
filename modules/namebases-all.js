"use strict";

(function () {
  if (!Array.isArray(window.realWorldNameBases)) window.realWorldNameBases = [];
  if (!Array.isArray(window.fantasyNameBases)) window.fantasyNameBases = [];
  window.defaultNameBases = []
    .concat(window.realWorldNameBases)
    .concat(window.fantasyNameBases);
})();
