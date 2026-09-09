import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePerformAssessment, cachedAssessmentResultsQuery } from "#/hooks/useAssessment";
import { m } from "@/paraglide/messages";

export function useAssessmentSubmit() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasCached, setHasCached] = useState<boolean>(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessors, setAssessors] = useState<string[]>([]);
  const performAssessment = usePerformAssessment();
  const queryClient = useQueryClient();

  const submit = async (pid: string, selectedAssessors: string[]) => {
    setAssessors(selectedAssessors);

    const newErrors: Record<string, string> = {};

    try {
      new URL(pid);
    } catch {
      newErrors.url = m.invalidUrl();
    }

    if (selectedAssessors.length === 0) {
      newErrors["assessment-options"] = m.selectAtLeastOneAssessment();
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // first check if there are cached results for this PID
      const cachedResults = await queryClient.query(cachedAssessmentResultsQuery(pid));

      if (cachedResults.results && cachedResults.results.length > 0 && !hasCached) {
        setAssessmentId(cachedResults.id);
        setHasCached(true);
        setErrors({});
        return;
      }

      setHasCached(false);
      const result = await performAssessment.mutateAsync({ pid, assessors: selectedAssessors });
      setAssessmentId(result.id);
      setErrors({});
    } catch (err) {
      setErrors({ root: err instanceof Error ? err.message : m.genericError() });
    }
  };

  return {
    submit,
    errors,
    hasCached,
    assessmentId,
    assessors,
    performAssessment,
  };
}
