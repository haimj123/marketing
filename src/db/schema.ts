/**
 * Postgres schema for §4 of the build plan.
 *
 * The running app reads through `src/lib/data.ts`, which today is backed by a
 * committed seed file so the project boots with no services attached. This
 * schema is the M2 target: `npm run db:generate && npm run db:push` against a
 * Supabase Postgres, then point `data.ts` at `src/db/queries.ts`.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const claimStatus = pgEnum("claim_status", ["unclaimed", "claimed", "verified_contact"]);

export const verificationLevel = pgEnum("verification_level", [
  "unverified",
  "irs_listed",
  "claimed",
  "claim_verified",
  "endorsed",
]);

export const taxStatus = pgEnum("tax_status", [
  "us_501c3",
  "israeli_amuta",
  "uk_charity",
  "canadian",
  "other",
  "unverified",
]);

export const orgSource = pgEnum("org_source", ["irs_bmf", "self_submitted"]);

export const budgetBand = pgEnum("budget_band", [
  "under_100k",
  "100k_500k",
  "500k_2m",
  "2m_10m",
  "over_10m",
  "unknown",
]);

export const paymentMethodType = pgEnum("payment_method_type", [
  "zelle",
  "quickpay",
  "paypal",
  "venmo",
  "check",
  "wire",
  "external",
]);

export const campaignStatus = pgEnum("campaign_status", [
  "active",
  "flagged_stale",
  "archived",
  "complete",
]);

export const memberRole = pgEnum("member_role", ["owner", "admin", "editor"]);

export const claimMethod = pgEnum("claim_method", ["email", "phone", "domain"]);

export const claimRequestStatus = pgEnum("claim_request_status", [
  "pending",
  "code_sent",
  "verified",
  "rejected",
]);

export const removalRequestStatus = pgEnum("removal_request_status", [
  "open",
  "actioned",
  "declined",
]);

/* ------------------------------------------------------------------ people */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const donorProfiles = pgTable("donor_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  city: text("city"),
  maaserPct: integer("maaser_pct").default(10).notNull(),
  /**
   * Encrypted at rest with pgcrypto — this is the single most sensitive field
   * in the product and it exists only so we can subtract from it.
   */
  incomeCentsEncrypted: text("income_cents_encrypted"),
  fiscalYearStart: text("fiscal_year_start").default("01-01").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ----------------------------------------------------------- organizations */

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    legalName: text("legal_name").notNull(),
    dba: text("dba"),
    ein: text("ein"),
    taxStatus: taxStatus("tax_status").default("unverified").notNull(),
    usPartnerOrgId: uuid("us_partner_org_id"),
    claimStatus: claimStatus("claim_status").default("unclaimed").notNull(),
    verificationLevel: verificationLevel("verification_level").default("unverified").notNull(),
    source: orgSource("source").default("irs_bmf").notNull(),

    tagline: text("tagline"),
    storyMd: text("story_md"),
    logoUrl: text("logo_url"),
    heroUrl: text("hero_url"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),

    addressLine1: text("address_line1"),
    city: text("city"),
    region: text("region"),
    postalCode: text("postal_code"),
    country: text("country").default("US").notNull(),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),

    rulingYear: integer("ruling_year"),
    nteeCode: text("ntee_code"),
    budgetBand: budgetBand("budget_band").default("unknown").notNull(),

    isPublished: boolean("is_published").default(false).notNull(),
    irsLastSyncedAt: timestamp("irs_last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("organizations_ein_idx").on(t.ein),
    index("organizations_city_idx").on(t.city),
    index("organizations_published_idx").on(t.isPublished),
    // Trigram + full-text search. Postgres FTS handles tens of thousands of
    // rows comfortably; there is no reason to pay for a hosted index here.
    index("organizations_search_idx").using(
      "gin",
      sql`to_tsvector('english', coalesce(${t.legalName}, '') || ' ' || coalesce(${t.dba}, '') || ' ' || coalesce(${t.city}, ''))`,
    ),
  ],
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHe: text("name_he"),
  iconKey: text("icon_key").notNull(),
  blurb: text("blurb"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const organizationCategories = pgTable(
  "organization_categories",
  {
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.categoryId] })],
);

export const orgMembers = pgTable(
  "org_members",
  {
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: memberRole("role").default("editor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.userId] })],
);

export const claimRequests = pgTable("claim_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  method: claimMethod("method").notNull(),
  /** Hashed, never stored in the clear. */
  codeHash: text("code_hash"),
  sentTo: text("sent_to"),
  status: claimRequestStatus("status").default("pending").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [index("departments_org_idx").on(t.orgId)],
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    goalCents: integer("goal_cents"),
    /** Self-reported. Never render without `raisedUpdatedAt`. */
    raisedCents: integer("raised_cents"),
    raisedUpdatedAt: timestamp("raised_updated_at", { withTimezone: true }),
    currency: text("currency").default("USD").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    matchMultiplier: integer("match_multiplier"),
    matcherName: text("matcher_name"),
    suggestedAmountsCents: jsonb("suggested_amounts_cents").$type<number[]>(),
    status: campaignStatus("status").default("active").notNull(),
  },
  (t) => [
    uniqueIndex("campaigns_org_slug_idx").on(t.orgId, t.slug),
    index("campaigns_status_idx").on(t.status),
  ],
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    type: paymentMethodType("type").notNull(),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    instructionsMd: text("instructions_md"),
    externalUrl: text("external_url"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [index("payment_methods_org_idx").on(t.orgId)],
);

export const endorsements = pgTable("endorsements", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  endorserName: text("endorser_name").notNull(),
  endorserTitle: text("endorser_title"),
  quote: text("quote").notNull(),
  docUrl: text("doc_url"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

/* ----------------------------------------------------------------- donors */

/** The maaser ledger. */
export const gifts = pgTable(
  "gifts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
    /** Denormalised so a year-end statement survives an org being delisted. */
    orgNameSnapshot: text("org_name_snapshot").notNull(),
    einSnapshot: text("ein_snapshot"),
    campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    givenAt: timestamp("given_at", { withTimezone: true }).notNull(),
    paymentMethodType: paymentMethodType("payment_method_type"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("gifts_user_given_idx").on(t.userId, t.givenAt)],
);

export const givingListItems = pgTable(
  "giving_list_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
    amountCents: integer("amount_cents").notNull(),
    status: text("status").default("pending").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("giving_list_user_idx").on(t.userId)],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.orgId] })],
);

/* ---------------------------------------------------------------- governance */

export const removalRequests = pgTable("removal_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  requesterEmail: text("requester_email").notNull(),
  requesterRole: text("requester_role"),
  reason: text("reason").notNull(),
  status: removalRequestStatus("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  actionedAt: timestamp("actioned_at", { withTimezone: true }),
});

export const abuseReports = pgTable("abuse_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  reporterEmail: text("reporter_email"),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_log_entity_idx").on(t.entity, t.entityId)],
);

/* -------------------------------------------------------------- relations */

export const organizationsRelations = relations(organizations, ({ many }) => ({
  departments: many(departments),
  campaigns: many(campaigns),
  paymentMethods: many(paymentMethods),
  endorsements: many(endorsements),
  categories: many(organizationCategories),
  members: many(orgMembers),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [departments.orgId],
    references: [organizations.id],
  }),
  campaigns: many(campaigns),
  paymentMethods: many(paymentMethods),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  organization: one(organizations, {
    fields: [campaigns.orgId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [campaigns.departmentId],
    references: [departments.id],
  }),
}));
