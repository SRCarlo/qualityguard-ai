import { Router } from "express";
import { z } from "zod";

import { qualityGuardGraph } from "../graph/harness.js";

const router = Router();

const issueSchema = z.object({
  issue: z.string().min(10, "Issue must contain at least 10 characters"),
});

router.post("/", async (req, res) => {
  try {
    // -----------------------------------------
    // Validate request
    // -----------------------------------------

    const result = issueSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: result.error.issues,
      });
    }

    const { issue } = result.data;

    // -----------------------------------------
    // Run QualityGuard harness
    // -----------------------------------------

    console.log("\n🚀 Starting QualityGuard analysis\n");

    const output = await qualityGuardGraph.invoke({
      issue,

      inputGuard: null,

      issueAnalysis: null,

      possibleCauses: null,

      actionPlan: null,

      safetyReview: null,

      criticReview: null,

      requiresHumanApproval: true,

      revisionCount: 0,
    });

    console.log("\n🏁 QualityGuard analysis finished.\n");

    // -----------------------------------------
    // Determine execution status
    // -----------------------------------------

    const inputGuard = output.inputGuard;

    const blocked = inputGuard?.status === "REVIEW REQUIRED";

    // -----------------------------------------
    // Return result
    // -----------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        issue,

        inputGuard: output.inputGuard ?? null,

        issueAnalysis: output.issueAnalysis ?? null,

        possibleCauses: output.possibleCauses ?? null,

        actionPlan: output.actionPlan ?? null,

        safetyReview: output.safetyReview ?? null,

        criticReview: output.criticReview ?? null,

        requiresHumanApproval: blocked || output.requiresHumanApproval === true,

        revisionCount: output.revisionCount ?? 0,

        executionStatus: blocked ? "HUMAN_REVIEW_REQUIRED" : "COMPLETED",
      },
    });
  } catch (error: any) {
    console.error("\n QualityGuard analysis failed:");

    console.error(error?.message || error);

    return res.status(500).json({
      success: false,

      error: error?.message || "Quality analysis failed",
    });
  }
});

export default router;
