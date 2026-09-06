import { z } from "zod";

export const InputGuardSchema = z.object({
  status: z.enum(["SAFE", "REVIEW REQUIRED"]),
  reasons: z.array(z.string()).max(3),
});

export const IssueAnalysisSchema = z.object({
  machine: z.string(),
  defect: z.string(),
  quantity: z.string(),
  time: z.string(),
  measurements: z.string(),
  maintenance: z.string(),
  missingInformation: z.array(z.string()),
});

export const RootCauseSchema = z.object({
  causes: z
    .array(
      z.object({
        cause: z.string(),
        confidence: z.enum(["Low", "Medium", "High"]),
        whyPossible: z.string(),
        evidenceNeeded: z.string(),
      }),
    )
    .max(3),
});

export const ActionPlanSchema = z.object({
  immediateChecks: z.array(z.string()).max(2),
  investigation: z.array(z.string()).max(2),
  followUp: z.array(z.string()).max(2),
});

export const SafetyReviewSchema = z.object({
  status: z.enum(["PASS", "REVIEW REQUIRED"]),
  reasons: z.array(z.string()).max(3),
});

export const CriticReviewSchema = z.object({
  decision: z.enum(["PASS", "REVISE"]),
  reasons: z.array(z.string()).max(3),
});

export type InputGuard = z.infer<typeof InputGuardSchema>;

export type IssueAnalysis = z.infer<typeof IssueAnalysisSchema>;

export type RootCause = z.infer<typeof RootCauseSchema>;

export type ActionPlan = z.infer<typeof ActionPlanSchema>;

export type SafetyReview = z.infer<typeof SafetyReviewSchema>;

export type CriticReview = z.infer<typeof CriticReviewSchema>;
