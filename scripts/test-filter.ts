/**
 * Spot checks for the BMF filter. Not a substitute for the manual review pass
 * §M2 requires — these are the cases that have to keep working while the
 * keyword list is tuned.
 *
 *   npx tsx scripts/test-filter.ts
 */
import { classify, mapCategories, budgetBand, titleCase, slugify, taxStatus } from "./lib/bmf-filter";

interface Case {
  name: string;
  ntee: string;
  expect: boolean;
  why: string;
}

const CASES: Case[] = [
  // Should match
  { name: "CONGREGATION OHEL YAAKOV", ntee: "X30", expect: true, why: "NTEE X30" },
  { name: "TOMCHEI SHABBOS OF ROCKLAND INC", ntee: "P600", expect: true, why: "keyword in human services" },
  { name: "YESHIVA GEDOLAH OF WOODLAKE", ntee: "B20", expect: true, why: "keyword in education" },
  { name: "AMERICAN FRIENDS OF BIKUR CHOLIM", ntee: "P580", expect: true, why: "keyword" },
  { name: "HATZOLOH OF THE SOUTH SHORE", ntee: "E62", expect: true, why: "keyword in emergency services" },
  { name: "GEMACH KEREN SHMUEL", ntee: "P600", expect: true, why: "keyword" },
  { name: "BAIS YAAKOV ACADEMY", ntee: "B20", expect: true, why: "keyword" },
  { name: "CHABAD OF THE VALLEY", ntee: "X30", expect: true, why: "NTEE X30" },

  // Should not match
  { name: "VICTORIA COMMUNITY FOUNDATION", ntee: "T20", expect: false, why: "torah must not fire inside Victoria" },
  { name: "BAISLEY PARK CIVIC ASSOCIATION", ntee: "S20", expect: false, why: "bais must not fire inside Baisley" },
  { name: "FIRST BAPTIST CHURCH OF ZION", ntee: "X20", expect: false, why: "negative keyword wins over 'zion'" },
  { name: "BETH ANN SMITH MEMORIAL FUND", ntee: "T30", expect: false, why: "bare 'beth' is a given name — only shul compounds count" },
  { name: "CONGREGATION BETH ISRAEL", ntee: "X20", expect: true, why: "'beth israel' is a shul compound" },
  { name: "BETHESDA COMMUNITY TRUST", ntee: "T30", expect: false, why: "must not fire inside Bethesda" },
  { name: "ISLAMIC RELIEF OF AMERICA", ntee: "X40", expect: false, why: "negative keyword" },
  { name: "MESSIANIC JEWISH ALLIANCE", ntee: "X30", expect: false, why: "negative keyword outranks NTEE X30" },
  { name: "SAN FRANCISCO ANIMAL RESCUE", ntee: "D20", expect: false, why: "wrong NTEE family entirely" },
];

let failures = 0;

for (const testCase of CASES) {
  const result = classify(testCase.name, testCase.ntee);
  const pass = result.matched === testCase.expect;
  if (!pass) failures += 1;
  const mark = pass ? "ok  " : "FAIL";
  console.log(
    `${mark} ${testCase.name.padEnd(38)} → ${String(result.matched).padEnd(5)} (${testCase.why})`,
  );
}

console.log("\nDerived fields");
console.log(`  titleCase:   ${titleCase("TOMCHEI SHABBOS OF ROCKLAND INC")}`);
console.log(`  slugify:     ${slugify("Tomchei Shabbos of Rockland Inc", "112233445")}`);
console.log(`  categories:  ${mapCategories("Tomchei Shabbos of Rockland Inc", "P600").join(", ")}`);
console.log(`  categories:  ${mapCategories("Yeshiva Gedolah of Woodlake", "B20").join(", ")}`);
console.log(`  budgetBand:  ${budgetBand("", "6")} / ${budgetBand("2400000", "")}`);
console.log(`  taxStatus:   ${taxStatus("03", "1")} / ${taxStatus("03", "4")}`);

if (failures > 0) {
  console.error(`\n${failures} case(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("\nAll filter cases pass.");
}
