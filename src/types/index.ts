/* ─── Shared Types for Blog System ─── */

export type Lang = "tr" | "en";

export type ArticleStatus = "draft" | "published";

export type ViewMode = "edit" | "preview" | "site";

export type AIAction =
  | "improve"
  | "summarize"
  | "expand"
  | "translate"
  | "generate"
  | "bilingual"
  | "custom"
  | "auto_blog";

export type ImageAspectRatio = "landscape" | "portrait" | "square";

export type ImageLayout = "block" | "float-left" | "float-right";

export interface Article {
  id: string;
  slug: string;
  category: string;
  created_at: string;
  updated_at?: string;
}

export interface ArticleTranslation {
  id: string;
  article_id: string;
  language: string;
  title: string;
  content: string;
  status: ArticleStatus;
  thumbnail?: string | null;
  meta_description?: string | null;
}

export interface ArticleWithTranslations extends Article {
  translations: ArticleTranslation[];
}

export interface ArticleListItem {
  id: string;
  slug: string;
  category: string;
  created_at: string;
  tr_title: string | null;
  tr_status: string | null;
  en_title: string | null;
  en_status: string | null;
}

export interface PublicArticle {
  id: string;
  slug: string;
  category: string;
  created_at: string;
  title: string;
  content: string;
  language: string;
  thumbnail: string | null;
  meta_description?: string | null;
}

export interface PublicArticleListItem {
  id: string;
  slug: string;
  category: string;
  created_at: string;
  title: string;
  status: string;
}

export interface SEOCheck {
  id: string;
  label: string;
  status: "good" | "warn" | "error";
  message: string;
  tip?: string;
  aiFixable?: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}
