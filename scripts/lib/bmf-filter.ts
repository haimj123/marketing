/**
 * The Jewish-organization filter for the IRS Business Master File, and the
 * field transforms that turn a BMF row into a listing.
 *
 * Kept separate from the ingest runner so it can be exercised on its own —
 * see `scripts/test-filter.ts`. The whole seeding strategy rests on this file
 * being both broad enough to find the corpus and tight enough that a donor
 * never finds a church in a tzedaka directory.
 */

/**
 * The name-keyword pass. Matched on word boundaries, so "torah" does not fire
 * inside "Victoria" and "bais" does not fire inside "Baisley".
 *
 * Transliteration is the whole difficulty here: the same institution is
 * written yeshiva / yeshivah / yeshivas, bais / beis / beth, chesed /
 * chessed. Missing a spelling costs coverage; a loose pattern costs
 * precision, and precision is what keeps this list credible.
 */
export const NAME_KEYWORDS = [
  "yeshiva", "yeshivah", "yeshivas", "yeshivos", "yeshivath", "yeshivat",
  "kollel", "kollelim",
  "chabad", "lubavitch", "satmar", "bobov", "belz", "vizhnitz", "breslov", "skver",
  "hebrew", "jewish", "judaic", "judaism", "torah", "talmud", "talmudic", "halacha",
  "chesed", "chessed", "hachnosas", "hachnasas", "tomchei", "tomchey", "bikur", "cholim",
  "gemach", "gmach", "mikvah", "mikveh", "mikvaos", "eruv",
  "congregation", "synagogue", "shul", "kehilla", "kehillah", "kehilas",
  "beis", "bais",
  // "beth" and "bet" are given names and Greek letters on their own, so they
  // only count in the compounds a shul actually uses.
  "beth israel", "beth jacob", "beth yaakov", "beth medrash", "beth hamedrash",
  "beth el", "beth shalom", "beth sholom", "beth din", "beth abraham", "beth david",
  "bet knesset", "bet midrash",
  "agudath", "agudas", "agudah", "ohel", "zichron", "ahavas", "ahavath",
  "tzedaka", "tzedakah", "tsedaka", "maaser",
  "kallah", "hachnasas kallah", "yesomim", "almanos", "hatzalah", "hatzoloh", "chaveirim",
  "shabbos", "shabbat", "yom tov", "pesach", "purim", "sukkah", "succah",
  "kosher", "kashrus", "kashruth", "shechita", "chevra kadisha", "chevrah kadisha",
  "yerushalayim", "eretz yisroel", "sephardic", "sefardic", "ashkenazi",
  "rabbinical", "rabbi ", "cheder", "talmud torah", "bnos", "bnei brak",
  "menorah", "shaare", "shaarei", "sha'are", "sha'arei", "mesivta", "yisroel", "yisrael",
] as const;

/**
 * Names that trip the keyword pass for the wrong reason. Checked first, so a
 * negative always wins — a Messianic organization filed under X30 is not what
 * a donor searching this directory is looking for, and neither is a church
 * named for Zion.
 */
export const NEGATIVE_KEYWORDS = [
  "baptist", "methodist", "presbyterian", "lutheran", "episcopal", "catholic",
  "pentecostal", "evangel", "christ", "christian", "church", "ministries",
  "ministry", "gospel", "missionary", "apostolic", "adventist", "mormon",
  "latter day", "islamic", "muslim", "masjid", "mosque", "hindu", "buddhist",
  "sikh", "messianic", "jews for jesus", "hebrew roots",
] as const;

