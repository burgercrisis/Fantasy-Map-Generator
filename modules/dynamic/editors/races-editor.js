const $body = insertEditorHtml();
addListeners();

export function open() {
  closeDialogs("#racesEditor, .stable");

  if (!pack || !pack.races || pack.races.length <= 1) {
    alertMessage.innerHTML = /* html */ `No races are defined for this map. Races are only available for High Fantasy and Dark Fantasy culture sets.`;
    $("#alert").dialog({
      resizable: false,
      title: "Races Editor",
      width: "26em",
      position: {my: "center", at: "center", of: "svg"}
    });
    return;
  }

  if (!layerIsOn("toggleCultures")) toggleCultures();
  if (layerIsOn("toggleStates")) toggleStates();
  if (layerIsOn("toggleReligions")) toggleReligions();
  if (layerIsOn("toggleProvinces")) toggleProvinces();

  refreshRacesEditor();

  $("#racesEditor").dialog({
    title: "Races Editor",
    resizable: false,
    close: closeRacesEditor,
    position: {my: "right top", at: "right-10 top+10", of: "svg"}
  });

  $body.focus();
}

function insertEditorHtml() {
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
      <button id="racesManually" data-tip="Manually re-assign races (not yet brush-based)" class="icon-brush"></button>
      <button id="racesAdd" data-tip="Add a new race" class="icon-plus"></button>
      <button id="racesExport" data-tip="Download races-related data" class="icon-download"></button>
      <button id="racesImport" data-tip="Upload races-related data" class="icon-upload"></button>
      <button id="racesRecalculate" data-tip="Recalculate cultures based on race expansion factors" class="icon-retweet"></button>
      <input id="racesCSVToLoad" type="file" accept=".csv" style="display:none" />
    </div>
  </div>`;

  byId("dialogs").insertAdjacentHTML("beforeend", editorHtml);
  return byId("racesBody");
}

function addListeners() {
  applySortingByHeader("racesHeader");

  byId("racesEditorRefresh").on("click", refreshRacesEditor);
  byId("racesEditStyle").on("click", () => editStyle("cults"));
  byId("racesLegend").on("click", toggleRacesLegend);
  byId("racesPercentage").on("click", toggleRacesPercentageMode);
  byId("racesManually").on("click", enterRacesManualAssignment);
  byId("racesAdd").on("click", addRace);
  byId("racesExport").on("click", downloadRacesCsv);
  byId("racesImport").on("click", () => byId("racesCSVToLoad").click());
  byId("racesCSVToLoad").on("change", uploadRacesData);
  byId("racesRecalculate").on("click", recalculateRaces);
}

function closeRacesEditor() {}

function refreshRacesEditor() {
  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
}

function collectRaceStatistics() {
  const stats = {};
  const {races, cells, cultures, burgs, states} = pack;

  if (!races || races.length <= 1) return stats;

  races.forEach(r => {
    if (!r || !r.i) return;
    stats[r.i] = {cells: 0, area: 0, rural: 0, urban: 0, cultures: 0, states: 0, burgs: 0};
  });

  if (cultures) {
    cultures.forEach(c => {
      if (!c || !c.i || c.removed) return;
      const rid = c.race || 0;
      if (!rid || !stats[rid]) return;
      stats[rid].cultures += 1;
    });
  }

  if (states) {
    states.forEach(s => {
      if (!s || !s.i || s.removed) return;
      const rid = s.race || 0;
      if (!rid || !stats[rid]) return;
      stats[rid].states += 1;
    });
  }

  if (burgs) {
    burgs.forEach(b => {
      if (!b || !b.i || b.removed) return;
      const rid = b.race || 0;
      if (!rid || !stats[rid]) return;
      stats[rid].burgs += 1;
    });
  }

  if (cells && cultures) {
    for (const i of cells.i) {
      if (cells.h[i] < 20) continue;
      const cultureId = cells.culture[i];
      const culture = cultures[cultureId];
      if (!culture || !culture.i || culture.removed) continue;
      const rid = culture.race || 0;
      if (!rid || !stats[rid]) continue;
      const s = stats[rid];
      s.cells += 1;
      s.area += cells.area[i];
      s.rural += cells.pop[i];
      const burgId = cells.burg[i];
      if (burgId) s.urban += burgs[burgId].population;
    }
  }

  return stats;
}

function racesEditorAddLines(stats) {
  const unit = getAreaUnit();
  let lines = "";
  let totalArea = 0;
  let totalPopulation = 0;
  let totalCultures = 0;
  let totalStates = 0;
  let totalBurgs = 0;

  const races = (pack.races || []).filter(r => r && r.i);

  for (const r of races) {
    const s =
      stats[r.i] || {
        cells: 0,
        area: 0,
        rural: 0,
        urban: 0,
        cultures: 0,
        states: 0,
        burgs: 0
      };

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
        let approxCount = null;
        if (typeof getRaceLanguageIsoWeights === "function") {
          try {
            const isoWeights = getRaceLanguageIsoWeights(r.name);
            if (isoWeights && typeof isoWeights === "object") {
              approxCount = Object.keys(isoWeights).length;
            }
          } catch (e) {}
        }
        const parts = [];
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
      <input data-tip="Race expansion factor. Multiplies culture expansionism when recalculating cultures" class="raceExpansion" style="width: 6em" type="number" min="0" max="99" step=".1" value="${expansionism}">
      <div data-tip="Cells count" class="raceCells hide" style="width: 4em">${s.cells}</div>
      <div data-tip="Land area" class="raceArea hide" style="width: 6em">${si(area)} ${unit}</div>
      <div data-tip="${populationTip}" class="racePopulation hide" style="width: 7em">${si(population)}</div>
      <div data-tip="Cultures count" class="raceCultures" style="width: 5em">${s.cultures}</div>
      <div data-tip="States count" class="raceStates" style="width: 5em">${s.states}</div>
      <div data-tip="Burgs count" class="raceBurgs" style="width: 5em">${s.burgs}</div>
    </div>`;
  }

  $body.innerHTML = lines;

  byId("racesFooterRaces").innerHTML = races.length;
  byId("racesFooterArea").innerHTML = `${si(totalArea)} ${unit}`;
  byId("racesFooterPopulation").innerHTML = si(totalPopulation);
  byId("racesFooterCultures").innerHTML = totalCultures;
  byId("racesFooterStates").innerHTML = totalStates;
  byId("racesFooterBurgs").innerHTML = totalBurgs;
  byId("racesFooterArea").dataset.area = totalArea;
  byId("racesFooterPopulation").dataset.population = totalPopulation;

  $body.querySelectorAll(":scope > div").forEach($line => {
    $line.on("click", selectRaceOnLineClick);
  });
  $body.querySelectorAll("fill-box").forEach($el => $el.on("click", raceChangeColor));
  $body.querySelectorAll("div > input.raceName").forEach($el => $el.on("input", raceChangeName));
  $body.querySelectorAll("div > input.raceExpansion").forEach($el => $el.on("change", raceChangeExpansion));

  applySorting(racesHeader);
  $("#racesEditor").dialog({width: fitContent()});
}

