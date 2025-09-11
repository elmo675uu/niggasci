// server/app.js
const path = require("path");
const express = require("express");
const app = express();

// --- your existing middleware/routes import here ---
/*
  const routes = require("./routes");
  app.use("/api", routes);
*/

// STATIC (optional; usually you won’t serve client from here on cPanel)
app.use(express.json());

// Health check (keep this, helps verify Passenger app is alive)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Ensure your file paths are absolute (for posts.json/config.json)
const DATA_DIR = path.resolve(__dirname); // adjust if you keep data elsewhere
// Example:
// const POSTS_JSON = path.join(DATA_DIR, "posts.json");

module.exports = app;
