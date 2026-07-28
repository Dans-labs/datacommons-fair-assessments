import { createFileRoute } from "@tanstack/react-router";
import { Input } from "#/components/Input";
import { CheckboxGroup } from "#/components/Checkbox";
import { Form } from "@base-ui/react/form";
import { Button } from "#/components/Button";
import { useState } from "react";
import { useAssessmentResults, usePerformAssessment } from "#/hooks/useAssessment";
import type { Assessment } from "#/api/assessment";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const performAssessment = usePerformAssessment();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Perform automated assessments</h1>
      <Form
        className="mx-auto w-100 max-w-full bg-gray-300 dark:bg-gray-800 p-8 rounded-lg mt-6"
        errors={errors}
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const pid = formData.get("url") as string;
          const assessors = formData.getAll("assessment-options") as Assessment[];

          const newErrors: Record<string, string> = {};

          try {
            new URL(pid);
          } catch {
            newErrors.url = "This is not a valid URL";
          }

          if (assessors.length === 0) {
            newErrors["assessment-options"] = "Select at least one assessment";
          }

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
          }

          try {
            const result = await performAssessment.mutateAsync({ pid, assessors });
            setAssessmentId(result.id);
            setErrors({});
          } catch (err) {
            setErrors({ root: err instanceof Error ? err.message : "Something went wrong" });
          }
        }}
      >
        <Input
          label="Enter DOI URL"
          name="url"
          type="url"
          pattern="https?://.*"
          placeholder="https://doi.org/10.1234/example"
          className="mb-6"
        />
        <CheckboxGroup
          name="assessment-options"
          groupLabel="Select assessments"
          items={[
            { id: "fuji", label: "F-UJI", value: "fuji" },
            { id: "fair_champion", label: "FAIR Champion", value: "fair_champion" },
          ]}
          defaultValue={["fuji", "fair_champion"]}
          className="mb-8"
        />
        <Button type="submit" disabled={performAssessment.isPending} className="text-xl">
          Submit
        </Button>

        {errors.root && (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {errors.root}
          </p>
        )}
      </Form>

      {assessmentId && <AssessmentResults id={assessmentId} />}
    </div>
  );
}

function AssessmentResults({ id }: { id: string }) {
  const { data, isLoading, error } = useAssessmentResults(id);

  if (isLoading) {
    return <p className="mt-4 text-sm">Loading assessment results...</p>;
  }

  if (error) {
    return (
      <p className="mt-4 text-sm text-red-500" role="alert">
        Error fetching assessment results:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Assessment Results</h2>
      <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
