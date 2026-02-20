import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const src = path.join(dist, "index.html");
const dest = path.join(dist, "404.html");

if (!fs.existsSync(src)) {
  console.error("dist/index.html not found. Run npm run build first.");
  process.exit(1);
}
fs.copyFileSync(src, dest);
console.log("Copied index.html → 404.html for GitHub Pages SPA routing.");
