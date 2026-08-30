import { max as d3max, min as d3min, mean, median } from "d3";
import { closeDialogs, destroyDialog } from "@/components/dialog/dialog-helpers";
import { tip } from "@/components/tooltips";
import { downloadFile, getFileName, speak, uploadFile } from "@/utils";
import { ensureEl, openURL, rn, unique } from "../utils";
import type { LanguageMixerCatalogEntry } from "@/generators/language-softmods";
import type { NameBase } from "@/data/name-bases";

/** Catalog entry as stored in language-mixes.json — extends the imported type with optional lexifier/subgroup. */
type MixerCatalogEntry = LanguageMixerCatalogEntry & {
  lexifier?: string;
  subgroup?: string;
};

// ---------------------------------------------------------------------------
// AI provider configuration (used by the mixer's AI generation feature).
// Mirrors the upstream ai-generator.ts PROVIDERS/MODELS/DEFAULT_MODEL so the
// mixer can call requestAiCompletion() without depending on that module's
// internal (non-exported) constants.
// ---------------------------------------------------------------------------

type Provider = "openai" | "anthropic" | "ollama";

interface GenerationOptions {
  key: string;
  model: string;
  prompt: string;
  temperature: number;
  webAccess: boolean;
  onContent: (content: string) => void;
}

interface StreamChunk {
  choices?: Array<{ delta?: { content?: string } }>;
  delta?: { text?: string };
  response?: string;
}

const PROVIDERS: Record<Provider, { keyLink: string; generate: (options: GenerationOptions) => Promise<void> }> = {
  openai: {
    keyLink: "https://platform.openai.com/account/api-keys",
    generate: generateWithOpenAI
  },
  anthropic: {
    keyLink: "https://console.anthropic.com/account/keys",
    generate: generateWithAnthropic
  },
  ollama: {
    keyLink: "https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Ollama-text-generation",
    generate: generateWithOllama
  }
};

const DEFAULT_MODEL = "gpt-5.6-luna";

const MODELS: Record<string, Provider> = {
  "gpt-5.6-luna": "openai",
  "gpt-5.6-terra": "openai",
  "gpt-5.6-sol": "openai",
  "gpt-5-mini": "openai",
  "gpt-5-nano": "openai",
  "claude-opus-4-8": "anthropic",
  "claude-sonnet-5": "anthropic",
  "claude-haiku-4-5": "anthropic",
  "ollama (local models)": "ollama"
};

// ---------------------------------------------------------------------------
// Namesbase editor
// ---------------------------------------------------------------------------

function open(): void {
  if (customization) return;
  closeDialogs("#namesbaseEditor, .stable");

  renderDialog();
  initLanguageMixer();
  createBasesList();
  updateInputs();

  $("#namesbaseEditor").dialog({
    title: "Namesbase Editor",
    width: "60vw",
    position: { my: "center", at: "center", of: "svg" },
    close: closeNamesbaseEditor
  });
}

// ---------------------------------------------------------------------------
// Dialog rendering
// ---------------------------------------------------------------------------

function renderDialog(): void {
  destroyDialog("namesbaseEditor");
  const editorHtml = /* html */ `<div id="namesbaseEditor" class="dialog stable textual">
      <div id="namesbaseBasesTop">
        <span>Select base: </span>
        <select id="namesbaseSelect" data-tip="Select base to edit" style="width: 12em" value="0"></select>
        <button id="namesbaseShowAll" data-tip="Show all namebases, not just those in use">Show all</button>
        <span style="margin-left: 2px">Names data: </span>
      </div>
      <div id="namesbaseBody" style="margin-block: 2px; width: auto">
        <textarea
          id="namesbaseTextarea"
          data-base="0"
          rows="13"
          data-tip="Names data: a comma separated list of source names used for names generation"
          placeholder="Provide a names data: a comma separated list of source names"
          autocorrect="off"
          spellcheck="false"
          style="resize: none"
        ></textarea>
        <div>
          <span>Name: </span>
          <input
            id="namesbaseName"
            data-tip="Type to change a base name"
            placeholder="Base name"
            autocorrect="off"
            spellcheck="false"
            style="width: 12em"
          />
          <span>Length: </span>
          <input id="namesbaseMin" data-tip="Recommended minimum name length" type="number" min="2" max="100" />
          <input id="namesbaseMax" data-tip="Recommended maximum name length" type="number" min="2" value="10" />
          <span>Doubled: </span>
          <input
            id="namesbaseDouble"
            data-tip="Populate with letters that can be used twice in a row (geminates)"
            autocorrect="off"
            spellcheck="false"
            style="width: 10em"
          />
        </div>
        <fieldset>
          <legend>Generated examples:</legend>
          <div id="namesbaseExamples" data-tip="Examples. Click to re-generate"></div>
        </fieldset>
      </div>
      <div id="namesbaseBottom">
        <button
          id="namesbaseUpdateExamples"
          data-tip="Re-generate examples based on provided data"
          class="icon-arrows-cw"
        ></button>
        <button id="namesbaseAdd" data-tip="Add new namesbase" class="icon-plus"></button>
        <button id="namesbaseDefault" data-tip="Restore default namesbase" class="icon-cancel"></button>
        <button id="namesbaseDownload" data-tip="Download namesbase to PC" class="icon-download"></button>
        <button
          id="namesbaseUpload"
          data-tip="Upload a namesbase from PC, replacing the current set"
          class="icon-upload"
        ></button>
        <button
          id="namesbaseUploadExtend"
          data-tip="Upload a namesbase from PC, extending the current set"
          class="icon-up-circled2"
        ></button>
        <button
          id="namesbaseCA"
          data-tip="Find or share custom namesbase on Cartography Assets portal"
          class="icon-drafting-compass"
        ></button>
        <button
          id="namesbaseAnalyze"
          data-tip="Analyze namesbase to get a validity and quality overview"
          class="icon-flask"
        ></button>
        <button
          id="namesbaseSpeak"
          data-tip="Speak the examples. You can change voice and language in options"
          class="icon-voice"
        ></button>
      </div>
      <div id="namesbaseMixer" style="margin-top: 1em; border-top: 1px solid #aaa; padding-top: 0.5em">
        <fieldset>
          <legend>Language Mixer</legend>
          <div style="display: flex; gap: 0.5em; flex-wrap: wrap; align-items: center; margin-bottom: 0.5em">
            <select id="namesbaseMixerCategory" data-tip="Filter by category" style="width: 10em"></select>
            <select id="namesbaseMixerFamily" data-tip="Filter by family" style="width: 10em"></select>
            <select id="namesbaseMixerTagFilter" data-tip="Filter by tag" style="width: 10em">
              <option value="">All tags</option>
              <option value="isolate">Isolates</option>
              <option value="unclassified">Unclassified</option>
              <option value="hypothetical">Hypothetical</option>
            </select>
            <select id="namesbaseMixerLanguage" data-tip="Select a language to add" style="width: 14em"></select>
            <button id="namesbaseMixerAdd" data-tip="Add selected language to the mix" class="icon-plus"></button>
            <button id="namesbaseMixerAddRandom" data-tip="Add a random matching language" class="icon-shuffle"></button>
            <button id="namesbaseMixerEven" data-tip="Set all weights to 1" class="icon-equals"></button>
            <button id="namesbaseMixerRandomizeAll" data-tip="Randomize all weights" class="icon-dice"></button>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.5em">
            <thead>
              <tr>
                <th style="text-align: left">Language</th>
                <th style="text-align: left">Region</th>
                <th style="text-align: left">Weight</th>
                <th style="text-align: left">Actions</th>
              </tr>
            </thead>
            <tbody id="namesbaseMixerSelection"></tbody>
          </table>
          <div style="display: flex; gap: 0.5em; flex-wrap: wrap; align-items: center; margin-bottom: 0.5em">
            <span>Count: </span>
            <input id="namesbaseMixerCount" type="number" min="5" max="200" value="40" style="width: 4em" />
            <button id="namesbaseMixerGenerate" data-tip="Generate names via AI">Generate (AI)</button>
            <button id="namesbaseMixerGenerateLocal" data-tip="Generate names locally using Markov chains">Generate (Local)</button>
          </div>
          <div style="margin-bottom: 0.5em">
            <select id="namesbaseAiModel" data-tip="AI model" style="width: 12em"></select>
            <span>Temp: </span>
            <input id="namesbaseAiTemperature" type="number" min="0" max="2" step="0.1" value="1" style="width: 3em" />
            <span>Key: </span>
            <input id="namesbaseAiKey" data-tip="API key for the selected provider" placeholder="API key" style="width: 12em" />
            <button id="namesbaseAiKeyHelp" data-tip="Get an API key" class="icon-help-circled"></button>
            <label style="margin-left: 0.5em">
              <input id="namesbaseAiWebAccess" type="checkbox" /> Web access
            </label>
          </div>
          <textarea
            id="namesbaseMixerResult"
            rows="4"
            placeholder="Generated names will appear here"
            style="width: 100%; resize: vertical"
          ></textarea>
          <div style="display: flex; gap: 0.5em; align-items: center; margin-top: 0.5em">
            <button id="namesbaseMixerInsert" data-tip="Insert generated names into the base">Insert</button>
            <select id="namesbaseMixerInsertMode" data-tip="Insert mode">
              <option value="append">Append</option>
              <option value="replace">Replace</option>
              <option value="new">New base</option>
            </select>
            <span id="namesbaseMixerStatus" style="margin-left: auto; font-size: 0.9em"></span>
          </div>
        </fieldset>
      </div>
    </div>`;
  ensureEl("dialogs").insertAdjacentHTML("beforeend", editorHtml);

  const uploader = ensureEl<HTMLInputElement>("namesbaseToLoad");

  ensureEl("namesbaseSelect").addEventListener("change", updateInputs);
  ensureEl("namesbaseTextarea").addEventListener("change", updateNamesData);
  ensureEl("namesbaseUpdateExamples").addEventListener("click", updateExamples);
  ensureEl("namesbaseExamples").addEventListener("click", updateExamples);
  ensureEl("namesbaseName").addEventListener("input", e => updateBaseName((e.target as HTMLInputElement).value));
  ensureEl("namesbaseMin").addEventListener("input", e => updateBaseMin((e.target as HTMLInputElement).value));
  ensureEl("namesbaseMax").addEventListener("input", e => updateBaseMax((e.target as HTMLInputElement).value));
  ensureEl("namesbaseDouble").addEventListener("input", e =>
    updateBaseDuplication((e.target as HTMLInputElement).value)
  );
  ensureEl("namesbaseAdd").addEventListener("click", namesbaseAdd);
  ensureEl("namesbaseAnalyze").addEventListener("click", analyzeNamesbase);
  ensureEl("namesbaseDefault").addEventListener("click", namesbaseRestoreDefault);
  ensureEl("namesbaseDownload").addEventListener("click", namesbaseDownload);
  ensureEl("namesbaseUpload").addEventListener("click", () => {
    uploader.addEventListener("change", e => uploadFile(e.target as HTMLInputElement, d => namesbaseUpload(d, true)), {
      once: true
    });
    uploader.click();
  });
  ensureEl("namesbaseUploadExtend").addEventListener("click", () => {
    uploader.addEventListener("change", e => uploadFile(e.target as HTMLInputElement, d => namesbaseUpload(d, false)), {
      once: true
    });
    uploader.click();
  });
  ensureEl("namesbaseCA").addEventListener("click", () =>
    openURL("https://cartographyassets.com/asset-category/specific-assets/azgaars-generator/namebases/")
  );
  ensureEl("namesbaseSpeak").addEventListener("click", () => speak(ensureEl("namesbaseExamples").textContent ?? ""));
}

