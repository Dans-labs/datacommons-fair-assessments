import { apiFetch } from "./client";

export type AssessmentMode = "public" | "private";
export type Assessment = "fuji" | "fair_champion";
export type PerformAssessmentInput = {
  pid: string;
  mode?: AssessmentMode;
  assessors: Assessment[];
};
export type AssessmentStatus = "pending" | "processing" | "completed" | "failed"; // to check later on
export type PerformAssessmentResponse = {
  id: string;
  status: AssessmentStatus;
};

export function performAssessment({
  pid,
  mode = "public",
  assessors,
}: PerformAssessmentInput): Promise<PerformAssessmentResponse> {
  return apiFetch("/api/v1/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pid, mode, assessors }),
  });
}

export function fetchAssessmentResults(id: string) {
  return apiFetch(`/api/v1/assessments/${encodeURIComponent(id)}`);
}
