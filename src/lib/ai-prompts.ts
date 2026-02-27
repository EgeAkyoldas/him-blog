import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

export interface AIPromptConfig {
  persona: {
    name: string;
    role: string;
    expertise: string[];
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
 * Interpolate template variables in a prompt string.
 * Replaces {key} patterns with values from the vars object.
 */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
