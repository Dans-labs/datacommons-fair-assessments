import type React from "react";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";

type BaseProps = { label: string };

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
      <Field.Label className="mb-1 font-bold">{label}</Field.Label>
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
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          type={type ?? "text"}
          className={sharedClass}
          placeholder={placeholder ?? ""}
        />
      )}
      <Field.Error className="text-red-500 text-xs absolute -bottom-5" />
    </Field.Root>
  );
}
