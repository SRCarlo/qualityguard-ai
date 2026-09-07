export interface HarnessState {
  issue: string;

  issueSummary?: string;

  possibleCauses?: string[];

  actionPlan?: string[];

  safetyReview?: string;

  criticReview?: string;

  requiresHumanApproval: boolean;

  status: string;
}
