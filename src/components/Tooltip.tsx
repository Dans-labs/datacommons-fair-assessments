import { Popover } from "@base-ui/react/popover";
import { m } from "@/paraglide/messages";
import { STATUS_STYLES, StatusIcon, type ResultGuidance } from "./AssessmentResult";

export default function TooltipComponent({
  children,
  title,
  tip,
  className,
}: {
  children: React.ReactNode;
  title: string;
  tip: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger className={className}>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className="
            bg-black/80 text-white rounded-xl p-3 max-w-xs
            data-starting-style:opacity-0 data-starting-style:scale-98 data-ending-style:opacity-0 data-ending-style:scale-98 transition-[opacity,transform]
          "
          >
            <Popover.Arrow
              className="
                relative block h-1.5 w-3 overflow-clip
                data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180
                data-[side=bottom]:-top-1.5 data-[side=bottom]:rotate-0
                data-[side=left]:-right-2.25 data-[side=left]:rotate-90
                data-[side=right]:-left-2.25 data-[side=right]:-rotate-90
                before:absolute before:bottom-0 before:left-1/2
                before:block before:box-border
                before:h-[calc(6px*sqrt(2))]
                before:w-[calc(6px*sqrt(2))]
                before:-translate-x-1/2 before:translate-y-1/2
                before:rotate-45
                before:bg-black/80
            "
            />
            <Popover.Title className="text-base mb-1">{title}</Popover.Title>
            {tip}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function GuidanceTooltip({
  node,
  guidance,
  children,
  className,
}: {
  node: string;
  guidance: ResultGuidance | undefined;
  children: React.ReactNode;
  className?: string;
}) {
  const guidanceTip = guidance ? (
    <div className="text-sm *:leading-snug">
      <p className="mb-2">
        {node}: {guidance.description}
      </p>
      <p
        className={`${STATUS_STYLES[guidance.outcome].badge} border-1 px-2 py-1 rounded-xl mb-1 flex gap-2 items-center`}
      >
        <StatusIcon status={guidance.outcome} />
        <span className="flex-1">{guidance.message}</span>
      </p>
      {guidance.guidance.length > 0
        ? [
            <h3 className="text-sm mb-1 mt-4">How to improve?</h3>,
            guidance.guidance.map((g, index) => (
              <p key={index} className="mb-1">
                {g}
              </p>
            )),
          ]
        : null}
    </div>
  ) : (
    <div className="text-sm *:leading-snug">
      <p className="mb-2">
        {node}: {m.noGuidance()}
      </p>
    </div>
  );
  return (
    <TooltipComponent tip={guidanceTip} className={className} title={m.guidance()}>
      {children}
    </TooltipComponent>
  );
}
