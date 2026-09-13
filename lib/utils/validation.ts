import type { NextRequest } from "next/server";
import { z } from "zod";

export const createProjectSchema = z.object({
  appName: z.string().trim().min(2).max(120),
  appIdea: z.string().trim().min(20).max(5000),
  designData: z.union([z.string(), z.instanceof(String)]).optional(),
  designPreference: z.string().optional(),
  dynamicAnswers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
});

export const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  prdData: z.string().optional(),
  strukturData: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  appName: z.string().optional(),
  appIdea: z.string().optional(),
  formInputs: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  taskData: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  status: z.enum(["IN_PROGRESS", "FINISHED"]).optional(),
  checkedTasks: z.union([z.string(), z.record(z.string(), z.boolean())]).optional(),
  designData: z.string().optional(),
  tasksOutdated: z.boolean().optional(),
}).refine((v) => Object.keys(v).length > 1, {
  message: "Nothing to update",
});

export const editPrdSchema = z.object({
  projectId: z.string().optional(),
  currentPrd: z.string().min(1),
  prompt: z.string().min(1).max(4000),
  selectedModel: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

/** Request body for /api/generate/* routes that need a projectId and optional forceSync. */
export const projectIdSchema = z.object({
  projectId: z.string().min(1),
  forceSync: z.boolean().optional(),
});

/** Validates the AI's mind-map (struktur) JSON before persistence. */
export const strukturSchema = z.object({
  title: z.string(),
  description: z.string(),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      phase: z.number().int(),
      color: z.string().optional(),
      children: z
        .array(z.object({ id: z.string(), label: z.string() }))
        .optional()
        .default([]),
    })
  ),
});

/** Validates the AI's task-list JSON before persistence. */
export const tasksSchema = z.object({
  phases: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      tasks: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          estimasi: z.string().optional(),
          tags: z.array(z.string()).optional().default([]),
          isCheckpoint: z.boolean().optional().default(false),
          definitionOfDone: z.string().optional(),
        })
      ),
    })
  ),
});

/** Validates the AI's dynamic-question list JSON. */
export const questionsSchema = z.array(
  z.object({
    key: z.string(),
    title: z.string(),
    subtitle: z.string(),
    type: z.enum(["single", "multiple"]),
    options: z.array(z.string()),
  })
);

/**
 * Helper: parse & validate a JSON request body. Returns the parsed value or
 * throws with a `status` on the error so routes can respond 400 consistently.
 */
export async function parseBody<T>(req: NextRequest, schema: z.ZodType<T>) {
  const raw = await req.json().catch(() => {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 } as const);
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw Object.assign(new Error(message), { status: 400 } as const);
  }
  return parsed.data as T;
}