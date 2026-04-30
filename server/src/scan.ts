import type { Dirent } from "fs";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { maybeRefineParsedMovieFromFilename } from "./ollamaFilenameTitle.js";
import { isVideoFile, parseVideoFile, type ParsedVideoFile } from "./parseFilename.js";

export interface ScannedFile {
  filePath: string;
  folderPath: string;
  parsed: ParsedVideoFile;
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
      const parsed = parseVideoFile(full);
      if (!parsed) continue;
      const refined = await maybeRefineParsedMovieFromFilename(full, parsed);
      const folderPath = join(rootDir);
      acc.push({
        filePath: full,
        folderPath,
        parsed: refined,
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
