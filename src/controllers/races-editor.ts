import { csvParse, select } from "d3";
import { closeDialogs } from "@/components/dialog/dialog-helpers";
import { applySortingByHeader, applySorting } from "@/components/dialog/sorting";
import type { FillBoxElement } from "@/components/fill-box";
import { clearLegend, drawLegend } from "@/renderers/draw-legend";
import { tip } from "@/components/tooltips";
import { Controllers } from "@/controllers";
import { Layers } from "@/components/layers";
import { drawCultures } from "@/renderers/draw-cultures";
import { downloadFile, getArea, getAreaUnit, getFileName, getRandomColor } from "@/utils";
import { ensureEl, rn, si } from "@/utils";

// Race entity type (custom to this fork; no upstream equivalent)
interface Race {
  i: number;
  name: string;
  color?: string;
  expansionism?: number;
  removed?: boolean;
}

// Per-race aggregated statistics collected from cells, cultures, states, and burgs
interface RaceStats {
  cells: number;
  area: number;
  rural: number;
  urban: number;
  cultures: number;
  states: number;
  burgs: number;
}

// Custom window globals added by this fork (no upstream equivalent)
declare global {
  var getRaceLanguageProfile: ((raceName: string) => { categories?: string[]; families?: string[] }) | undefined;
  var getRaceLanguageIsoWeights: ((raceName: string) => Record<string, number>) | undefined;
  var initializeRacesForExpansion: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
  var rerollRacesForCultures: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
  var assignRaces: (() => void) | undefined;
  var drawRaces: (() => void) | undefined;
  var refreshAllEditors: (() => void) | undefined;
  var fitContent: () => string;
}

const dialogId = "racesEditor" as const;

let $body: HTMLElement;

insertEditorHtml();
addListeners();

export function open(): void {
  closeDialogs("#racesEditor, .stable");

  const races = (pack as unknown as { races?: Race[] }).races;
  if (!pack || !races || races.length <= 1) {
    alertMessage.innerHTML = /* html */ `No races are defined for this map. Races are only available for High Fantasy and Dark Fantasy culture sets.`;
    $("#alert").dialog({
      resizable: false,
      title: "Races Editor",
      width: "26em",
      position: { my: "center", at: "center", of: "svg" }
    });
    return;
  }

  if (!Layers.isOn("cultures")) Layers.show("cultures");
  if (Layers.isOn("states")) Layers.hide("states");
  if (Layers.isOn("religions")) Layers.hide("religions");
  if (Layers.isOn("provinces")) Layers.hide("provinces");

  refreshRacesEditor();

  $(`#${dialogId}`).dialog({
    title: "Races Editor",
    resizable: false,
    close: closeRacesEditor,
    position: { my: "right top", at: "right-10 top+10", of: "svg" }
  });

  $body.focus();
}

