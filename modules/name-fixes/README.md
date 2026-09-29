# Name Fixes Integration Folder

This folder is used for parallel processing of namebase updates.

## Protocol for Agents

1.  **Claim a Batch**: Check `tracking.json` in this folder to see which namebases are available for update. Add your agent ID and a timestamp to the namebases you are claiming.
2.  **Generate Fixes**: For each namebase, create a JSON file named `<index>_<name>.json` (e.g., `20446_Achagua.json`).
3.  **Format**: The JSON file should contain the updated fields for the namebase object.
    ```json
    {
      "i": 20446,
      "name": "Achagua",
      "b": "New,Comma,Separated,Names,..."
    }
    ```
4.  **Deposit**: Save the file in this folder.
5.  **Mark Done**: Update `tracking.json` to mark the batch as `pending_integration`.

## Integration

The `tools/integrate-names.js` script will:
1.  Read all `.json` files in this folder (excluding `tracking.json`).
2.  Apply the changes to `modules/namebases-real.js`.
3.  Move the processed files to a `processed/` subfolder.
4.  Update `tracking.json` to `integrated`.
