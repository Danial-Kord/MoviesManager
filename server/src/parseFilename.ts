/**
 * Port of com.company.Sorting stringConditions + findName + getYear.
 */
const STRING_CONDITIONS: string[] = [
  "256",
  "264",
  "255",
  "480",
  "20",
  "19",
  "21",
  "22",
  "1080",
  "720",
  ".mkv",
  ".mp4",
  ".mpeg",
  ".mpeg2",
  "bluray",
  "hdrip",
  "hdcam",
  "hdtv",
  "4k",
  "web",
  ".avi",
];

function findCutIndex(name: string): number {
  let f = name.length;
  for (let i = 2; i < name.length; i++) {
    let flag = false;
    if (i > 0) {
      const temp = name.toLowerCase();
      for (const cond of STRING_CONDITIONS) {
        if (temp.substring(2, i).endsWith(cond)) {
          f = i - cond.length;
          flag = true;
          break;
        }
      }
    }
    if (flag) break;
  }
  return f;
}

export function getYearFromName(fileName: string): string {
  if (
    !fileName.includes("20") &&
    !fileName.includes("19") &&
    !fileName.includes("21") &&
    !fileName.includes("22")
  ) {
    return "";
  }
  const temp = fileName;
  for (let i = 2; i < fileName.length && i + 2 < fileName.length; i++) {
    const q = fileName[i - 1] + fileName[i];
    if (q === "20" || q === "19" || q === "21" || q === "22") {
      return q + fileName[i + 1] + fileName[i + 2];
    }
  }
  return "";
}

const VIDEO_EXTS = new Set([
  ".mkv",
  ".mp4",
  ".mpeg",
  ".mpeg2",
  ".avi",
  ".mpg",
  ".webm",
  ".m4v",
]);

export function isVideoFile(name: string): boolean {
  const lower = name.toLowerCase();
  for (const ext of VIDEO_EXTS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

export function findDisplayNameFromFileName(fileName: string): string | null {
  if (!isVideoFile(fileName)) return null;
  const nameOnly = fileName.replace(/.*[/\\]/, "");
  const cut = findCutIndex(nameOnly);
  const temp1 = nameOnly.substring(0, cut);
  let temp = "";
  for (let i = 0; i < temp1.length; i++) {
    if (i === temp1.length - 1) break;
    const c = temp1[i];
    if (c === "." || c === "-" || c === "_" || c === ")" || c === "(" || c === "*") {
      temp += " ";
    } else {
      temp += c;
    }
  }
  return temp.trim() || nameOnly;
}
