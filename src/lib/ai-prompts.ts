import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

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

/**
 * Load and cache AI prompt configuration from YAML.
 * The YAML file is read once and cached for the lifetime of the process.
 */
export function loadAIPrompts(): AIPromptConfig {
  if (_cached) return _cached;
  const filePath = join(process.cwd(), "src", "config", "ai-prompts.yaml");
  const raw = readFileSync(filePath, "utf-8");
  _cached = parse(raw) as AIPromptConfig;
  return _cached;
}

/**
 * Get persona definition by ID. Falls back to philosopher_editor.
 */
export function getPersona(personaId?: string): PersonaDefinition & { id: string } {
  const config = loadAIPrompts();
  const id = personaId && config.personas[personaId] ? personaId : "philosopher_editor";
  return { id, ...config.personas[id] };
}

/**
 * Get list of available persona IDs and names for the UI.
 */
export function getPersonaList(): { id: string; name: string; tone: string }[] {
  const config = loadAIPrompts();
  return Object.entries(config.personas).map(([id, p]) => ({
    id,
    name: p.name,
    tone: p.tone,
  }));
}

/**
 * Interpolate template variables in a prompt string.
 * Replaces {key} patterns with values from the vars object.
 */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
