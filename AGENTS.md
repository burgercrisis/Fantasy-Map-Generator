# Fantasy Map Generator - Agent Development Guide

## Development Environment
- **Static web app - NO BUILD PROCESS** - direct file editing only
- Run with HTTP server: `python3 -m http.server 8000` (never file://)
- Access at: `http://localhost:8000` (startup takes 2-3 seconds)
- Multi-agent language mixer coordination: see `DEVplans/Language-Mixer-Compliance.md`
- Always reference this guide before searching or using bash

## Commands
### Testing
- `pnpm test` - Run all tests (Jest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run with coverage report (70% thresholds)
- `jest <path-to-test-file>` - Run specific test file
- `pnpm test:normalize` - Run single test: `tools/mixer-core/normalize-language-names.test.js`
- `pnpm test:placenames` - Run placename tests with custom config

### Language Mixer Tools (Primary Domain)
- `pnpm mixer:qa` - Full QA (diff + coverage)
- `pnpm mixer:full` - Complete regeneration pipeline
- `pnpm mixer:full-with-normalize` - Full pipeline with name normalization
- `pnpm mixer:health` - Run health checks
- `pnpm mixer:doctor` - Comprehensive diagnostics
- `pnpm mixer:guardrails` - Check language mixer guardrails
- `pnpm mixer:apply-deltas` - Apply mixer deltas to namebases (requires guardrails check)
- `pnpm mixer:check-deltas` - Check delta conflicts without applying

## Code Style
### JavaScript - General
- **Strict mode**: Always start files with `"use strict";`
- **Comments**: Keep them minimal and focused on WHY, not WHAT
- **No build tools**: Direct file editing, browser refresh for changes
- **Formatting**: Use tabs for indentation (observed in modules/)

### Module Pattern
- **Browser modules**: Use IIFE pattern: `window.ModuleName = (function () { ... })`
- **Global variables**: Attach to `window.ModuleName` or use `const/let` in main scope
- **Node.js tools**: Use CommonJS: `const fs = require("node:fs");`
- **No ES6 imports** in main app code (loaded via `<script>` tags in index.html)
- **Node.js tools can use ES6 imports** (observed in test files)

### Naming Conventions
- **Constants**: UPPER_SNAKE_CASE (e.g., `UINT16_MAX`, `ROUTES_SHARP_ANGLE`, `DEEPER_LAND`)
- **Functions**: camelCase, descriptive names (e.g., `generateMainRoads`, `clipPoly`, `markupGrid`)
- **Classes**: PascalCase for constructors/exports (e.g., `LanguageNameAnalyzer`, `LanguageNameResolver`)
- **Variables**: camelCase (e.g., `burgsByFeature`, `minSegment`, `cellsNumber`)
- **Module globals**: PascalCase attached to window (e.g., `window.Features`, `window.Routes`)

### Error Handling
- **Conditional logging**: Use `ERROR && console.error("message")` pattern
- **Debug flags**: `DEBUG`, `INFO`, `TIME`, `WARN`, `ERROR` defined in main.js
- **Silent errors**: For non-critical issues, use conditional `ERROR && console.error()`
- **Node.js tools**: Use `console.error()` for fatal errors (no conditional needed)
- **Time measurement**: Use `TIME && console.time("label")` and `TIME && console.timeEnd("label")`

### File Organization
- **Core**: `index.html`, `main.js`, `versioning.js`
- **Modules**: `modules/` - core functionality (biomes, routes, cultures, etc.)
- **UI**: `modules/ui/` - UI components (editors, tools, style management)
- **Dynamic**: `modules/dynamic/` - runtime modules (export, installation)
- **Renderers**: `modules/renderers/` - drawing and rendering logic
- **Utils**: `utils/` - pure utility functions (math, arrays, strings, debugging)
- **Tools**: `tools/` - Node.js CLI scripts for language mixer and diagnostics
- **Config**: `config/` - Heightmap templates and language mixer configurations

### Version Management
- Update `versioning.js` for all changes
- Update file hashes in `index.html`: `file.js?v=1.108.1`
- Semantic versioning: major.minor.patch (major=incompatible, minor=backward-compat additions, patch=bug fixes)

## Testing Guidelines
- Tests primarily in `tools/mixer-core/` directory
- Jest configuration enforces 70% coverage thresholds (branches, functions, lines, statements)
- 10s timeout for property-based tests
- Use fast-check for property-based testing (configured in jest.setup.js)
- Test structure: `describe()`, `test()`, `beforeEach()` patterns
- Custom matchers in jest.setup.js: `toBeValidLanguageName`, `toBeShortName`
- Fast-check configured with `numRuns: 100` and `seed: 42` for reproducibility

## Validation Requirements
ALWAYS validate changes by:
1. Starting HTTP server (wait 2-3 seconds for full startup - NEVER cancel)
2. Generate new map and verify: countries, cities, roads, geography
3. Test UI: Layers button, layer controls work
4. Test regeneration: New Map! button works
5. Check browser console for errors
6. Map generation should complete in ~1 second

## Known Constraints & Workflows
- External resources (Google Analytics, fonts) may fail - this is normal
- Multi-agent language mixer: follow `.windsurf/workflows/` and compliance docs
- `/continue` command resumes language mixer workstream unless user specifies otherwise
- **Never run git commands** (status, diff, commit, etc.) unless explicitly requested by user
- **Lock management**: Acquire `mcp1_lock_acquire` for shared files, release immediately after editing
- **Single-integrator lane**: Only integrator runs `pnpm run mixer:apply-deltas`

## Code Patterns
- D3.js for DOM manipulation and SVG rendering
- jQuery for UI dialogs (`.dialog()`, `.each()`)
- Global `pack` object stores map data
- Debug mode visualization uses `debug.selectAll()` pattern
- Array utilities use functional patterns (`map`, `filter`, `reduce`)
- Typed arrays for performance: `Int8Array`, `Uint16Array`, `Uint32Array`
- Graph operations using `grid.cells` structure with typed arrays
