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
export type AssessmentResults = {
  id: string;
  pid: string;
  results: AssessmentResult[];
};
export type AssessmentPass = "pass" | "fail" | "indeterminate" | "partial";
export type AssessmentResult = {
  assessor_id: string;
  name: string;
  status: AssessmentStatus;
  raw: Record<string, any>;
  normalised: {
    assessor: Assessment;
    profile: Assessment;
    status: AssessmentStatus;
    overall: AssessmentPass;
    f: AssessmentPass;
    a: AssessmentPass;
    i: AssessmentPass;
    r: AssessmentPass;
    f1: AssessmentPass;
    f2: AssessmentPass;
    f3: AssessmentPass;
    f4: AssessmentPass;
    a1: AssessmentPass;
    a1_1: AssessmentPass;
    a1_2: AssessmentPass;
    a2: AssessmentPass;
    i1: AssessmentPass;
    i2: AssessmentPass;
    i3: AssessmentPass;
    r1: AssessmentPass;
    r1_1: AssessmentPass;
    r1_2: AssessmentPass;
    r1_3: AssessmentPass;
  };
  error: string | null;
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

export function fetchAssessmentResults(id: string): Promise<AssessmentResults> {
  return apiFetch(`/api/v1/assessments/${encodeURIComponent(id)}`);
}
