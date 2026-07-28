import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Fieldset } from "@base-ui/react/fieldset";
import { Field } from "@base-ui/react/field";

type CheckboxItem = {
  id: string;
  label: string;
  value: string;
};

const boxClass =
  "h-6 w-6 shrink-0 flex items-center justify-center rounded-lg border-2 " +
  "border-gray-800 dark:border-gray-500 bg-transparent outline-none transition-colors " +
  "focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 " +
  "data-[checked]:bg-indigo-500 data-[checked]:border-indigo-500";

export function CheckboxGroup({
  name,
  groupLabel,
  items,
  defaultValue = [],
  className = "",
}: {
  name: string;
  groupLabel: string;
  items: CheckboxItem[];
  defaultValue?: string[];
  className?: string;
}) {
  return (
    <Field.Root name={name} className={`relative ${className}`}>
      <Fieldset.Root>
        <Fieldset.Legend className="mb-2 font-bold">{groupLabel}</Fieldset.Legend>
        <BaseCheckboxGroup defaultValue={defaultValue} className="flex flex-col gap-2">
          {items.map((item) => (
            <label
              key={item.id}
              htmlFor={item.id}
              className="flex w-fit cursor-pointer select-none items-center gap-2"
            >
              <BaseCheckbox.Root id={item.id} name={name} value={item.value} className={boxClass}>
                <BaseCheckbox.Indicator className="flex h-full w-full items-center justify-center text-white">
                  <CheckIcon />
                </BaseCheckbox.Indicator>
              </BaseCheckbox.Root>
              {item.label}
            </label>
          ))}
        </BaseCheckboxGroup>
      </Fieldset.Root>
      <Field.Error className="absolute -bottom-5 text-xs text-red-500" />
    </Field.Root>
  );
}

export function Checkbox({
  id,
  label,
  defaultChecked = false,
}: {
  id: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={id} className="">
      <BaseCheckbox.Root id={id} name={id} defaultChecked={defaultChecked} className="">
        <BaseCheckbox.Indicator className="h-6 w-6 flex items-center justify-center rounded-lg bg-indigo-500 text-white">
          <CheckIcon />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label}
    </label>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  );
}
