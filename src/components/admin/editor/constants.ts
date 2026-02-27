import {
  Wand2,
  FileText,
  LetterText,
  Languages,
  Sparkles,
  Globe,
  MessageSquare,
} from "lucide-react";
import type { AIAction, CategoryOption } from "@/types";

/**
 * Article categories — customize for your domain.
 * These must match the `category` enum in your DB schema.
 */
export const categories: CategoryOption[] = [
  { value: "theory", label: "Müzik Teorisi" },
  { value: "instrument", label: "Enstrüman" },
  { value: "ear_training", label: "Kulak Eğitimi" },
  { value: "sight_reading", label: "Deşifre" },
  { value: "performance", label: "Performans" },
  { value: "exam_prep", label: "Sınav Hazırlık" },
  { value: "other", label: "Genel" },
];

export const categoryLabels: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.value, c.label])
);

export const aiActions: {
  action: AIAction;
  icon: typeof Sparkles;
  label: string;
  desc: string;
}[] = [
  { action: "improve", icon: Wand2, label: "İyileştir", desc: "Profesyonelleştir" },
  { action: "summarize", icon: FileText, label: "Özetle", desc: "Kısa tut" },
  { action: "expand", icon: LetterText, label: "Genişlet", desc: "Daha uzun yaz" },
  { action: "translate", icon: Languages, label: "Çevir", desc: "Dile çevir" },
  { action: "generate", icon: Sparkles, label: "Üret", desc: "Başlıktan yaz" },
  { action: "bilingual", icon: Globe, label: "İki Dil", desc: "TR + EN üret" },
  { action: "custom", icon: MessageSquare, label: "Özel", desc: "Serbest mesaj" },
];
