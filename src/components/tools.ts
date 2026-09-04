import { refreshEditors } from "@/components/dialog/dialog-helpers";
import { Layers } from "@/components/layers";
import { tip } from "@/components/tooltips";
import { Controllers } from "@/controllers";
import { Emblems } from "@/generators/emblems-generator";
import { Population } from "@/generators/population-generator";
import { drawRaces } from "@/renderers/draw-races";
import { unfog } from "@/renderers/overlays/fogging";
import { ensureEl, gauss, isCtrlClick } from "@/utils";

declare global {
  var rerollRacesForCultures: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
  var initializeRacesForExpansion: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
  var assignRaces: (() => void) | undefined;
  var refreshAllEditors: (() => void) | undefined;
  var toggleRaces: ((event?: Event) => void) | undefined;
  var editRaces: (() => void) | undefined;
  var drawRaces: (() => void) | undefined;
  var regenerateRaces: (() => void) | undefined;
}

ensureEl("toolsContent").addEventListener("click", event => {
  if (customization) return tip("Please exit the customization mode first", false, "error");
  if (!(event instanceof MouseEvent) || !(event.target instanceof HTMLElement)) return;
  if (!["BUTTON", "I"].includes(event.target.tagName)) return;

  const buttonId = event.target.id;
  const parentId = event.target.parentElement?.id;
  if (parentId === "regenerateFeature") confirmRegeneration(event, buttonId);
  else if (buttonId === "editHeightmapButton") void Controllers.HeightmapEditor.open();
  else if (buttonId === "editBiomesButton") void Controllers.BiomesEditor.open();
  else if (buttonId === "editStatesButton") void Controllers.StatesEditor.open();
  else if (buttonId === "editRacesButton") void Controllers.RacesEditor.open();
  else if (buttonId === "editProvincesButton") void Controllers.ProvincesEditor.open();
  else if (buttonId === "editDiplomacyButton") void Controllers.DiplomacyEditor.open();
  else if (buttonId === "editCoastlineSettings") void Controllers.CoastlineEditor.open();
  else if (buttonId === "editTradeAnimationButton") void Controllers.TradeAnimationEditor.open();
  else if (buttonId === "editCulturesButton") void Controllers.CulturesEditor.open();
  else if (buttonId === "editReligions") void Controllers.ReligionsEditor.open();
  else if (buttonId === "editGoods") void Controllers.GoodsEditor.open();
  else if (buttonId === "editEmblemButton") void Controllers.EmblemsEditor.openDefault();
  else if (buttonId === "editNamesBaseButton") void Controllers.NamesbaseEditor.open();
  else if (buttonId === "editUnitsButton") void Controllers.UnitsEditor.open();
  else if (buttonId === "editMeasurersButton") void Controllers.MeasurersEditor.open();
  else if (buttonId === "editNotesButton") void Controllers.NotesEditor.open();
  else if (buttonId === "editZonesButton") void Controllers.ZonesEditor.open();
  else if (buttonId === "overviewChartsButton") void Controllers.ChartsOverview.open();
  else if (buttonId === "overviewBurgsButton") void Controllers.BurgsOverview.open();
  else if (buttonId === "overviewRoutesButton") void Controllers.RoutesOverview.open();
  else if (buttonId === "overviewRiversButton") void Controllers.RiversOverview.open();
  else if (buttonId === "overviewMilitaryButton") void Controllers.MilitaryOverview.open();
  else if (buttonId === "overviewLabelsButton") void Controllers.LabelsOverview.open();
  else if (buttonId === "overviewMarkersButton") void Controllers.MarkersOverview.open();
  else if (buttonId === "overviewMarketsButton") void Controllers.MarketsOverview.open();
  else if (buttonId === "overviewCellsButton") void Controllers.CellInfo.open();
  else if (buttonId === "openMinimapButton") void Controllers.Minimap.open();
  else if (buttonId === "configRegenerateMarkers") void Controllers.MarkersSettings.open();
  else if (buttonId === "addBurgTool") void Controllers.BurgCreator.toggle();
  else if (buttonId === "addLabel") void Controllers.LabelCreator.toggle();
  else if (buttonId === "addRiver") void Controllers.RiverAutoCreator.toggle();
  else if (buttonId === "addRoute") void Controllers.RouteCreator.open();
  else if (buttonId === "addMarker") void Controllers.MarkerCreator.toggle();
  else if (buttonId === "openSubmapTool") void Controllers.SubmapTool.open();
  else if (buttonId === "openTransformTool") void Controllers.TransformTool.open();
});

