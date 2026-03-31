import type { ReactElement } from "react";
import { Sparkles } from "lucide-react";
import type { TooltipRenderProps } from "react-joyride";
import { useLocation } from "react-router";
import { parseTourUiVariant, type TourUiVariant } from "./tourUiVariant";

function TooltipFooter({
  continuous,
  index,
  skipProps,
  backProps,
  primaryProps,
}: Pick<
  TooltipRenderProps,
  "continuous" | "index" | "skipProps" | "backProps" | "primaryProps"
>) {
  return (
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
  );
}

/** Variante 1 — Studio: sachlich, Fortschrittsbalken, kein Puls. */
function TooltipStudio(props: TooltipRenderProps) {
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
          <TooltipFooter
            continuous={continuous}
            index={index}
            skipProps={skipProps}
            backProps={backProps}
            primaryProps={primaryProps}
          />
          <p className="text-[11px] text-slate-400 mt-3 tabular-nums">
            Schritt {index + 1} von {size}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Variante 2 — Coach: kompakter Hinweis mit Icon, äußerer Schatten-Puls. */
function TooltipCoach(props: TooltipRenderProps) {
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
      className="onboarding-tooltip-pulse-wrap max-w-[min(100vw-1.25rem,19.5rem)] outline-none"
      style={{ zIndex: 10060 }}
    >
      <div className="overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 backdrop-blur-[2px]">
        <div className="p-4">
          <div className="flex gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md"
              aria-hidden
            >
              <Sparkles className="size-[22px] opacity-95" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold text-indigo-600 tabular-nums">
                Schritt {index + 1} von {size}
              </p>
              {step.title ? (
                <h3
                  className="mt-0.5 text-[15px] text-slate-900 leading-tight"
                  style={{ fontWeight: 600 }}
                >
                  {step.title}
                </h3>
              ) : null}
            </div>
          </div>
          <div className="mt-3 text-[13px] text-slate-600 leading-snug whitespace-pre-line pl-0.5">
            {step.content}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <TooltipFooter
              continuous={continuous}
              index={index}
              skipProps={skipProps}
              backProps={backProps}
              primaryProps={primaryProps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Variante 3 — Ticket: vertikaler Akzent mit großer Nummer. */
function TooltipTicket(props: TooltipRenderProps) {
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
      className="max-w-[min(100vw-1.25rem,23rem)] outline-none"
      style={{ zIndex: 10060 }}
    >
      <div className="flex overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80">
        <div className="flex w-[3.25rem] shrink-0 flex-col items-center justify-center bg-gradient-to-b from-indigo-600 to-indigo-700 px-1 py-5 text-center text-white">
          <span className="text-[22px] font-bold leading-none tabular-nums">
            {index + 1}
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/75">
            von {size}
          </span>
        </div>
        <div className="min-w-0 flex-1 px-4 py-4">
          {step.title ? (
            <h3
              className="text-[15px] text-slate-900 leading-snug mb-2"
              style={{ fontWeight: 600 }}
            >
              {step.title}
            </h3>
          ) : null}
          <div className="text-[13px] text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
            {step.content}
          </div>
          <TooltipFooter
            continuous={continuous}
            index={index}
            skipProps={skipProps}
            backProps={backProps}
            primaryProps={primaryProps}
          />
        </div>
      </div>
    </div>
  );
}

const RENDERERS: Record<
  TourUiVariant,
  (p: TooltipRenderProps) => ReactElement
> = {
  1: TooltipStudio,
  2: TooltipCoach,
  3: TooltipTicket,
};

export function OnboardingTooltip(props: TooltipRenderProps) {
  const { search } = useLocation();
  const variant = parseTourUiVariant(search);
  const Renderer = RENDERERS[variant];
  return Renderer(props);
}
