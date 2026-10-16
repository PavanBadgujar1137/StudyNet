/**
 * Build CRA with the correct env file.
 * Production: .env  →  .env.production  →  build
 * UAT:        .env.uat → .env.production → build → restore .env
 *
 * Usage: node scripts/build-with-env.js production|uat
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const mode = (process.argv[2] || "production").toLowerCase();
const root = path.join(__dirname, "..");
const envProductionPath = path.join(root, ".env.production");
const sourceName = mode === "uat" ? ".env.uat" : ".env";
const sourcePath = path.join(root, sourceName);

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing ${sourceName}`);
  process.exit(1);
}

const previous =
  fs.existsSync(envProductionPath) ? fs.readFileSync(envProductionPath) : null;

fs.copyFileSync(sourcePath, envProductionPath);
console.log(`Building with ${sourceName} (env=${mode})`);

const result = spawnSync(
  "npx",
  ["cross-env", "DISABLE_ESLINT_PLUGIN=true", "react-scripts", "build"],
  { cwd: root, stdio: "inherit", shell: true }
);

// Always leave .env.production = production (.env)
const prodSource = path.join(root, ".env");
if (fs.existsSync(prodSource)) {
  fs.copyFileSync(prodSource, envProductionPath);
} else if (previous) {
  fs.writeFileSync(envProductionPath, previous);
}

process.exit(result.status ?? 1);
