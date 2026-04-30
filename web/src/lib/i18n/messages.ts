export type AppLocale = "en" | "fa";

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export const messagesEn = {
  brandTitle: "Movie Manager",
  navHome: "Home",
  navDatabase: "Database",
  navDuplicates: "Duplicates",
  navSettings: "Settings",
  searchPlaceholder: "Search titles…",
  searchAria: "Search titles",
  footerNote: "Local API — for use on 127.0.0.1 only",
  language: "Language",

  apiOfflineBold: "Local API not running.",
  apiOfflineRest:
    "Next.js proxies /api to 127.0.0.1:4000. From the repo root run npm run dev, or npm run dev:api.",

  busyScanning: "Scanning…",
  busyEnriching: "Enriching TMDb…",

  heroPlay: "Play",
  heroMoreInfo: "More info",
  heroEpisodes: "Episodes",
  heroEpisodesOne: "{n} episode",
  heroEpisodesMany: "{n} episodes",
  badgeDubbed: "Dubbed",

  favAdd: "Add to favorites",
  favRemove: "Remove from favorites",

  filtersTitle: "Filters",
  filtersSearchHint: "Search uses the bar above",
  filtersQuery: "Query:",
  filtersNoQuery: "No title filter — browse full library",
  sortLabel: "Sort",
  sortNone: "None",
  sortName: "Name",
  sortYear: "Year",
  sortScore: "Score",
  sortVotes: "Votes",
  catalogLabel: "Catalog",
  catAll: "Movies & series",
  catMovies: "Movies only",
  catSeries: "TV series only",
  libraryLabel: "Library",
  libVisible: "Visible only",
  libAll: "All (incl. hidden)",
  libFavorites: "Favorites",
  libScored: "With score",
  libHidden: "Hidden (blacklist)",
  genreLabel: "Genre",
  folderLabel: "Folder contains",
  yearFrom: "Year from",
  yearTo: "Year to",
  apply: "Apply",
  rescan: "Rescan",
  enrichTmdb: "Enrich TMDb",

  yourLibrary: "Your library",
  loading: "Loading…",

  seriesEpSuffix: "ep.",

  paginationPrev: "Previous page",
  paginationNext: "Next page",
  paginationTotal: "{total} total",

  backToLibrary: "← Back to library",
  runtime: "Runtime:",
  fileLabel: "File:",
  dubbedLabel: "Dubbed:",
  dubbedYes: "Yes",
  dubbedNo: "No",
  directors: "Directors:",
  cast: "Cast:",

  hideBlacklist: "Hide (blacklist)",
  unhide: "Unhide",

  seasonsTitle: "Seasons",
  seasonUnknown: "Episodes (season unknown)",
  specials: "Specials",
  seasonPrefix: "Season ",
  diskEpisodesLine: "{seasons} seasons · {episodes} episodes on disk",
  diskEpisodeLineSingular: "{seasons} seasons · {episodes} episode on disk",
  episodeCardEpisodes: "{n} episodes",
  episodeCardEpisode: "{n} episode",
  details: "Details",

  duplicatesTitle: "Duplicate finder",
  duplicatesIntro:
    "Groups show extra copies of the same logical movie or episode. Only paths on disk are listed—compare files and remove extras outside this app if needed.",
  duplicatesKindTitleYear: "Same title & year",
  duplicatesKindTmdbId: "Same TMDb ID",
  duplicatesKindEpisodeSlot: "Same series episode",
  duplicatesNoGroups: "No duplicates detected with current rules.",
  duplicatesPathsHeading: "File paths",
  duplicatesOpen: "Open",
  duplicatesStats: "{groups} groups · {rows} duplicate rows",
} as const;

