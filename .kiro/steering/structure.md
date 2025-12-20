# Project Structure

## Root Level Files

- `index.html` - Main application entry point with SVG canvas and UI structure
- `main.js` - Core application initialization and map generation orchestration
- `package.json` - Node.js dependencies and npm scripts for language mixer tools
- `versioning.js` - Version management and update notifications
- `manifest.webmanifest` - PWA configuration for installable web app

## Core Directories

### `/modules/` - Generation Logic
Modular JavaScript files containing specialized map generation systems:
- `biomes.js`, `cultures-generator.js`, `burgs-and-states.js` - Core world generation
- `names-generator.js`, `names-mixer.js` - Name generation and language mixing
- `races.js` - Fantasy race system integration
- `heightmap-generator.js` - Terrain generation
- `religions-generator.js`, `military-generator.js` - Specialized generators
- `/dynamic/`, `/io/`, `/renderers/`, `/ui/` - Subdirectories for specific concerns

### `/config/` - Language Mixer Configuration
Critical configuration files for the language mixing system:
- `language-mixer-map.json` - ISO code to namebase index mappings
- `language-mixes.json` - Language catalog for mixer UI
- `language-mixes-all.js` - Generated bundle for browser consumption
- `heightmap-templates.js` - Predefined terrain configurations

### `/tools/` - Development & Maintenance Scripts
Extensive CLI tooling organized by function:
- `/mixer-core/` - Core language mixer maintenance and validation
- `/mixer-catalog/` - Language catalog management and expansion
- `/mixer-diagnostics/` - Health checks and cleanup utilities
- `/mixer-races/` - Race-language integration tools
- `/mixer-deltas/` - Delta-based collaborative workflow support
- `HELPER-TOOLS.md` - Comprehensive documentation of all CLI tools

### `/DEVplans/` - Development Documentation
Planning documents and status tracking:
- Development roadmaps and feature specifications
- Language system compliance and rules documentation
- Architecture decision records and migration plans

## Asset Directories

### `/charges/` - Heraldic Elements
SVG files for coat of arms and emblems (300+ heraldic charges)

### `/heightmaps/` - Terrain Templates
PNG heightmaps for real-world inspired terrain generation

### `/images/` - UI Assets
Icons, patterns, textures, and social media assets

### `/libs/` - Third-party Libraries
External JavaScript libraries and dependencies

### `/styles/` - CSS Stylesheets
Application styling and themes

## Key Architectural Patterns

- **Generator Pattern**: Each major system (cultures, religions, military) has its own generator module
- **Data-Driven**: Heavy use of JSON configuration files for customizable behavior
- **CLI-First Tooling**: Extensive command-line tools for maintenance and validation
- **Delta Workflow**: Collaborative editing system using delta files to avoid conflicts
- **Modular Loading**: Dynamic imports for performance optimization

## File Naming Conventions

- Generator modules: `*-generator.js`
- Configuration files: `*.json` for data, `*.js` for generated bundles
- Tool scripts: Organized in themed subdirectories under `/tools/`
- Assets: Descriptive names with appropriate extensions (`.svg`, `.png`, `.css`)

## Development Workflow Files

- `.tmp-*` files - Temporary diagnostic outputs (should not be committed)
- `/tmp/` - Temporary working directory
- Delta files in `/tools/mixer-deltas/` - Collaborative change management