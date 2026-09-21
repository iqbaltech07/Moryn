import { NextRequest, NextResponse } from "next/server";
import {
  getDesignTemplateById,
  getAllDesignTemplatesWithContent,
} from "@/lib/design/designTemplatesServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("id");

    if (templateId) {
      const template = getDesignTemplateById(templateId);
      if (!template) {
        return NextResponse.json({ error: "Design template not found" }, { status: 404 });
      }
      return NextResponse.json({ template });
    }

    const templates = getAllDesignTemplatesWithContent();
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Error fetching design templates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch design templates" },
      { status: 500 }
    );
  }
}
