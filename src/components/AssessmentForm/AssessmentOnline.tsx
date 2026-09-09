import { Input } from "#/components/Input";
import { CheckboxGroup } from "#/components/Checkbox";
import { m } from "@/paraglide/messages";
import { CachedResultsNotice } from "./CachedResultsNotice";
import type { Assessor } from "#/api/assessment";

export function OnlineAssessment({
  url,
  onUrlChange,
  fetchedAssessors,
  hasCached,
  assessorsError,
}: {
  url: string;
  onUrlChange: (value: string) => void;
  fetchedAssessors: Assessor[];
  hasCached: boolean;
  assessorsError?: string | null;
}) {
  return (
    <div className="sm:pr-8 pb-4 sm:pb-0">
      <h2>{m.onlineAssessment()}</h2>
      <p className="text-sm">{m.onlineAssessmentDescription()}</p>
      <Input
        name="url"
        type="url"
        pattern="https?://.*"
        placeholder="https://doi.org/10.1234/example"
        className="mb-6"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
      />
      {assessorsError ? (
        <p className="text-red-500 text-sm" role="alert">
          {m.assessorsLoadError({ error: assessorsError })}
        </p>
      ) : (
        <CheckboxGroup
          name="assessment-options"
          groupLabel={m.selectAssessments()}
          items={fetchedAssessors.map((assessor) => ({
            id: assessor.id,
            label: assessor.name,
            value: assessor.id,
          }))}
          defaultValue={["fuji", "fair_champion"]}
        />
      )}

      <CachedResultsNotice show={hasCached} />
    </div>
  );
}
