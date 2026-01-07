"use strict";

/**
 * Report Utilities Module
 * 
 * Shared utility functions for reading/writing files and generating reports.
 * Provides consistent file I/O operations across mixer tools.
 * 
 * Usage:
 *   const { readJson, writeJson, toTsv } = require("./_report-utils");
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

/**
 * Normalizes relative path separators for consistent output
 * @param {string} relPath - Path to normalize
 * @returns {string} Path with forward slashes
 */
function normalizeRelPath(relPath) {
  return String(relPath).replace(/\\/g, "/");
}

/**
 * Resolves relative path to absolute path
 * @param {string} relPath - Relative path from project root
 * @returns {string} Absolute path
 */
function resolvePath(relPath) {
  return path.isAbsolute(relPath) ? relPath : path.join(root, relPath);
}

/**
 * Reads text file content, removing BOM if present
 * @param {string} relPath - Relative path to file
 * @returns {string} File contents
 */
function readText(relPath) {
  const full = resolvePath(relPath);
  return fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
}

/**
 * Reads and parses JSON file
 * @param {string} relPath - Relative path to JSON file
 * @returns {Object} Parsed JSON object
 */
function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

/**
 * Writes text content to file
 * @param {string} relPath - Relative path to target file
 * @param {string} contents - Content to write
 */
function writeText(relPath, contents) {
  const full = resolvePath(relPath);
  fs.mkdirSync(path.dirname(full), {recursive: true});
  fs.writeFileSync(full, contents, "utf8");
  console.log("Wrote", normalizeRelPath(relPath));
}

/**
 * Writes JSON data to file with formatting
 * @param {string} relPath - Relative path to target file
 * @param {Object} data - Data to write as JSON
 */
function writeJson(relPath, data) {
  writeText(relPath, JSON.stringify(data, null, 2) + "\n");
}

/**
 * Converts array of objects to TSV format
 * @param {Array} rows - Array of objects to convert
 * @param {Array} columns - Column names to include
 * @returns {string} TSV formatted string
 */
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
