"use strict";

const PROVIDERS = {
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
  },
  gemini: {
    keyLink: "https://aistudio.google.com/app/apikey",
    generate: generateWithGemini
  }
};

const DEFAULT_MODEL = "gpt-4o-mini";

const MODELS = {
  "gpt-4o-mini": "openai",
  "chatgpt-4o-latest": "openai",
  "gpt-4o": "openai",
  "gpt-4-turbo": "openai",
  o3: "openai",
  "o3-mini": "openai",
  "o3-pro": "openai",
  "o4-mini": "openai",
  "claude-opus-4-20250514": "anthropic",
  "claude-sonnet-4-20250514": "anthropic",
  "claude-3-5-haiku-latest": "anthropic",
  "claude-3-5-sonnet-latest": "anthropic",
  "claude-3-opus-latest": "anthropic",
   "gemini-1.5-flash-latest": "gemini",
   "gemini-1.5-pro-latest": "gemini",
   "gemini-1.0-pro-latest": "gemini",
  "ollama (local models)": "ollama"
};

const SYSTEM_MESSAGE = "I'm working on my fantasy map.";

async function generateWithOpenAI({key, model, prompt, temperature, onContent}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`
  };

  const messages = [
    {role: "system", content: SYSTEM_MESSAGE},
    {role: "user", content: prompt}
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({model, messages, temperature, stream: true})
  });

  const getContent = json => {
    const content = json.choices?.[0]?.delta?.content;
    if (content) onContent(content);
  };

  await handleStream(response, getContent);
}

async function generateWithGemini({key, model, prompt, temperature, onContent, webAccess}) {
  const url =
    "https://generativelanguage.googleapis.com/v1/models/" +
    encodeURIComponent(model) +
    ":streamGenerateContent?key=" +
    encodeURIComponent(key);

  const body = {
    contents: [{role: "user", parts: [{text: prompt}]}],
    generationConfig: {temperature},
    systemInstruction: {role: "system", parts: [{text: SYSTEM_MESSAGE}]}
  };

  if (webAccess) {
    body.tools = [{googleSearchRetrieval: {}}];
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  const getContent = json => {
    const candidates = json.candidates || [];
    candidates.forEach(candidate => {
      const parts = (candidate.content && candidate.content.parts) || [];
      parts.forEach(part => {
        if (part.text) onContent(part.text);
      });
    });
  };

  await handleStream(response, getContent);
}

async function generateWithAnthropic({key, model, prompt, temperature, onContent}) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  };

  const messages = [{role: "user", content: prompt}];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({model, system: SYSTEM_MESSAGE, messages, temperature, max_tokens: 4096, stream: true})
  });

  const getContent = json => {
    const content = json.delta?.text;
    if (content) onContent(content);
  };

  await handleStream(response, getContent);
}

async function generateWithOllama({key, model, prompt, temperature, onContent}) {
  const ollamaModelName = key; // for Ollama, 'key' is the actual model name entered by the user

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      model: ollamaModelName,
      prompt,
      system: SYSTEM_MESSAGE,
      options: {temperature},
      stream: true
    })
  });

  const getContent = json => {
    if (json.response) onContent(json.response);
  };

  await handleStream(response, getContent);
}

async function handleStream(response, getContent) {
  if (!response.ok) {
    let errorMessage = `Failed to generate (${response.status} ${response.statusText})`;
    try {
      const json = await response.json();
      errorMessage = json.error?.message || json.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, {stream: true});
    const lines = buffer.split("\n");

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line === "data: [DONE]") break;

      try {
        const parsed = line.startsWith("data: ") ? JSON.parse(line.slice(6)) : JSON.parse(line);
        getContent(parsed);
      } catch (error) {
        ERROR && console.error("Failed to parse line:", line, error);
      }
    }

    buffer = lines.at(-1);
  }
}

function getAiProviderForModel(model) {
  if (!model || typeof MODELS !== "object" || !MODELS) return null;
  return MODELS[model] || null;
}

function getStoredAiModel() {
  const stored = localStorage.getItem("fmg-ai-model");
  if (stored && typeof MODELS === "object" && MODELS && MODELS[stored]) {
    return stored;
  }
  return typeof DEFAULT_MODEL !== "undefined" ? DEFAULT_MODEL : stored;
}

function getStoredAiKey() {
  const model = getStoredAiModel();
  const provider = getAiProviderForModel(model);
  if (!provider) return "";
  return localStorage.getItem(`fmg-ai-kl-${provider}`) || "";
}

function getStoredAiWebAccess() {
  return localStorage.getItem("fmg-ai-web-access") === "1";
}

async function requestAiCompletion({model, key, prompt, temperature, onContent, webAccess}) {
  const finalModel = model || getStoredAiModel();
  const provider = getAiProviderForModel(finalModel);
  if (!provider || !PROVIDERS[provider]) {
    throw new Error("Selected AI model is not supported");
  }

  const finalKey = key != null && key !== "" ? key : getStoredAiKey();
  const storedTemp = +localStorage.getItem("fmg-ai-temperature") || 1;
  const finalTemperature = typeof temperature === "number" && !Number.isNaN(temperature) ? temperature : storedTemp;

  await PROVIDERS[provider].generate({
    key: finalKey,
    model: finalModel,
    prompt,
    temperature: finalTemperature,
    onContent,
    webAccess: !!webAccess
  });
}

function generateWithAi(defaultPrompt, onApply) {
  updateValues();

  $("#aiGenerator").dialog({
    title: "AI Text Generator",
    position: {my: "center", at: "center", of: "svg"},
    resizable: false,
    buttons: {
      Generate: function (e) {
        generate(e.target);
      },
      Apply: function () {
        const result = byId("aiGeneratorResult").value;
        if (!result) return tip("No result to apply", true, "error", 4000);
        onApply(result);
        $(this).dialog("close");
      },
      Close: function () {
        $(this).dialog("close");
      }
    }
  });

  if (modules.generateWithAi) return;
  modules.generateWithAi = true;

  byId("aiGeneratorKeyHelp").on("click", function (e) {
    const model = byId("aiGeneratorModel").value;
    const provider = MODELS[model];
    openURL(PROVIDERS[provider].keyLink);
  });

  const modelSelect = byId("aiGeneratorModel");
  const temperatureInput = byId("aiGeneratorTemperature");
  const keyInput = byId("aiGeneratorKey");
  const webAccessCheckbox = byId("aiGeneratorWebAccess");

  function syncGeneratorControlsToMixer() {
    const mixerModelSelect = document.getElementById("namesbaseAiModel");
    const mixerTemperatureInput = document.getElementById("namesbaseAiTemperature");
    const mixerKeyInput = document.getElementById("namesbaseAiKey");
    const mixerWebAccessInput = document.getElementById("namesbaseAiWebAccess");

    const model = modelSelect ? modelSelect.value : "";
    const temperatureValue = temperatureInput ? temperatureInput.value : "";
    const keyValue = keyInput ? keyInput.value : "";
    const webAccess = !!(webAccessCheckbox && webAccessCheckbox.checked);

    if (
      mixerModelSelect &&
      model &&
      typeof MODELS === "object" &&
      MODELS &&
      MODELS[model]
    ) {
      mixerModelSelect.value = model;
    }

    if (mixerTemperatureInput && temperatureValue !== "") {
      mixerTemperatureInput.value = temperatureValue;
    }

    if (mixerKeyInput) {
      mixerKeyInput.value = keyValue;
    }

    if (mixerWebAccessInput) {
      mixerWebAccessInput.checked = webAccess;
    }
  }

  function onGeneratorControlsChange() {
    if (modelSelect && typeof MODELS === "object" && MODELS) {
      const model = modelSelect.value;
      if (model && MODELS[model]) {
        localStorage.setItem("fmg-ai-model", model);
        const provider = MODELS[model];
        if (provider && keyInput) {
          localStorage.setItem(`fmg-ai-kl-${provider}`, keyInput.value || "");
        }
      }
    }

    if (temperatureInput) {
      const t = temperatureInput.valueAsNumber;
      if (!Number.isNaN(t)) {
        localStorage.setItem("fmg-ai-temperature", t);
      }
    }

    const webAccess = !!(webAccessCheckbox && webAccessCheckbox.checked);
    localStorage.setItem("fmg-ai-web-access", webAccess ? "1" : "0");

    syncGeneratorControlsToMixer();
  }

  if (modelSelect) modelSelect.addEventListener("change", onGeneratorControlsChange);
  if (temperatureInput) temperatureInput.addEventListener("change", onGeneratorControlsChange);
  if (keyInput) keyInput.addEventListener("change", onGeneratorControlsChange);
  if (webAccessCheckbox) webAccessCheckbox.addEventListener("change", onGeneratorControlsChange);

  function updateValues() {
    byId("aiGeneratorResult").value = "";
    byId("aiGeneratorPrompt").value = defaultPrompt;
    byId("aiGeneratorTemperature").value = localStorage.getItem("fmg-ai-temperature") || "1";

    const select = byId("aiGeneratorModel");
    select.options.length = 0;
    Object.keys(MODELS).forEach(model => select.options.add(new Option(model, model)));
    select.value = localStorage.getItem("fmg-ai-model");
    if (!select.value || !MODELS[select.value]) select.value = DEFAULT_MODEL;

    const provider = MODELS[select.value];
    byId("aiGeneratorKey").value = localStorage.getItem(`fmg-ai-kl-${provider}`) || "";

    const webAccessCheckbox = byId("aiGeneratorWebAccess");
    if (webAccessCheckbox) {
      webAccessCheckbox.checked = getStoredAiWebAccess();
    }
  }

  async function generate(button) {
    const key = byId("aiGeneratorKey").value;
    if (!key) return tip("Please enter an API key", true, "error", 4000);

    const model = byId("aiGeneratorModel").value;
    if (!model) return tip("Please select a model", true, "error", 4000);
    localStorage.setItem("fmg-ai-model", model);

    const provider = MODELS[model];
    localStorage.setItem(`fmg-ai-kl-${provider}`, key);

    const prompt = byId("aiGeneratorPrompt").value;
    if (!prompt) return tip("Please enter a prompt", true, "error", 4000);

    const temperature = byId("aiGeneratorTemperature").valueAsNumber;
    if (isNaN(temperature)) return tip("Temperature must be a number", true, "error", 4000);
    localStorage.setItem("fmg-ai-temperature", temperature);

    const webAccessCheckbox = byId("aiGeneratorWebAccess");
    const webAccess = !!(webAccessCheckbox && webAccessCheckbox.checked);
    localStorage.setItem("fmg-ai-web-access", webAccess ? "1" : "0");

    try {
      button.disabled = true;
      const resultArea = byId("aiGeneratorResult");
      resultArea.disabled = true;
      resultArea.value = "";
      const onContent = content => (resultArea.value += content);

      await PROVIDERS[provider].generate({key, model, prompt, temperature, onContent, webAccess});
    } catch (error) {
      return tip(error.message, true, "error", 4000);
    } finally {
      button.disabled = false;
      byId("aiGeneratorResult").disabled = false;
    }
  }
}
