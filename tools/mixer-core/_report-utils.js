"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function normalizeRelPath(relPath) {
  return String(relPath).replace(/\\/g, "/");
}

function resolvePath(relPath) {
  return path.isAbsolute(relPath) ? relPath : path.join(root, relPath);
}

function readText(relPath) {
  const full = resolvePath(relPath);
  return fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function writeText(relPath, contents) {
  const full = resolvePath(relPath);
  fs.mkdirSync(path.dirname(full), {recursive: true});
  fs.writeFileSync(full, contents, "utf8");
  console.log("Wrote", normalizeRelPath(relPath));
}

function writeJson(relPath, data) {
  writeText(relPath, JSON.stringify(data, null, 2) + "\n");
}

function toTsv(rows, columns) {
  const header = columns.join("\t");

  function esc(value) {
    if (value == null) return "";
    const s = String(value);
    return s.replace(/\r?\n/g, " ");
  }

  const lines = [header];
  for (const row of rows) {
    lines.push(columns.map(c => esc(row[c])).join("\t"));
  }

  return lines.join("\n") + "\n";
}

module.exports = {
  root,
  resolvePath,
  readText,
  readJson,
  writeText,
  writeJson,
  toTsv,
};
