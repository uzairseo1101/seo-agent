import { z } from 'zod';

export const AiRecommendationSchema = z.object({
  findingId: z.string(),
  findingCategory: z.enum(['technical', 'content', 'geo', 'aeo', 'indexability']),
  affectedUrl: z.string().url(),
  evidenceReference: z.string(),
  explanation: z.string().min(10),
  recommendedAction: z.string().min(10),
  reasonForRecommendation: z.string().min(10),
  prioritySuggestion: z.enum(['critical', 'high', 'medium', 'low']),
  confidenceBasis: z.string(),
  limitations: z.string(),
  suggestedVerificationMethod: z.string(),
});

export const AiAuditInterpretationSchema = z.object({
  executiveSummary: z.string().min(20),
  strategicPriorities: z.array(z.string()).min(1).max(5),
  recommendations: z.array(AiRecommendationSchema),
  methodologyDisclaimer: z.string(),
});

export type AiRecommendation = z.infer<typeof AiRecommendationSchema>;
export type AiAuditInterpretation = z.infer<typeof AiAuditInterpretationSchema>;
