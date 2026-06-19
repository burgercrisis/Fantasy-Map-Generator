"use strict";
const { createServer } = require("node:http");
const { readFileSync, statSync } = require("node:fs");
const { join, extname } = require("node:path");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".map": "application/json",
};

const ROOT = join(__dirname, "..");
let port = 3000;
const maxPort = 3100;

function tryListen(server, p) {
  return new Promise((resolve, reject) => {
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        reject(err);
      }
    });
    server.listen(p, "0.0.0.0", () => {
      server.removeAllListeners("error");
      resolve(p);
    });
  });
}

async function main() {
  const server = createServer((req, res) => {
    let url = req.url.split("?")[0];
    if (url === "/") url = "/index.html";
    const filePath = join(ROOT, url);

    try {
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const data = readFileSync(filePath);
      const mime = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  let bound = 0;
  for (let p = port; p <= maxPort; p++) {
    bound = await tryListen(server, p);
    if (bound) break;
  }

  if (!bound) {
    console.error(`No free port found between ${port} and ${maxPort}`);
    process.exit(1);
  }

  console.log(`Server running at http://localhost:${bound}/`);
  console.log("Press Ctrl+C to stop.");

  process.on("SIGINT", () => {
    server.close(() => {
      console.log("\nServer stopped.");
      process.exit(0);
    });
  });
}

main();
