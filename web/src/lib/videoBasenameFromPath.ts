/** Filename portion for OS paths (forward or back slashes). Safe on server and client. */
export function videoBasenameFromPath(filePath: string): string {
  const i = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return i >= 0 ? filePath.slice(i + 1) : filePath;
}
