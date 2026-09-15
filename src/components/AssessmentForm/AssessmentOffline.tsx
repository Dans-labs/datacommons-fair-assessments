import { Dropzone } from "#/components/Input";
import { type JsonWithFileName } from "#/api/assessment";
import { m } from "@/paraglide/messages";
import type { Dispatch, SetStateAction } from "react";

export function OfflineAssessment({
  onJsonLoaded,
  hasResults,
  jsonData,
}: {
  onJsonLoaded: Dispatch<SetStateAction<JsonWithFileName[] | null>>;
  hasResults: boolean;
  jsonData: JsonWithFileName[] | null;
}) {
  return (
    <div className="sm:pl-8 pt-4 sm:pt-0">
      <h2>{m.offlineAssessment()}</h2>
      <p className="text-sm">{m.offlineAssessmentDescription()}</p>
      <Dropzone
        onJsonLoaded={onJsonLoaded}
        maxFiles={1}
        disabled={hasResults}
        jsonData={jsonData}
      />
    </div>
  );
}
