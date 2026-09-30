import { apiFetch } from "./client";

export type Assessor = {
  id: string;
  name: string;
};
export type AssessmentMode = "public" | "private";
export type Assessment = "fuji" | "fair_champion" | "offline";
export type PerformAssessmentInput = {
  pid?: string;
  mode?: AssessmentMode;
  assessors: string[];
  metadata?: Record<string, any>;
};
export type AssessmentStatus = "pending" | "running" | "completed" | "failed"; // to check later on
export type PerformAssessmentResponse = {
  id: string;
  status: AssessmentStatus;
  offline?: AssessmentResult;
};
export type AssessmentResults = {
  id: string;
  pid: string;
  status: AssessmentStatus;
  results: AssessmentResult[];
  completed_at: string;
};
export type Guidance = {
  assessor: string;
  cell: string;
  test: string;
  description: string;
  message: string | null;
  outcome: AssessmentPass;
};
export type Scores = {
  f: number | null;
  a: number | null;
  i: number | null;
  r: number | null;
  overall: number | null;
};
export type DetailedScores = {
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
export type AssessmentPass = "pass" | "fail" | "indeterminate" | "partial";
export type AssessmentResult = {
  fileName?: string;
  assessor: Assessment;
  profile: Assessment;
  status: AssessmentStatus;
  overall: AssessmentPass;
  assessor_version: string;
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
  // TODO harmonize this
  profile_ref: string;
  error: any;
  guidance: Guidance[];
  scored: Scores;
  scores: Scores;
  cells: DetailedScores;
};
export type JsonWithFileName = { fileName: string; metadata: Record<string, unknown> };

export function getAssessors(): Promise<Assessor[]> {
  return apiFetch("/api/v1/assessors/");
}

export function performAssessment({
  pid,
  mode = "public",
  assessors,
  metadata,
}: PerformAssessmentInput): Promise<PerformAssessmentResponse> {
  return apiFetch("/api/v1/assessments/", {
    method: "POST",
    body: JSON.stringify({ pid, mode, assessors, metadata }),
  });
}

export function fetchAssessmentResults(id?: string | null): Promise<AssessmentResults> {
  return apiFetch(`/api/v1/assessments/${encodeURIComponent(id ?? "")}/results`);
}

export function fetchRawAssessmentResults(
  id: string,
): Promise<Omit<AssessmentResults, "results"> & { results: any }> {
  return apiFetch(`/api/v1/assessments/${encodeURIComponent(id)}/raw`);
}

export function fetchCachedAssessmentResults(pid: string): Promise<AssessmentResults> {
  return apiFetch(`/api/v1/assessments/latest?pid=${encodeURIComponent(pid)}`, {}, true);
}