function insertEditorHtml(): void {
  const editorHtml = /* html */ `<div id="racesEditor" class="dialog stable">
    <div id="racesHeader" class="header" style="grid-template-columns: 9em 6em 4em 6em 7em 5em 5em 5em 3em; grid-column-gap: 0.4em">
      <div data-tip="Click to sort by race name" class="sortable alphabetically icon-sort-name-down" data-sortby="name">Race&nbsp;</div>
      <div data-tip="Click to sort by race expansion factor" class="sortable" data-sortby="expansionism">Expansion&nbsp;</div>
      <div data-tip="Click to sort by cells count" class="sortable hide" data-sortby="cells">Cells&nbsp;</div>
      <div data-tip="Click to sort by land area" class="sortable hide" data-sortby="area">Area&nbsp;</div>
      <div data-tip="Click to sort by population" class="sortable hide icon-sort-number-down" data-sortby="population">Population&nbsp;</div>
      <div data-tip="Click to sort by cultures count" class="sortable" data-sortby="cultures">Cultures&nbsp;</div>
      <div data-tip="Click to sort by states count" class="sortable" data-sortby="states">States&nbsp;</div>
      <div data-tip="Click to sort by burgs count" class="sortable" data-sortby="burgs">Burgs&nbsp;</div>
      <div data-tip="Click to sort by color" class="sortable alphabetically" data-sortby="color">Color&nbsp;</div>
    </div>
    <div id="racesBody" class="table" data-type="absolute"></div>

    <div id="racesFooter" class="totalLine">
      <div data-tip="Races number" style="margin-left: 12px">Races:&nbsp;<span id="racesFooterRaces">0</span></div>
      <div data-tip="Total land area" style="margin-left: 12px">Land Area:&nbsp;<span id="racesFooterArea">0</span></div>
      <div data-tip="Total population" style="margin-left: 12px">Population:&nbsp;<span id="racesFooterPopulation">0</span></div>
      <div data-tip="Total cultures number" style="margin-left: 12px">Cultures:&nbsp;<span id="racesFooterCultures">0</span></div>
      <div data-tip="Total states number" style="margin-left: 12px">States:&nbsp;<span id="racesFooterStates">0</span></div>
      <div data-tip="Total burgs number" style="margin-left: 12px">Burgs:&nbsp;<span id="racesFooterBurgs">0</span></div>
    </div>

    <div id="racesBottom">
      <button id="racesEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
      <button id="racesEditStyle" data-tip="Edit races style in Style Editor" class="icon-adjust"></button>
      <button id="racesLegend" data-tip="Toggle Legend box" class="icon-list-bullet"></button>
      <button id="racesPercentage" data-tip="Toggle percentage / absolute values display mode" class="icon-percent"></button>
      <button id="racesRegenerate" data-tip="Regenerate races distribution" class="icon-arrows-cw"></button>
      <button id="racesManually" data-tip="Manually re-assign races (not yet brush-based)" class="icon-brush"></button>
      <button id="racesAdd" data-tip="Add a new race" class="icon-plus"></button>
      <button id="racesExport" data-tip="Download races-related data" class="icon-download"></button>
      <button id="racesImport" data-tip="Upload races-related data" class="icon-upload"></button>
      <button id="racesRecalculate" data-tip="Recalculate cultures based on race expansion factors" class="icon-retweet"></button>
      <input id="racesCSVToLoad" type="file" accept=".csv" style="display:none" />
    </div>
  </div>`;

  ensureEl("dialogs").insertAdjacentHTML("beforeend", editorHtml);
  $body = ensureEl("racesBody");
}

function addListeners(): void {
  applySortingByHeader("racesEditor", "racesHeader");

  ensureEl("racesEditorRefresh").addEventListener("click", refreshRacesEditor);
  ensureEl("racesEditStyle").addEventListener("click", () => editStyle("cults"));
  ensureEl("racesLegend").addEventListener("click", toggleRacesLegend);
  ensureEl("racesPercentage").addEventListener("click", toggleRacesPercentageMode);
  ensureEl("racesRegenerate").addEventListener("click", regenerateRaces);
  ensureEl("racesManually").addEventListener("click", enterRacesManualAssignment);
  ensureEl("racesAdd").addEventListener("click", addRace);
  ensureEl("racesExport").addEventListener("click", downloadRacesCsv);
  ensureEl("racesImport").addEventListener("click", () => ensureEl("racesCSVToLoad").click());
  ensureEl("racesCSVToLoad").addEventListener("change", uploadRacesData);
  ensureEl("racesRecalculate").addEventListener("click", recalculateRaces);
}

function closeRacesEditor(): void {}

function refreshRacesEditor(): void {
  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
}

