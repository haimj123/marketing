import type { Category } from "./types";

/**
 * Top-level taxonomy. Twelve entries — the plan's ceiling is fourteen and
 * more is worse: a category rail a donor has to scroll twice has stopped
 * being navigation.
 *
 * Icon keys are lucide-react names, resolved in `components/category-icon.tsx`.
 */
export const CATEGORIES: Category[] = [
  {
    slug: "chinuch",
    nameEn: "Chinuch & Schools",
    nameHe: "חינוך",
    iconKey: "GraduationCap",
    blurb: "Yeshivos, day schools, Bais Yaakovs and scholarship funds.",
    sortOrder: 1,
  },
  {
    slug: "food",
    nameEn: "Food & Shabbos Needs",
    nameHe: "תומכי שבת",
    iconKey: "ShoppingBasket",
    blurb: "Tomchei Shabbos, food pantries and weekly package programs.",
    sortOrder: 2,
  },
  {
    slug: "bikur-cholim",
    nameEn: "Bikur Cholim & Refuah",
    nameHe: "ביקור חולים",
    iconKey: "HeartPulse",
    blurb: "Hospital hospitality, medical referral and patient support.",
    sortOrder: 3,
  },
  {
    slug: "hachnasas-kallah",
    nameEn: "Hachnasas Kallah",
    nameHe: "הכנסת כלה",
    iconKey: "Gem",
    blurb: "Wedding and household costs for families who cannot cover them.",
    sortOrder: 4,
  },
  {
    slug: "kimcha-dpischa",
    nameEn: "Kimcha D'Pischa & Yom Tov",
    nameHe: "קמחא דפסחא",
    iconKey: "Wheat",
    blurb: "Seasonal drives for Pesach, Yom Tov and Purim needs.",
    sortOrder: 5,
  },
  {
    slug: "gemach",
    nameEn: "Gemachim & Free Loans",
    nameHe: "גמ״ח",
    iconKey: "HandCoins",
    blurb: "Interest-free loan funds and lending gemachim.",
    sortOrder: 6,
  },
  {
    slug: "kollel",
    nameEn: "Torah & Kollel",
    nameHe: "תורה וכולל",
    iconKey: "BookOpen",
    blurb: "Kollelim, batei midrash and full-time learning support.",
    sortOrder: 7,
  },
  {
    slug: "yesomim",
    nameEn: "Yesomim & Almanos",
    nameHe: "יתומים ואלמנות",
    iconKey: "HeartHandshake",
    blurb: "Support for orphans, widows and bereaved families.",
    sortOrder: 8,
  },
  {
    slug: "hatzalah",
    nameEn: "Hatzalah & Emergency",
    nameHe: "הצלה",
    iconKey: "Siren",
    blurb: "Volunteer EMS, search and rescue, and crisis response.",
    sortOrder: 9,
  },
  {
    slug: "kiruv",
    nameEn: "Kiruv & Outreach",
    nameHe: "קירוב",
    iconKey: "Sparkles",
    blurb: "Campus, community and adult education outreach.",
    sortOrder: 10,
  },
  {
    slug: "shul-mikvah",
    nameEn: "Shuls & Mikvaos",
    nameHe: "בתי כנסת ומקוואות",
    iconKey: "Landmark",
    blurb: "Congregations, mikvaos and communal building funds.",
    sortOrder: 11,
  },
  {
    slug: "israel",
    nameEn: "Israel",
    nameHe: "ארץ ישראל",
    iconKey: "Globe",
    blurb: "Israeli amutot and the American friends organizations behind them.",
    sortOrder: 12,
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function categoryName(slug: string): string {
  return CATEGORY_BY_SLUG.get(slug)?.nameEn ?? slug;
}
