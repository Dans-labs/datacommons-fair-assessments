import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAssessmentResults,
  fetchRawAssessmentResults,
  performAssessment,
  getAssessors,
  fetchCachedAssessmentResults,
  performOfflineAssessment,
} from "#/api/assessment";

export function usePerformAssessment() {
  return useMutation({
    mutationFn: performAssessment,
  });
}

export function usePerformOfflineAssessment() {
  return useMutation({
    mutationFn: performOfflineAssessment,
  });
}

export function useAssessmentResults(id?: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["assessmentResults", id],
    queryFn: () => fetchAssessmentResults(id),
    enabled,
    refetchInterval: (query) => {
      return query.state.data?.status === "running" ? 5000 : false;
    },
  });
}

export function useGetAssessors() {
  return useQuery({
    queryKey: ["assessors"],
    queryFn: getAssessors,
  });
}

export function useRawAssessmentResults(id?: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["rawAssessmentResults", id],
    queryFn: () => fetchRawAssessmentResults(id!),
    enabled: enabled && Boolean(id),
  });
}

export function cachedAssessmentResultsQuery(pid: string) {
  return {
    queryKey: ["cachedAssessmentResults", pid],
    queryFn: () => fetchCachedAssessmentResults(pid),
  };
}
export function useCachedAssessmentResults(pid: string) {
  return useQuery(cachedAssessmentResultsQuery(pid));
}