function collectRaceStatistics(): RaceStats[] {
  const stats: RaceStats[] = [];
  const { races, cells, cultures, burgs, states } = pack as unknown as {
    races?: Race[];
    cells: typeof pack.cells & { race?: Uint16Array };
    cultures: typeof pack.cultures;
    burgs: typeof pack.burgs;
    states: typeof pack.states;
  };

  if (!races || races.length <= 1) return stats;

  races.forEach(r => {
    if (!r || !r.i) return;
    stats[r.i] = { cells: 0, area: 0, rural: 0, urban: 0, cultures: 0, states: 0, burgs: 0 };
  });

  const hasCellRaces = cells && cells.race && cells.i && cells.race.length === cells.i.length;

  if (!hasCellRaces && cultures) {
    cultures.forEach(c => {
      if (!c || !c.i || c.removed) return;
      const rid = (c as unknown as { race?: number }).race || 0;
      if (!rid || !stats[rid]) return;
      stats[rid].cultures += 1;
    });
  }

  if (states) {
    states.forEach(s => {
      if (!s || !s.i || s.removed) return;
      const rid = (s as unknown as { race?: number }).race || 0;
      if (!rid || !stats[rid]) return;
      stats[rid].states += 1;
    });
  }

  if (burgs) {
    burgs.forEach(b => {
      if (!b || !b.i || b.removed) return;
      const rid = (b as unknown as { race?: number }).race || 0;
      if (!rid || !stats[rid]) return;
      stats[rid].burgs += 1;
    });
  }

  if (hasCellRaces && cultures && cells.culture) {
    const countsByCulture: Record<number, Record<number, number>> = [];

    for (const i of cells.i) {
      if (cells.h && cells.h[i] < 20) continue;
      const rid = cells.race![i] || 0;
      if (!rid || !stats[rid]) continue;
      const s = stats[rid];

      s.cells += 1;
      s.area += cells.area[i];
      s.rural += cells.pop[i];
      const burgId = cells.burg ? cells.burg[i] : 0;
      if (burgId && burgs && burgs[burgId]) s.urban += burgs[burgId].population!;

      const cultureId = cells.culture[i];
      const culture = cultures[cultureId];
      if (!culture || !culture.i || culture.removed) continue;
      const bucket = (countsByCulture[cultureId] = countsByCulture[cultureId] || {});
      bucket[rid] = (bucket[rid] || 0) + 1;
    }

    cultures.forEach(culture => {
      if (!culture || !culture.i || culture.removed) return;
      const counts = countsByCulture[culture.i];
      if (!counts) return;

      let bestRaceId = 0;
      let bestCount = 0;
      for (const [raceIdRaw, count] of Object.entries(counts)) {
        const raceId = +raceIdRaw;
        if (!raceId) continue;
        if (count > bestCount) {
          bestCount = count;
          bestRaceId = raceId;
        }
      }

      if (bestRaceId && stats[bestRaceId]) stats[bestRaceId].cultures += 1;
    });
  } else {
    if (cultures) {
      cultures.forEach(c => {
        if (!c || !c.i || c.removed) return;
        const rid = (c as unknown as { race?: number }).race || 0;
        if (!rid || !stats[rid]) return;
        stats[rid].cultures += 1;
      });
    }

    if (cells && cultures) {
      for (const i of cells.i) {
        if (cells.h && cells.h[i] < 20) continue;
        const cultureId = cells.culture[i];
        const culture = cultures[cultureId];
        if (!culture || !culture.i || culture.removed) continue;
        const rid = (culture as unknown as { race?: number }).race || 0;
        if (!rid || !stats[rid]) continue;
        const s = stats[rid];
        s.cells += 1;
        s.area += cells.area[i];
        s.rural += cells.pop[i];
        const burgId = cells.burg ? cells.burg[i] : 0;
        if (burgId && burgs && burgs[burgId]) s.urban += burgs[burgId].population!;
      }
    }
  }

  return stats;
}

