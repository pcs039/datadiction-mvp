import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();

const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "ADMIN_PASSWORD",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const requiredFiles = [
  "supabase/migrations/202605280001_datadiction_mvp.sql",
  "supabase/seed/datadiction_mvp_seed.sql",
  "src/app/queries.ts",
  "docs/datadiction-deployment.md",
];

function readEnvFile() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return new Set();

  const envText = readFileSync(envPath, "utf8");

  return new Set(
    envText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=")[0])
      .filter(Boolean),
  );
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    encoding: "utf8",
  });

  return result.status === 0;
}

function printCheck(label, ok, hint = "") {
  const mark = ok ? "OK" : "NEEDS_ACTION";
  console.log(`${mark}  ${label}${hint ? ` - ${hint}` : ""}`);
}

const envKeys = readEnvFile();

console.log("\nDataDiction deployment readiness\n");

for (const file of requiredFiles) {
  printCheck(file, existsSync(join(root, file)));
}

console.log("");

for (const key of requiredEnvKeys) {
  printCheck(`.env.local has ${key}`, envKeys.has(key));
}

printCheck(
  "SUPABASE_SERVICE_ROLE_KEY stays server-only",
  !envKeys.has("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"),
  "do not expose service role keys to the browser",
);

console.log("");

printCheck("Supabase CLI installed", commandExists("supabase"), "optional for CLI migrations");
printCheck("Vercel CLI installed", commandExists("vercel"), "optional for CLI deployment");
printCheck(".vercel project link exists", existsSync(join(root, ".vercel/project.json")));

console.log("\nNext steps:");
console.log("1. Apply SQL files in Supabase SQL Editor, or install/login Supabase CLI.");
console.log("2. Set the required environment variables in Vercel.");
console.log("3. Deploy with Vercel or connect the GitHub repo in the Vercel dashboard.");
console.log("");
