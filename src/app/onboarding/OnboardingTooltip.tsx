import type { TooltipRenderProps } from "react-joyride";
import { renderTourInline, TourMarkdown } from "./tourMarkdown";

/**
 * Schwebende Einführungskarte (Studio): Fortschrittsbalken im Kopf, Aktionen unten.
 */
type StepData = {
  hidePrimary?: boolean;
  /** Breitere Karte (längere Tour-Texte, z. B. Story-Generator). */
  widePanel?: boolean;
  /** Statt „Weiter“: konkrete UI-Aktion beschreiben (Markdown-light: **fett**). */
  actionHint?: string;
  /** Wenn Joyride nur ein Step übergibt, Fortschritt trotzdem korrekt anzeigen. */
  progressLabel?: { current: number; total: number };
  /** Aktion direkt in der Tutorial-Kachel (Story Generator u. a.). */
  tutorialCardCta?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

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
  const data = (step.data ?? {}) as StepData;
  const progressCurrent = data.progressLabel?.current ?? index + 1;
  const progressTotal = data.progressLabel?.total ?? size;
  const pct = Math.round((progressCurrent / progressTotal) * 100);

  return (
    <div
      {...tooltipProps}
      className={
        data.widePanel
          ? "max-w-[min(100vw-1.25rem,28rem)] outline-none"
          : "max-w-[min(100vw-1.25rem,22rem)] outline-none"
      }
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
              {typeof step.title === "string"
                ? renderTourInline(step.title)
                : step.title}
            </h3>
          ) : null}
          <div className="text-[13px] text-slate-600 leading-relaxed mb-5">
            {typeof step.content === "string" ? (
              <TourMarkdown text={step.content} />
            ) : (
              step.content
            )}
          </div>
          {data.tutorialCardCta ? (
            <div className="mb-4 w-full">
              <button
                type="button"
                disabled={data.tutorialCardCta.disabled}
                onClick={data.tutorialCardCta.onClick}
                className="w-full text-[13px] px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 disabled:pointer-events-none text-white cursor-pointer border-0 font-inherit shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors"
                style={{ fontWeight: 600 }}
              >
                {data.tutorialCardCta.label}
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2">
            <button
              type="button"
              className="text-[12px] text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-[3px] decoration-slate-300 hover:decoration-slate-500 bg-transparent border-0 cursor-pointer p-0 font-inherit"
              {...skipProps}
            />
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
              {!data.tutorialCardCta && data.hidePrimary && data.actionHint ? (
                <div className="text-[13px] text-slate-700 leading-relaxed max-w-[18rem] text-right sm:text-left order-first sm:order-none">
                  <div className="inline-flex items-start gap-2 rounded-lg bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100 text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 shrink-0 pt-0.5">
                      Als Nächstes
                    </span>
                    <TourMarkdown
                      text={data.actionHint}
                      variant="compact"
                      className="min-w-0 flex-1"
                    />
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                {continuous && index > 0 && !data.hidePrimary ? (
                  <button
                    type="button"
                    className="text-[13px] px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white cursor-pointer font-inherit transition-colors"
                    {...backProps}
                  />
                ) : null}
                {data.hidePrimary ? (
                  <button
                    type="button"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    {...primaryProps}
                  />
                ) : (
                  <button
                    type="button"
                    className="text-[13px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer border-0 font-inherit shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors"
                    style={{ fontWeight: 600 }}
                    {...primaryProps}
                  />
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 tabular-nums">
            Schritt {progressCurrent} von {progressTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
