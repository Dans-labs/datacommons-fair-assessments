import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePerformAssessment, cachedAssessmentResultsQuery } from "#/hooks/useAssessment";
import { m } from "@/paraglide/messages";
import type { JsonWithFileName } from "#/api/assessment";

export function useAssessmentSubmit() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasCached, setHasCached] = useState<boolean>(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessors, setAssessors] = useState<string[]>([]);
  const [offlineAssessments, setOfflineAssessments] = useState<{ fileName: string; result: any }[]>(
    [],
  );
  const performAssessment = usePerformAssessment();
  const queryClient = useQueryClient();

  const submit = async (
    pid: string,
    selectedAssessors: string[],
    jsonData: JsonWithFileName[] | null,
  ) => {
    setAssessors(selectedAssessors);
    setErrors({});

    const trimmedPid = pid.trim();
    const hasUrl = trimmedPid.length > 0;
    const hasJson = !!jsonData && jsonData.length > 0;

    const newErrors: Record<string, string> = {};

    if (!hasUrl && !hasJson) {
      newErrors.root = m.provideUrlOrJson(); // nothing to submit at all
    }

    if (hasUrl) {
      try {
        new URL(trimmedPid);
      } catch {
        newErrors.url = m.invalidUrl();
      }
      if (selectedAssessors.length === 0) {
        newErrors["assessment-options"] = m.selectAtLeastOneAssessment();
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const runErrors: Record<string, string> = {};

    try {
      const cachedResults = await queryClient.query(cachedAssessmentResultsQuery(trimmedPid));
      if (cachedResults.results?.length && !hasCached) {
        setAssessmentId(cachedResults.id);
        setHasCached(true);
        if (hasJson) {
          const result = await performAssessment.mutateAsync({
            pid: jsonData[0].fileName,
            assessors: ["offline"],
            metadata: jsonData[0].metadata,
          });
          setOfflineAssessments([{ fileName: jsonData[0].fileName, result: result.offline }]);
        }
      } else {
        setHasCached(false);
        const assessors =
          hasJson && hasUrl
            ? [...selectedAssessors, "offline"]
            : hasUrl
              ? selectedAssessors
              : hasJson
                ? ["offline"]
                : [];
        if (assessors.length === 0) {
          runErrors["assessment-options"] = m.selectAtLeastOneAssessment();
          setErrors(runErrors);
          return;
        }
        const result = await performAssessment.mutateAsync({
          pid: hasUrl ? trimmedPid : (jsonData?.[0].fileName ?? ""),
          assessors: assessors,
          metadata: hasJson ? jsonData[0].metadata : undefined,
        });
        if (hasJson) {
          setOfflineAssessments([{ fileName: jsonData[0].fileName, result: result.offline }]);
        }
        setAssessmentId(result.id);
      }
    } catch (err) {
      runErrors.root = err instanceof Error ? err.message : m.genericError();
    }

    if (Object.keys(runErrors).length > 0) {
      setErrors(runErrors);
    }
  };

  const reset = () => {
    setAssessmentId(null);
    setHasCached(false);
    setOfflineAssessments([]);
    setErrors({});
  };

  return {
    submit,
    errors,
    hasCached,
    assessmentId,
    assessors,
    performAssessment,
    offlineAssessments,
    reset,
  };
}
