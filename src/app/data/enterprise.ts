/**
 * Produkt (Sidebar-Hauptzeile) vs. Enterprise-Mandant (Unterzeile).
 * Workspaces in der Topbar = Kundenorganisationen unter diesem Mandanten.
 */
export const ENTERPRISE = {
  /** Produktname oben links (Hauptzeile) */
  productName: "ReqWise AI",
  productTagline: "Requirements Intelligence",
  /** Mandant / bereitstellende Organisation (Unterzeile, früher „Enterprise“) */
  clientName: "Capgemini",
  /** Kurz für Export-Dateinamen etc. */
  shortName: "ReqWise",
  /** Nur das Pik-Symbol (ohne Wortmarke) */
  logoSrc: "/logos/capgemini-ace.svg",
} as const;

export type EnterpriseConfig = typeof ENTERPRISE;