function selectRaceOnLineClick() {}

function raceChangeColor() {
  const $el = this;
  const currentFill = $el.getAttribute("fill");
  const raceId = +$el.parentNode.dataset.id;

  function callback(fill) {
    $el.setAttribute("fill", fill);
    $el.parentNode.dataset.color = fill;
    pack.races[raceId].color = fill;
  }

  openPicker(currentFill, callback);
}

function raceChangeName() {
  const raceId = +this.parentNode.dataset.id;
  this.parentNode.dataset.name = this.value;
  pack.races[raceId].name = this.value;
}

function raceChangeExpansion() {
  const raceId = +this.parentNode.dataset.id;
  const v = +this.value;
  this.parentNode.dataset.expansionism = v;
  if (!pack.races[raceId]) return;
  pack.races[raceId].expansionism = isNaN(v) ? 1 : v;
}

function toggleRacesLegend() {
  if (legend.selectAll("*").size()) return clearLegend();

  const data = (pack.races || [])
    .filter(r => r && r.i && !r.removed)
    .map(r => [r.i, r.color || "#888888", r.name]);
  drawLegend("Races", data);
}

function toggleRacesPercentageMode() {
  if ($body.dataset.type === "absolute") {
    $body.dataset.type = "percentage";
    const totalArea = +byId("racesFooterArea").dataset.area || 0;
    const totalPopulation = +byId("racesFooterPopulation").dataset.population || 0;

    $body.querySelectorAll(":scope > div").forEach(el => {
      const {area, population} = el.dataset;
      if (totalArea) el.querySelector(".raceArea").innerText = rn((+area / totalArea) * 100) + "%";
      if (totalPopulation)
        el.querySelector(".racePopulation").innerText = rn((+population / totalPopulation) * 100) + "%";
    });
  } else {
    $body.dataset.type = "absolute";
    const stats = collectRaceStatistics();
    racesEditorAddLines(stats);
  }
}

function addRace() {
  if (!pack.races) pack.races = [];
  const i = pack.races.length;
  const name = `Race ${i}`;
  const color = getRandomColor();
  pack.races.push({i, name, color, expansionism: 1});

  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
}

function downloadRacesCsv() {
  const headers = "Id,Name,Color,Expansionism";
  const lines = (pack.races || [])
    .filter(r => r && r.i)
    .map(r => [r.i, r.name, r.color || "", r.expansionism ?? 1].join(","));

  const csvData = [headers].concat(lines).join("\n");
  const name = getFileName("Races") + ".csv";
  downloadFile(csvData, name);
}

async function uploadRacesData() {
  const file = this.files[0];
  this.value = "";
  if (!file) return;

  const csv = await file.text();
  const data = d3.csvParse(csv, d => ({
    id: +d.Id,
    name: d.Name,
    color: d.Color,
    expansionism: +d.Expansionism
  }));

  if (!pack.races) pack.races = [];
  const {races} = pack;

  data.forEach(row => {
    const id = row.id;
    if (!id) return;
    let race = races[id];
    if (!race) {
      race = {i: id};
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

function recalculateRaces() {
  if (typeof initializeRacesForExpansion === "function") {
    initializeRacesForExpansion({forceFilterFromUi: true});
  }

  Cultures.expand();
  drawCultures();

  if (pack.burgs && pack.cells && pack.cells.culture) {
    pack.burgs.forEach(b => {
      if (!b || !b.i || b.removed) return;
      b.culture = pack.cells.culture[b.cell];
    });
  }

  if (typeof assignRaces === "function") assignRaces();
  else updateCellRacesFromCultures();

  const stats = collectRaceStatistics();
  racesEditorAddLines(stats);
  if (typeof refreshAllEditors === "function") refreshAllEditors();
}

function updateCellRacesFromCultures() {
  const {cells, cultures, races} = pack;
  if (!cells || !cultures || !races) return;
  if (!cells.culture || !cells.i) return;

  const raceArray = new Uint16Array(cells.i.length);

  for (const i of cells.i) {
    const cultureId = cells.culture[i];
    const culture = cultures[cultureId];
    const raceId = culture && culture.race ? culture.race : 0;
    raceArray[i] = raceId;
  }

  cells.race = raceArray;
}

function enterRacesManualAssignment() {
  tip("Race manual reassignment by brush is not implemented yet. Please use Race-related columns in other editors.", false, "info");
}
