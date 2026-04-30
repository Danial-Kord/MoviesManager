import assert from "node:assert/strict";
import test from "node:test";
import {
  compileDubbedRulesToCache,
  isDubbedFromPath,
  normalizeMovieDuplicateKey,
  normalizeSeriesKey,
  parseVideoFile,
  resetUserDubbedRulesForTests,
  validateAndNormalizeDubbedRules,
} from "./parseFilename.js";

test.afterEach(() => {
  resetUserDubbedRulesForTests();
});

test("parseVideoFile: BRRip 720p without year — title stops before release tags", () => {
  const r = parseVideoFile("D:/films/Mulan.I.BRRip.720p-GLORY.mkv");
  assert.ok(r);
  assert.equal(r.kind, "movie");
  if (r.kind === "movie") {
    assert.equal(r.displayName.trim(), "Mulan I");
    assert.equal(r.year, "");
  }
});

test("parseVideoFile: movie without episode token", () => {
  const r = parseVideoFile("D:/films/Some.Movie.2020.1080p.mkv");
  assert.ok(r);
  assert.equal(r.kind, "movie");
  if (r.kind === "movie") {
    assert.match(r.displayName, /Some Movie/i);
    assert.equal(r.year, "2020");
    assert.equal(r.dubbed, false);
  }
});

test("isDubbedFromPath: dual audio filename", () => {
  assert.equal(isDubbedFromPath("D:/Anime/Film.Dual.Audio.mkv"), true);
});

test("parseVideoFile: dubbed hint in filename", () => {
  const r = parseVideoFile("D:/Anime/Movie.2021.Hindi.Dubbed.720p.mkv");
  assert.ok(r);
  assert.equal(r.kind, "movie");
  if (r.kind === "movie") assert.equal(r.dubbed, true);
});

test("parseVideoFile: dubbed from parent folder", () => {
  const r = parseVideoFile("D:/Anime Hindi Dubbed/Show.Name.S01E01.mkv");
  assert.ok(r);
  assert.equal(r.kind, "episode");
  if (r.kind === "episode") assert.equal(r.dubbed, true);
});

test("parseVideoFile: S01E02 dotted release name", () => {
  const r = parseVideoFile("Show.Name.S01E02.Pilot.mkv");
  assert.ok(r);
  assert.equal(r.kind, "episode");
  if (r.kind === "episode") {
    assert.equal(r.seriesTitle, "Show Name");
    assert.equal(r.season, 1);
    assert.equal(r.episode, 2);
    assert.equal(r.episodeTitle, "Pilot");
    assert.match(r.displayNameForRow, /S01E02/);
    assert.equal(r.dubbed, false);
  }
});

test("parseVideoFile: 1x02 pattern", () => {
  const r = parseVideoFile("My Show - 1x02 - Title.mp4");
  assert.ok(r);
  assert.equal(r.kind, "episode");
  if (r.kind === "episode") {
    assert.equal(r.season, 1);
    assert.equal(r.episode, 2);
    assert.equal(r.dubbed, false);
  }
});

test("normalizeSeriesKey: stable lowercase key", () => {
  assert.equal(normalizeSeriesKey("Show Name", "2020"), normalizeSeriesKey("show.name", "2020"));
});

test("normalizeSeriesKey: folder/year variants map to one series", () => {
  assert.equal(normalizeSeriesKey("Young Justice", "2010"), normalizeSeriesKey("Young Justice", "2019"));
  assert.equal(normalizeSeriesKey("Young Justice", ""), normalizeSeriesKey("Young Justice", "2020"));
});

test("normalizeMovieDuplicateKey: stable title+year", () => {
  assert.equal(
    normalizeMovieDuplicateKey("The Matrix", "1999"),
    normalizeMovieDuplicateKey("the.matrix", "1999")
  );
  assert.notEqual(normalizeMovieDuplicateKey("The Matrix", "1999"), normalizeMovieDuplicateKey("The Matrix", "2003"));
});

test("user dubbed rule: contains folder fragment", () => {
  const v = validateAndNormalizeDubbedRules([{ pattern: "Persian Dub", mode: "contains" }]);
  assert.equal(v.ok, true);
  if (!v.ok) return;
  const c = compileDubbedRulesToCache(v.rules);
  assert.equal(c.ok, true);
  assert.equal(isDubbedFromPath("D:/Movies/Persian Dub/Film.2020.mkv"), true);
  assert.equal(isDubbedFromPath("D:/Movies/Other/Film.2020.mkv"), false);
});

test("user dubbed rule: regex", () => {
  const v = validateAndNormalizeDubbedRules([{ pattern: "fan.?edit", mode: "regex" }]);
  assert.equal(v.ok, true);
  if (!v.ok) return;
  const c = compileDubbedRulesToCache(v.rules);
  assert.equal(c.ok, true);
  assert.equal(isDubbedFromPath("D:/Fanedit/release.mkv"), true);
});

test("validateAndNormalizeDubbedRules rejects invalid regex compile", () => {
  const v = validateAndNormalizeDubbedRules([{ pattern: "(unclosed", mode: "regex" }]);
  assert.equal(v.ok, true);
  if (!v.ok) return;
  const c = compileDubbedRulesToCache(v.rules);
  assert.equal(c.ok, false);
});

test("disabled rule does not match", () => {
  const v = validateAndNormalizeDubbedRules([{ pattern: "zzzuniquefolderzzz", mode: "contains", enabled: false }]);
  assert.equal(v.ok, true);
  if (!v.ok) return;
  compileDubbedRulesToCache(v.rules);
  assert.equal(isDubbedFromPath("D:/zzzuniquefolderzzz/x.mkv"), false);
});
