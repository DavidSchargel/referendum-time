import { z } from 'zod';

export const SourceItemSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
});

export const AnalysisSchema = z.object({
  billId: z.string(),
  plainLanguageSummary: z.string(),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  whoBenefits: z.array(z.string()).default([]),
  whoMightBeHarmed: z.array(z.string()).default([]),
  debate: z.object({
    proVoice: z.string(),
    conVoice: z.string(),
  }),
  uncertainties: z.array(z.string()).default([]),
  sources: z.array(SourceItemSchema).default([]),
  generatedAtIso: z.string(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type SourceItem = z.infer<typeof SourceItemSchema>;
