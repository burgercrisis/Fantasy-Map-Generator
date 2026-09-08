"use strict";

(function () {
  // Build set of all indices referenced by language mixer map BEFORE filtering
  const mixerIndices = new Set();
  if (window.languageMixerMap && Array.isArray(window.languageMixerMap)) {
    for (const entry of window.languageMixerMap) {
      if (entry.bases && Array.isArray(entry.bases)) {
        for (const idx of entry.bases) mixerIndices.add(idx);
      }
    }
  }
  console.log("Mixer map indices to preserve:", mixerIndices.size);

  // Build reverse mapping: index -> expected ISO from mixer map
  const mixerIndexToISO = new Map();
  if (window.languageMixerMap && Array.isArray(window.languageMixerMap)) {
    for (const entry of window.languageMixerMap) {
      if (entry.iso && entry.bases && Array.isArray(entry.bases)) {
        for (const idx of entry.bases) {
          mixerIndexToISO.set(idx, entry.iso);
        }
      }
    }
  }

  // Check if a namebase name matches an ISO (fuzzy match)
  function nameMatchesISO(name, iso) {
    if (!name || !iso) return false;
    const nameLower = name.toLowerCase().replace(/[^a-z]/g, '');
    const isoLower = iso.toLowerCase().replace(/[^a-z]/g, '');
    // Direct match or name contains iso or iso contains name
    return nameLower === isoLower || nameLower.includes(isoLower) || isoLower.includes(nameLower);
  }

  // Calculate Jaccard similarity between two settlement arrays
  function settlementSimilarity(a, b) {
    if (!a || !b) return 0;
    const setA = new Set(a.split(',').map(s => s.trim()).filter(s => s));
    const setB = new Set(b.split(',').map(s => s.trim()).filter(s => s));
    if (setA.size === 0 && setB.size === 0) return 1;
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const s of setA) if (setB.has(s)) intersection++;
    const union = setA.size + setB.size - intersection;
    return intersection / union;
  }

  // Filter out proto languages and resolve duplicates by name
  // BUT: keep dialect variants with distinct settlement data (low overlap)
  function filterNameBases(bases, preserveIndices) {
    const byName = new Map(); // name -> array of entries (for clustering)

    // First pass: group by name
    for (const b of bases) {
      if (!b || typeof b !== "object") continue;

      // Remove proto languages (unless index is in mixer map)
      if (typeof b.name === "string" && b.name.toLowerCase().includes("proto") && !preserveIndices.has(b.i)) {
        continue;
      }

      if (typeof b.name === "string") {
        const nameLower = b.name.toLowerCase().trim();
        if (!byName.has(nameLower)) byName.set(nameLower, []);
        byName.get(nameLower).push(b);
      } else {
        // No name, keep it with random key
        const key = "__noname_" + Math.random();
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key).push(b);
      }
    }

    // Second pass: for each name group, cluster by settlement similarity
    const result = [];
    const SIMILARITY_THRESHOLD = 0.3; // Below this = different dialect

    for (const [nameLower, entries] of byName) {
      if (entries.length === 1) {
        result.push(entries[0]);
        continue;
      }

      // CRITICAL: If any entry in this group has a mixer-referenced index,
      // keep ALL entries in this group (don't deduplicate by similarity)
      // because they represent distinct dialect data for the same language.
      const hasMixerIndex = entries.some(e => preserveIndices.has(e.i));
      
      if (hasMixerIndex) {
        // Keep all entries - they're all needed by the mixer map
        for (const entry of entries) result.push(entry);
        continue;
      }

      // Cluster entries by settlement similarity
      const clusters = [];
      for (const entry of entries) {
        let assigned = false;
        for (const cluster of clusters) {
          // Check similarity to cluster representative (first entry)
          const rep = cluster[0];
          const sim = settlementSimilarity(entry.b || "", rep.b || "");
          if (sim >= SIMILARITY_THRESHOLD) {
            cluster.push(entry);
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          clusters.push([entry]); // New cluster
        }
      }

      // From each cluster, keep the best entry (most settlements, or expanded, or in mixer)
      for (const cluster of clusters) {
        let best = cluster[0];
        for (const entry of cluster) {
          const bestCount = best.b ? best.b.split(',').length : 0;
          const entryCount = entry.b ? entry.b.split(',').length : 0;
          const bestInMixer = preserveIndices.has(best.i);
          const entryInMixer = preserveIndices.has(entry.i);
          const bestIsExpanded = best.name.toLowerCase().includes('expanded');
          const entryIsExpanded = entry.name.toLowerCase().includes('expanded');

          // Prefer mixer entries
          if (entryInMixer && !bestInMixer) {
            best = entry;
          } else if (!entryInMixer && bestInMixer) {
            // keep best
          } else if (entryIsExpanded && !bestIsExpanded) {
            best = entry;
          } else if (!entryIsExpanded && bestIsExpanded) {
            // keep best
          } else if (entryCount > bestCount) {
            best = entry;
          }
        }
        result.push(best);
      }
    }

    return result;
  }

  // Filter each continent array FIRST (removes proto + within-continent duplicates)
  // but preserve mixer-referenced indices
  if (Array.isArray(window.africaNameBases)) window.africaNameBases = filterNameBases(window.africaNameBases, mixerIndices);
  if (Array.isArray(window.asiaNameBases)) window.asiaNameBases = filterNameBases(window.asiaNameBases, mixerIndices);
  if (Array.isArray(window.europeNameBases)) window.europeNameBases = filterNameBases(window.europeNameBases, mixerIndices);
  if (Array.isArray(window.northAmericaNameBases)) window.northAmericaNameBases = filterNameBases(window.northAmericaNameBases, mixerIndices);
  if (Array.isArray(window.southAmericaNameBases)) window.southAmericaNameBases = filterNameBases(window.southAmericaNameBases, mixerIndices);
  if (Array.isArray(window.oceaniaNameBases)) window.oceaniaNameBases = filterNameBases(window.oceaniaNameBases, mixerIndices);
  if (Array.isArray(window.fantasyNameBases)) window.fantasyNameBases = filterNameBases(window.fantasyNameBases, mixerIndices);
  if (Array.isArray(window.dedicatedNameBases)) window.dedicatedNameBases = filterNameBases(window.dedicatedNameBases, mixerIndices);
  if (Array.isArray(window.researchNameBases)) window.researchNameBases = filterNameBases(window.researchNameBases, mixerIndices);

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

    // Filter again to resolve cross-continent duplicates, but preserve mixer indices
    window.realWorldNameBases = filterNameBases(continentArrays, mixerIndices);
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

      // Type C: different name at same index
      const indexInMixer = mixerIndices.has(i);

      if (indexInMixer) {
        // Index is reserved for mixer map - determine which entry the mixer expects
        const expectedISO = mixerIndexToISO.get(i);
        
        const existingMatches = expectedISO && nameMatchesISO(existing.name, expectedISO);
        const newMatches = expectedISO && nameMatchesISO(b.name, expectedISO);
        
        if (existingMatches && !newMatches) {
          // Existing matches expected ISO, DISCARD new one (don't reassign - it becomes orphan)
          console.log("Discarding duplicate at mixer index " + i + ": " + b.name + " (expected " + expectedISO + ")");
          continue;
        } else if (newMatches && !existingMatches) {
          // New entry matches expected ISO, replace existing
          byIndex.set(i, b);
          reassigned.push({ oldI: i, newI: i, name: existing.name, displacedBy: b.name });
          continue;
        }
        // Neither matches expected ISO - DISCARD new entry, keep existing
        console.log("Discarding non-matching at mixer index " + i + ": " + b.name + " (expected " + expectedISO + ", have " + existing.name + " vs " + b.name + ")");
        continue;
      }
        continue;
      }

      // Index not in mixer map - reassign the new one
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