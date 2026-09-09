import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const GenerateWorkflowInput = z.object({
  description: z.string().min(10, "Describe the task in a little more detail."),
});

const WorkflowActionSchema = z.object({
  step: z.number(),
  action: z.string(),
  tool: z.string(),
});

const WorkflowTriggerSchema = z.object({
  source: z.string(),
  condition: z.string(),
});

const WorkflowSchema = z.object({
  name: z.string(),
  trigger: WorkflowTriggerSchema,
  actions: z.array(WorkflowActionSchema),
  confidence: z.number(),
  explanation: z.string(),
  requiresReview: z.boolean(),
});

export const generateWorkflow = createServerFn({ method: "POST" })
  .validator((input: unknown) => GenerateWorkflowInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      throw new Error("Missing LOVABLE_API_KEY");
    }

    const gateway = createLovableAiGatewayProvider(key);

    const { output } = await generateText({
      model: gateway("google/gemini-3.8-flash"),
      output: Output.object({
        schema: WorkflowSchema,
      }),
      system: `You are an expert workplace automation designer. Your job is to turn a plain-language description of a repetitive workplace task into a safe, structured automation workflow.

Rules:
- Use only common workplace tools (email, calendar, spreadsheet, forms, chat, file storage, CRM).
- Break the workflow into a trigger and 2-6 ordered actions.
- Set confidence between 0 and 1 based on how clearly the task can be automated.
- Mark requiresReview as true if the task involves spending money, sensitive data, legal obligations, or unclear handoffs.
- Explain the workflow in one concise sentence.
- Never suggest actions that delete data without human confirmation.
- Prefer read/summarize/notify actions over destructive write actions unless the user explicitly asks for them.

Respond ONLY with a JSON object matching this exact schema:
{
  "name": "Short workflow name",
  "trigger": { "source": "tool or event", "condition": "when it runs" },
  "actions": [
    { "step": 1, "action": "what this step does", "tool": "tool name" },
    { "step": 2, "action": "what this step does", "tool": "tool name" }
  ],
  "confidence": 0.85,
  "explanation": "One sentence summary.",
  "requiresReview": true
}`,
      prompt: `Design an automation workflow for this workplace task: "${data.description}"`,
    });

    return output;
  });
