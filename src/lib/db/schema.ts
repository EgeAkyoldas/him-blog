import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  vector,
} from "drizzle-orm/pg-core";

/* ─── Enums ─── */

/**
 * Article categories — customize these for your domain.
 * Default values are generic. Replace with your own.
 */
export const categoryEnum = pgEnum("category", [
  "theory",
  "instrument",
  "ear_training",
  "sight_reading",
  "performance",
  "exam_prep",
  "other",
]);

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
]);

/* ─── Articles ─── */

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  category: categoryEnum("category").notNull().default("other"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ─── Article Translations ─── */

export const articleTranslations = pgTable("article_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  language: text("language").notNull(), // 'tr' | 'en'
  title: text("title").notNull(),
  content: text("content").notNull(), // HTML from TipTap
  status: articleStatusEnum("status").notNull().default("draft"),
  thumbnail: text("thumbnail"), // Supabase Storage URL
  metaDescription: text("meta_description"), // SEO meta (max 160 chars)
  embedding: vector("embedding", { dimensions: 1536 }), // Optional: AI embeddings
});
