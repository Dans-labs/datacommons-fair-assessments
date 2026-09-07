import type { InputHTMLAttributes, Dispatch, SetStateAction } from "react";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { useDropzone, type FileRejection } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";

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
}: {
  onJsonLoaded: Dispatch<SetStateAction<string | null>>;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Non-JSON (or otherwise rejected) file selected
      if (fileRejections.length > 0) {
        setFileName(null);
        setError("Please select a valid JSON file.");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      // New valid selection replaces whatever was there before
      setError(null);
      setFileName(file.name);

      const reader = new FileReader();

      reader.onabort = () => {
        setError("File reading was aborted.");
      };

      reader.onerror = () => {
        setError("File reading has failed.");
      };

      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          onJsonLoaded(parsed);
        } catch {
          setError("That file doesn't contain valid JSON.");
        }
      };

      reader.readAsText(file);
    },
    [onJsonLoaded],
  );

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: { "application/json": [] },
  });

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      // Prevent the click from bubbling to the dropzone and reopening the file picker
      event.stopPropagation();
      setFileName(null);
      setError(null);
      onJsonLoaded(null);
    },
    [onJsonLoaded],
  );

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-3 text-center cursor-pointer
          hover:border-indigo-500
          transition-colors duration-200
          ${isDragActive ? "border-indigo-500" : "border-slate-400 dark:border-slate-500"}
        `}
      >
        <input {...getInputProps()} />
        {fileName ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="font-medium">{fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selected file"
              className="text-slate-500  hover:text-red-700 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </span>
        ) : isDragActive ? (
          <span className="opacity-50">Drop here ...</span>
        ) : (
          <span className="opacity-50">Drag and drop or click to select JSON file</span>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
