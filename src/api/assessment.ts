import { apiFetch } from "./client";

export type Assessor = {
  id: string;
  name: string;
};
export type AssessmentMode = "public" | "private";
export type Assessment = "fuji" | "fair_champion";
export type PerformAssessmentInput = {
  pid: string;
  mode?: AssessmentMode;
  assessors: Assessment[];
};
export type AssessmentStatus = "pending" | "running" | "completed" | "failed"; // to check later on
export type PerformAssessmentResponse = {
  id: string;
  status: AssessmentStatus;
};
export type AssessmentResults = {
  id: string;
  pid: string;
  status: AssessmentStatus;
  results: AssessmentResult[];
};
export type AssessmentPass = "pass" | "fail" | "indeterminate" | "partial";
export type AssessmentResult = {
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

export function getAssessors(): Promise<Assessor[]> {
  return apiFetch("/api/v1/assessors/");
}

export function performAssessment({
  pid,
  mode = "public",
  assessors,
}: PerformAssessmentInput): Promise<PerformAssessmentResponse> {
  return apiFetch("/api/v1/assessments/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pid, mode, assessors }),
  });
}

export function fetchAssessmentResults(id: string): Promise<AssessmentResults> {
  return apiFetch(`/api/v1/assessments/${encodeURIComponent(id)}`);
}

export function fetchRawAssessmentResults(
  id: string,
): Promise<Omit<AssessmentResults, "results"> & { results: any }> {
  return apiFetch(`/api/v1/assessments/${encodeURIComponent(id)}/raw`);
}
