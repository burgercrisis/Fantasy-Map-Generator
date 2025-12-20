So far what I've done is:

- Add a language mixer which can be used to "mix" different languages using the Markov system Azgaar implemented; this can be used to generate novel "languages" for placenames that truly do not exist, but may feel like they do.


- Add a small fantasy race system. It has some campaign setting sets, and integrates alongside the cultures system.

- [More detail](DEVplans/Changes-vs-Azgaar-master.md)

## MCP Configuration

This project uses MCP (Model Context Protocol) for development tooling. The `.kiro/settings/mcp.json` configuration file has been updated to use environment variables instead of hard-coded paths.

To set up your environment, create a `.env` file with the following variables:

```
# Path to the MCP hub server.js file
MCP_HUB_SERVER_PATH=/path/to/your/mcp/hub/dist/server.js

# Root directories for MCP hub projects
MCP_HUB_PROJECT_ROOTS=/path/to/your/projects

# Root directories for Git repositories
MCP_HUB_GIT_ROOTS=/path/to/your/git/repos

# Path to pnpm command (usually found via 'which pnpm' or 'where pnpm')
MCP_HUB_PNPM_CMD=/path/to/pnpm

# Root directories to verify (usually same as PROJECT_ROOTS)
MCP_HUB_VERIFY_ROOTS=/path/to/your/projects

# Path to Chrome/Chromium executable for Puppeteer
PUPPETEER_BROWSER_EXE=/path/to/chrome/executable
```

Planned (rough priority order for this fork):

- **0. Current focus:**
  - [Language Mixer Rules (authoritative)](DEVplans/Language-Mixer-Rules.md)
  - [Languages, mixer behavior across languages, and races/languages wiring](DEVplans/Races-Languages-Rules.md)
  - [Races ↔ Cultures Decoupling](DEVplans/Races-Cultures-Decoupling.md)

- **1.** [Add the Underdark](DEVplans/Underdark.md)

- **2.** [Upgrade Renderering to DeckGL Hybrid](DEVplans\Rendering-Option1-DeckGL-Hybrid.md)

- **3.** [Add Individuals](DEVplans/Individuals.md)

- **4.** [Heightmap Landforms Plan](DEVplans/Heightmap-Landforms-Plan.md)

- **5.** [Heightmap World Builder (Composite Generator) Plan](DEVplans/Heightmap-Worldbuilder.md)

- **6.** [Options Min–Max Sliders – Plan](DEVplans/Options-MinMax-Sliders.md)

- **7.** [Add a full 3.5 / Pathfinder / 5e D&D character generation system on top of Individuals](DEVplans/Characters.md)

- **8.** [Add an evolving world simulation layer (wars, rulers, borders, trade, burg lifecycle)](DEVplans/Evolving-Simulation.md)

- **9.** [Evolving simulation knobs & choices / k-NN-iffication](DEVplans/Evolving-Simulation-Choices.md)

- **00. Nice-to-have:** get Gemini API working, maybe add more AI APIs.

- **Always:** improve everything.


Status items:

- [Language system status and tooling extensions](DEVplans/Languages-Status.md)
- [Guidelines for races/languages](DEVplans/Races-Languages-Rules.md)
- [Language mixer helper tools & workflows](tools/HELPER-TOOLS.md) CLI scripts for Markov/mixer QA, coverage checks, and race language palettes.


Above is my description of what I'm doing to Azgaars dankness

Below is the original description from Azgaar


# Fantasy Map Generator

Azgaar's _Fantasy Map Generator_ is a free web application that helps fantasy writers, game masters, and cartographers create and edit fantasy maps.

Link: [azgaar.github.io/Fantasy-Map-Generator](https://azgaar.github.io/Fantasy-Map-Generator).

Refer to the [project wiki](https://github.com/Azgaar/Fantasy-Map-Generator/wiki) for guidance. The current progress is tracked in [Trello](https://trello.com/b/7x832DG4/fantasy-map-generator). Some details are covered in my old blog [_Fantasy Maps for fun and glory_](https://azgaar.wordpress.com).

[![preview](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/9502eae9-92e0-4d0d-9f17-a2ba4a565c01)](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/11a42446-4bd5-4526-9cb1-3ef97c868992)

[![preview](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/e751a9e5-7986-4638-b8a9-362395ef7583)](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/e751a9e5-7986-4638-b8a9-362395ef7583)

[![preview](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/b0d0efde-a0d1-4e80-8818-ea3dd83c2323)](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/b0d0efde-a0d1-4e80-8818-ea3dd83c2323)

Join our [Discord server](https://discordapp.com/invite/X7E84HU) and [Reddit community](https://www.reddit.com/r/FantasyMapGenerator) to share your creations, discuss the Generator, suggest ideas and get the most recent updates.

Contact me via [email](mailto:azgaar.fmg@yandex.com) if you have non-public suggestions. For bug reports please use [GitHub issues](https://github.com/Azgaar/Fantasy-Map-Generator/issues) or _#fmg-bugs_ channel on Discord. If you are facing performance issues, please read [the tips](https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Tips#performance-tips).

Pull requests are highly welcomed. The codebase is messy and requires re-design. I will appreciate if you start with minor changes. Check out the [data model](https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model) before contributing.

You can support the project on [Patreon](https://www.patreon.com/azgaar).

_Inspiration:_

- Martin O'Leary's [_Generating fantasy maps_](https://mewo2.com/notes/terrain)

- Amit Patel's [_Polygonal Map Generation for Games_](http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation)

- Scott Turner's [_Here Dragons Abound_](https://heredragonsabound.blogspot.com)




