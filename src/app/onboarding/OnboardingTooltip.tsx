import type { TooltipRenderProps } from "react-joyride";

/**
 * Onboarding-Karte: ruhiger Inhalt, nur der äußere Ring pulsiert (Schatten).
 */
export function OnboardingTooltip(props: TooltipRenderProps) {
  const {
    continuous,
    index,
    size,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
  } = props;

  return (
    <div
      {...tooltipProps}
      className="onboarding-tooltip-pulse-wrap max-w-[min(100vw-1.25rem,22rem)] outline-none"
      style={{ zIndex: 10060 }}
    >
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90">
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-90" />
        <div className="px-5 pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            {step.title ? (
              <h3
                className="text-[15px] text-slate-900 leading-tight tracking-tight pr-2"
                style={{ fontWeight: 600 }}
              >
                {step.title}
              </h3>
            ) : (
              <span />
            )}
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-600">
              {index + 1}/{size}
            </span>
          </div>
          <div className="text-[13px] text-slate-600 leading-[1.55] mb-5 whitespace-pre-line">
            {step.content}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2 border-t border-slate-100 pt-4 -mx-1 px-1">
            <button
              type="button"
              className="text-[12px] text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-[3px] decoration-slate-300 hover:decoration-slate-500 bg-transparent border-0 cursor-pointer p-0 font-inherit"
              {...skipProps}
            />
            <div className="flex items-center gap-2">
              {continuous && index > 0 ? (
                <button
                  type="button"
                  className="text-[13px] px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white cursor-pointer font-inherit transition-colors"
                  {...backProps}
                />
              ) : null}
              <button
                type="button"
                className="text-[13px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer border-0 font-inherit shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors"
                style={{ fontWeight: 600 }}
                {...primaryProps}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