function closeNamesbaseEditor(): void {
  $("#namesbaseEditor").dialog("destroy");
  ensureEl("namesbaseEditor").remove();
}

// ---------------------------------------------------------------------------
// Base list management
// ---------------------------------------------------------------------------

function getUsedNamebaseIndices(): Set<number> {
  if (typeof pack === "undefined" || !pack || !Array.isArray(pack.cultures)) return new Set();
  const used = new Set<number>();
  for (let i = 0; i < pack.cultures.length; i++) {
    const base = pack.cultures[i]?.base;
    if (typeof base === "number" && base >= 0) used.add(base);
  }
  return used;
}

function isMixerBase(base: NameBase): boolean {
  if (!base) return false;
  const b = base as NameBase & {
    cultureMixer?: boolean;
    raceMixerFor?: unknown;
    languageMixer?: boolean;
    isoWeights?: unknown;
  };
  return Boolean(b.cultureMixer || b.raceMixerFor || b.languageMixer || b.isoWeights);
}

let showAllNamebases = false;

function shouldShowBase(i: number, usedSet: Set<number>, previousValue: string | undefined): boolean {
  if (showAllNamebases) return true;
  const b = Names.nameBases[i];
  if (!b) return false;
  if (isMixerBase(b)) return true;
  if (usedSet.has(i)) return true;
  if (previousValue !== undefined && +previousValue === i) return true;
  return false;
}

function createBasesList(): void {
  const select = ensureEl<HTMLSelectElement>("namesbaseSelect");
  const previousValue = select.value;
  const usedSet = getUsedNamebaseIndices();
  select.innerHTML = "";

  let inUse = 0;
  let mixed = 0;
  let other = 0;
  Names.nameBases.forEach((b, i) => {
    if (!b) return;
    if (!shouldShowBase(i, usedSet, previousValue)) return;
    select.options.add(new Option(b.name, String(i)));
    if (isMixerBase(b)) mixed++;
    else if (usedSet.has(i)) inUse++;
    else other++;
  });

  if (!select.options.length && Names.nameBases.some(b => b)) {
    showAllNamebases = true;
    const showAllButton = ensureEl<HTMLButtonElement>("namesbaseShowAll");
    showAllButton.classList.add("active");
    Names.nameBases.forEach((b, i) => {
      if (b) select.options.add(new Option(b.name, String(i)));
    });
    other = Names.nameBases.filter(b => b).length;
  }

  if (previousValue && select.querySelector(`option[value="${previousValue}"]`)) {
    select.value = previousValue;
  }

  const total = Names.nameBases.filter(b => b).length;
  if (total) {
    const visible = inUse + mixed + other;
    select.title = `Showing ${visible} of ${total} namebases (in use: ${inUse}, mixed: ${mixed}, other: ${other})`;
  }
}

// ---------------------------------------------------------------------------
// Input synchronization
// ---------------------------------------------------------------------------

function updateInputs(): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  if (!Names.nameBases[base]) {
    tip(`Namesbase ${base} is not defined`, false, "error");
    return;
  }
  (ensureEl("namesbaseTextarea") as HTMLTextAreaElement).value = Names.nameBases[base].b;
  (ensureEl("namesbaseName") as HTMLInputElement).value = Names.nameBases[base].name;
  (ensureEl("namesbaseMin") as HTMLInputElement).value = String(Names.nameBases[base].min);
  (ensureEl("namesbaseMax") as HTMLInputElement).value = String(Names.nameBases[base].max);
  (ensureEl("namesbaseDouble") as HTMLInputElement).value = Names.nameBases[base].d;
  updateExamples();
}

