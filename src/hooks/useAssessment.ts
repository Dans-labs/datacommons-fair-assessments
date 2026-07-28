import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchAssessmentResults, performAssessment } from "#/api/assessment";

export function usePerformAssessment() {
  return useMutation({
    mutationFn: performAssessment,
  });
}

export function useAssessmentResults(id: string) {
  return useQuery({
    queryKey: ["assessmentResults", id],
    queryFn: () => fetchAssessmentResults(id),
    enabled: !!id,
  });
}
