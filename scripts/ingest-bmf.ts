/**
 * IRS Exempt Organizations Business Master File → unclaimed listings.
 *
 * This is the cold-start solution and it only exists because the project is a
 * free directory: the BMF is public record, published monthly, and it contains
 * every US tax-exempt organization with EIN, name, address, ruling year, NTEE
 * classification and income band. Filter it for Jewish organizations and the
 * directory has thousands of accurate, verifiable stubs on day one — before a
 * single organization has been recruited.
 *
 * Usage
 *   npx tsx scripts/ingest-bmf.ts --download          # fetch eo1–eo4 from irs.gov
 *   npx tsx scripts/ingest-bmf.ts                     # parse whatever is in data/bmf-raw
 *   npx tsx scripts/ingest-bmf.ts --sample 40         # print 40 matches and stop
 *   npx tsx scripts/ingest-bmf.ts --publish           # write the live seed file
 *
 * Without --publish the run writes a staged batch to src/data/bmf-import.json
 * and nothing reaches the site. That is deliberate: §M2's exit test is a
 * false-positive rate under 5%, and you cannot measure that on data you have
 * already published.
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { join, resolve } from "node:path";
import { parse } from "csv-parse/sync";
import {
  budgetBand,
  classify,
  mapCategories,
  slugify,
  taxStatus,
  titleCase,
} from "./lib/bmf-filter";

/** The BMF columns this script reads. The file has more; these are the ones
 *  a listing is built from. */
export interface BmfRow {
  EIN: string;
  NAME: string;
  STREET: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  SUBSECTION: string;
  RULING: string;
  DEDUCTIBILITY: string;
  STATUS: string;
  INCOME_CD: string;
  REVENUE_AMT: string;
  NTEE_CD: string;
  SORT_NAME: string;
}

const RAW_DIR = resolve(process.cwd(), "data/bmf-raw");
const STAGED = resolve(process.cwd(), "src/data/bmf-import.json");
const LIVE = resolve(process.cwd(), "src/data/seed-organizations.json");

const SOURCES = [
  "https://www.irs.gov/pub/irs-soi/eo1.csv",
  "https://www.irs.gov/pub/irs-soi/eo2.csv",
  "https://www.irs.gov/pub/irs-soi/eo3.csv",
  "https://www.irs.gov/pub/irs-soi/eo4.csv",
];

/* ------------------------------------------------------------------- main */

async function download() {
  mkdirSync(RAW_DIR, { recursive: true });
  for (const url of SOURCES) {
    const name = url.split("/").pop()!;
    const target = join(RAW_DIR, name);
    if (existsSync(target)) {
      console.log(`  ${name} already present, skipping`);
      continue;
    }
    process.stdout.write(`  downloading ${name}… `);
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`${url} → HTTP ${res.status}`);
    await pipeline(Readable.fromWeb(res.body as never), createWriteStream(target));
    console.log("done");
  }
}

function readRows(): BmfRow[] {
  if (!existsSync(RAW_DIR)) {
    throw new Error(
      `No BMF files found in ${RAW_DIR}. Run with --download, or drop eo1.csv…eo4.csv there yourself.`,
    );
  }
  const files = readdirSync(RAW_DIR).filter((f) => f.toLowerCase().endsWith(".csv"));
  if (files.length === 0) throw new Error(`No .csv files in ${RAW_DIR}.`);

  const rows: BmfRow[] = [];
  for (const file of files) {
    const text = readFileSync(join(RAW_DIR, file), "latin1");
    const parsed = parse(text, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
    }) as BmfRow[];
    console.log(`  ${file}: ${parsed.length.toLocaleString()} rows`);
    rows.push(...parsed);
  }
  return rows;
}

