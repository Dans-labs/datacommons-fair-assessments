import type { InputHTMLAttributes, Dispatch, SetStateAction } from "react";
import type { JsonWithFileName } from "#/api/assessment";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { useDropzone, type FileRejection } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";
import { m } from "@/paraglide/messages";

type BaseProps = { label?: string };

type InputProps =
  | (BaseProps & { type?: "textarea" } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
  | (BaseProps & {
      type?: Exclude<React.HTMLInputTypeAttribute, "textarea">;
    } & React.InputHTMLAttributes<HTMLInputElement>);

export function Input({ label, type, name, placeholder, className, ...props }: InputProps) {
  const isTextarea = type === "textarea";
  const sharedClass =
    "outline-none px-3 py-3 w-full bg-transparent border-2 border-slate-400 dark:border-slate-500 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Field.Root className={`relative w-full group flex flex-col ${className ?? ""}`} name={name}>
      {label && <Field.Label className="mb-1 font-bold">{label}</Field.Label>}
      {isTextarea ? (
        <Field.Control
          render={<textarea />}
          {...(props as any)}
          className={sharedClass}
          placeholder={placeholder ?? ""}
        />
      ) : (
        <Field.Control
          render={<BaseInput />}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
          type={type ?? "text"}
          className={sharedClass}
          placeholder={placeholder ?? ""}
        />
      )}
      <Field.Error className="text-red-500 text-xs absolute -bottom-5" />
    </Field.Root>
  );
}

export function Dropzone({
  onJsonLoaded,
  maxFiles = 1,
}: {
  onJsonLoaded: Dispatch<SetStateAction<JsonWithFileName[] | null>>;
  maxFiles?: number;
}) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Only treat "wrong file type" as a hard rejection. Dropzone's own maxFiles
      // check only knows about this batch, not files added in earlier drops, so we
      // don't trust its "too-many-files" rejections — we recompute that ourselves below.
      const hasInvalidType = fileRejections.some((r) =>
        r.errors.some((e) => e.code === "file-invalid-type"),
      );

      if (hasInvalidType) {
        setError(m.fileError());
        return;
      }

      const candidates = [
        ...acceptedFiles,
        ...fileRejections
          .filter((r) => r.errors.every((e) => e.code !== "file-invalid-type"))
          .map((r) => r.file),
      ];

      if (candidates.length === 0) return;

      const remainingSlots = maxFiles - fileNames.length;

      // Already full: reject everything, distinct message, nothing gets read
      if (remainingSlots <= 0) {
        setError(m.maxFilesReached({ maxFiles }));
        return;
      }

      // Partial overflow: cut off the excess before any reading happens
      const filesToProcess = candidates.slice(0, remainingSlots);
      const wasTruncated = candidates.length > remainingSlots;

      setError(wasTruncated ? m.tooManyFilesSelected({ maxFiles }) : null);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();

        reader.onabort = () => {
          setError(m.fileReadAbort());
        };

        reader.onerror = () => {
          setError(m.fileReadError());
        };

        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result as string);
            const withFileName: JsonWithFileName = {
              metadata: { ...parsed },
              fileName: file.name,
            };

            setFileNames((prev) => [...prev, file.name]);
            onJsonLoaded((prev) => [...(prev ?? []), withFileName]);
          } catch {
            setError(m.fileInvalidJson());
          }
        };

        reader.readAsText(file);
      });
    },
    [onJsonLoaded, maxFiles, fileNames.length],
  );

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    maxFiles,
    onDrop,
    accept: { "application/json": [".json"], "application/ld+json": [".jsonld"] },
    disabled: fileNames.length >= maxFiles,
  });

  const handleClear = useCallback(
    (event: React.MouseEvent, name?: string) => {
      event.stopPropagation();
      if (name) {
        setFileNames((prev) => prev.filter((n) => n !== name));
        onJsonLoaded((prev) => {
          const next = prev?.filter((j) => j.fileName !== name) ?? [];
          return next.length > 0 ? next : null;
        });
      } else {
        setFileNames([]);
        onJsonLoaded(null);
      }
      setError(null);
    },
    [onJsonLoaded],
  );

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-3
          transition-colors duration-200
          ${fileNames.length >= maxFiles ? "cursor-not-allowed" : "cursor-pointer hover:border-indigo-500"}
          ${isDragActive ? "border-indigo-500" : "border-slate-400 dark:border-slate-500"}
        `}
      >
        <input {...getInputProps()} />
        {fileNames.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {fileNames.map((name) => (
              <span key={name} className="flex w-full items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => handleClear(e, name)}
                  aria-label="Clear selected file"
                  className="text-slate-500 hover:text-red-700 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <span className="font-medium">{name}</span>
              </span>
            ))}
          </div>
        ) : isDragActive ? (
          <span className="opacity-50">{m.dropFiles()}</span>
        ) : (
          <span className="opacity-50">{m.selectFiles()}</span>
        )}
        {fileNames.length >= maxFiles && (
          <p className="text-slate-500 text-xs mt-1 mb-0">{m.maxFilesReached({ maxFiles })}</p>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
