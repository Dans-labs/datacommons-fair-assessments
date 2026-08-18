import { useState } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { Tabs } from "@base-ui/react/tabs";
import { ScrollArea } from "@base-ui/react/scroll-area";
import JsonView from "@uiw/react-json-view";
import type { AssessmentResult as AssessmentResultType } from "#/api/assessment";
import { m } from "@/paraglide/messages";
import {
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import { useGetAssessors, useRawAssessmentResults } from "#/hooks/useAssessment";

// The `raw` field isn't in the snippet you shared, so it's typed defensively here.
// If `AssessmentResult` already declares it, this extension is a no-op.
type ResultWithRaw = AssessmentResultType & { raw?: unknown };

const STATUS_STYLES: Record<string, { badge: string; bar: string; icon: string; label: string }> = {
  pass: {
    badge:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
    bar: "bg-emerald-400 dark:bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    label: m.pass(),
  },
  partial: {
    badge:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
    bar: "bg-amber-400 dark:bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    label: m.partial(),
  },
  fail: {
    badge:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700",
    bar: "bg-rose-400 dark:bg-rose-500",
    icon: "text-rose-600 dark:text-rose-400",
    label: m.fail(),
  },
  indeterminate: {
    badge:
      "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700/70 dark:text-slate-300 dark:border-slate-600",
    bar: "bg-slate-400 dark:bg-slate-500",
    icon: "text-slate-500 dark:text-slate-400",
    label: m.indeterminate(),
  },
};

const FALLBACK_STYLE = {
  badge:
    "bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-700/70 dark:text-slate-300 dark:border-slate-600",
  bar: "bg-slate-300 dark:bg-slate-600",
  icon: "text-slate-400",
};

function capitalize(value: string) {
  return value.length ? value[0].toUpperCase() + value.slice(1) : value;
}

function statusStyle(status: string) {
  const style = STATUS_STYLES[status.toLowerCase()];
  return style ?? { ...FALLBACK_STYLE, label: capitalize(status) || "Unknown" };
}

const STATUS_ICONS = {
  pass: CheckCircleIcon,
  fail: XCircleIcon,
  partial: MinusCircleIcon,
  indeterminate: QuestionMarkCircleIcon,
} as const;

function StatusIcon({ status, className = "w-4 h-4" }: { status: string; className?: string }) {
  const Icon =
    STATUS_ICONS[status.toLowerCase() as keyof typeof STATUS_ICONS] ?? QuestionMarkCircleIcon;
  return <Icon className={className} aria-hidden="true" />;
}

function StatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const style = statusStyle(status);
  const sizing = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-3 py-1 gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${sizing} ${style.badge}`}
    >
      <StatusIcon status={status} className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      {style.label}
    </span>
  );
}

const DIMENSIONS = [
  { key: "f", label: "F", full: m.findable() },
  { key: "a", label: "A", full: m.accessible() },
  { key: "i", label: "I", full: m.interoperable() },
  { key: "r", label: "R", full: m.reusable() },
] as const;

type ScoreNode = { key: string; status: string; children: ScoreNode[] };

/**
 * Turns a flat set of keys like f1, a1, a1_1, a1_2, a2 into a tree based on
 * underscore-prefix matching (a1_1's parent is a1, a1's parent is none, etc).
 */
function buildHierarchy(entries: [string, string][]): ScoreNode[] {
  const keys = entries.map(([key]) => key);
  const nodes = new Map<string, ScoreNode>(
    entries.map(([key, status]) => [key, { key, status, children: [] }]),
  );
  const roots: ScoreNode[] = [];

  for (const key of keys) {
    let parentKey: string | null = null;
    for (const candidate of keys) {
      if (candidate !== key && key.startsWith(`${candidate}_`)) {
        if (!parentKey || candidate.length > parentKey.length) parentKey = candidate;
      }
    }
    const node = nodes.get(key)!;
    if (parentKey) {
      nodes.get(parentKey)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (list: ScoreNode[]) => {
    list.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
    list.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

function formatKeyLabel(key: string) {
  return key.toUpperCase().replace(/_/g, ".");
}

function ScoreTree({ nodes, depth = 0 }: { nodes: ScoreNode[]; depth?: number }) {
  return (
    <ul
      className={
        depth === 0
          ? "space-y-1"
          : "mt-1 space-y-1 border-l border-slate-300 dark:border-slate-600 pl-3"
      }
    >
      {nodes.map((node) => (
        <li key={node.key}>
          <div className="flex items-center justify-between gap-3 py-1">
            <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <StatusIcon
                status={node.status}
                className={`w-3.5 h-3.5 shrink-0 ${statusStyle(node.status).icon}`}
              />
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {formatKeyLabel(node.key)}
              </span>
            </span>
            <StatusBadge status={node.status} size="sm" />
          </div>
          {node.children.length > 0 && <ScoreTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

function CopyJsonButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard API unavailable (e.g. insecure context) — fail silently.
        }
      }}
      className="text-xs font-medium px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      {copied ? m.copied() : m.copyJsonButton()}
    </button>
  );
}

export function AssessmentResult({
  result,
  completed,
  id,
  date,
}: {
  result: ResultWithRaw;
  completed: boolean;
  id: string;
  date: string;
}) {
  const [open, setOpen] = useState(false);
  const normalised = (result ?? {}) as Record<string, unknown>;
  console.log(date, "date");

  const overall = typeof normalised.overall === "string" ? normalised.overall : undefined;
  const profile = typeof normalised.profile === "string" ? normalised.profile : undefined;
  const processStatus = typeof normalised.status === "string" ? normalised.status : undefined;
  const version =
    typeof normalised.assessor_version === "string" ? normalised.assessor_version : undefined;

  const META_KEYS = new Set(["assessor", "profile", "status", "overall"]);
  const scoreEntries = Object.entries(normalised).filter(
    (entry): entry is [string, string] => !META_KEYS.has(entry[0]) && typeof entry[1] === "string",
  );

  const dimensions = DIMENSIONS.map((dim) => {
    const dimStatus = normalised[dim.key];
    const children = scoreEntries.filter(([key]) => new RegExp(`^${dim.key}\\d`).test(key));
    return {
      ...dim,
      status: typeof dimStatus === "string" ? dimStatus : undefined,
      tree: buildHierarchy(children),
    };
  });
  const hasCompass = dimensions.some((d) => d.status);

  // Only count leaf/sub-criteria (e.g. f1, a1_2) toward the ratio, not the
  // aggregate f/a/i/r/overall scores, to avoid double-counting.
  const leafEntries = scoreEntries.filter(([key]) => /^[a-z]+\d/i.test(key));
  const passCount = leafEntries.filter(([, status]) => status.toLowerCase() === "pass").length;
  const total = leafEntries.length;
  const passRatio = total > 0 ? passCount / total : 0;

  const { data: assessors } = useGetAssessors();
  const { data: rawResults } = useRawAssessmentResults(id, completed);

  const rawResult = rawResults?.results.find((r: any) => r.assessor === result.assessor);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 shadow-sm">
      <div
        className={`h-1.5 w-full ${overall ? statusStyle(overall).bar : "bg-slate-300 dark:bg-slate-600"}`}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {assessors?.find((a) => a.id === result.assessor)?.name}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">
                {version ? `v${version}` : ""}
              </span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {date ? m.assessmentDate({ date: new Date(date) }) : ""}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {[profile && m.profile({ profile }), processStatus].filter(Boolean).join(" · ")}
            </p>
          </div>
          {overall && <StatusBadge status={overall} />}
        </div>

        {total > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{m.passedCriteriaCount({ passCount, total })}</span>
              <span>{Math.round(passRatio * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500"
                style={{ width: `${passRatio * 100}%` }}
              />
            </div>
          </div>
        )}

        {hasCompass && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {dimensions.map((dim) =>
              dim.status ? (
                <div
                  key={dim.key}
                  title={dim.full}
                  className={`rounded-lg border px-2 py-2 text-center ${statusStyle(dim.status).badge}`}
                >
                  <div className="text-lg font-black leading-none">{dim.label}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide opacity-80 mt-1 truncate">
                    {dim.full}
                  </div>
                </div>
              ) : (
                <div
                  key={dim.key}
                  className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-2 py-2 text-center text-slate-300 dark:text-slate-600"
                >
                  <div className="text-lg font-black leading-none">{dim.label}</div>
                </div>
              ),
            )}
          </div>
        )}

        <Collapsible.Root open={open} onOpenChange={setOpen} className="mt-4">
          <Collapsible.Trigger className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 transition-colors cursor-pointer">
            <ChevronRightIcon
              className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
              aria-hidden="true"
            />
            {open ? m.hideDetails() : m.showDetails()}
          </Collapsible.Trigger>

          <Collapsible.Panel
            keepMounted
            className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0"
          >
            <div className="pt-3">
              <Tabs.Root defaultValue="breakdown">
                <Tabs.List className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-3">
                  <Tabs.Tab
                    value="breakdown"
                    className="px-3 py-1.5 text-sm font-medium border-b-2 border-transparent -mb-px text-slate-500 dark:text-slate-400 data-active:text-indigo-600 data-active:border-indigo-500 dark:data-active:text-indigo-300 transition-colors cursor-pointer hover:dark:text-white"
                  >
                    {m.breakdownTab()}
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="raw"
                    className="px-3 py-1.5 text-sm font-medium border-b-2 border-transparent -mb-px text-slate-500 dark:text-slate-400 data-active:text-indigo-600 data-active:border-indigo-500 dark:data-active:text-indigo-300 transition-colors cursor-pointer hover:dark:text-white"
                  >
                    {m.rawJsonTab()}
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="breakdown">
                  {dimensions.some((d) => d.tree.length > 0) ? (
                    <div className="space-y-3">
                      {dimensions
                        .filter((d) => d.tree.length > 0)
                        .map((dim) => (
                          <div key={dim.key}>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded ${statusStyle(dim.status ?? "indeterminate").badge}`}
                              >
                                {dim.label}
                              </span>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                {dim.full}
                              </span>
                            </div>
                            <ScoreTree nodes={dim.tree} />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {m.noDetailedBreakdownAvailable()}
                    </p>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="raw" keepMounted>
                  <div className="flex justify-end mb-2">
                    <CopyJsonButton value={JSON.stringify(rawResult ?? {})} />
                  </div>
                  <ScrollArea.Root className="h-80 rounded-lg dark:bg-[#0d1117] bg-white">
                    <ScrollArea.Viewport className="h-full">
                      <ScrollArea.Content className="p-2">
                        <JsonView
                          value={rawResult ?? {}}
                          displayDataTypes={false}
                          objectSortKeys={false}
                          shortenTextAfterLength={80}
                        />
                      </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar className="w-2 rounded-r-lg bg-gray-200 dark:bg-gray-800">
                      <ScrollArea.Thumb className="w-full rounded-lg bg-gray-400 dark:bg-gray-600" />
                    </ScrollArea.Scrollbar>
                  </ScrollArea.Root>
                </Tabs.Panel>
              </Tabs.Root>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>
    </div>
  );
}
