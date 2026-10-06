import { Dropzone, Input } from "#/components/Input";
import { type JsonWithFileName } from "#/api/assessment";
import { m } from "@/paraglide/messages";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "#/components/Button";
import { useFetchExternalURL } from "#/hooks/useAssessment";
import Loader from "#/components/Loader";

export function OfflineAssessment({
  onJsonLoaded,
  hasResults,
  jsonData,
}: {
  onJsonLoaded: Dispatch<SetStateAction<JsonWithFileName[] | null>>;
  hasResults: boolean;
  jsonData: JsonWithFileName[] | null;
}) {
  const [externalUrl, setExternalUrl] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const { mutate, isPending, error, reset } = useFetchExternalURL();

  const handleFetch = () => {
    setParseError(null);
    mutate(externalUrl.trim(), {
      onSuccess: (data) => {
        try {
          // if fetchExternalURL already returns parsed JSON, drop JSON.parse
          const parsed = typeof data === "string" ? JSON.parse(data) : data;
          onJsonLoaded([
            {
              fileName: externalUrl.trim(),
              metadata: parsed,
            },
          ]);
        } catch (e) {
          console.error("Failed to parse external JSON:", e);
          setParseError("The URL did not return valid JSON.");
        }
      },
    });
  };

  const handleUrlChange = (value: string) => {
    setExternalUrl(value);
    if (error || parseError) {
      reset();
      setParseError(null);
    }
  };

  const canFetch = !hasResults && jsonData === null && externalUrl.trim() !== "" && !isPending;

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
      <p className="text-sm mt-4">{m.offlineAssessmentExternalUrl()}</p>
      <div className="flex gap-2">
        <Input
          name="externalUrl"
          type="url"
          pattern="https?://.*"
          placeholder="https://yoururl.org/dataset.jsonld"
          value={externalUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={(e) => {
            // Enter would otherwise submit the parent form
            if (e.key === "Enter") {
              e.preventDefault();
              if (canFetch) handleFetch();
            }
          }}
          disabled={hasResults || jsonData !== null || isPending}
        />
        <Button type="button" onClick={handleFetch} disabled={!canFetch} className="w-24">
          {isPending ? <Loader size="4" noPadding /> : m.fetch()}
        </Button>
      </div>
      {(error || parseError) && (
        <span className="text-red-500 text-xs">{parseError ?? String(error)}</span>
      )}
    </div>
  );
}
