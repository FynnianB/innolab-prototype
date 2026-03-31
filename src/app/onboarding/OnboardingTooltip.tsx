import type { TooltipRenderProps } from "react-joyride";

/**
 * Schwebende Einführungskarte (Studio): Fortschrittsbalken im Kopf, Aktionen unten.
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
  const pct = Math.round(((index + 1) / size) * 100);

  return (
    <div
      {...tooltipProps}
      className="max-w-[min(100vw-1.25rem,22rem)] outline-none"
      style={{ zIndex: 10060 }}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/90">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Einführung
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-indigo-500 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="px-5 pt-4 pb-4">
          {step.title ? (
            <h3
              className="text-[16px] text-slate-900 leading-snug tracking-tight mb-2"
              style={{ fontWeight: 600 }}
            >
              {step.title}
            </h3>
          ) : null}
          <div className="text-[13px] text-slate-600 leading-relaxed mb-5 whitespace-pre-line">
            {step.content}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2">
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
          <p className="text-[11px] text-slate-400 mt-3 tabular-nums">
            Schritt {index + 1} von {size}
          </p>
        </div>
      </div>
    </div>
  );
}