function confirmRegeneration(event: MouseEvent, button: string): void {
  if (sessionStorage.getItem("regenerateFeatureDontAsk")) {
    regenerate(event, button);
    return;
  }

  const message = ensureEl("alertMessage");
  message.innerHTML =
    "Regeneration will remove all the custom changes for the element.<br /><br />Are you sure you want to proceed?";
  $("#alert").dialog({
    resizable: false,
    title: "Regenerate element",
    buttons: {
      Proceed: function () {
        regenerate(event, button);
        $(this).dialog("close");
      },
      Cancel: function () {
        $(this).dialog("close");
      }
    },
    open: function () {
      const checkbox =
        '<span><input id="dontAsk" class="checkbox" type="checkbox"><label for="dontAsk" class="checkbox-label dontAsk"><i>do not ask again</i></label><span>';
      this.parentElement.querySelector(".ui-dialog-buttonpane")?.insertAdjacentHTML("afterbegin", checkbox);
    },
    close: function () {
      const checkbox = this.parentElement.querySelector(".checkbox") as HTMLInputElement | null;
      if (checkbox?.checked) sessionStorage.setItem("regenerateFeatureDontAsk", "true");
      $(this).dialog("destroy");
    }
  });
}

function regenerate(event: MouseEvent, button: string): void {
  if (button === "regenerateStateLabels") regenerateStateLabels();
  else if (button === "regenerateReliefIcons") regenerateReliefIcons();
  else if (button === "regenerateRoutes") regenerateRoutes();
  else if (button === "regenerateRivers") regenerateRivers();
  else if (button === "regenerateRaces") regenerateRaces();
  else if (button === "regeneratePopulation") regeneratePopulation();
  else if (button === "regenerateStates") regenerateStates();
  else if (button === "regenerateProvinces") regenerateProvinces();
  else if (button === "regenerateBurgs") regenerateBurgs();
  else if (button === "regenerateGoods") regenerateGoods();
  else if (button === "regenerateMarkets") regenerateMarkets();
  else if (button === "regenerateEconomy") regenerateEconomy();
  else if (button === "regenerateProduction") regenerateProduction();
  else if (button === "regenerateEmblems") regenerateEmblems();
  else if (button === "regenerateReligions") regenerateReligions();
  else if (button === "regenerateCultures") regenerateCultures();
  else if (button === "regenerateMilitary") regenerateMilitary();
  else if (button === "regenerateIce") regenerateIce();
  else if (button === "regenerateMarkers") regenerateMarkers();
  else if (button === "regenerateZones") regenerateZones(event);
  refreshEditors();
}

function regenerateStateLabels(): void {
  for (const state of pack.states) {
    if (!state.i || state.removed) continue;
    if (state.label) delete state.label; // cleanup custom label data to force recalculation of pathPoints
  }
  Layers.draw("labels");
}

function regenerateReliefIcons(): void {
  Relief.generate();
  Layers.draw("relief");
}

function regenerateRoutes(): void {
  Routes.regenerate();
  Layers.draw("routes");
}

function regenerateRivers(): void {
  Rivers.regenerate();
  Layers.draw("rivers");
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
  if (pack.provinces) pack.provinces.forEach(p => p && delete (p as unknown as { race?: number }).race);
  if (pack.burgs) pack.burgs.forEach(b => b && delete (b as unknown as { race?: number }).race);
  if (pack.religions) pack.religions.forEach(r => r && delete (r as unknown as { race?: number }).race);

  // Force rebuild of cell-level race layer.
  const cells = pack.cells as unknown as { race?: Uint16Array };
  delete cells.race;

  // Reroll per-culture race assignment (so distribution actually changes).
  if (typeof rerollRacesForCultures === "function") {
    rerollRacesForCultures({ forceFilterFromUi: true });
  } else if (typeof initializeRacesForExpansion === "function") {
    initializeRacesForExpansion({ forceFilterFromUi: true });
  }

  // Rebuild cell-level race layer and derived entity races.
  if (typeof assignRaces === "function") assignRaces();

  if (Layers.isOn("races")) drawRaces();
  if (typeof refreshAllEditors === "function") refreshAllEditors();
}

