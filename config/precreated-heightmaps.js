"use strict";

// Precreated heightmaps provide real-world geographical starting points for map generation.
// Each entry corresponds to a PNG file in the heightmaps/ directory with the same key name.
// These heightmaps are derived from real elevation data and can be used as templates for more realistic maps.
// The id field is used for internal referencing and must be unique.
const precreatedHeightmaps = {
  "africa-centric": {id: 0, name: "Africa Centric"},
  arabia: {id: 1, name: "Arabia"},
  atlantics: {id: 2, name: "Atlantics"},
  britain: {id: 3, name: "Britain"},
  caribbean: {id: 4, name: "Caribbean"},
  "east-asia": {id: 5, name: "East Asia"},
  eurasia: {id: 6, name: "Eurasia"},
  europe: {id: 7, name: "Europe"},
  "europe-accented": {id: 8, name: "Europe Accented"},
  "europe-and-central-asia": {id: 9, name: "Europe and Central Asia"},
  "europe-central": {id: 10, name: "Europe Central"},
  "europe-north": {id: 11, name: "Europe North"},
  greenland: {id: 12, name: "Greenland"},
  hellenica: {id: 13, name: "Hellenica"},
  iceland: {id: 14, name: "Iceland"},
  "indian-ocean": {id: 15, name: "Indian Ocean"},
  "mediterranean-sea": {id: 16, name: "Mediterranean Sea"},
  "middle-east": {id: 17, name: "Middle East"},
  "north-america": {id: 18, name: "North America"},
  "us-centric": {id: 19, name: "US-centric"},
  "us-mainland": {id: 20, name: "US Mainland"},
  world: {id: 21, name: "World"},
  "world-from-pacific": {id: 22, name: "World from Pacific"}
};
