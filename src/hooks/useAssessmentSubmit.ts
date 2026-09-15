import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePerformAssessment,
  cachedAssessmentResultsQuery,
  usePerformOfflineAssessment,
} from "#/hooks/useAssessment";
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
  const performOfflineAssessment = usePerformOfflineAssessment();
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

    if (hasUrl) {
      try {
        const cachedResults = await queryClient.query(cachedAssessmentResultsQuery(trimmedPid));
        if (cachedResults.results?.length && !hasCached) {
          setAssessmentId(cachedResults.id);
          setHasCached(true);
        } else {
          setHasCached(false);
          const result = await performAssessment.mutateAsync({
            pid: trimmedPid,
            assessors: selectedAssessors,
          });
          setAssessmentId(result.id);
        }
      } catch (err) {
        runErrors.root = err instanceof Error ? err.message : m.genericError();
      }
    }

    if (hasJson && jsonData) {
      const outcomes = await Promise.allSettled(
        jsonData.map((item) =>
          performOfflineAssessment.mutateAsync({ ...item }).then((result) => ({
            fileName: item.fileName,
            result: {
              assessor: result.assessor,
              assessor_version: result.assessor_version,
              ...result.cells,
            },
            guidance: result.guidance,
          })),
        ),
      );

      const succeeded: { fileName: string; result: any; guidance: any }[] = [];
      const failed: { fileName: string; reason: unknown }[] = [];

      outcomes.forEach((outcome, i) => {
        if (outcome.status === "fulfilled") {
          succeeded.push({
            fileName: outcome.value.fileName,
            result: outcome.value.result,
            guidance: outcome.value.guidance,
          });
        } else {
          failed.push({ fileName: jsonData[i].fileName, reason: outcome.reason });
        }
      });

      if (succeeded.length > 0) {
        setOfflineAssessments(succeeded);
      }

      if (failed.length > 0) {
        const message =
          failed.length === jsonData.length
            ? m.genericError()
            : m.someOfflineAssessmentsFailed({ count: failed.length, total: jsonData.length });
        runErrors.root = message;
        console.error(
          "Offline assessment failures:",
          failed.map((f) => `${f.fileName}: ${f.reason}`),
        );
      }
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
