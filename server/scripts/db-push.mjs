import { spawnSync } from "child_process";
import { homedir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = join(__dirname, "..");

const f = join(homedir(), ".moviemanager", "movies.db");
// Prisma SQLite on Windows: file:C:/path (single slash after file:)
const urlPath = f.split("\\").join("/");
const u = f.match(/^[A-Za-z]:/) ? `file:${urlPath}` : `file:${urlPath}`;

const r = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: u },
  cwd: serverDir,
});

process.exit(r.status ?? 0);
