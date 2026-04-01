import type { ReactNode } from "react";

/** Inline: **fett** (GitHub-übliches Markdown). */
export function renderTourInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-slate-800">
          {m[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Kurz-Markdown für Tutorial-Kacheln: Absätze via Leerzeile, Zeilenumbrüche mit \n, **fett**.
 */
export function TourMarkdown({
  text,
  className,
  variant = "default",
}: {
  text: string;
  className?: string;
  /** Kompakter Abstand in Hinweis-Zeilen (z. B. „Als Nächstes“). */
  variant?: "default" | "compact";
}) {
  const pGap = variant === "compact" ? "mb-1.5 last:mb-0" : "mb-3 last:mb-0";
  const blocks = text.trim().split(/\n\n+/);
  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        return (
          <p key={bi} className={pGap}>
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 ? <br /> : null}
                {renderTourInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