function updateExamples(): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  let examples = "";
  for (let i = 0; i < 7; i++) {
    const example = Names.getBase(base);
    if (example === undefined) {
      examples = "Cannot generate examples. Please verify the data";
      break;
    }
    if (i) examples += ", ";
    examples += example;
  }
  ensureEl("namesbaseExamples").innerHTML = examples;
}

function updateNamesData(): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  const input = ensureEl<HTMLTextAreaElement>("namesbaseTextarea");
  if (input.value.split(",").length < 3) {
    tip("The names data provided is too short or incorrect", false, "error");
    return;
  }
  const securedNamesData = input.value.replace(/[/|]/g, "");
  Names.nameBases[base].b = securedNamesData;
  input.value = securedNamesData;
  Names.updateChain(base);
}

function updateBaseName(rawName: string): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  const select = ensureEl<HTMLSelectElement>("namesbaseSelect");
  const name = rawName.replace(/[/|]/g, "");
  select.options[select.selectedIndex].innerHTML = name;
  Names.nameBases[base].name = name;
}

function updateBaseMin(value: string): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  if (+value > Names.nameBases[base].max) {
    tip("Minimal length cannot be greater than maximal", false, "error");
    return;
  }
  Names.nameBases[base].min = +value;
}

function updateBaseMax(value: string): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  if (+value < Names.nameBases[base].min) {
    tip("Maximal length should be greater than minimal", false, "error");
    return;
  }
  Names.nameBases[base].max = +value;
}

