import { useState } from "react";
import { Form } from "@base-ui/react/form";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { Button } from "#/components/Button";
import Loader from "#/components/Loader";
import { AssessmentResults } from "../AssessmentResult";
import { m } from "@/paraglide/messages";
import type { Assessor, JsonWithFileName } from "#/api/assessment";
import { useAssessmentSubmit } from "#/hooks/useAssessmentSubmit";
import { OnlineAssessment } from "./AssessmentOnline";
import { OfflineAssessment } from "./AssessmentOffline";

export function AssessmentForm({
  fetchedAssessors,
  assessorsError,
}: {
  fetchedAssessors: Assessor[];
  assessorsError: string | null;
}) {
  const [url, setUrl] = useState<string>("");
  const [jsonData, setJsonData] = useState<JsonWithFileName[] | null>(null);
  const {
    submit,
    errors,
    hasCached,
    assessmentId,
    assessors,
    performAssessment,
    offlineAssessments,
    reset,
  } = useAssessmentSubmit();

  const hasResults =
    (assessmentId && !performAssessment.isPending) || offlineAssessments?.length > 0;

  const offlineAssessmentsEnabled =
    fetchedAssessors.filter((ass) => ass.id === "offline").length > 0;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="mx-auto flex w-full flex-col xl:flex-row xl:justify-center
        gap-4 xl:gap-8"
      >
        <motion.div
          layout="position"
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="min-w-0 shrink-0"
        >
          <Form
            className="w-full xl:w-180 max-w-screen bg-indigo-100 dark:bg-indigo-950 p-8 rounded-lg shadow-sm relative overflow-hidden flex flex-wrap justify-center"
            errors={errors}
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              console.log(formData.get("url"));
              const pid = formData.get("url") as string;
              const selectedAssessors = formData.getAll("assessment-options") as string[];
              await submit(pid, selectedAssessors, jsonData);
            }}
          >
            <div className="h-1.5 w-full bg-indigo-500 dark:bg-indigo-600 absolute top-0 left-0" />
            <div
              className={`${offlineAssessmentsEnabled ? "grid sm:grid-cols-2 divide-y-2 sm:divide-x-2 sm:divide-y-0 divide-indigo-200 dark:divide-indigo-900" : ""} mb-8 w-full`}
            >
              <OnlineAssessment
                url={url}
                onUrlChange={setUrl}
                fetchedAssessors={fetchedAssessors.filter((ass) => ass.id !== "offline")}
                hasCached={hasCached}
                assessorsError={assessorsError}
                hasResults={hasResults}
              />
              {offlineAssessmentsEnabled && (
                <OfflineAssessment
                  onJsonLoaded={setJsonData}
                  jsonData={jsonData}
                  hasResults={hasResults}
                />
              )}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                type="submit"
                disabled={(performAssessment.isPending || hasResults) && !hasCached}
                className={`text-xl px-6 md:px-10 ${hasResults && !hasCached ? "opacity-50 pointer-events-none" : ""} `}
              >
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

              {hasResults && (
                <Button
                  className="text-lg"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setUrl("");
                    setJsonData(null);
                  }}
                >
                  New Assessment
                </Button>
              )}
            </div>
            {errors.root && (
              <p className="mt-4 text-sm text-red-500 w-full mb-0 text-center" role="alert">
                {errors.root}
              </p>
            )}
          </Form>
        </motion.div>
        <AnimatePresence>
          {hasResults && (
            <AssessmentResults
              key={assessmentId || "results"}
              id={assessmentId}
              assessors={assessors}
              fetchedAssessors={fetchedAssessors}
              offlineAssessments={offlineAssessments}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
