# Technology Stack

## Core Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Graphics**: SVG-based rendering with D3.js for data visualization and map generation
- **Build System**: Node.js with pnpm package manager
- **Deployment**: Static site deployment (Netlify)

## Key Libraries & Dependencies

- **D3.js**: Core library for data-driven SVG manipulation and visualization
- **jQuery & jQuery UI**: UI components and interactions
- **Delaunator**: Delaunay triangulation for Voronoi diagrams
- **Three.js**: 3D rendering capabilities
- **JSZip**: File compression/decompression
- **Alea**: Seeded random number generation
- **TinyMCE**: Rich text editor for notes

## Architecture

- **Modular Structure**: Code organized in `/modules/` directory with specialized generators
- **Data-Driven**: Uses Voronoi diagrams and graph-based data structures
- **Client-Side Generation**: All map generation happens in the browser
- **No Backend**: Pure frontend application with local storage

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Language mixer maintenance (core workflow)
pnpm run mixer:qa                    # Quick health check
pnpm run mixer:full                  # Complete mixer rebuild
pnpm run mixer:guardrails           # Check for duplicate base indices
pnpm run mixer:apply-deltas         # Apply delta changes (single-integrator workflow)
pnpm run mixer:check-deltas         # Validate deltas without applying

# Language mixer diagnostics
pnpm run mixer:coverage             # Check ISO coverage
pnpm run mixer:failures             # Check for mapping failures  
pnpm run mixer:health               # Run health diagnostics
pnpm run mixer:namedups             # Check for name duplicates

# Race and language integration
pnpm run mixer:race-coverage        # Check race-language coverage
pnpm run mixer:race-suite           # Run race language test suite

# Namebase maintenance
pnpm run namebases:lengths          # Check namebase length statistics
```

## Development Workflow

- **Multi-agent Safety**: Use delta workflow for collaborative changes to avoid conflicts
- **Language Mixer**: Core system requires careful maintenance of mapping consistency
- **Testing**: Extensive CLI tools for validation and quality assurance
- **Version Control**: Semantic versioning with manual updates on merge to main

## File Structure

- `/modules/` - Core generation logic (biomes, cultures, states, etc.)
- `/config/` - Language mixer configuration and mappings
- `/tools/` - CLI maintenance and diagnostic scripts
- `/libs/` - Third-party libraries
- `/heightmaps/` - Predefined terrain templates