"use strict";
function editNamesbase() {
  if (customization) return;
  closeDialogs("#namesbaseEditor, .stable");
  $("#namesbaseEditor").dialog();

  if (modules.editNamesbase) return;
  modules.editNamesbase = true;

  // add listeners
  document.getElementById("namesbaseSelect").addEventListener("change", updateInputs);
  document.getElementById("namesbaseTextarea").addEventListener("change", updateNamesData);
  document.getElementById("namesbaseUpdateExamples").addEventListener("click", updateExamples);
  document.getElementById("namesbaseExamples").addEventListener("click", updateExamples);
  document.getElementById("namesbaseName").addEventListener("input", updateBaseName);
  document.getElementById("namesbaseMin").addEventListener("input", updateBaseMin);
  document.getElementById("namesbaseMax").addEventListener("input", updateBaseMax);
  document.getElementById("namesbaseDouble").addEventListener("input", updateBaseDublication);
  document.getElementById("namesbaseAdd").addEventListener("click", namesbaseAdd);
  document.getElementById("namesbaseAnalyze").addEventListener("click", analyzeNamesbase);
  document.getElementById("namesbaseDefault").addEventListener("click", namesbaseRestoreDefault);
  document.getElementById("namesbaseDownload").addEventListener("click", namesbaseDownload);

  const uploader = document.getElementById("namesbaseToLoad");
  document.getElementById("namesbaseUpload").addEventListener("click", () => {
    uploader.addEventListener("change", e => uploadFile(e.target, d => namesbaseUpload(d, true)), {once: true});
    uploader.click();
  });
  document.getElementById("namesbaseUploadExtend").addEventListener("click", () => {
    uploader.addEventListener("change", e => uploadFile(e.target, d => namesbaseUpload(d, false)), {once: true});
    uploader.click();
  });

  document.getElementById("namesbaseCA").addEventListener("click", () => {
    openURL("https://cartographyassets.com/asset-category/specific-assets/azgaars-generator/namebases/");
  });
  document.getElementById("namesbaseSpeak").addEventListener("click", () => speak(namesbaseExamples.textContent));

  // Language Mixer references
  const mixerCategorySelect = byId("namesbaseMixerCategory");
  const mixerLanguageSelect = byId("namesbaseMixerLanguage");
  const mixerAddButton = byId("namesbaseMixerAdd");
  const mixerEvenButton = byId("namesbaseMixerEven");
  const mixerSelectionBody = byId("namesbaseMixerSelection");
  const mixerCountInput = byId("namesbaseMixerCount");
  const mixerGenerateButton = byId("namesbaseMixerGenerate");
  const mixerGenerateLocalButton = byId("namesbaseMixerGenerateLocal");
  const mixerResultArea = byId("namesbaseMixerResult");
  const mixerInsertButton = byId("namesbaseMixerInsert");
  const mixerInsertMode = byId("namesbaseMixerInsertMode");
  const mixerStatus = byId("namesbaseMixerStatus");

  const mixer = {
    catalog: null,
    languages: [],
    generating: false
  };

  function clamp(value, min, max) {
    const v = isNaN(value) ? min : value;
    return Math.min(max, Math.max(min, v));
  }

  if (mixerLanguageSelect) initLanguageMixer();

  createBasesList();
  updateInputs();

  $("#namesbaseEditor").dialog({
    title: "Namesbase Editor",
    width: "60vw",
    position: {my: "center", at: "center", of: "svg"}
  });

  function createBasesList() {
    const select = document.getElementById("namesbaseSelect");
    select.innerHTML = "";
    nameBases.forEach((b, i) => select.options.add(new Option(b.name, i)));
  }

  function updateInputs() {
    const base = +document.getElementById("namesbaseSelect").value;
    if (!nameBases[base]) return tip(`Namesbase ${base} is not defined`, false, "error");

    document.getElementById("namesbaseTextarea").value = nameBases[base].b;
    document.getElementById("namesbaseName").value = nameBases[base].name;
    document.getElementById("namesbaseMin").value = nameBases[base].min;
    document.getElementById("namesbaseMax").value = nameBases[base].max;
    document.getElementById("namesbaseDouble").value = nameBases[base].d;
    updateExamples();
  }

  function updateExamples() {
    const base = +document.getElementById("namesbaseSelect").value;
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
    document.getElementById("namesbaseExamples").innerHTML = examples;
  }

  function updateNamesData() {
    const base = +document.getElementById("namesbaseSelect").value;
    const input = document.getElementById("namesbaseTextarea");
    if (input.value.split(",").length < 3)
      return tip("The names data provided is too short of incorrect", false, "error");

    const securedNamesData = input.value.replace(/[/|]/g, "");
    nameBases[base].b = securedNamesData;
    input.value = securedNamesData;
    Names.updateChain(base);
  }

  function updateBaseName() {
    const base = +document.getElementById("namesbaseSelect").value;
    const select = document.getElementById("namesbaseSelect");

    const rawName = this.value;
    const name = rawName.replace(/[/|]/g, "");

    select.options[namesbaseSelect.selectedIndex].innerHTML = name;
    nameBases[base].name = name;
  }

  function updateBaseMin() {
    const base = +document.getElementById("namesbaseSelect").value;
    if (+this.value > nameBases[base].max) return tip("Minimal length cannot be greater than maximal", false, "error");
    nameBases[base].min = +this.value;
  }

  function updateBaseMax() {
    const base = +document.getElementById("namesbaseSelect").value;
    if (+this.value < nameBases[base].min) return tip("Maximal length should be greater than minimal", false, "error");
    nameBases[base].max = +this.value;
  }

  function updateBaseDublication() {
    const base = +document.getElementById("namesbaseSelect").value;
    nameBases[base].d = this.value;
  }

  function analyzeNamesbase() {
    const namesSourceString = document.getElementById("namesbaseTextarea").value;
    const namesArray = namesSourceString.toLowerCase().split(",");
    const length = namesArray.length;
    if (!namesSourceString || !length) return tip("Names data should not be empty", false, "error");

    const chain = Names.calculateChain(namesSourceString);
    const variety = rn(d3.mean(Object.values(chain).map(keyValue => keyValue.length)));

    const wordsLength = namesArray.map(n => n.length);

    const nonLatin = namesSourceString.match(/[^\u0000-\u007f]/g);
    const nonBasicLatinChars = nonLatin
      ? unique(
          namesSourceString
            .match(/[^\u0000-\u007f]/g)
            .join("")
            .toLowerCase()
        ).join("")
      : "none";

    const geminate = namesArray.map(name => name.match(/[^\w\s]|(.)(?=\1)/g) || []).flat();
    const doubled = unique(geminate).filter(
      char => geminate.filter(doudledChar => doudledChar === char).length > 3
    ) || ["none"];

    const duplicates = unique(namesArray.filter((e, i, a) => a.indexOf(e) !== i)).join(", ") || "none";
    const multiwordRate = d3.mean(namesArray.map(n => +n.includes(" ")));

    const getLengthQuality = () => {
      if (length < 30)
        return "<span data-tip='Namesbase contains < 30 names - not enough to generate reasonable data' style='color:red'>[not enough]</span>";
      if (length < 100)
        return "<span data-tip='Namesbase contains < 100 names - not enough to generate good names' style='color:darkred'>[low]</span>";
      if (length <= 400)
        return "<span data-tip='Namesbase contains a reasonable number of samples' style='color:green'>[good]</span>";
      return "<span data-tip='Namesbase contains > 400 names. That is too much, try to reduce it to ~300 names' style='color:darkred'>[overmuch]</span>";
    };

    const getVarietyLevel = () => {
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
      <div data-tip="The shortest name length">Min name length: ${d3.min(wordsLength)}</div>
      <div data-tip="The longest name length">Max name length: ${d3.max(wordsLength)}</div>
      <div data-tip="Average name length">Mean name length: ${rn(d3.mean(wordsLength), 1)}</div>
      <div data-tip="Common name length">Median name length: ${d3.median(wordsLength)}</div>
      <hr />
      <div data-tip="Characters outside of Basic Latin have bad font support">Non-basic chars: ${nonBasicLatinChars}</div>
      <div data-tip="Characters that are frequently (more than 3 times) doubled">Doubled chars: ${doubled.join(
        ""
      )}</div>
      <div data-tip="Names used more than one time">Duplicates: ${duplicates}</div>
      <div data-tip="Percentage of names containing space character">Multi-word names: ${rn(
        multiwordRate * 100,
        2
      )}%</div>
    </div>`;

    $("#alert").dialog({
      resizable: false,
      title: "Data Analysis",
      position: {my: "left top-30", at: "right+10 top", of: "#namesbaseEditor"},
      buttons: {
        OK: function () {
          $(this).dialog("close");
        }
      }
    });
  }

  function namesbaseAdd() {
    const base = nameBases.length;
    const b =
      "This,is,an,example,of,name,base,showing,correct,format,It,should,have,at,least,one,hundred,names,separated,with,comma";
    nameBases.push({name: "Base" + base, min: 5, max: 12, d: "", m: 0, b});
    document.getElementById("namesbaseSelect").add(new Option("Base" + base, base));
    document.getElementById("namesbaseSelect").value = base;
    document.getElementById("namesbaseTextarea").value = b;
    document.getElementById("namesbaseName").value = "Base" + base;
    document.getElementById("namesbaseMin").value = 5;
    document.getElementById("namesbaseMax").value = 12;
    document.getElementById("namesbaseDouble").value = "";
    document.getElementById("namesbaseExamples").innerHTML = "Please provide names data";
  }

  function namesbaseRestoreDefault() {
    alertMessage.innerHTML = /* html */ `Are you sure you want to restore default namesbase?`;
    $("#alert").dialog({
      resizable: false,
      title: "Restore default data",
      buttons: {
        Restore: function () {
          $(this).dialog("close");
          Names.clearChains();
          nameBases = Names.getNameBases();
          createBasesList();
          updateInputs();
        },
        Cancel: function () {
          $(this).dialog("close");
        }
      }
    });
  }

  function namesbaseDownload() {
    const data = nameBases.map((b, i) => `${b.name}|${b.min}|${b.max}|${b.d}|${b.m}|${b.b}`).join("\r\n");
    const name = getFileName("Namesbase") + ".txt";
    downloadFile(data, name);
  }

  function namesbaseUpload(dataLoaded, override = true) {
    const data = dataLoaded.split("\r\n");
    if (!data || !data[0]) return tip("Cannot load a namesbase. Please check the data format", false, "error");

    Names.clearChains();
    if (override) nameBases = [];
    const unsafe = new RegExp(/[|/]/, "g");

    data.forEach(base => {
      const [rawName, min, max, d, m, rawNames] = base.split("|");
      const name = rawName.replace(unsafe, "");
      const names = rawNames.replace(unsafe, "");
      nameBases.push({name, min: +min, max: +max, d, m: +m, b: names});
    });

    createBasesList();
    updateInputs();
  }

  function initLanguageMixer() {
    loadMixerCatalog().then(() => {
      renderMixerCategories();
      renderMixerLanguageOptions();
    });

    mixerCategorySelect?.addEventListener("change", () => {
      renderMixerLanguageOptions();
    });

    mixerAddButton?.addEventListener("click", e => {
      e.preventDefault();
      addLanguageToMix(mixerLanguageSelect.value);
    });

    mixerEvenButton?.addEventListener("click", e => {
      e.preventDefault();
      distributeMixerWeights();
    });

    mixerGenerateButton?.addEventListener("click", e => {
      e.preventDefault();
      generateMixerNames();
    });

    mixerGenerateLocalButton?.addEventListener("click", e => {
      e.preventDefault();
      generateMixerNamesLocal();
    });

    mixerInsertButton?.addEventListener("click", e => {
      e.preventDefault();
      insertMixerNamesIntoBase();
    });

    renderMixerSelection();
  }

  async function loadMixerCatalog() {
    if (mixer.catalog) return mixer.catalog;
    if (window.languageMixerCatalog) {
      // Ensure the preloaded catalog is sorted the same way as fetched data
      mixer.catalog = window.languageMixerCatalog.sort((a, b) => (a.region + a.name).localeCompare(b.region + b.name));
      return mixer.catalog;
    }

    try {
      const res = await fetch(`./config/language-mixes.json?v=${VERSION}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      mixer.catalog = data.sort((a, b) => (a.region + a.name).localeCompare(b.region + b.name));
      window.languageMixerCatalog = mixer.catalog;
    } catch (error) {
      tip("Cannot load language catalog. Please reload the app.", false, "error");
      ERROR && console.error(error);
      mixer.catalog = [];
    }

    return mixer.catalog;
  }

  function renderMixerCategories() {
    if (!mixerCategorySelect || !mixer.catalog) return;
    const categories = Array.from(new Set(mixer.catalog.map(lang => lang.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
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

  function formatMixerTagBadge(meta, inline = false) {
    if (!meta || !meta.tags || !meta.tags.length) return "";
    const tags = [];
    if (meta.tags.includes("extinct")) tags.push("extinct");
    if (meta.tags.includes("pidgin")) tags.push("pidgin");
    if (meta.tags.includes("mixed")) tags.push("mixed");
    if (meta.tags.includes("creole")) tags.push("creole");
    if (meta.tags.includes("unclassified")) tags.push("unclassified");
    if (!tags.length) return "";
    const label = `[${tags.join(", ")}]`;
    if (inline) return label;
    return `<span style="opacity:.7;font-size:.85em">${label}</span>`;
  }

  function formatMixerLabel(meta) {
    if (!meta) return "";
    const parts = [meta.name || meta.iso];
    if (meta.region) parts.push(`• ${meta.region}`);
    const badge = formatMixerTagBadge(meta, true);
    return badge ? `${parts.join(" ")} ${badge}` : parts.join(" ");
  }

  function renderMixerLanguageOptions() {
    if (!mixerLanguageSelect || !mixer.catalog) return;
    mixerLanguageSelect.innerHTML = "";
    const selectedCategory = mixerCategorySelect?.value || "";
    const options = selectedCategory ? mixer.catalog.filter(lang => lang.category === selectedCategory) : mixer.catalog;
    options.forEach(lang => {
      const option = document.createElement("option");
      option.value = lang.iso;
      option.textContent = formatMixerLabel(lang);
      mixerLanguageSelect.append(option);
    });
  }

  function addLanguageToMix(iso) {
    if (!iso) return;
    if (mixer.languages.some(lang => lang.iso === iso)) {
      return tip("Language already added to the mix", false, "warn");
    }
    mixer.languages.push({iso, weight: 1});
    renderMixerSelection();
  }

  function renderMixerSelection() {
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
          <small>${[meta?.category, meta?.subgroup].filter(Boolean).join(" • ")}</small>
        </td>
        <td>${meta?.region || ""}</td>
        <td>
          <input type="number" min="1" max="1000" value="${lang.weight}" class="namesbaseMixerWeight" style="width:5em" />
        </td>
        <td>
          <button class="icon-trash-empty namesbaseMixerRemove" data-iso="${lang.iso}" data-tip="Remove language"></button>
        </td>
      `;
      mixerSelectionBody.append(row);
    });

    mixerSelectionBody.querySelectorAll(".namesbaseMixerWeight").forEach(input => {
      input.addEventListener("input", function () {
        const iso = this.closest("tr").dataset.iso;
        const lang = mixer.languages.find(l => l.iso === iso);
        const value = +this.value;
        lang.weight = value > 0 ? value : 1;
      });
    });

    mixerSelectionBody.querySelectorAll(".namesbaseMixerRemove").forEach(button => {
      button.addEventListener("click", () => {
        mixer.languages = mixer.languages.filter(l => l.iso !== button.dataset.iso);
        renderMixerSelection();
      });
    });
  }

  function distributeMixerWeights() {
    if (!mixer.languages.length) {
      return tip("Add languages before distributing weights", false, "warn");
    }
    mixer.languages.forEach(lang => (lang.weight = 1));
    renderMixerSelection();
  }

  function getMixerMeta(iso) {
    return mixer.catalog?.find(lang => lang.iso === iso);
  }

  async function generateMixerNames() {
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
    mixerCountInput.value = count;

    const breakdown = mixer.languages
      .map(lang => {
        const meta = getMixerMeta(lang.iso);
        const pct = Math.round((lang.weight / totalWeight) * 100);
        return `${meta?.name || lang.iso} (${pct}% mix, region ${meta?.region || "N/A"}, category ${
          meta?.category || "N/A"
        })`;
      })
      .join("; ");

    const prompt = `
Generate ${count} unique fantasy place names. Names must feel like a blend of these language families with the given weights: ${breakdown}.
Guidelines:
- Return a comma-separated list only, no numbering or extra prose.
- Names should be 1-3 words, title case, 3-16 characters per word.
- Avoid diacritics that are not ASCII.
- Do not repeat names, and keep them pronounceable.
    `.trim();

    const temperature = +localStorage.getItem("fmg-ai-temperature") || 0.9;
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
        onContent: content => {
          mixerResultArea.value += content;
        }
      });
      setMixerStatus("Generation completed. Review the names and insert when ready.", "success");
    } catch (error) {
      setMixerStatus(error.message || "Failed to generate names", "error");
      tip(error.message, true, "error", 4000);
    } finally {
      mixer.generating = false;
      mixerGenerateButton.disabled = false;
    }
  }

  function generateMixerNamesLocal() {
    if (!mixer.languages.length) return tip("Please add at least one language", false, "error");

    const isoWeights = mixer.languages.reduce((acc, lang) => {
      if (lang.weight > 0) acc[lang.iso] = lang.weight;
      return acc;
    }, {});

    if (!Object.keys(isoWeights).length) {
      return tip("Weights must be greater than zero", false, "error");
    }

    const count = clamp(+mixerCountInput.value || 40, 5, 200);
    mixerCountInput.value = count;

    if (!Names.getMixedByIso) {
      setMixerStatus("Local Markov mixer not loaded. Please refresh the page.", "error");
      return;
    }

    try {
      const names = Names.getMixedByIso(isoWeights, {count});
      if (!names || !names.length) {
        setMixerStatus("No names generated. Check language mapping.", "error");
        return;
      }

      mixerResultArea.value = names.join(", ");
      setMixerStatus(`Generated ${names.length} mixed names locally.`, "success");
    } catch (error) {
      setMixerStatus(error.message || "Failed to generate local names", "error");
      ERROR && console.error("Local mixer error:", error);
    }
  }

  function insertMixerNamesIntoBase() {
    const text = mixerResultArea.value;
    const names = parseMixerNames(text);
    if (!names.length) return tip("No generated names to insert", false, "warn");

    const textarea = document.getElementById("namesbaseTextarea");
    const mode = mixerInsertMode.value;

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

  function parseMixerNames(text) {
    return text
      .split(/\r?\n|,/)
      .map(n => n.trim())
      .map(n => n.replace(/^[\d\.\-\)\(]+/, ""))
      .filter(n => n.length > 1);
  }

  function setMixerStatus(message, type = "info") {
    if (!mixerStatus) return;
    const colors = {info: "", success: "green", error: "crimson", warn: "orange"};
    mixerStatus.style.color = colors[type] || "";
    mixerStatus.textContent = message;
  }
}