function racesEditorAddLines(stats: RaceStats[]): void {
  const unit = getAreaUnit();
  let lines = "";
  let totalArea = 0;
  let totalPopulation = 0;
  let totalCultures = 0;
  let totalStates = 0;
  let totalBurgs = 0;

  const races = ((pack as unknown as { races?: Race[] }).races || []).filter(r => r && r.i);

  for (const r of races) {
    const s = stats[r.i] || { cells: 0, area: 0, rural: 0, urban: 0, cultures: 0, states: 0, burgs: 0 };

    const area = getArea(s.area);
    const rural = s.rural * populationRate;
    const urban = s.urban * populationRate * urbanization;
    const population = rn(rural + urban);
    const populationTip = `Total population: ${si(population)}; Rural population: ${si(rural)}; Urban population: ${si(
      urban
    )}`;

    const expansionism = r.expansionism ?? 1;

    let languageMixerTip = "";
    if (typeof getRaceLanguageProfile === "function") {
      const profile = getRaceLanguageProfile(r.name);
      if (profile && typeof profile === "object") {
        const categories = Array.isArray(profile.categories) ? profile.categories.filter(Boolean) : [];
        const families = Array.isArray(profile.families) ? profile.families.filter(Boolean) : [];
        let approxCount: number | null = null;
        if (typeof getRaceLanguageIsoWeights === "function") {
          try {
            const isoWeights = getRaceLanguageIsoWeights(r.name);
            if (isoWeights && typeof isoWeights === "object") {
              approxCount = Object.keys(isoWeights).length;
            }
          } catch (e) {
            // ignore errors from the language weight lookup
          }
        }
        const parts: string[] = [];
        if (categories.length) parts.push(`Categories: ${categories.join(", ")}`);
        if (families.length) parts.push(`Families: ${families.join(", ")}`);
        if (approxCount != null) parts.push(`Approx mixer languages: ${approxCount}`);
        if (parts.length) {
          languageMixerTip = parts.join(" • ");
        }
      }
    }

    totalArea += area;
    totalPopulation += population;
    totalCultures += s.cultures;
    totalStates += s.states;
    totalBurgs += s.burgs;

    lines += /* html */ `<div
      class="states"
      data-id="${r.i}"
      data-name="${r.name}"
      data-color="${r.color || ""}"
      data-expansionism="${expansionism}"
      data-cells="${s.cells}"
      data-area="${area}"
      data-population="${population}"
      data-cultures="${s.cultures}"
      data-states="${s.states}"
      data-burgs="${s.burgs}"
      data-languages-tip="${languageMixerTip}"
      data-tip="${languageMixerTip}"
    >
      <fill-box fill="${r.color || "#888888"}"></fill-box>
      <input data-tip="Race name. Click and type to change" class="raceName" style="width: 8em"
        value="${r.name}" autocorrect="off" spellcheck="false" />
      <input data-tip="Race expansion factor" class="raceExpansion" style="width: 6em" type="number" min="0" max="99" step=".1" value="${expansionism}">
      <div data-tip="Cells count" class="raceCells hide" style="width: 4em">${s.cells}</div>
      <div data-tip="Land area" class="raceArea hide" style="width: 6em">${si(area)} ${unit}</div>
      <div data-tip="${populationTip}" class="racePopulation hide" style="width: 7em">${si(population)}</div>
      <div data-tip="Cultures count" class="raceCultures" style="width: 5em">${s.cultures}</div>
      <div data-tip="States count" class="raceStates" style="width: 5em">${s.states}</div>
      <div data-tip="Burgs count" class="raceBurgs" style="width: 5em">${s.burgs}</div>
    </div>`;
  }

  $body.innerHTML = lines;

  ensureEl("racesFooterRaces").innerHTML = String(races.length);
  ensureEl("racesFooterArea").innerHTML = `${si(totalArea)} ${unit}`;
  ensureEl("racesFooterPopulation").innerHTML = si(totalPopulation);
  ensureEl("racesFooterCultures").innerHTML = String(totalCultures);
  ensureEl("racesFooterStates").innerHTML = String(totalStates);
  ensureEl("racesFooterBurgs").innerHTML = String(totalBurgs);
  ensureEl("racesFooterArea").dataset.area = String(totalArea);
  ensureEl("racesFooterPopulation").dataset.population = String(totalPopulation);

  $body.querySelectorAll(":scope > div").forEach($line => {
    $line.addEventListener("click", selectRaceOnLineClick);
  });
  $body.querySelectorAll("fill-box").forEach($el => $el.addEventListener("click", raceChangeColor));
  $body.querySelectorAll("div > input.raceName").forEach($el => $el.addEventListener("input", raceChangeName));
  $body.querySelectorAll("div > input.raceExpansion").forEach($el =>
    $el.addEventListener("change", raceChangeExpansion)
  );

  applySorting(ensureEl("racesHeader"));
  $(`#${dialogId}`).dialog({ width: fitContent() });
}