export interface MatchResult {
  matched: boolean;
  reason: "ntee_x30" | "keyword" | null;
  keyword?: string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** NTEE X30 is Judaism. On-topic without needing a keyword. */
function isJudaismCode(ntee: string): boolean {
  return ntee.startsWith("X30");
}

/**
 * Families where a Jewish organization is commonly filed by *function* rather
 * than religion: X religion, B education, P human services, T philanthropy,
 * E health (Hatzalah, bikur cholim). A row in one of these still has to clear
 * the keyword pass.
 */
function isPlausibleCode(ntee: string): boolean {
  return /^[XBPTE]/.test(ntee);
}

export function classify(name: string, ntee: string): MatchResult {
  const lower = ` ${name.toLowerCase()} `;

  for (const bad of NEGATIVE_KEYWORDS) {
    if (lower.includes(bad)) return { matched: false, reason: null };
  }

  const code = (ntee ?? "").toUpperCase();
  if (isJudaismCode(code)) return { matched: true, reason: "ntee_x30" };
  if (!isPlausibleCode(code)) return { matched: false, reason: null };

  for (const keyword of NAME_KEYWORDS) {
    const term = keyword.trim();
    const pattern = new RegExp(`(^|[^a-z])${escapeRegex(term)}([^a-z]|$)`, "i");
    if (pattern.test(lower)) return { matched: true, reason: "keyword", keyword: term };
  }

  return { matched: false, reason: null };
}

/* ------------------------------------------------------- category mapping */

const CATEGORY_RULES: { category: string; ntee?: RegExp; keywords?: string[] }[] = [
  {
    category: "chinuch",
    ntee: /^B(2|3|4|8)/,
    keywords: ["yeshiva", "bais yaakov", "beth jacob", "bnos", "cheder", "day school", "academy", "talmud torah", "mesivta"],
  },
  { category: "food", keywords: ["tomchei", "tomchey", "food", "pantry", "shabbos", "shabbat", "meals"] },
  { category: "bikur-cholim", ntee: /^(E|P58)/, keywords: ["bikur", "cholim", "refuah", "chevra kadisha", "chesed shel emes"] },
  { category: "hachnasas-kallah", keywords: ["kallah", "wedding"] },
  { category: "kimcha-dpischa", keywords: ["kimcha", "pesach", "yom tov", "purim", "maos chitim"] },
  { category: "gemach", keywords: ["gemach", "gmach", "free loan", "loan fund", "interest free"] },
  { category: "kollel", keywords: ["kollel", "beis medrash", "bais medrash", "beth medrash", "beth hamedrash"] },
  { category: "yesomim", keywords: ["yesomim", "almanos", "orphan", "widow"] },
  { category: "hatzalah", keywords: ["hatzalah", "hatzoloh", "chaveirim", "ambulance", "emergency"] },
  { category: "kiruv", keywords: ["kiruv", "outreach", "chabad", "hillel", "campus"] },
  {
    category: "shul-mikvah",
    keywords: ["congregation", "synagogue", "shul", "kehilla", "kehillah", "mikvah", "mikveh", "eruv", "beth israel", "beth shalom", "beth sholom", "beth el"],
  },
  { category: "israel", keywords: ["israel", "jerusalem", "yerushalayim", "eretz", "american friends", "bnei brak"] },
];

/**
 * An organization with no signal beyond "it is Jewish" gets an empty category
 * list rather than a guessed one. An empty list is honest and gets fixed when
 * the profile is claimed; a wrong one misleads a donor immediately.
 */
export function mapCategories(name: string, ntee: string): string[] {
  const lower = name.toLowerCase();
  const code = (ntee ?? "").toUpperCase();
  const hits: string[] = [];

  for (const rule of CATEGORY_RULES) {
    if (rule.ntee?.test(code)) {
      hits.push(rule.category);
      continue;
    }
    if (rule.keywords?.some((k) => lower.includes(k))) hits.push(rule.category);
  }

  return [...new Set(hits)].slice(0, 3);
}

/* ------------------------------------------------------------- transforms */

const INCOME_BANDS: Record<string, string> = {
  "0": "under_100k",
  "1": "under_100k",
  "2": "under_100k",
  "3": "under_100k",
  "4": "100k_500k",
  "5": "500k_2m",
  "6": "500k_2m",
  "7": "2m_10m",
  "8": "2m_10m",
  "9": "over_10m",
};

export function budgetBand(revenueAmt: string, incomeCd: string): string {
  const revenue = Number(revenueAmt);
  if (Number.isFinite(revenue) && revenue > 0) {
    if (revenue < 100_000) return "under_100k";
    if (revenue < 500_000) return "100k_500k";
    if (revenue < 2_000_000) return "500k_2m";
    if (revenue < 10_000_000) return "2m_10m";
    return "over_10m";
  }
  return INCOME_BANDS[(incomeCd ?? "").trim()] ?? "unknown";
}

const SMALL_WORDS = new Set(["of", "the", "and", "for", "in", "at", "a", "an", "to", "on", "de"]);
const ALWAYS_UPPER: Record<string, string> = { llc: "LLC", usa: "USA", nyc: "NYC", ny: "NY" };

/** BMF names are ALL CAPS. Title-case them without mangling the small words. */
export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => {
      const bare = word.replace(/[^a-z]/g, "");
      if (ALWAYS_UPPER[bare]) return word.replace(bare, ALWAYS_UPPER[bare]);
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word.replace(/^[a-z]/, (c) => c.toUpperCase());
    })
    .join(" ");
}

export function slugify(name: string, ein: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70)
    .replace(/-$/, "");
  return base || `org-${ein}`;
}

/**
 * DEDUCTIBILITY 1 means contributions are deductible, 2 means they are not,
 * 4 means the record cannot say. Anything other than 1 must never reach a
 * donor as "deductible" — that misrepresentation is the largest legal
 * exposure left once the project stops touching money.
 */
export function taxStatus(subsection: string, deductibility: string): string {
  if ((subsection ?? "").trim() === "03" && (deductibility ?? "").trim() === "1") {
    return "us_501c3";
  }
  return "unverified";
}
