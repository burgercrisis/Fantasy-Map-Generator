---
description: PDF Splitter side project
---

# PDF Splitter Side Project

## Layout
- **Folder**: `pdf_splitter/`
  - Core scripts: `pdf_splitter_gui.py`, `pdf_splitter_lib.py`, `phb_split_to_text.py`
  - Standalone entrypoints: `pdf_splitter_standalone.py`, `pdf_splitter_standalone_debug.py`
  - PyInstaller specs: `PDF_Splitter_*.spec`, `PDF_Splitter_Legacy.spec`
  - Test helpers: `test_executable.py`, `test_tkdnd.py`
  - Test PDFs: `pdf_splitter/pdfs/`
  - Build artifacts: `pdf_splitter/build/`
  - EXEs: `pdf_splitter/dist/`

## Running (Dev)
- CLI: `py pdf_splitter\phb_split_to_text.py <pdf-or-folder> [pages_per_chunk]`
- GUI script: `py pdf_splitter\pdf_splitter_gui.py`

## Standalone EXE
- Built with PyInstaller `--onefile --windowed` from `pdf_splitter_standalone.py`.
- Main deliverable: `pdf_splitter/dist/PDF_Splitter_GUI_v2.exe`
- EXE is self-contained; it embeds the core logic and does not need other project files at runtime (only user PDFs as input).

## Rebuild commands (from repo root)
- Windowed EXE:
  - `py -m PyInstaller --onefile --windowed --name "PDF_Splitter_GUI_v2" --hidden-import tkinterdnd2 --hidden-import tkinterdnd2.TkinterDnD .\pdf_splitter\pdf_splitter_standalone.py`
- Optional console/debug EXE:
  - `py -m PyInstaller --onefile --console --name "PDF_Splitter_Debug" --hidden-import tkinterdnd2 --hidden-import tkinterdnd2.TkinterDnD .\pdf_splitter\pdf_splitter_standalone_debug.py`