function selectRaceOnLineClick(): void {}

function raceChangeColor(this: FillBoxElement): void {
  const currentFill = this.getAttribute("fill");
  const raceId = +(this.parentNode as HTMLElement).dataset.id!;

  const callback = (fill: string) => {
    this.setAttribute("fill", fill);
    (this.parentNode as HTMLElement).dataset.color = fill;
    const races = (pack as unknown as { races?: Race[] }).races;
    if (races) races[raceId].color = fill;
  };

  void Controllers.ColorPicker.open(currentFill || "#888888", callback);
}

function raceChangeName(this: HTMLInputElement): void {
  const raceId = +(this.parentNode as HTMLElement).dataset.id!;
  (this.parentNode as HTMLElement).dataset.name = this.value;
  const races = (pack as unknown as { races?: Race[] }).races;
  if (races) races[raceId].name = this.value;
}

function raceChangeExpansion(this: HTMLInputElement): void {
  const raceId = +(this.parentNode as HTMLElement).dataset.id!;
  const v = +this.value;
  (this.parentNode as HTMLElement).dataset.expansionism = String(v);
  const races = (pack as unknown as { races?: Race[] }).races;
  if (!races || !races[raceId]) return;
  races[raceId].expansionism = isNaN(v) ? 1 : v;
}

function toggleRacesLegend(): void {
  if (select("#legend").selectAll("*").size()) return clearLegend();

  const data = ((pack as unknown as { races?: Race[] }).races || [])
    .filter(r => r && r.i && !r.removed)
    .map(r => [r.i, r.color || "#888888", r.name] as [number, string, string]);
  drawLegend("Races", data);
}

function toggleRacesPercentageMode(): void {
  if ($body.dataset.type === "absolute") {
    $body.dataset.type = "percentage";
    const totalArea = +ensureEl("racesFooterArea").dataset.area! || 0;
    const totalPopulation = +ensureEl("racesFooterPopulation").dataset.population! || 0;

    $body.querySelectorAll(":scope > div").forEach(el => {
      const { area, population } = (el as HTMLElement).dataset;
      if (totalArea)
        el.querySelector<HTMLElement>(".raceArea")!.innerText = rn((+area! / totalArea) * 100) + "%";
      if (totalPopulation)
        el.querySelector<HTMLElement>(".racePopulation")!.innerText =
          rn((+population! / totalPopulation) * 100) + "%";
    });
  } else {
    $body.dataset.type = "absolute";
    const stats = collectRaceStatistics();
    racesEditorAddLines(stats);
  }
}

function addRace(): void {
  const races = (pack as unknown as { races?: Race[] | undefined }).races;
  if (!races) return;
  const i = races.length;
  const name = `Race ${i}`;
  const color = getRandomColor();
  races.push({ i, name, color, expansionism: 1 });

  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
}

function downloadRacesCsv(): void {
  const headers = "Id,Name,Color,Expansionism";
  const lines = ((pack as unknown as { races?: Race[] }).races || [])
    .filter(r => r && r.i)
    .map(r => [r.i, r.name, r.color || "", r.expansionism ?? 1].join(","));

  const csvData = [headers].concat(lines).join("\n");
  const name = getFileName("Races") + ".csv";
  downloadFile(csvData, name);
}

