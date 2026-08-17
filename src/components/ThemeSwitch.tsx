// ThemeSwitch.tsx
import { ComputerDesktopIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { Button } from "@base-ui/react";
import { useTheme } from "./ThemeProvider";
import { m } from "@/paraglide/messages";
import { useEffect, useState } from "react";

const themes = [
  { key: "system", label: m.themeSystem(), Icon: ComputerDesktopIcon },
  { key: "light", label: m.themeLight(), Icon: SunIcon },
  { key: "dark", label: m.themeDark(), Icon: MoonIcon },
] as const;

type Theme = (typeof themes)[number]["key"];

export default function ThemeSwitch({ expanded }: { expanded: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleChange(value: Theme) {
    setTheme(value);
  }

  const { Icon: ActiveIcon, label: activeLabel } = themes.find((t) => t.key === theme) ?? themes[0];

  return (
    <div className="fixed bottom-2 left-2">
      <Button
        onClick={() =>
          handleChange(theme === "system" ? "light" : theme === "light" ? "dark" : "system")
        }
        aria-label={m.themeSwitcherButton({ theme: theme })}
        className={`
          ${expanded ? "hidden" : ""} md:hidden flex items-center justify-center rounded-lg p-2.5 w-full
          bg-linear-to-r from-gray-100 to-gray-300 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200
          transition-all cursor-pointer
        `}
      >
        <ActiveIcon className="h-4 w-4" />
      </Button>

      <ToggleGroup
        value={[theme]}
        onValueChange={(values) => {
          if (values.length > 0) setTheme(values[0] as Theme);
        }}
        aria-label={m.themeSwitcherButtonGroup({ theme: activeLabel })}
        className={`${!expanded ? "hidden" : "inline-flex"} md:inline-flex items-center gap-0.5 rounded-lg bg-black/10 dark:bg-black/20 justify-stretch mb-0.5`}
        aria-orientation={undefined}
      >
        {themes.map(({ key, label, Icon }) => (
          <Toggle
            key={key}
            value={key}
            aria-label={label}
            className={`
              flex-1
              flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs justify-center
              transition-all cursor-pointer
              ${mounted ? "data-pressed:bg-white data-pressed:text-gray-900" : ""}
              data-pressed:shadow-sm data-pressed:font-medium
              hover:text-gray-900
              hover:dark:text-gray-200
              ${theme === key && mounted ? "bg-white text-gray-900 shadow-sm font-medium hover:text-gray-900 hover:dark:text-gray-900" : "dark:text-gray-400 text-gray-500"}
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
