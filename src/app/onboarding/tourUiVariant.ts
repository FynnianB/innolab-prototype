export type TourUiVariant = 1 | 2 | 3;

/**
 * Team-Vergleich: Tooltip-Design per URL wählen.
 * - `?tourUi=1` — Studio: ruhig, Fortschrittsbalken, ohne Schatten-Puls
 * - `?tourUi=2` — Coach: kompakt, Icon-Hinweis, leichter Puls
 * - `?tourUi=3` — Ticket: Split-Panel mit großer Schrittnummer
 *
 * Ohne Parameter oder ungültiger Wert → 1.
 */
export function parseTourUiVariant(search: string): TourUiVariant {
  const raw = new URLSearchParams(search).get("tourUi");
  if (raw === "2") return 2;
  if (raw === "3") return 3;
  return 1;
}
