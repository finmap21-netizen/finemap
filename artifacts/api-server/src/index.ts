import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since we might be running from dist/ or src/, look for .env in the parent of src/ or dist/
const possiblePaths = [
  path.resolve(process.cwd(), "artifacts/api-server/.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env")
];

console.log("[dotenv-debug] Current Working Directory:", process.cwd());
console.log("[dotenv-debug] __dirname:", __dirname);

for (const p of possiblePaths) {
  const exists = fs.existsSync(p);
  console.log(`[dotenv-debug] Checking path "${p}" -> exists: ${exists}`);
  if (exists) {
    const result = dotenv.config({ path: p });
    console.log(`[dotenv-debug] Loaded config from "${p}". Error:`, result.error || "none");
    break;
  }
}

console.log("[dotenv-debug] GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "Yes (Starts with: " + process.env.GEMINI_API_KEY.substring(0, 5) + "...)" : "No");


import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