export const messagesFa = {
  brandTitle: "مدیریت فیلم",
  navHome: "خانه",
  navDatabase: "پایگاه داده",
  navDuplicates: "تکراری‌ها",
  navSettings: "تنظیمات",
  searchPlaceholder: "جستجوی عنوان…",
  searchAria: "جستجوی عنوان",
  footerNote: "API محلی — فقط برای استفاده روی ۱۲۷٫۰٫۰٫۱",
  language: "زبان",

  apiOfflineBold: "API محلی در حال اجرا نیست.",
  apiOfflineRest:
    "Next.js مسیر /api را به ۱۲۷٫۰٫۰٫۱:۴۰۰۰ پروکسی می‌کند. از ریشهٔ مخزن npm run dev یا npm run dev:api را اجرا کنید.",

  busyScanning: "در حال اسکن…",
  busyEnriching: "در حال غنی‌سازی TMDb…",

  heroPlay: "پخش",
  heroMoreInfo: "اطلاعات بیشتر",
  heroEpisodes: "قسمت‌ها",
  heroEpisodesOne: "{n} قسمت",
  heroEpisodesMany: "{n} قسمت",
  badgeDubbed: "دوبله",

  favAdd: "افزودن به علاقه‌مندی‌ها",
  favRemove: "حذف از علاقه‌مندی‌ها",

  filtersTitle: "فیلترها",
  filtersSearchHint: "جستجو از نوار بالا",
  filtersQuery: "عبارت:",
  filtersNoQuery: "بدون فیلتر عنوان — کل مجموعه",
  sortLabel: "مرتب‌سازی",
  sortNone: "بدون",
  sortName: "نام",
  sortYear: "سال",
  sortScore: "امتیاز",
  sortVotes: "آرا",
  catalogLabel: "کاتالوگ",
  catAll: "فیلم و سریال",
  catMovies: "فقط فیلم",
  catSeries: "فقط سریال",
  libraryLabel: "کتابخانه",
  libVisible: "فقط قابل‌نمایش",
  libAll: "همه (شامل مخفی)",
  libFavorites: "علاقه‌مندی‌ها",
  libScored: "دارای امتیاز",
  libHidden: "مخفی (لیست سیاه)",
  genreLabel: "ژانر",
  folderLabel: "پوشه شامل",
  yearFrom: "سال از",
  yearTo: "سال تا",
  apply: "اعمال",
  rescan: "اسکن مجدد",
  enrichTmdb: "غنی‌سازی TMDb",

  yourLibrary: "کتابخانهٔ شما",
  loading: "در حال بارگذاری…",

  seriesEpSuffix: "ق.",

  paginationPrev: "صفحهٔ قبل",
  paginationNext: "صفحهٔ بعد",
  paginationTotal: "{total} مورد",

  backToLibrary: "← بازگشت به کتابخانه",
  runtime: "مدت:",
  fileLabel: "فایل:",
  dubbedLabel: "دوبله:",
  dubbedYes: "بله",
  dubbedNo: "خیر",
  directors: "کارگردان:",
  cast: "بازیگران:",

  hideBlacklist: "مخفی (لیست سیاه)",
  unhide: "نمایش",

  seasonsTitle: "فصل‌ها",
  seasonUnknown: "قسمت‌ها (فصل نامشخص)",
  specials: "ویژه",
  seasonPrefix: "فصل ",
  diskEpisodesLine: "{seasons} فصل · {episodes} قسمت روی دیسک",
  diskEpisodeLineSingular: "{seasons} فصل · {episodes} قسمت روی دیسک",
  episodeCardEpisodes: "{n} قسمت",
  episodeCardEpisode: "{n} قسمت",
  details: "جزئیات",

  duplicatesTitle: "یافتن نسخه‌های تکراری",
  duplicatesIntro:
    "هر گروه چند نسخه از یک فیلم یا قسمت یک سریال را نشان می‌دهد. فقط مسیر فایل‌ها نمایش داده می‌شود؛ برای حذف نسخه‌های اضافی خودتان روی دیسک تصمیم بگیرید.",
  duplicatesKindTitleYear: "همان عنوان و سال",
  duplicatesKindTmdbId: "همان شناسهٔ TMDb",
  duplicatesKindEpisodeSlot: "همان قسمت سریال",
  duplicatesNoGroups: "با قوانین فعلی موردی یافت نشد.",
  duplicatesPathsHeading: "مسیر فایل‌ها",
  duplicatesOpen: "باز کردن",
  duplicatesStats: "{groups} گروه · {rows} ردیف تکراری",
} as const;

export type MessageKey = keyof typeof messagesEn;

export function getMessages(locale: AppLocale): Record<MessageKey, string> {
  return locale === "fa" ? messagesFa : messagesEn;
}
