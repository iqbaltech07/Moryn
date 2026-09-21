import fs from "fs";
import path from "path";
import { DESIGN_TEMPLATES_METADATA, DesignTemplateMetadata } from "@/lib/design/designTemplates";

/**
 * Loads the 100% authentic, unmodified markdown content from public/design templates.
 */
export function getTemplateRawMarkdown(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), "public", "design templates", filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch (err) {
    console.warn(`[getTemplateRawMarkdown] Failed to read ${filename}:`, err);
  }
  return "";
}

/**
 * Returns all design templates with their full, untruncated markdown contents.
 */
export function getAllDesignTemplatesWithContent() {
  return DESIGN_TEMPLATES_METADATA.map((meta) => ({
    ...meta,
    rawMarkdown: getTemplateRawMarkdown(meta.filename),
  }));
}

/**
 * Returns a single template by id with its raw markdown content.
 */
export function getDesignTemplateById(id: string) {
  const meta = DESIGN_TEMPLATES_METADATA.find((t) => t.id === id);
  if (!meta) return null;
  return {
    ...meta,
    rawMarkdown: getTemplateRawMarkdown(meta.filename),
  };
}
