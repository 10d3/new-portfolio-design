import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Better-Auth Required Tables ────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));


// ─── Projects ────────────────────────────────────────────────────────────────

/**
 * A project entry shown on the portfolio homepage and its own slug detail page.
 * The slug detail page is designed to impress recruiters, so the schema
 * supports rich content beyond the card: full description, challenges,
 * outcomes, multiple screenshots, role, team size, and duration.
 */
export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // ── Core ────────────────────────────────────────────────────────────────
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  /** Short description shown on the homepage card. */
  description: text("description").notNull(),

  /**
   * Full case-study body — stored as HTML from Tiptap, rendered on the
   * /projects/[slug] detail page. Supports headings, code blocks, etc.
   */
  body: text("body"),

  dates: text("dates").notNull(),
  active: boolean("active").default(false).notNull(),

  // ── Media ────────────────────────────────────────────────────────────────
  /** Looping demo video URL (UploadThing or external). */
  videoUrl: text("video_url"),

  /** Hero / cover image URL. */
  imageUrl: text("image_url"),

  /**
   * Extra screenshots for the detail page gallery.
   * Stored as a JSON array of { url, caption } objects.
   */
  gallery: jsonb("gallery").$type<{ url: string; caption?: string }[]>(),

  // ── Technologies ─────────────────────────────────────────────────────────
  technologies: text("technologies").array(),

  // ── Links ────────────────────────────────────────────────────────────────
  siteUrl: text("site_url"),
  sourceUrl: text("source_url"),

  // ── Recruiter-facing detail-page fields ──────────────────────────────────
  /** Your role on the project (e.g. "Lead Full-Stack Developer"). */
  role: text("role"),

  /** Number of people on the team. */
  teamSize: text("team_size"),

  /**
   * Key challenges you solved — stored as a JSON array of strings.
   * Rendered as a bullet list on the detail page.
   */
  challenges: jsonb("challenges").$type<string[]>(),

  /**
   * Measurable outcomes / impact (e.g. "Reduced processing time by 60%").
   * Rendered as a bullet list on the detail page.
   */
  outcomes: jsonb("outcomes").$type<string[]>(),

  /**
   * Key features to highlight (beyond the description).
   * Rendered as a feature grid on the detail page.
   */
  features: jsonb("features").$type<{ title: string; description: string }[]>(),

  // ── SEO ──────────────────────────────────────────────────────────────────
  metaDescription: text("meta_description"),

  // ── Timestamps ───────────────────────────────────────────────────────────
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),

  /** Tiptap HTML content. */
  content: text("content"),

  imageUrl: text("image_url"),
  keywords: text("keywords").array(),

  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
