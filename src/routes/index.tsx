import { createFileRoute } from "@tanstack/react-router";
import { Input } from "#/components/Input";
import { CheckboxGroup } from "#/components/Checkbox";
import { Form } from "@base-ui/react/form";
import { Button } from "#/components/Button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAssessmentResults,
  usePerformAssessment,
  cachedAssessmentResultsQuery,
} from "#/hooks/useAssessment";
import { getAssessors, type Assessor } from "#/api/assessment";
import { m } from "@/paraglide/messages";
import Loader from "#/components/Loader";
import { AssessmentResult } from "#/components/AssessmentResult";
import { motion, AnimatePresence, MotionConfig } from "motion/react";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const assessors = await getAssessors();
    return { fetchedAssessors: assessors };
  },
});

function Home() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasCached, setHasCached] = useState<boolean>(false);
  const performAssessment = usePerformAssessment();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const { fetchedAssessors } = Route.useLoaderData();
  const [assessors, setAssessors] = useState<string[]>([]);
  const queryClient = useQueryClient();

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex-1 flex p-4 md:p-8
        bg-linear-to-b from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900"
      >
        <div
          className="mx-auto flex w-full flex-col md:flex-row md:justify-center
          gap-4 md:gap-8"
        >
          <motion.div
            layout="position"
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="min-w-0 shrink-0"
          >
            <Form
              className="md:w-80 lg:w-100 max-w-screen bg-indigo-100 dark:bg-indigo-950 p-8 rounded-lg shadow-sm relative overflow-hidden"
              errors={errors}
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const pid = formData.get("url") as string;
                const assessors = formData.getAll("assessment-options") as string[];
                setAssessors(assessors);

                const newErrors: Record<string, string> = {};

                try {
                  new URL(pid);
                } catch {
                  newErrors.url = m.invalidUrl();
                }

                if (assessors.length === 0) {
                  newErrors["assessment-options"] = m.selectAtLeastOneAssessment();
                }

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  return;
                }

                try {
                  // first check if there are cached results for this PID
                  const cachedResults = await queryClient.fetchQuery(
                    cachedAssessmentResultsQuery(pid),
                  );

                  if (cachedResults.results.length > 0 && !hasCached) {
                    setAssessmentId(cachedResults.id);
                    setHasCached(true);
                    setErrors({});
                    return;
                  }

                  setHasCached(false);
                  const result = await performAssessment.mutateAsync({ pid, assessors });
                  setAssessmentId(result.id);
                  setErrors({});
                } catch (err) {
                  setErrors({ root: err instanceof Error ? err.message : m.genericError() });
                }
              }}
            >
              <div className="h-1.5 w-full bg-indigo-500 dark:bg-indigo-600 absolute top-0 left-0" />
              <Input
                label={m.enterDoiUrl()}
                name="url"
                type="url"
                pattern="https?://.*"
                placeholder="https://doi.org/10.1234/example"
                className="mb-6"
              />
              <CheckboxGroup
                name="assessment-options"
                groupLabel={m.selectAssessments()}
                items={fetchedAssessors.map((assessor) => ({
                  id: assessor.id,
                  label: assessor.name,
                  value: assessor.id,
                }))}
                defaultValue={["fuji", "fair_champion"]}
                className="mb-8"
              />

              <AnimatePresence>
                {hasCached && (
                  <motion.div
                    key="cached-results"
                    layout="position"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className="bg-green-600 text-white rounded-md px-4 py-3 mb-6 text-sm"
                  >
                    {m.cachedResultsNotice()}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={performAssessment.isPending} className="text-xl">
                {performAssessment.isPending ? (
                  <span className="flex gap-2">
                    <Loader noPadding size="5" />
                    {m.assessingButton()}
                  </span>
                ) : hasCached ? (
                  m.assessFreshButton()
                ) : (
                  m.assessButton()
                )}
              </Button>

              {errors.root && (
                <p className="mt-4 text-sm text-red-500" role="alert">
                  {errors.root}
                </p>
              )}
            </Form>
          </motion.div>
          <AnimatePresence>
            {assessmentId && !performAssessment.isPending && (
              <motion.div
                key={assessmentId}
                layout="position"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="min-w-0 w-full md:max-w-4xl"
              >
                <AssessmentResults
                  id={assessmentId}
                  assessors={assessors}
                  fetchedAssessors={fetchedAssessors}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function AssessmentResults({
  id,
  assessors,
  fetchedAssessors,
}: {
  id: string;
  assessors: string[];
  fetchedAssessors: Assessor[];
}) {
  const { data, isLoading, error } = useAssessmentResults(id);

  if (isLoading) {
    return (
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="w-full flex justify-center"
      >
        <motion.p variants={cardVariants} className="mt-2 flex gap-2">
          <Loader noPadding /> {m.loading()}
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="w-full flex justify-center"
      >
        <motion.p variants={cardVariants} className="mt-2 text-red-500" role="alert">
          {m.errorHeader()}: {error instanceof Error ? error.message : m.errorDescription()}
        </motion.p>
      </motion.div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col w-full"
    >
      <div className="flex items-baseline justify-between mb-1 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {m.assessmentResultsHeader()}
        </h2>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex gap-2 items-center">
          {m.assessors({ count: data.results.length, total: assessors.length })}
          {data.status === "running" && (
            <span className="flex gap-1 items-center">
              <Loader noPadding size="4" />
              {m.loading()}
            </span>
          )}
        </span>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full"
      >
        <AnimatePresence mode="popLayout">
          {assessors.map((assessor) => {
            const result = data.results.find((r) => r.assessor === assessor);

            return (
              <motion.div
                key={assessor}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {result ? (
                  <AssessmentResult
                    result={result}
                    completed={data.status === "completed"}
                    id={id}
                    date={data.completed_at}
                  />
                ) : (
                  <AssessmentPlaceholder
                    assessor={fetchedAssessors.find((a) => a.id === assessor)!}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function AssessmentPlaceholder({ assessor }: { assessor: Assessor }) {
  return (
    <div className="flex h-full min-h-35 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed dark:border-slate-800 border-slate-50 p-6 text-center">
      <Loader />
      <p className="text-sm text-muted-foreground">
        {m.runningAssessment({ name: assessor.name })}
      </p>
    </div>
  );
}
