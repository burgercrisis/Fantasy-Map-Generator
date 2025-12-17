# PDF Splitter – C# WinForms Rewrite

_Last updated: 2025-12-10_

Status (2025-12-17): Prevented blank BOM-only `textpdf` outputs by inserting `[NO_TEXT_EXTRACTED ...]` placeholders when extraction yields no text, and writing output as UTF-8 without BOM.

Status (2025-12-17): Added OCR fallback (when text extraction yields nothing) by invoking external `pdftoppm` (Poppler) + `tesseract` if present on PATH. Requires rebuilding the EXE to take effect.

Status (2025-12-17): Added `--split` headless CLI mode (with `--page-from/--page-to`) to enable reproducible OCR runs. Verified OCR output for Aasimar/Tiefling PDF pages 51–60; added normalization for common mojibake sequences (e.g. `â€™` -> `’`).

## 1. Goal

Replace the Python/pdfplumber-based PDF-to-text chunker with a **C#/.NET WinForms** tool that:

- Splits one or many PDFs into text chunks of N pages each.
- Writes outputs under a `textpdf/<safe-stem>/` folder, matching the Python behavior.
- Ships as a **single-file, self-contained EXE** for Windows.

## 2. Project location & components

- **Folder:** `pdf_splitter/`
- **Project:** `PdfSplitter.csproj` (WinForms, `net8.0-windows`)
- **Main entry:** `Program.cs` → `MainForm`
- **UI:** `MainForm.cs` + `MainForm.Designer.cs`
- **PDF library:** `UglyToad.PdfPig` (NuGet)

Behavior is intentionally parallel to `pdf_splitter_lib.process_pdf` + `phb_split_to_text.py`:

- Accept a **single PDF file** or a **folder of PDFs**.
- Use a **pages-per-chunk** setting (default 10) to group pages.
- Output chunked `.txt` files with names like `stem_p001-p010.txt` and an `"----- PAGE BREAK -----"` separator between pages in each chunk.

## 3. Building & running

### 3.1 From Visual Studio

1. Open `pdf_splitter/PdfSplitter.csproj` as a project/solution.
2. Restore NuGet packages when prompted (PdfPig).
3. Build and run:
   - F5: debug run.
   - Ctrl+F5: run without debugger.

### 3.2 From command line (PowerShell, cwd = repo root)

```powershell
# build & run (debug)
dotnet build .\pdf_splitter\PdfSplitter.csproj

dotnet run --project .\pdf_splitter\PdfSplitter.csproj
```

## 4. Single-file, self-contained publish

The `.csproj` is configured for:

- `TargetFramework`: `net8.0-windows`
- `PublishSingleFile = true`
- `SelfContained = true`
- `RuntimeIdentifier = win-x64`

To publish a release EXE (PowerShell, cwd = repo root):

```powershell
# produce a single EXE in pdf_splitter\bin\Release\net8.0-windows\win-x64\publish

dotnet publish .\pdf_splitter\PdfSplitter.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

Result:

- A single Windows EXE that users can run without installing .NET.
- Size will be larger than the Python script, but deployment is just “hand them the EXE”.

## 5. Current UI/behavior

MainForm v1 includes:

- **Input path textbox**: accepts either a file path or a folder path.
- **Browse button**: opens a file picker for a single `.pdf` file.
- **Pages-per-chunk numeric up-down**: 1–500, default 10.
- **Run button**:
  - If input is a file: processes that PDF.
  - If input is a folder: processes all `*.pdf` in that folder (non-recursive).
- **Log textbox**: shows progress (`Processing ...`, `Wrote ...`, `Done.`) and any error messages.

Output location:

- If input is a file: `textpdf` folder beside the file.
- If input is a folder: `textpdf` inside that folder.

## 6. Open choices & future tweaks

- **Choice: UX polish vs minimalism**
  - Minimal (current): single-screen, text path, basic log.
  - Future: drag-and-drop support, progress bar, cancellation, recent paths.

- **Choice: PDF engine features**
  - Current: basic text extraction only (via PdfPig’s `page.Text`).
  - Future: add options for per-page export, handling images, or alternate text extractors.

- **Choice: deployment footprint**
  - Current: `SelfContained=true`, `PublishSingleFile=true` → larger but standalone EXE.
  - Future option: disable `SelfContained` for smaller EXE on machines that already have .NET 8.

## 7. Recommended next steps

1. **Sanity-test the C# splitter** on a few real PDFs:
   - Compare output text folders vs the Python version on the same inputs.
2. **Decide UX upgrades** (if any): drag-and-drop, per-file status, multi-threading.
3. **Finalize deployment**: choose target RID(s) and whether to keep `SelfContained` for all users.
4. When satisfied, **mark the Python splitter as legacy** in this file and/or in the repo docs, pointing to the new EXE.

## 8. TOC / leader line behavior

- When **Wrap lines** is enabled, any line that ends with digits and has a run of `.` immediately before the page number (e.g., `Chapter One .......................... 12`) is **pre-trimmed** so that the visible part of the line (including the number) does not exceed the configured max line length.
- Only the dot run is shortened; the label text and trailing number are preserved.
- This trimming runs before the generic word-wrapping reflow, to help keep TOC-style entries on a single line instead of wrapping awkwardly.

## 9. Developer test harness

- The main `PdfSplitter` WinForms project also exposes a small **console harness** for testing the wrapping / leader-trimming behavior without running the GUI.
- Usage (from repo root):
  - `dotnet run --project .\pdf_splitter\PdfSplitter.csproj -- --wrap-test 40 "CREDITS .........................................1"`
    - First argument after `--wrap-test` is the wrap width.
    - Remaining arguments are joined into the input text.
- If you pass only `--wrap-test` with no extra args, the harness runs in **interactive mode**, prompting for a width and multi-line input (terminated by an empty line) and then printing the wrapped output.

- Additionally, the `wrap_harness` console project provides a **TOC-focused harness** for experimenting with leader trimming and multi-line TOC merges:
  - `dotnet run --project .\pdf_splitter\wrap_harness\PdfSplitter.Harness.csproj -- toc 40`
    - Prompts for multi-line TOC input (end with an empty line), then runs `WrapText` and the TOC merge pass (`MergeTocLinesInPages`) and prints the transformed output.
    - You can also pass the width inline as `toc <width>` or omit it and enter it interactively.
