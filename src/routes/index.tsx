import { createFileRoute } from "@tanstack/react-router";
import { Input } from "#/components/Input";
import { CheckboxGroup } from "#/components/Checkbox";
import { Form } from "@base-ui/react/form";
import { Button } from "#/components/Button";
import { useState } from "react";
import { useAssessmentResults, usePerformAssessment } from "#/hooks/useAssessment";
import type { Assessment } from "#/api/assessment";
import { m } from "@/paraglide/messages";
import Loader from "#/components/Loader";
import { AssessmentResult } from "#/components/AssessmentResult";
import { motion, AnimatePresence, MotionConfig } from "motion/react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const performAssessment = usePerformAssessment();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex-1 flex sm:items-start sm:justify-center p-4 md:p-8 flex-col sm:flex-row gap-4 sm:gap-8 
      bg-linear-to-b from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900
      "
      >
        <motion.div layout="position" transition={{ type: "spring", stiffness: 260, damping: 26 }}>
          <Form
            className="sm:w-60 md:w-80 lg:w-100 max-w-screen bg-indigo-100 dark:bg-indigo-950 p-8 rounded-lg shadow-sm relative overflow-hidden"
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
              items={[
                { id: "fuji", label: "F-UJI", value: "fuji" },
                { id: "fair_champion", label: "FAIR Champion", value: "fair_champion" },
              ]}
              defaultValue={["fuji", "fair_champion"]}
              className="mb-8"
            />
            <Button type="submit" disabled={performAssessment.isPending} className="text-xl">
              {performAssessment.isPending ? (
                <span className="flex gap-2">
                  <Loader noPadding size="5" />
                  {m.assessingButton()}
                </span>
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
              className=""
            >
              <AssessmentResults id={assessmentId} />
            </motion.div>
          )}
        </AnimatePresence>
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

function AssessmentResults({ id }: { id: string }) {
  const { data, isLoading, error } = useAssessmentResults(id);

  if (isLoading) {
    return (
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="w-100 flex justify-center"
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
        className="w-100 flex justify-center"
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
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {m.assessmentResultsHeader()}
        </h2>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {data.results.length} assessor{data.results.length === 1 ? "" : "s"}
        </span>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        {data.results.map((result) => (
          <motion.div key={result.assessor_id} variants={cardVariants}>
            <AssessmentResult result={result} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