function updateBaseDuplication(value: string): void {
  const base = +ensureEl<HTMLSelectElement>("namesbaseSelect").value;
  Names.nameBases[base].d = value;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

function analyzeNamesbase(): void {
  const namesSourceString = (ensureEl("namesbaseTextarea") as HTMLTextAreaElement).value;
  const namesArray = namesSourceString.toLowerCase().split(",");
  const length = namesArray.length;
  if (!namesSourceString || !length) {
    tip("Names data should not be empty", false, "error");
    return;
  }

  const chain = Names.calculateChain(namesSourceString);
  const chainValues = Object.values(chain) as string[][];
  const variety = rn(mean(chainValues.map(kv => kv.length)) ?? 0);

  const wordsLength = namesArray.map(n => n.length);

  const nonLatin = namesSourceString.match(/[\u0080-\uFFFF]/gu);
  const nonBasicLatinChars = nonLatin
    ? unique(
        namesSourceString
          .match(/[\u0080-\uFFFF]/gu)!
          .join("")
          .toLowerCase()
          .split("")
      ).join("")
    : "none";

  const geminate = namesArray.flatMap(name => name.match(/[^\w\s]|(.)(?=\1)/g) ?? []);
  const doubled = unique(geminate).filter(char => geminate.filter(d => d === char).length > 3);
  const doubledStr = doubled.length ? doubled.join("") : "none";

  const duplicates = unique(namesArray.filter((e, i, a) => a.indexOf(e) !== i)).join(", ") || "none";
  const multiwordRate = mean(namesArray.map(n => +n.includes(" "))) ?? 0;

  const getLengthQuality = (): string => {
    if (length < 30)
      return "<span data-tip='Namesbase contains < 30 names - not enough to generate reasonable data' style='color:red'>[not enough]</span>";
    if (length < 100)
      return "<span data-tip='Namesbase contains < 100 names - not enough to generate good names' style='color:darkred'>[low]</span>";
    if (length <= 400)
      return "<span data-tip='Namesbase contains a reasonable number of samples' style='color:green'>[good]</span>";
    return "<span data-tip='Namesbase contains > 400 names. That is too much, try to reduce it to ~300 names' style='color:darkred'>[overmuch]</span>";
  };

  const getVarietyLevel = (): string => {
    if (variety < 15)
      return "<span data-tip='Namesbase average variety < 15 - generated names will be too repetitive' style='color:red'>[low]</span>";
    if (variety < 30)
      return "<span data-tip='Namesbase average variety < 30 - names can be too repetitive' style='color:orange'>[mean]</span>";
    return "<span data-tip='Namesbase variety is good' style='color:green'>[good]</span>";
  };

  alertMessage.innerHTML = /* html */ `<div style="line-height: 1.6em; max-width: 20em">
      <div data-tip="Number of names provided">Namesbase length: ${length} ${getLengthQuality()}</div>
      <div data-tip="Average number of generation variants for each key in the chain">Namesbase variety: ${variety} ${getVarietyLevel()}</div>
      <hr />
      <div data-tip="The shortest name length">Min name length: ${d3min(wordsLength)}</div>
      <div data-tip="The longest name length">Max name length: ${d3max(wordsLength)}</div>
      <div data-tip="Average name length">Mean name length: ${rn(mean(wordsLength) ?? 0, 1)}</div>
      <div data-tip="Common name length">Median name length: ${median(wordsLength)}</div>
      <hr />
      <div data-tip="Characters outside of Basic Latin have bad font support">Non-basic chars: ${nonBasicLatinChars}</div>
      <div data-tip="Characters that are frequently (more than 3 times) doubled">Doubled chars: ${doubledStr}</div>
      <div data-tip="Names used more than one time">Duplicates: ${duplicates}</div>
      <div data-tip="Percentage of names containing space character">Multi-word names: ${rn(multiwordRate * 100, 2)}%</div>
    </div>`;

  $("#alert").dialog({
    resizable: false,
    title: "Data Analysis",
    width: "auto",
    position: { my: "left top-30", at: "right+10 top", of: "#namesbaseEditor" },
    buttons: {
      OK: function () {
        $(this).dialog("close");
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Add / restore / download / upload
// ---------------------------------------------------------------------------

function namesbaseAdd(): void {
  const baseId = Names.nameBases.length;
  const b =
    "This,is,an,example,of,name,base,showing,correct,format,It,should,have,at,least,one,hundred,names,separated,with,comma";
  Names.nameBases.push({
    name: `Base${baseId}`,
    i: baseId,
    min: 5,
    max: 12,
    d: "",
    m: 0,
    b
  });
  if (typeof window.refreshDefaultNameBaseIds === "function") window.refreshDefaultNameBaseIds();
  ensureEl<HTMLSelectElement>("namesbaseSelect").add(new Option(`Base${baseId}`, String(baseId)));
  (ensureEl("namesbaseSelect") as HTMLSelectElement).value = String(baseId);
  (ensureEl("namesbaseTextarea") as HTMLTextAreaElement).value = b;
  (ensureEl("namesbaseName") as HTMLInputElement).value = `Base${baseId}`;
  (ensureEl("namesbaseMin") as HTMLInputElement).value = "5";
  (ensureEl("namesbaseMax") as HTMLInputElement).value = "12";
  (ensureEl("namesbaseDouble") as HTMLInputElement).value = "";
  ensureEl("namesbaseExamples").innerHTML = "Please provide names data";
}

function namesbaseRestoreDefault(): void {
  alertMessage.innerHTML = /* html */ `Are you sure you want to restore default namesbase?`;
  $("#alert").dialog({
    resizable: false,
    title: "Restore default data",
    buttons: {
      Restore: function () {
        $(this).dialog("close");
        Names.clearChains();
        Names.nameBases = Names.getNameBases();
        createBasesList();
        updateInputs();
      },
      Cancel: function () {
        $(this).dialog("close");
      }
    }
  });
}

function namesbaseDownload(): void {
  const data = Names.nameBases.map(b => `${b.name}|${b.min}|${b.max}|${b.d}|${b.m}|${b.b}`).join("\r\n");
  const name = `${getFileName("Namesbase")}.txt`;
  downloadFile(data, name);
}

function namesbaseUpload(dataLoaded: string, override = true): void {
  const lines = dataLoaded
    .replace(/\r\n|\r/g, "\n")
    .split("\n")
    .filter(Boolean);
  if (!lines.length) {
    tip("Cannot load a namesbase. Please check the data format", false, "error");
    return;
  }

  Names.clearChains();
  if (override) Names.nameBases = [];

  const errors: ParseError[] = [];
  lines.forEach((line, index) => {
    try {
      const [rawName, min, max, d, m, rawNames] = line.split("|");
      const name = rawName?.replace(unsafe, "");
      if (!name) throw new Error("Name is missing");
      const names = rawNames?.replace(unsafe, "");
      if (!names) throw new Error("Names are missing");
      Names.nameBases.push({
        name,
        i: Names.nameBases.length,
        min: +min,
        max: +max,
        d,
        m: +m,
        b: names
      });
      if (typeof window.refreshDefaultNameBaseIds === "function") window.refreshDefaultNameBaseIds();
    } catch (e) {
      errors.push({ id: index + 1, line, error: (e as Error).message });
      ERROR && console.error(e);
    }
  });

  if (errors.length > 0) {
    ERROR && console.error("Namesbase upload errors", errors);
    const errorItems = errors
      .map(
        ({ id, line, error }) => /* html */ `<li style="padding:0.6em 0;border-top:1px solid #ddd;">
            <div>
              Line ${id}:
              <span style="color:#8b0000">${escapeHtml(error)}.</span> Data:
            </div>
            <div style="margin-top:0.35em;font-family:var(--font-monospace,monospace);font-size:0.95em;line-height:1.4;word-break:break-word;color:#333;">
              ${escapeHtml(line) || "<empty line>"}
            </div>
          </li>`
      )
      .join("");

    alertMessage.innerHTML = /* html */ `<div>
        <p style="margin:0.75em;">
          <strong>File parsing error. Only ${lines.length - errors.length} out of ${lines.length} namebases added.</strong>
          Each namebase should be on its own line and follow the format: <code>name|min|max|duplication|m|names</code>. Parameters should be separated with the <code>|</code> character, and this character should not be used within the parameters. Another prohibited character is <code>/</code>. The most common issue is names and other parameters being on two separate lines.
          <ul style="margin:0.5em;">
            <li><code>name</code>: name of the base.</li>
            <li><code>min</code>: minimal recommended length of generated names. It should be a number.</li>
            <li><code>max</code>: maximal recommended length of generated names. It should be a number greater than minimal length.</li>
            <li><code>duplication</code>: characters that can be duplicated in generated names. For example <code>lkd</code> means names like "Kalla", "Mikkor", "Dalddur" are possible. This parameter can be empty.</li>
            <li><code>m</code>: unused parameter, populate with <code>0</code>.</li>
            <li><code>names</code>: names data, separated with commas. It should contain at least 3 names to be valid.</li>
          </ul>
        </p>
        <div>
          <ul style="margin:0;padding-left:1.5em;">
            ${errorItems}
          </ul>
        </div>
      </div>`;

    $("#alert").dialog({
      resizable: false,
      title: "Parsing error",
      width: "min(72vw, 68em)",
      position: { my: "center center-4em", at: "center", of: "svg" },
      buttons: {
        Continue: function () {
          $(this).dialog("close");
        }
      }
    });
  }

  createBasesList();
  updateInputs();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const unsafe = /[|/]/g;

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

interface ParseError {
  id: number;
  line: string;
  error: string;
}

// ---------------------------------------------------------------------------
// Language Mixer
// ---------------------------------------------------------------------------

interface MixerLanguage {
  iso: string;
  weight: number;
}

interface MixerState {
  catalog: MixerCatalogEntry[] | null;
  languages: MixerLanguage[];
  generating: boolean;
}

const mixer: MixerState = {
  catalog: null,
  languages: [],
  generating: false
};

function clamp(value: number, min: number, max: number): number {
  const v = isNaN(value) ? min : value;
  return Math.min(max, Math.max(min, v));
}

function getRandomWeightNearOne(): number {
  const r = Math.random();
  let raw: number;

  if (r < 0.98) {
    const u = (Math.random() + Math.random() + Math.random()) / 3;
    raw = 1 + (u - 0.5) * 1.2;
  } else {
    const exp = Math.random() * 3;
    raw = Math.pow(10, exp);
  }

  const value = Math.round(raw * 100) / 100;
  return clamp(value, 0.01, 1000);
}

function initLanguageMixer(): void {
  const mixerCategorySelect = ensureEl<HTMLSelectElement>("namesbaseMixerCategory");
  const mixerFamilySelect = ensureEl<HTMLSelectElement>("namesbaseMixerFamily");
  const mixerTagFilterSelect = ensureEl<HTMLSelectElement>("namesbaseMixerTagFilter");
  const mixerLanguageSelect = ensureEl<HTMLSelectElement>("namesbaseMixerLanguage");
  const mixerAddButton = ensureEl<HTMLButtonElement>("namesbaseMixerAdd");
  const mixerEvenButton = ensureEl<HTMLButtonElement>("namesbaseMixerEven");
  const mixerAddRandomButton = ensureEl<HTMLButtonElement>("namesbaseMixerAddRandom");
  const mixerRandomizeAllButton = ensureEl<HTMLButtonElement>("namesbaseMixerRandomizeAll");
  const mixerGenerateButton = ensureEl<HTMLButtonElement>("namesbaseMixerGenerate");
  const mixerGenerateLocalButton = ensureEl<HTMLButtonElement>("namesbaseMixerGenerateLocal");
  const mixerInsertButton = ensureEl<HTMLButtonElement>("namesbaseMixerInsert");

  const showAllButton = ensureEl<HTMLButtonElement>("namesbaseShowAll");
  showAllButton.addEventListener("click", () => {
    showAllNamebases = !showAllNamebases;
    showAllButton.classList.toggle("active", showAllNamebases);
    createBasesList();
  });

  loadMixerCatalog().then(() => {
    renderMixerCategories();
    renderMixerFamilies();
    renderMixerLanguageOptions();
  });

  mixerCategorySelect.addEventListener("change", () => {
    renderMixerFamilies();
    renderMixerLanguageOptions();
  });

  mixerFamilySelect.addEventListener("change", () => {
    renderMixerLanguageOptions();
  });

  mixerTagFilterSelect.addEventListener("change", () => {
    renderMixerLanguageOptions();
  });

  mixerAddButton.addEventListener("click", e => {
    e.preventDefault();
    addLanguageToMix(mixerLanguageSelect.value);
  });

  mixerEvenButton.addEventListener("click", e => {
    e.preventDefault();
    distributeMixerWeights();
  });

  mixerAddRandomButton.addEventListener("click", e => {
    e.preventDefault();
    void addRandomLanguageToMixFromFilters();
  });

  mixerRandomizeAllButton.addEventListener("click", e => {
    e.preventDefault();
    randomizeAllMixerWeights();
  });

  mixerGenerateButton.addEventListener("click", e => {
    e.preventDefault();
    void generateMixerNames();
  });

  mixerGenerateLocalButton.addEventListener("click", e => {
    e.preventDefault();
    generateMixerNamesLocal();
  });

  mixerInsertButton.addEventListener("click", e => {
    e.preventDefault();
    insertMixerNamesIntoBase();
  });

  initMixerAiControls();
  renderMixerSelection();
}

// ---------------------------------------------------------------------------
// Mixer catalog loading and rendering
// ---------------------------------------------------------------------------

async function loadMixerCatalog(): Promise<MixerCatalogEntry[]> {
  if (mixer.catalog) return mixer.catalog;
  if (window.languageMixerCatalog) {
    mixer.catalog = [...window.languageMixerCatalog].sort((a, b) =>
      (a.region ?? "" + a.name).localeCompare(b.region ?? "" + b.name)
    );
    return mixer.catalog;
  }

  try {
    const version = (window as unknown as { VERSION?: string }).VERSION ?? "";
    const res = await fetch(`./config/language-mixes.json?v=${version}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = (await res.json()) as MixerCatalogEntry[];
    mixer.catalog = data.sort((a, b) => (a.region ?? "" + a.name).localeCompare(b.region ?? "" + b.name));
    window.languageMixerCatalog = mixer.catalog;
  } catch (error) {
    tip("Cannot load language catalog. Please reload the app.", false, "error");
    ERROR && console.error(error);
    mixer.catalog = [];
  }

  return mixer.catalog;
}

function renderMixerCategories(): void {
  const mixerCategorySelect = ensureEl<HTMLSelectElement>("namesbaseMixerCategory");
  if (!mixerCategorySelect || !mixer.catalog) return;
  const categories = Array.from(
    new Set(mixer.catalog.map(lang => lang.category).filter((c): c is string => Boolean(c)))
  ).sort((a, b) => a.localeCompare(b));
  mixerCategorySelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All categories";
  mixerCategorySelect.append(allOption);
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    mixerCategorySelect.append(option);
  });
}

function renderMixerFamilies(): void {
  const mixerCategorySelect = ensureEl<HTMLSelectElement>("namesbaseMixerCategory");
  const mixerFamilySelect = ensureEl<HTMLSelectElement>("namesbaseMixerFamily");
  if (!mixerFamilySelect || !mixer.catalog) return;
  const selectedCategory = mixerCategorySelect?.value || "";
  let source = mixer.catalog;
  if (selectedCategory) source = source.filter(lang => lang.category === selectedCategory);
  const families = Array.from(
    new Set(source.map(lang => lang.family || lang.category).filter((f): f is string => Boolean(f)))
  ).sort((a, b) => a.localeCompare(b));
  const previousValue = mixerFamilySelect.value;
  mixerFamilySelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All families";
  mixerFamilySelect.append(allOption);
  families.forEach(family => {
    const option = document.createElement("option");
    option.value = family;
    option.textContent = family;
    mixerFamilySelect.append(option);
  });
  if (previousValue && families.includes(previousValue)) {
    mixerFamilySelect.value = previousValue;
  }
}

function formatMixerTagBadge(meta: MixerCatalogEntry | undefined, inline = false): string {
  if (!meta || !meta.tags || !meta.tags.length) return "";
  const tags: string[] = [];
  if (meta.tags.includes("extinct")) tags.push("extinct");
  if (meta.tags.includes("pidgin")) tags.push("pidgin");
  if (meta.tags.includes("mixed")) tags.push("mixed");
  if (meta.tags.includes("creole")) tags.push("creole");
  if (meta.tags.includes("unclassified")) tags.push("unclassified");
  if (meta.tags.includes("hypothetical")) tags.push("hypothetical");
  if (meta.tags.includes("proto")) tags.push("proto");
  if (meta.tags.includes("family")) tags.push("family");
  if (!tags.length) return "";
  const label = `[${tags.join(", ")}]`;
  if (inline) return label;
  return `<span style="opacity:.7;font-size:.85em">${label}</span>`;
}

function formatMixerLabel(meta: MixerCatalogEntry | undefined): string {
  if (!meta) return "";
  const parts = [meta.name || meta.iso];
  if (meta.region) parts.push(`• ${meta.region}`);
  const badge = formatMixerTagBadge(meta, true);
  return badge ? `${parts.join(" ")} ${badge}` : parts.join(" ");
}

function renderMixerLanguageOptions(): void {
  const mixerCategorySelect = ensureEl<HTMLSelectElement>("namesbaseMixerCategory");
  const mixerFamilySelect = ensureEl<HTMLSelectElement>("namesbaseMixerFamily");
  const mixerTagFilterSelect = ensureEl<HTMLSelectElement>("namesbaseMixerTagFilter");
  const mixerLanguageSelect = ensureEl<HTMLSelectElement>("namesbaseMixerLanguage");
  if (!mixerLanguageSelect || !mixer.catalog) return;
  mixerLanguageSelect.innerHTML = "";
  const selectedCategory = mixerCategorySelect?.value || "";
  const selectedFamily = mixerFamilySelect?.value || "";
  const selectedTagFilter = mixerTagFilterSelect?.value || "";
  let options = mixer.catalog;
  if (selectedCategory) options = options.filter(lang => lang.category === selectedCategory);
  if (selectedFamily) options = options.filter(lang => lang.family === selectedFamily);
  if (selectedTagFilter === "isolate") {
    options = options.filter(lang => lang.category === "Language isolate");
  } else if (selectedTagFilter === "unclassified") {
    options = options.filter(
      lang =>
        lang.category === "Unclassified" || (Array.isArray(lang.tags) && lang.tags.indexOf("unclassified") !== -1)
    );
  } else if (selectedTagFilter === "hypothetical") {
    options = options.filter(
      lang =>
        lang.category === "Hypothetical" || (Array.isArray(lang.tags) && lang.tags.indexOf("hypothetical") !== -1)
    );
  }
  options.forEach(lang => {
    if (lang.tags && lang.tags.includes("family")) return;
    const option = document.createElement("option");
    option.value = lang.iso;
    option.textContent = formatMixerLabel(lang);
    mixerLanguageSelect.append(option);
  });
}

// ---------------------------------------------------------------------------
// Mixer selection management
// ---------------------------------------------------------------------------

function addLanguageToMix(iso: string): void {
  if (!iso) return;
  if (mixer.languages.some(lang => lang.iso === iso)) {
    return tip("Language already added to the mix", false, "warn");
  }
  mixer.languages.push({ iso, weight: 1 });
  renderMixerSelection();
}

function renderMixerSelection(): void {
  const mixerSelectionBody = ensureEl<HTMLTableSectionElement>("namesbaseMixerSelection");
  if (!mixerSelectionBody) return;
  mixerSelectionBody.innerHTML = "";

  if (!mixer.languages.length) {
    mixerSelectionBody.innerHTML =
      '<tr><td colspan="4" style="text-align:center; padding: .4em">Add languages to start mixing</td></tr>';
    return;
  }

  mixer.languages.forEach(lang => {
    const meta = getMixerMeta(lang.iso);
    const row = document.createElement("tr");
    row.dataset.iso = lang.iso;
    row.innerHTML = `
        <td>
          <div>${meta?.name || lang.iso} ${formatMixerTagBadge(meta)}</div>
          <small>${[meta?.category, meta?.family].filter(Boolean).join(" • ")}</small>
        </td>
        <td>${meta?.region || ""}</td>
        <td>
          <input type="number" min="0.01" max="1000" step="0.01" value="${lang.weight.toFixed(2)}" class="namesbaseMixerWeight" style="width:5em" />
        </td>
        <td>
          <button class="icon-shuffle namesbaseMixerRandomizeWeight" data-iso="${lang.iso}" data-tip="Randomize weight"></button>
          <button class="icon-trash-empty namesbaseMixerRemove" data-iso="${lang.iso}" data-tip="Remove language"></button>
        </td>
    `;
    mixerSelectionBody.append(row);
  });

  mixerSelectionBody.querySelectorAll<HTMLInputElement>(".namesbaseMixerWeight").forEach(input => {
    input.addEventListener("input", function () {
      const iso = (this.closest("tr") as HTMLTableRowElement).dataset.iso ?? "";
      const lang = mixer.languages.find(l => l.iso === iso);
      let value = parseFloat(this.value);
      if (isNaN(value)) value = 1;
      if (value <= 0) value = 0.01;
      if (value > 1000) value = 1000;
      value = Math.round(value * 100) / 100;
      if (lang) lang.weight = value;
      this.value = value.toFixed(2);
    });
  });

  mixerSelectionBody.querySelectorAll<HTMLButtonElement>(".namesbaseMixerRemove").forEach(button => {
    button.addEventListener("click", () => {
      mixer.languages = mixer.languages.filter(l => l.iso !== button.dataset.iso);
      renderMixerSelection();
    });
  });

  mixerSelectionBody.querySelectorAll<HTMLButtonElement>(".namesbaseMixerRandomizeWeight").forEach(button => {
    button.addEventListener("click", () => {
      const iso = (button.closest("tr") as HTMLTableRowElement).dataset.iso ?? "";
      const lang = mixer.languages.find(l => l.iso === iso);
      if (!lang) return;
      const newWeight = getRandomWeightNearOne();
      lang.weight = newWeight;
      const input = button.closest("tr")?.querySelector<HTMLInputElement>(".namesbaseMixerWeight");
      if (input) input.value = newWeight.toFixed(2);
    });
  });
}

function distributeMixerWeights(): void {
  if (!mixer.languages.length) {
    return tip("Add languages before distributing weights", false, "warn");
  }
  mixer.languages.forEach(lang => (lang.weight = 1));
  renderMixerSelection();
}

function randomizeAllMixerWeights(): void {
  if (!mixer.languages.length) {
    return tip("Add languages before randomizing weights", false, "warn");
  }
  mixer.languages.forEach(lang => {
    lang.weight = getRandomWeightNearOne();
  });
  renderMixerSelection();
}

function getMixerMeta(iso: string): MixerCatalogEntry | undefined {
  return mixer.catalog?.find(lang => lang.iso === iso);
}

async function addRandomLanguageToMixFromFilters(): Promise<void> {
  await loadMixerCatalog();
  if (!mixer.catalog || !mixer.catalog.length) return;

  const mixerCategorySelect = ensureEl<HTMLSelectElement>("namesbaseMixerCategory");
  const mixerFamilySelect = ensureEl<HTMLSelectElement>("namesbaseMixerFamily");
  const mixerTagFilterSelect = ensureEl<HTMLSelectElement>("namesbaseMixerTagFilter");

  const selectedCategory = mixerCategorySelect?.value || "";
  const selectedFamily = mixerFamilySelect?.value || "";
  const selectedTagFilter = mixerTagFilterSelect?.value || "";

  let options = mixer.catalog;
  if (selectedCategory) options = options.filter(lang => lang.category === selectedCategory);
  if (selectedFamily) options = options.filter(lang => lang.family === selectedFamily);
  if (selectedTagFilter === "isolate") {
    options = options.filter(lang => lang.category === "Language isolate");
  } else if (selectedTagFilter === "unclassified") {
    options = options.filter(
      lang =>
        lang.category === "Unclassified" || (Array.isArray(lang.tags) && lang.tags.indexOf("unclassified") !== -1)
    );
  } else if (selectedTagFilter === "hypothetical") {
    options = options.filter(
      lang =>
        lang.category === "Hypothetical" || (Array.isArray(lang.tags) && lang.tags.indexOf("hypothetical") !== -1)
    );
  }

  const usedIsos = new Set(mixer.languages.map(l => l.iso));
  options = options.filter(lang => !(Array.isArray(lang.tags) && lang.tags.includes("family")) && !usedIsos.has(lang.iso));

  if (!options.length) {
    return tip("No more matching languages to add for the current filters", false, "warn");
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  const iso = options[randomIndex].iso;
  addLanguageToMix(iso);
}

// ---------------------------------------------------------------------------
// Mixer name generation
// ---------------------------------------------------------------------------

function generateMixerLanguageName(): string {
  if (!mixer.languages.length) return "";

  const samples = mixer.languages
    .map(lang => {
      const meta = getMixerMeta(lang.iso);
      return (meta && meta.name) || lang.iso || "";
    })
    .map(n => String(n).trim())
    .filter(Boolean);

  if (!samples.length) return "";
  if (samples.length === 1) return samples[0];

  const text = samples.join(",");
  let chain: Record<string, string[]>;
  try {
    chain = Names.calculateChain(text) as unknown as Record<string, string[]>;
  } catch (error) {
    ERROR && console.error("Failed to calculate mixer language name chain", error);
    return "";
  }

  if (!chain || chain[""] === undefined) return "";

  const min = 4;
  const max = 14;

  const pickRandom = (list: string[]): string => {
    if (!Array.isArray(list) || !list.length) return "";
    return list[Math.floor(Math.random() * list.length)] || "";
  };

  let v = chain[""];
  let cur = pickRandom(v);
  let w = "";

  for (let i = 0; i < 30; i++) {
    if (cur === "") {
      if (w.length < min) {
        cur = "";
        w = "";
        v = chain[""];
      } else break;
    } else {
      if (w.length + cur.length > max) {
        if (w.length < min) w += cur;
        break;
      } else {
        const lastChar = cur.charAt(cur.length - 1) || "";
        v = chain[lastChar] || chain[""];
      }
    }

    w += cur;
    cur = pickRandom(v);
  }

  let name = w.trim();
  if (!name || name.length < 3) return "";

  name = name
    .split(/([\s-]+)/)
    .map(part => {
      if (/^[\s-]+$/.test(part)) return part;
      if (!part) return part;
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");

  return name;
}

async function generateMixerNames(): Promise<void> {
  const mixerCountInput = ensureEl<HTMLInputElement>("namesbaseMixerCount");
  const mixerGenerateButton = ensureEl<HTMLButtonElement>("namesbaseMixerGenerate");
  const mixerResultArea = ensureEl<HTMLTextAreaElement>("namesbaseMixerResult");

  if (mixer.generating) return;
  await loadMixerCatalog();

  if (!mixer.languages.length) return tip("Please add at least one language", false, "error");

  const key = getStoredAiKey();
  if (!key) return tip("Please enter an AI API key in the AI Generator dialog first", false, "error");

  const model = getStoredAiModel();
  const provider = getAiProviderForModel(model);
  if (!provider || !PROVIDERS[provider]) return tip("Selected AI model is not supported", false, "error");

  const totalWeight = mixer.languages.reduce((sum, lang) => sum + lang.weight, 0);
  if (!totalWeight) return tip("Weights must be greater than zero", false, "error");

  const count = clamp(+mixerCountInput.value || 40, 5, 200);
  mixerCountInput.value = String(count);

  const breakdown = mixer.languages
    .map(lang => {
      const meta = getMixerMeta(lang.iso);
      const pct = Math.round((lang.weight / totalWeight) * 100);
      const lexifier = meta?.lexifier ? `, lexifier ${meta.lexifier}` : "";
      return `${meta?.name || lang.iso} (${pct}% mix, region ${meta?.region || "N/A"}, category ${meta?.category || "N/A"
        }${lexifier})`;
    })
    .join("; ");

  const prompt = `
Generate ${count} unique fantasy place names. Names must feel like a blend of these language families with the given weights: ${breakdown}.

Some sources are creoles, mixed languages, proto or hypothetical reconstructions, or family-level groupings, and may show tags such as [creole], [mixed], [proto], [hypothetical], [family] and an optional lexifier field. Interpret them as follows:
- Lexifier: If a source lists a lexifier (for example "lexifier English" or "lexifier Quechua–Spanish"), bias surface phonology and vocabulary toward those lexifier languages, with other sources influencing structure and secondary flavor.
- Creole / pidgin: Sources tagged as creole or pidgin should still sound strongly like their lexifier language(s), with only subtle substrate influence rather than a generic global mix.
- Mixed: Sources tagged as mixed already blend multiple lineages; keep that blended character but still respect the given region, family and lexifier information.
- Proto / hypothetical: Sources tagged as proto or hypothetical represent reconstructed or proposed stages; use them to shape patterns and phonotactics, but do not output obviously real-world historical names.
- Family: Sources tagged as family (for example "Romance", "Uralic" or "English-based Caribbean creoles family") represent broad family style rather than a single language; treat them as high-level stylistic umbrellas informed by their typical member languages.

Before you generate anything, infer for each source language its typical phonology, prosody, morphology type, and place-name patterns using its name, family, region, tags and any tools or web access you have. Do this analysis internally; do not output it directly.

When blending, mix the underlying linguistic features of the source languages, not just their spelling. Explicitly consider:
- Phonology and phonotactics: typical vowels, consonants, nasals, clusters, syllable shapes, stress patterns, and any vowel/consonant harmony.
- Prosodic "slantings": preferred syllable openings and closings, and the typical onset/coda clusters each language family favors.
- Morphology and word structure: isolating vs agglutinative vs fusional vs polysynthetic tendencies, common affixes or compounding patterns, and typical place-name morphemes.
- Syntax and grammar "feel": how multi-word names are ordered (e.g. modifiers vs heads, honorifics, and formals) so the overall structure matches the families and regions.
- Lexicon and semantics: roots and morphemes that feel typical for place names in those language families and regions, without copying real-world toponyms.

Guidelines:
- Return a comma-separated list only, no numbering or extra prose.
- Names should be 1-3 words, title case, 3-16 characters per word.
- Avoid diacritics that are not ASCII.
- Avoid adding generic global English or Latinate flavor unless those languages are explicitly part of the mix.
- Do not repeat names, and keep them pronounceable.
- Do not output any explanations or metadata, only the names.
    `.trim();

  const temperature = +(localStorage.getItem("fmg-ai-temperature") ?? "0.9");
  const webAccess = getStoredAiWebAccess();
  mixer.generating = true;
  mixerGenerateButton.disabled = true;
  setMixerStatus("Generating names...", "info");
  mixerResultArea.value = "";

  try {
    await requestAiCompletion({
      model,
      key,
      prompt,
      temperature,
      webAccess,
      onContent: content => {
        mixerResultArea.value += content;
      }
    });
    setMixerStatus("Generation completed. Review the names and insert when ready.", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setMixerStatus(message || "Failed to generate names", "error");
    tip(message, true, "error", 4000);
  } finally {
    mixer.generating = false;
    mixerGenerateButton.disabled = false;
  }
}

function generateMixerNamesLocal(): void {
  const mixerCountInput = ensureEl<HTMLInputElement>("namesbaseMixerCount");
  const mixerResultArea = ensureEl<HTMLTextAreaElement>("namesbaseMixerResult");

  if (!mixer.languages.length) return tip("Please add at least one language", false, "error");

  const isoWeights: Record<string, number> = {};
  mixer.languages.forEach(lang => {
    if (lang.weight > 0) isoWeights[lang.iso] = lang.weight;
  });

  if (!Object.keys(isoWeights).length) {
    return tip("Weights must be greater than zero", false, "error");
  }

  const count = clamp(+mixerCountInput.value || 40, 5, 200);
  mixerCountInput.value = String(count);

  const getMixedByIso = (
    Names as unknown as {
      getMixedByIso?: (weights: Record<string, number>, opts: { count: number }) => string[];
    }
  ).getMixedByIso;

  if (!getMixedByIso) {
    setMixerStatus("Local Markov mixer not loaded. Please refresh the page.", "error");
    return;
  }

  try {
    const names = getMixedByIso(isoWeights, { count });
    if (!names || !names.length) {
      setMixerStatus("No names generated. Check language mapping.", "error");
      return;
    }

    mixerResultArea.value = names.join(", ");
    setMixerStatus(`Generated ${names.length} mixed names locally.`, "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setMixerStatus(message || "Failed to generate local names", "error");
    ERROR && console.error("Local mixer error:", error);
  }
}

function insertMixerNamesIntoBase(): void {
  const mixerResultArea = ensureEl<HTMLTextAreaElement>("namesbaseMixerResult");
  const mixerInsertMode = ensureEl<HTMLSelectElement>("namesbaseMixerInsertMode");

  const text = mixerResultArea.value;
  const names = parseMixerNames(text);
  if (!names.length) return tip("No generated names to insert", false, "warn");

  const textarea = ensureEl<HTMLTextAreaElement>("namesbaseTextarea");
  const mode = mixerInsertMode.value;

  const uniqueNewNames = Array.from(new Set(names)).filter(Boolean);

  if (mode === "new") {
    if (!uniqueNewNames.length) return tip("No generated names to insert", false, "warn");

    const base = Names.nameBases.length;
    const selectedIndex = +ensureEl<HTMLSelectElement>("namesbaseSelect").value || 0;
    const sourceBase = Names.nameBases[selectedIndex];

    const fallbackName = sourceBase?.name ? `${sourceBase.name} mix` : `Base${base}`;
    const generatedName = generateMixerLanguageName();
    const baseName = generatedName || fallbackName;
    const min = typeof sourceBase?.min === "number" ? sourceBase.min : 5;
    const max = typeof sourceBase?.max === "number" ? sourceBase.max : 12;
    const d = typeof sourceBase?.d === "string" ? sourceBase.d : "";
    const m = typeof sourceBase?.m === "number" ? sourceBase.m : 0;
    const b = uniqueNewNames.join(", ");

    const newBase: NameBase & { languageMixer?: boolean } = { name: baseName, i: base, min, max, d, m, b, languageMixer: true };
    Names.nameBases.push(newBase);
    if (typeof window.refreshDefaultNameBaseIds === "function") window.refreshDefaultNameBaseIds();

    createBasesList();
    const select = ensureEl<HTMLSelectElement>("namesbaseSelect");
    select.value = String(base);
    updateInputs();

    setMixerStatus(`${names.length} names added as a new language.`, "success");
    return;
  }

  const existing = textarea.value
    ? textarea.value
      .split(",")
      .map(n => n.trim())
      .filter(Boolean)
    : [];

  const combined = mode === "replace" ? names : [...existing, ...names];
  const uniqueNames = Array.from(new Set(combined)).filter(Boolean);
  textarea.value = uniqueNames.join(", ");

  updateNamesData();
  updateExamples();
  setMixerStatus(`${names.length} names ${mode === "replace" ? "replaced" : "appended"} to the base.`, "success");
}

function parseMixerNames(text: string): string[] {
  return text
    .split(/\r?\n|,/)
    .map(n => n.trim())
    .map(n => n.replace(/^[\d\.\-\)\(]+/, ""))
    .filter(n => n.length > 1);
}

function setMixerStatus(message: string, type = "info"): void {
  const mixerStatus = ensureEl<HTMLSpanElement>("namesbaseMixerStatus");
  if (!mixerStatus) return;
  const colors: Record<string, string> = { info: "", success: "green", error: "crimson", warn: "orange" };
  mixerStatus.style.color = colors[type] || "";
  mixerStatus.textContent = message;
}

// ---------------------------------------------------------------------------
// Mixer AI controls
// ---------------------------------------------------------------------------

function initMixerAiControls(): void {
  const mixerAiModelSelect = ensureEl<HTMLSelectElement>("namesbaseAiModel");
  const mixerAiTemperatureInput = ensureEl<HTMLInputElement>("namesbaseAiTemperature");
  const mixerAiKeyInput = ensureEl<HTMLInputElement>("namesbaseAiKey");
  const mixerAiKeyHelpButton = ensureEl<HTMLButtonElement>("namesbaseAiKeyHelp");
  const mixerAiWebAccessInput = ensureEl<HTMLInputElement>("namesbaseAiWebAccess");

  const loadFromStorage = (): void => {
    mixerAiModelSelect.options.length = 0;
    Object.keys(MODELS).forEach(model => mixerAiModelSelect.options.add(new Option(model, model)));

    let storedModel = localStorage.getItem("fmg-ai-model");
    if (!storedModel || !MODELS[storedModel]) {
      storedModel = DEFAULT_MODEL;
    }
    if (storedModel) mixerAiModelSelect.value = storedModel;

    let provider: Provider | null = null;
    if (storedModel) {
      provider = MODELS[storedModel] ?? null;
    }
    const key = provider ? localStorage.getItem(`fmg-ai-kl-${provider}`) || "" : "";
    mixerAiKeyInput.value = key;

    const temperature = localStorage.getItem("fmg-ai-temperature");
    mixerAiTemperatureInput.value = temperature !== null ? temperature : "1";

    const webAccess = getStoredAiWebAccess();
    mixerAiWebAccessInput.checked = webAccess;
  };

  const saveToStorage = (): void => {
    const model = mixerAiModelSelect.value;
    if (model && MODELS[model]) {
      localStorage.setItem("fmg-ai-model", model);
      const provider = MODELS[model];
      localStorage.setItem(`fmg-ai-kl-${provider}`, mixerAiKeyInput.value || "");
    }

    const temperatureNumber = mixerAiTemperatureInput.valueAsNumber;
    if (!isNaN(temperatureNumber)) {
      localStorage.setItem("fmg-ai-temperature", String(temperatureNumber));
    }

    const webAccess = mixerAiWebAccessInput.checked;
    localStorage.setItem("fmg-ai-web-access", webAccess ? "1" : "0");
  };

  mixerAiModelSelect.addEventListener("change", saveToStorage);
  mixerAiTemperatureInput.addEventListener("change", saveToStorage);
  mixerAiKeyInput.addEventListener("change", saveToStorage);
  mixerAiWebAccessInput.addEventListener("change", saveToStorage);

  mixerAiKeyHelpButton.addEventListener("click", () => {
    const model = mixerAiModelSelect.value;
    if (!model || !MODELS[model]) return;
    const provider = MODELS[model];
    if (!provider || !PROVIDERS[provider]) return;
    openURL(PROVIDERS[provider].keyLink);
  });

  loadFromStorage();
}

// ---------------------------------------------------------------------------
// AI helpers
// ---------------------------------------------------------------------------

function getStoredAiKey(): string {
  const model = getStoredAiModel();
  const provider = MODELS[model] ?? null;
  return provider ? localStorage.getItem(`fmg-ai-kl-${provider}`) || "" : "";
}

function getStoredAiModel(): string {
  let storedModel = localStorage.getItem("fmg-ai-model");
  if (!storedModel || !MODELS[storedModel]) {
    storedModel = DEFAULT_MODEL;
  }
  return storedModel;
}

function getAiProviderForModel(model: string): Provider | null {
  return MODELS[model] ?? null;
}

function getStoredAiWebAccess(): boolean {
  return localStorage.getItem("fmg-ai-web-access") === "1";
}

async function requestAiCompletion({ key, model, prompt, temperature, webAccess, onContent }: GenerationOptions): Promise<void> {
  const provider = MODELS[model];
  if (!provider || !PROVIDERS[provider]) throw new Error(`Unsupported model: ${model}`);

  // webAccess is stored for potential future use in provider-specific request shaping
  void webAccess;

  await PROVIDERS[provider].generate({ key, model, prompt, temperature, webAccess, onContent });
}

// ---------------------------------------------------------------------------
// AI provider implementations
// ---------------------------------------------------------------------------

async function generateWithOpenAI({ key, model, prompt, temperature, onContent }: GenerationOptions): Promise<void> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`
  };

  const messages = [
    { role: "system", content: "I'm working on my fantasy map." },
    { role: "user", content: prompt }
  ];

  const body: Record<string, unknown> = { model, messages, stream: true };
  const FIXED_TEMPERATURE_MODELS = new Set([
    "gpt-5.6-luna",
    "gpt-5.6-terra",
    "gpt-5.6-sol",
    "gpt-5-mini",
    "gpt-5-nano",
    "claude-opus-4-8",
    "claude-sonnet-5"
  ]);
  if (!FIXED_TEMPERATURE_MODELS.has(model)) body.temperature = temperature;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  const getContent = (json: StreamChunk): void => {
    const content = json.choices?.[0]?.delta?.content;
    if (content) onContent(content);
  };

  await handleStream(response, getContent);
}

async function generateWithAnthropic({ key, model, prompt, temperature, onContent }: GenerationOptions): Promise<void> {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  };

  const messages = [{ role: "user", content: prompt }];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      system: "I'm working on my fantasy map.",
      messages,
      max_tokens: 4096,
      stream: true,
      ...(model.startsWith("claude-opus-4") || model.startsWith("claude-sonnet-5") ? {} : { temperature })
    })
  });

  const getContent = (json: StreamChunk): void => {
    const content = json.delta?.text;
    if (content) onContent(content);
  };

  await handleStream(response, getContent);
}

async function generateWithOllama({ key, model: _model, prompt, temperature, onContent }: GenerationOptions): Promise<void> {
  void _model;
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: key,
      prompt,
      system: "I'm working on my fantasy map.",
      options: { temperature },
      stream: true
    })
  });

  const getContent = (json: StreamChunk): void => {
    if (json.response) onContent(json.response);
  };

  await handleStream(response, getContent);
}

async function handleStream(response: Response, getContent: (json: StreamChunk) => void): Promise<void> {
  if (!response.ok) {
    let errorMessage = `Failed to generate (${response.status} ${response.statusText})`;
    try {
      const json = (await response.json()) as { error?: { message?: string } | string };
      errorMessage = (typeof json.error === "object" && json.error?.message) || (typeof json.error === "string" && json.error) || errorMessage;
    } catch (error) {
      ERROR && console.error("Failed to parse AI provider error response", error);
    }
    throw new Error(errorMessage);
  }

  if (!response.body) throw new Error("Response has no body to stream");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line === "data: [DONE]") break;

      try {
        const parsed = line.startsWith("data: ") ? JSON.parse(line.slice(6)) : JSON.parse(line);
        getContent(parsed as StreamChunk);
      } catch (error) {
        ERROR && console.error("Failed to parse line:", line, error);
      }
    }

    buffer = lines.at(-1) ?? "";
  }
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const NamesbaseEditor = { open };
