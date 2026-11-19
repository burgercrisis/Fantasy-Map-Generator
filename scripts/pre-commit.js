#!/usr/bin/env node
/**
 * Pre-commit runner.
 *
 * Git-for-Windows runs hooks through MSYS `sh`, whose `fork()` emulation fails
 * in some environments (0xC0000142 STATUS_DLL_INIT_FAILED) when forking heavy
 * children like `npm` or `biome check`. Node's child_process uses the native
 * Windows CreateProcess API instead of MSYS fork, so running the hook's tasks
 * from a single Node process keeps the same lint/version/asset checks while
 * avoiding the fork failure.
 */
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env: { ...process.env, SKIP_SIMPLE_GIT_HOOKS: "" },
  });
  if (result.error) {
    console.error(`[pre-commit] ${label} failed to start:`, result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[pre-commit] ${label} exited with code ${result.status}`);
    process.exit(result.status || 1);
  }
}

const node = process.execPath;
const biome = path.join(root, "node_modules", "@biomejs", "biome", "bin", "biome");

// Equivalent of `npm run lint` (biome check --write)
run("lint", node, [biome, "check", "--write"]);
// Equivalent of `node scripts/sync-version.js --stage`
run("sync-version", node, [path.join(root, "scripts", "sync-version.js"), "--stage"]);
// Equivalent of `node scripts/stamp-assets.js --stage`
run("stamp-assets", node, [path.join(root, "scripts", "stamp-assets.js"), "--stage"]);