function regeneratePopulation(): void {
  Population.regenerate();
  Layers.draw("population", "goods");
}

function regenerateStates(): void {
  const { warning, error } = States.regenerate();
  if (error) return void tip(error, false, "error");
  if (warning) tip(warning, false, "warn");

  unfog();
  Layers.draw("states", "borders", "provinces", "labels", "burgIcons", "military", "goods", "emblems");
}

function regenerateProvinces(): void {
  Provinces.regenerate();
  unfog();
  Layers.draw("borders", "provinces", "labels", "emblems");
}

function regenerateBurgs(): void {
  Burgs.regenerate();
  Layers.draw("burgIcons", "labels", "routes", "population", "goods", "emblems");
}

function regenerateGoods(): void {
  Goods.regenerate();
  Layers.draw("goods");
}

function regenerateMarkets(): void {
  Markets.regenerate();
  Layers.draw("markets", "goods", "trade");
}

function regenerateEconomy(): void {
  Production.regenerateEconomy();
  Layers.draw("markets", "goods", "trade");
}

function regenerateProduction(): void {
  Production.regenerate();
  Layers.draw("goods", "trade");
}

function regenerateEmblems(): void {
  Emblems.regenerate();
  Layers.draw("emblems");
}

function regenerateReligions(): void {
  Religions.regenerate();
  Layers.draw("religions", "goods");
}

function regenerateCultures(): void {
  Cultures.regenerate();

  if (typeof initializeRacesForExpansion === "function") {
    initializeRacesForExpansion({ forceFilterFromUi: true });
  }

  if (typeof assignRaces === "function") assignRaces();

  Layers.draw("cultures", "goods");
  if (typeof refreshAllEditors === "function") refreshAllEditors();
}

function regenerateMilitary(): void {
  Military.regenerate();
  Layers.draw("military");
}

function regenerateIce(): void {
  Ice.regenerate();
  Layers.draw("ice");
}

function regenerateMarkers(): void {
  Markers.regenerate();
  Layers.draw("markers");
}

function regenerateZones(event: MouseEvent): void {
  function applyZonesRegeneration(multiplier: number): void {
    Zones.regenerate(multiplier);
    refreshEditors();
    Layers.draw("zones", "goods");
  }

  if (!isCtrlClick(event)) {
    applyZonesRegeneration(gauss(1, 0.5, 0.6, 5, 2));
    return;
  }

  const promptForNumber = window.prompt as unknown as (
    message: string,
    options: { default: number; step: number; min: number; max: number },
    callback: (value: number | string) => void
  ) => void;
  promptForNumber("Please provide zones number multiplier", { default: 1, step: 0.01, min: 0, max: 100 }, value =>
    applyZonesRegeneration(Number(value))
  );
}

// Expose race UI functions to legacy JS (public/modules/ui/options.js)
window.toggleRaces = () => {
  const isOn = Layers.isOn("races");
  if (isOn) Layers.hide("races");
  else Layers.show("races");
};
window.editRaces = () => window.Controllers.RacesEditor.open();
window.drawRaces = drawRaces;
window.regenerateRaces = regenerateRaces;

// Refresh all open editors (faithful to original editors.js)
window.refreshAllEditors = (): void => {
  const editors = [
    "culturesEditorRefresh",
    "biomesEditorRefresh",
    "diplomacyEditorRefresh",
    "provincesEditorRefresh",
    "religionsEditorRefresh",
    "statesEditorRefresh",
    "zonesEditorRefresh"
  ];
  for (const id of editors) {
    const el = document.getElementById(id);
    if (el && el.offsetParent) (el as HTMLButtonElement).click();
  }
};
