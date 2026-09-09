import { createFileRoute } from "@tanstack/react-router";
import { getAssessors } from "#/api/assessment";
import { AssessmentForm } from "#/components/AssessmentForm/AssessmentForm";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    try {
      const assessors = await getAssessors();
      return { fetchedAssessors: assessors, assessorsError: null as string | null };
    } catch (err) {
      return {
        fetchedAssessors: [],
        assessorsError: err instanceof Error ? err.message : "Failed to load assessors",
      };
    }
  },
});

function Home() {
  const { fetchedAssessors, assessorsError } = Route.useLoaderData();

  return (
    <div
      className="flex-1 flex p-4 md:p-8
      bg-linear-to-b from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900"
    >
      <AssessmentForm fetchedAssessors={fetchedAssessors} assessorsError={assessorsError} />
    </div>
  );
}
