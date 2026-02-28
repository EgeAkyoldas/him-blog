import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/v1/admin/ai-personas — List all personas
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ai_personas")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ personas: data ?? [] });
  } catch (error) {
    console.error("Personas list error:", error);
    return NextResponse.json(
      { error: "Failed to load personas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/ai-personas — Create a new persona
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("ai_personas").insert({
      id: body.id,
      name: body.name,
      tone: body.tone ?? "",
      instruction: body.instruction ?? "",
      writing_style_rules: body.writing_style_rules ?? "",
      negative_constraints: body.negative_constraints ?? "",
      sort_order: body.sort_order ?? 99,
      is_active: body.is_active ?? true,
    });

    if (error) {
      console.error("Persona create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Persona create error:", error);
    return NextResponse.json(
      { error: "Failed to create persona" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/ai-personas — Update an existing persona
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    if (!body.id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("ai_personas")
      .update({
        name: body.name,
        tone: body.tone,
        instruction: body.instruction,
        writing_style_rules: body.writing_style_rules,
        negative_constraints: body.negative_constraints,
        sort_order: body.sort_order,
        is_active: body.is_active,
      })
      .eq("id", body.id);

    if (error) {
      console.error("Persona update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Persona update error:", error);
    return NextResponse.json(
      { error: "Failed to update persona" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/ai-personas — Delete a persona
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("ai_personas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Persona delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Persona delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete persona" },
      { status: 500 }
    );
  }
}
