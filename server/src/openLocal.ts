import { execFile } from "child_process";
import { platform } from "os";

/**
 * Opens a file path with the OS default application (Movies & TV, VLC, etc.).
 */
export function openFileWithDefaultApp(filePath: string): Promise<void> {
  const os = platform();
  return new Promise((resolve, reject) => {
    if (os === "win32") {
      const lit = filePath.replace(/'/g, "''");
      execFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", `Invoke-Item -LiteralPath '${lit}'`],
        { windowsHide: true },
        (err) => (err ? reject(err) : resolve())
      );
    } else if (os === "darwin") {
      execFile("open", [filePath], (err) => (err ? reject(err) : resolve()));
    } else {
      execFile("xdg-open", [filePath], (err) => (err ? reject(err) : resolve()));
    }
  });
}
