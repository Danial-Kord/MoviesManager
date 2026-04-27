import type { Dirent } from "fs";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { findDisplayNameFromFileName, getYearFromName, isVideoFile } from "./parseFilename.js";

export interface ScannedFile {
  filePath: string;
  folderPath: string;
  name: string;
  year: string;
}

export async function collectVideoFiles(
  rootDir: string,
  acc: ScannedFile[] = []
): Promise<ScannedFile[]> {
  let entries: Dirent[] = [];
  try {
    entries = await readdir(rootDir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = join(rootDir, e.name);
    if (e.isDirectory()) {
      await collectVideoFiles(full, acc);
    } else if (e.isFile() && isVideoFile(e.name)) {
      const name = findDisplayNameFromFileName(e.name);
      if (!name) continue;
      const year = getYearFromName(e.name) || "";
      const folderPath = join(rootDir);
      acc.push({
        filePath: full,
        folderPath,
        name,
        year,
      });
    }
  }
  return acc;
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isDirectory() || s.isFile();
  } catch {
    return false;
  }
}