async function uploadRacesData(this: HTMLInputElement): Promise<void> {
  const file = this.files?.[0];
  this.value = "";
  if (!file) return;

  const csv = await file.text();
  const data = csvParse(csv, d => ({
    id: +d.Id,
    name: d.Name,
    color: d.Color,
    expansionism: +d.Expansionism
  }));

  const races = (pack as unknown as { races?: Race[] | undefined }).races;
  if (!races) return;

  data.forEach(row => {
    const id = row.id;
    if (!id) return;
    let race = races[id];
    if (!race) {
      race = { i: id, name: row.name || `Race ${id}` };
      races[id] = race;
    }

    if (row.name) race.name = row.name;
    if (row.color) race.color = row.color;
    if (!isNaN(row.expansionism)) race.expansionism = row.expansionism;
    else if (race.expansionism === undefined) race.expansionism = 1;
  });

  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
}

function recalculateRaces(): void {
  if (typeof initializeRacesForExpansion === "function") {
    initializeRacesForExpansion({ forceFilterFromUi: true });
  }

  Cultures.expand();
  drawCultures();

  if (pack.burgs && pack.cells && pack.cells.culture) {
    pack.burgs.forEach(b => {
      if (!b || !b.i || b.removed) return;
      b.culture = pack.cells.culture[b.cell];
    });
  }

  // Force rebuild of cell-level races as cultures may have shifted.
  const cells = (pack.cells as unknown as { race?: Uint16Array });
  if (pack && cells) delete cells.race;

  if (typeof assignRaces === "function") assignRaces();
  else updateCellRacesFromCultures();

  if (typeof drawRaces === "function" && Layers.isOn("cultures")) {
    drawRaces();
  }

  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
  if (typeof refreshAllEditors === "function") refreshAllEditors();
}

function regenerateRaces(): void {
  if (!pack || !pack.cultures || !pack.cells) return;

  // Drop existing derived race assignments to force a re-roll.
  if (Array.isArray(pack.cultures)) {
    pack.cultures.forEach(c => {
      if (!c || !c.i || c.removed) return;
      delete (c as unknown as { race?: number }).race;
    });
  }

  if (pack.states) pack.states.forEach(s => s && delete (s as unknown as { race?: number }).race);
  if (pack.provinces)
    pack.provinces.forEach(p => p && delete (p as unknown as { race?: number }).race);
  if (pack.burgs) pack.burgs.forEach(b => b && delete (b as unknown as { race?: number }).race);
  if (pack.religions)
    pack.religions.forEach(r => r && delete (r as unknown as { race?: number }).race);

  // Force rebuild of cell-level race layer.
  const cells = (pack.cells as unknown as { race?: Uint16Array });
  delete cells.race;

  // Reroll per-culture race assignment (so distribution actually changes).
  // Keep culture namebases intact (do not touch culture.base here).
  if (typeof rerollRacesForCultures === "function") {
    rerollRacesForCultures({ forceFilterFromUi: true });
  } else if (typeof initializeRacesForExpansion === "function") {
    initializeRacesForExpansion({ forceFilterFromUi: true });
  }

  // Rebuild cell-level race layer and derived entity races.
  if (typeof assignRaces === "function") assignRaces();
  else updateCellRacesFromCultures();

  if (typeof drawRaces === "function" && Layers.isOn("cultures")) {
    drawRaces();
  }
  if (typeof drawCultures === "function") drawCultures();

  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
  if (typeof refreshAllEditors === "function") refreshAllEditors();
}

function updateCellRacesFromCultures(): void {
  const { cells, cultures } = pack as unknown as {
    cells: typeof pack.cells & { race?: Uint16Array; culture: Uint16Array; i: number[] };
    cultures: typeof pack.cultures;
  };
  if (!cells || !cultures) return;
  if (!cells.culture || !cells.i) return;

  const raceArray = new Uint16Array(cells.i.length);

  for (const i of cells.i) {
    const cultureId = cells.culture[i];
    const culture = cultures[cultureId];
    const raceId = culture && (culture as unknown as { race?: number }).race ? (culture as unknown as { race?: number }).race! : 0;
    raceArray[i] = raceId;
  }

  cells.race = raceArray;
}

function enterRacesManualAssignment(): void {
  tip("Race manual reassignment by brush is not implemented yet. Please use Race-related columns in other editors.", false, "info");
}

export const RacesEditor = { open };
