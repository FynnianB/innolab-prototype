import type { ReactNode } from "react";

const formulaWordClass = "italic font-semibold text-slate-600";

/**
 * Hebt die festen englischen Formel-Teile einer User Story hervor
 * („As a …, I want …, so that …“), damit sie sich vom deutschsprachigen Inhalt absetzen.
 */
export function UserStoryFormulaText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const trimmed = text.trim();
  const strict = trimmed.match(
    /^As a (.+?), I want (.+?), so that (.+)$/is,
  );
  if (strict) {
    const [, role, want, soThat] = strict;
    return (
      <span className={className}>
        <span className={formulaWordClass}>As a</span> {role}
        <span className={formulaWordClass}>, I want</span> {want}
        <span className={formulaWordClass}>, so that</span> {soThat}
      </span>
    );
  }

  const re = /\b(As a|I want|so that)\b/gi;
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(trimmed)) !== null) {
    if (m.index > last) {
      parts.push(trimmed.slice(last, m.index));
    }
    parts.push(
      <span key={key++} className={formulaWordClass}>
        {m[1]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < trimmed.length) {
    parts.push(trimmed.slice(last));
  }
  return parts.length > 0 ? (
    <span className={className}>{parts}</span>
  ) : (
    <span className={className}>{trimmed}</span>
  );
}

/**
 * Deutsche Variante der User-Story-Zeile im Generator (Rolle / Ziel / Nutzen getrennt).
 */
export function GermanUserStoryFormulaLine({
  role,
  goal,
  benefit,
  className,
}: {
  role: string;
  goal: string;
  benefit: string;
  className?: string;
}) {
  return (
    <p className={className}>
      <span className={formulaWordClass}>Als</span>{" "}
      <span className="font-medium text-[#475569]">{role}</span>{" "}
      <span className={formulaWordClass}>möchte ich</span>{" "}
      <span className="font-medium text-[#475569]">{goal}</span>
      <span className={formulaWordClass}>, damit</span>{" "}
      <span className="font-medium text-[#475569]">{benefit}</span>.
    </p>
  );
}
