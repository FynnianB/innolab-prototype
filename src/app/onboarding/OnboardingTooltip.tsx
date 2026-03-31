import type { TooltipRenderProps } from "react-joyride";

/**
 * Sprechblasen-Layout: dunkle Karte, gut lesbar; Buttons übernehmen Text aus Joyride-Locale (children in Props).
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
      className="rounded-xl border border-[#4c4c5c] bg-[#1e1e2e] text-white shadow-2xl max-w-[min(100vw-1.5rem,22.5rem)] px-4 py-3.5 outline-none"
      style={{ zIndex: 10060 }}
    >
      {step.title ? (
        <h3
          className="text-[15px] text-white mb-2 leading-snug"
          style={{ fontWeight: 600 }}
        >
          {step.title}
        </h3>
      ) : null}
      <div className="text-[13px] text-white/88 leading-relaxed mb-4">
        {step.content}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2">
        <button
          type="button"
          className="text-[12px] text-white/65 hover:text-white underline underline-offset-2 bg-transparent border-0 cursor-pointer p-0 font-inherit"
          {...skipProps}
        />
        <div className="flex items-center gap-2">
          {continuous && index > 0 ? (
            <button
              type="button"
              className="text-[13px] px-3 py-1.5 rounded-lg border border-white/25 text-white/90 hover:bg-white/10 bg-transparent cursor-pointer font-inherit"
              {...backProps}
            />
          ) : null}
          <button
            type="button"
            className="text-[13px] px-3.5 py-1.5 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white cursor-pointer border-0 shadow-sm font-inherit"
            {...primaryProps}
          />
        </div>
      </div>
      <p className="text-[11px] text-white/45 mt-3 tabular-nums">
        Schritt {index + 1} von {size}
      </p>
    </div>
  );
}