async function main() {
  const args = process.argv.slice(2);
  const sampleSize = args.includes("--sample")
    ? Number(args[args.indexOf("--sample") + 1] ?? 25)
    : 0;

  if (args.includes("--download")) {
    console.log("Downloading the IRS EO BMF…");
    await download();
  }

  console.log("Reading BMF files…");
  const rows = readRows();
  console.log(`  ${rows.length.toLocaleString()} rows total\n`);

  const seenEin = new Set<string>();
  const seenSlug = new Set<string>();
  const organizations: Record<string, unknown>[] = [];
  const reasons = { ntee_x30: 0, keyword: 0 };
  const keywordHits: Record<string, number> = {};
  let revoked = 0;

  const now = new Date().toISOString();

  for (const row of rows) {
    const ein = (row.EIN ?? "").trim();
    const name = (row.NAME ?? "").trim();
    if (!ein || !name || seenEin.has(ein)) continue;

    // STATUS 01 is the only code that means "in good standing, currently
    // exempt". Anything else — and especially a revocation — must not be
    // published with a badge implying otherwise.
    if ((row.STATUS ?? "").trim() !== "01") {
      revoked += 1;
      continue;
    }

    const ntee = (row.NTEE_CD ?? "").trim();
    const verdict = classify(name, ntee);
    if (!verdict.matched) continue;

    seenEin.add(ein);
    if (verdict.reason) reasons[verdict.reason] += 1;
    if (verdict.keyword) keywordHits[verdict.keyword] = (keywordHits[verdict.keyword] ?? 0) + 1;

    const display = titleCase(name);
    let slug = slugify(display, ein);
    if (seenSlug.has(slug)) slug = `${slug}-${ein.slice(-4)}`;
    seenSlug.add(slug);

    const rulingRaw = (row.RULING ?? "").trim();
    const rulingYear = rulingRaw.length >= 4 ? Number(rulingRaw.slice(0, 4)) : null;

    organizations.push({
      slug,
      legalName: display,
      dba: null,
      ein,
      taxStatus: taxStatus(row.SUBSECTION, row.DEDUCTIBILITY),
      usPartnerOrgSlug: null,
      claimStatus: "unclaimed",
      verificationLevel: "irs_listed",
      source: "irs_bmf",
      tagline: null,
      storyMd: null,
      logoUrl: null,
      heroUrl: null,
      website: null,
      phone: null,
      email: null,
      addressLine1: titleCase((row.STREET ?? "").trim()) || null,
      city: titleCase((row.CITY ?? "").trim()) || null,
      region: (row.STATE ?? "").trim() || null,
      postalCode: (row.ZIP ?? "").trim().slice(0, 5) || null,
      country: "US",
      // Geocoding is a separate, cacheable pass — see the README. Publishing a
      // guessed coordinate would put an organization on the wrong street.
      lat: null,
      lng: null,
      rulingYear: Number.isFinite(rulingYear) ? rulingYear : null,
      nteeCode: ntee || null,
      budgetBand: budgetBand(row.REVENUE_AMT, row.INCOME_CD),
      categorySlugs: mapCategories(display, ntee),
      departments: [],
      campaigns: [],
      paymentMethods: [],
      endorsements: [],
      isPublished: true,
      irsLastSyncedAt: now,
    });
  }

  console.log("Filter results");
  console.log(`  matched:            ${organizations.length.toLocaleString()}`);
  console.log(`    by NTEE X30:      ${reasons.ntee_x30.toLocaleString()}`);
  console.log(`    by name keyword:  ${reasons.keyword.toLocaleString()}`);
  console.log(`  skipped, not in good standing: ${revoked.toLocaleString()}`);

  const topKeywords = Object.entries(keywordHits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  if (topKeywords.length) {
    console.log("\n  Top keywords (check these for false positives):");
    for (const [keyword, count] of topKeywords) {
      console.log(`    ${keyword.padEnd(16)} ${count.toLocaleString()}`);
    }
  }

  if (sampleSize > 0) {
    console.log(`\nRandom sample of ${sampleSize} — read every line before publishing:\n`);
    const step = Math.max(1, Math.floor(organizations.length / sampleSize));
    for (let i = 0; i < organizations.length && i / step < sampleSize; i += step) {
      const o = organizations[i] as { legalName: string; city: string; region: string; nteeCode: string };
      console.log(`  ${o.legalName} — ${o.city}, ${o.region} [${o.nteeCode ?? "—"}]`);
    }
    console.log("\n(--sample stops here; nothing was written.)");
    return;
  }

  const publish = args.includes("--publish");
  const target = publish ? LIVE : STAGED;

  writeFileSync(
    target,
    `${JSON.stringify(
      {
        $comment: publish
          ? "Generated from the IRS Exempt Organizations Business Master File."
          : "STAGED IMPORT — not served. Review, then re-run with --publish.",
        isDemoData: false,
        generatedAt: now,
        organizations,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`\nWrote ${organizations.length.toLocaleString()} organizations to ${target}`);
  if (!publish) {
    console.log(
      "\nNothing has been published. Review the staged file — the exit test is a\n" +
        "false-positive rate under 5% on a hand-checked sample — then re-run with --publish.",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
