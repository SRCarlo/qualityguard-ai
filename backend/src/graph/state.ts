import { Annotation } from "@langchain/langgraph";

export const HarnessState = Annotation.Root({
  issue: Annotation<string>,

  inputGuard: Annotation<any>,

  issueAnalysis: Annotation<any>,

  possibleCauses: Annotation<any>,

  actionPlan: Annotation<any>,

  safetyReview: Annotation<any>,

  criticReview: Annotation<any>,

  requiresHumanApproval: Annotation<boolean>,

  revisionCount: Annotation<number>,
});

export type HarnessStateType = typeof HarnessState.State;
