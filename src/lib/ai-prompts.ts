import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { createAdminClient } from "@/lib/supabase";

export interface PersonaDefinition {
  name: string;
  tone: string;
  instruction: string;
  writing_style_rules?: string;
  negative_constraints?: string;
}

export interface AIPromptConfig {
  persona: {
    name: string;
    role: string;
    expertise: string[];
  };
  personas: Record<string, PersonaDefinition>;
  global_rules: {
    format: string;
    strict_tags: boolean;
    forbidden_phrases: string[];
    negative_constraints: string;
    writing_style_rules: string;
  };
  system_instruction: string;
  actions: Record<string, string>;
  image_prompt: string;
}

let _cached: AIPromptConfig | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute cache

/**
 * Load AI prompt configuration from YAML file (fallback).
 */
export function loadAIPromptsFromYAML(): AIPromptConfig {
  const filePath = join(process.cwd(), "src", "config", "ai-prompts.yaml");
  const raw = readFileSync(filePath, "utf-8");
  return parse(raw) as AIPromptConfig;
}

/**
 * Load AI prompt configuration from database, with YAML fallback.
 * Results are cached for 1 minute to avoid excessive DB calls.
 */
export async function loadAIPromptsFromDB(): Promise<AIPromptConfig> {
  const now = Date.now();
  if (_cached && now - _cacheTime < CACHE_TTL) return _cached;

  try {
    const supabase = createAdminClient();

    const [configRes, personasRes] = await Promise.all([
      supabase.from("ai_config").select("*").eq("id", "default").single(),
      supabase
        .from("ai_personas")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (!configRes.data) {
      // DB not seeded yet, fall back to YAML
      const yaml = loadAIPromptsFromYAML();
      _cached = yaml;
      _cacheTime = now;
      return yaml;
    }

    const config = configRes.data;
    const personas = personasRes.data ?? [];

    // Build the same shape as the YAML config
    const personasMap: Record<string, PersonaDefinition> = {};
    for (const p of personas) {
      personasMap[p.id] = {
        name: p.name,
        tone: p.tone,
        instruction: p.instruction,
        writing_style_rules: p.writing_style_rules || undefined,
        negative_constraints: p.negative_constraints || undefined,
      };
    }

    const result: AIPromptConfig = {
      persona: config.persona_defaults ?? {},
      personas: personasMap,
      global_rules: config.global_rules as AIPromptConfig["global_rules"],
      system_instruction: config.system_instruction,
      actions: config.actions as Record<string, string>,
      image_prompt: config.image_prompt,
    };

    _cached = result;
    _cacheTime = now;
    return result;
  } catch {
    // DB error, fall back to YAML
    const yaml = loadAIPromptsFromYAML();
    _cached = yaml;
    _cacheTime = now;
    return yaml;
  }
}

/**
 * Load and cache AI prompt configuration.
 * Synchronous version — reads from YAML file (for backward compatibility).
 */
export function loadAIPrompts(): AIPromptConfig {
  if (_cached && Date.now() - _cacheTime < CACHE_TTL) return _cached;
  const yaml = loadAIPromptsFromYAML();
  _cached = yaml;
  _cacheTime = Date.now();
  return yaml;
}

/**
 * Invalidate the cache so next call reloads from source.
 */
export function invalidateAIPromptsCache(): void {
  _cached = null;
  _cacheTime = 0;
}

/**
 * Get persona definition by ID. Falls back to philosopher_editor.
 */
export function getPersona(
  personaId?: string,
  config?: AIPromptConfig
): PersonaDefinition & { id: string } {
  const c = config ?? loadAIPrompts();
  const id =
    personaId && c.personas[personaId] ? personaId : "philosopher_editor";
  return { id, ...c.personas[id] };
}

/**
 * Get list of available persona IDs and names for the UI.
 */
export function getPersonaList(
  config?: AIPromptConfig
): { id: string; name: string; tone: string }[] {
  const c = config ?? loadAIPrompts();
  return Object.entries(c.personas).map(([id, p]) => ({
    id,
    name: p.name,
    tone: p.tone,
  }));
}

/**
 * Interpolate template variables in a prompt string.
 * Replaces {key} patterns with values from the vars object.
 */
export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
