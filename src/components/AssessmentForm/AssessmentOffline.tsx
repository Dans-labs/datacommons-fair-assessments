import { Dropzone, type JsonWithFileName } from "#/components/Input";
import { m } from "@/paraglide/messages";
import type { Dispatch, SetStateAction } from "react";

export function OfflineAssessment({
  onJsonLoaded,
}: {
  onJsonLoaded: Dispatch<SetStateAction<JsonWithFileName[] | null>>;
}) {
  return (
    <div className="sm:pl-8 pt-4 sm:pt-0">
      <h2>{m.offlineAssessment()}</h2>
      <p className="text-sm">{m.offlineAssessmentDescription()}</p>
      <Dropzone onJsonLoaded={onJsonLoaded} maxFiles={1} />
    </div>
  );
}
