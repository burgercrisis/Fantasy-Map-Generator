"use strict";

/**
 * Unified Development Server Runner
 * 
 * Consolidates server startup scripts:
 * - run_python_server.bat
 * - run_python_server.sh
 * - run_php_server.bat
 *
 * Usage:
 *   node tools/devserver/run-server.js --type=python [--port=8000]
 *   node tools/devserver/run-server.js --type=php
 *   node tools/devserver/run-server.js --type=node
 *   node tools/devserver/run-server.js --list
 *
 * Options:
 *   --type=python    Run Python HTTP server (default)
 *   --type=php       Run PHP built-in server
 *   --type=node      Run Node.js static server
 *   --port=PORT      Specify port (default: 8000)
 *   --host=HOST      Specify host (default: localhost)
 *   --list           List available server types
 *   --help, -h       Show this help
 *
 * Examples:
 *   node tools/devserver/run-server.js
 *   node tools/devserver/run-server.js --type=python --port=8080
 *   node tools/devserver/run-server.js --type=node
 */

const { execSync, spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

// ============================================================================
// SERVER CONFIGURATIONS
// ============================================================================

const serverConfigs = {
  python: {
    name: "Python HTTP Server",
    command: "python3",
    args: ["-m", "http.server"],
    waitMessage: "Serving HTTP on",
    installCheck: "python3 --version"
  },
  php: {
    name: "PHP Built-in Server",
    command: "php",
    args: ["-S", "localhost:8000"],
    waitMessage: "PHP Development Server started",
    installCheck: "php --version"
  },
  node: {
    name: "Node.js Static Server",
    command: "npx",
    args: ["serve", ".", "-l", "8000"],
    waitMessage: "Accepting connections",
    installCheck: "npx --version"
  }
};

// ============================================================================
// FUNCTIONS
// ============================================================================

function checkServer(type) {
  const config = serverConfigs[type];
  if (!config) {
    console.log(`Unknown server type: ${type}`);
    return false;
  }

  try {
    execSync(config.installCheck, { encoding: "utf8", stdio: "pipe" });
    return true;
  } catch (err) {
    return false;
  }
}

function runServer(type, options) {
  const { port = 8000, host = "localhost", verbose = false } = options;
  const config = serverConfigs[type];

  console.log(`\n=== ${config.name} ===\n`);
  console.log(`Starting ${config.name} on http://${host}:${port}`);
  console.log(`Root directory: ${root}\n`);

  if (!checkServer(type)) {
    console.log(`Error: ${config.command} is not installed or not in PATH.`);
    console.log(`Please install ${config.name} to use this server.`);
    return false;
  }

  const args = [...config.args, `${host}:${port}`];
  console.log(`Command: ${config.command} ${args.join(" ")}\n`);

  if (verbose) {
    console.log("Starting server...\n");
  }

  try {
    const server = spawn(config.command, args, {
      cwd: root,
      stdio: "inherit"
    });

    server.on("error", (err) => {
      console.error(`Server error: ${err.message}`);
      process.exit(1);
    });

    server.on("close", (code) => {
      if (code !== 0) {
        console.log(`Server exited with code ${code}`);
      }
    });

    // Keep process alive
    console.log(`Server running. Press Ctrl+C to stop.\n`);
    
    // Handle Ctrl+C
    process.on("SIGINT", () => {
      console.log("\nShutting down server...");
      server.kill();
      process.exit(0);
    });

    return true;
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    return false;
  }
}

function listServerTypes() {
  console.log("\nAvailable Server Types:\n");
  
  for (const [type, config] of Object.entries(serverConfigs)) {
    const available = checkServer(type) ? "✓" : "✗";
    console.log(`  ${type.padEnd(8)} ${available} ${config.name}`);
  }
  
  console.log("\nLegend: ✓ = available, ✗ = not installed");
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  const options = {
    type: args.find(a => a.startsWith("--type="))?.split("=")[1] || "python",
    port: args.find(a => a.startsWith("--port="))?.split("=")[1] || "8000",
    host: args.find(a => a.startsWith("--host="))?.split("=")[1] || "localhost",
    verbose: args.includes("--verbose"),
    list: args.includes("--list"),
    help: args.includes("--help") || args.includes("-h")
  };

  if (options.help || options.list) {
    const scriptName = path.basename(__filename);
    console.log(`${scriptName} - Unified Development Server Runner\n`);
    console.log(`Usage: node tools/devserver/${scriptName} [options]\n`);
    listServerTypes();
    console.log("\nExamples:");
    console.log(`  node tools/devserver/${scriptName}`);
    console.log(`  node tools/devserver/${scriptName} --type=python --port=8080`);
    console.log(`  node tools/devserver/${scriptName} --type=node --host=0.0.0.0`);
    return;
  }

  console.log("=== Unified Development Server Runner ===\n");

  const success = runServer(options.type, {
    port: Number(options.port),
    host: options.host,
    verbose: options.verbose
  });

  if (!success) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  }
}

module.exports = {
  checkServer,
  runServer,
  listServerTypes,
  serverConfigs
};
