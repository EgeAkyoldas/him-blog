import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { loadAIPrompts } from "@/lib/ai-prompts";

/**
 * GET /api/v1/admin/ai-config — Load AI configuration
 * Returns config from database, seeded from YAML if empty.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Try loading from DB
    const { data: config } = await supabase
      .from("ai_config")
      .select("*")
      .eq("id", "default")
      .single();

    const { data: personas } = await supabase
      .from("ai_personas")
      .select("*")
      .order("sort_order", { ascending: true });

    // If DB is empty, seed from YAML
    if (!config) {
      const yaml = loadAIPrompts();

      const configRow = {
        id: "default",
        system_instruction: yaml.system_instruction,
        global_rules: yaml.global_rules,
        actions: yaml.actions,
        image_prompt: yaml.image_prompt,
        persona_defaults: yaml.persona ?? {},
      };

      await supabase.from("ai_config").upsert(configRow);

      // Seed personas
      const personaRows = Object.entries(yaml.personas).map(
        ([id, p], index) => ({
          id,
          name: p.name,
          tone: p.tone,
          instruction: p.instruction,
          writing_style_rules: p.writing_style_rules ?? "",
          negative_constraints: p.negative_constraints ?? "",
          sort_order: index,
          is_active: true,
        })
      );

      if (personaRows.length > 0) {
        await supabase.from("ai_personas").upsert(personaRows);
      }

      return NextResponse.json({
        config: configRow,
        personas: personaRows,
      });
    }

    return NextResponse.json({
      config,
      personas: personas ?? [],
    });
  } catch (error) {
    console.error("AI config load error:", error);
    return NextResponse.json(
      { error: "Failed to load AI config" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/ai-config — Update AI configuration
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("ai_config")
      .upsert({
        id: "default",
        system_instruction: body.system_instruction,
        global_rules: body.global_rules,
        actions: body.actions,
        image_prompt: body.image_prompt,
        persona_defaults: body.persona_defaults ?? {},
      });

    if (error) {
      console.error("AI config update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AI config update error:", error);
    return NextResponse.json(
      { error: "Failed to update AI config" },
      { status: 500 }
    );
  }
}
