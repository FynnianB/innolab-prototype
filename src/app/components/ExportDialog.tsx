import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  CheckCircle2,
  Loader2,
  Download,
  Table,
  FileType,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useAppContext } from "../context/AppContext";

type ExportFormat = "PDF" | "CSV" | "XLSX";
type ExportPhase = "config" | "exporting" | "done";

const formatConfig: Record<ExportFormat, { icon: typeof FileText; color: string; bg: string; description: string }> = {
  PDF: { icon: FileType, color: "#ef4444", bg: "#fef2f2", description: "Formatierter Bericht mit Grafiken und Tabellen" },
  CSV: { icon: Table, color: "#10b981", bg: "#d1fae5", description: "Tabellarische Daten, kompatibel mit Excel & Co." },
  XLSX: { icon: FileSpreadsheet, color: "#4f46e5", bg: "#f1f0ff", description: "Excel-Arbeitsmappe mit mehreren Tabellenblättern" },
};

const scopeConfig: Record<string, { label: string; description: string; itemCount: number }> = {
  stories: { label: "User Stories", description: "Alle generierten User Stories inkl. Akzeptanzkriterien", itemCount: 7 },
  compliance: { label: "Compliance-Bericht", description: "Compliance-Check Ergebnisse mit Regelverweisen", itemCount: 12 },
  jira: { label: "Jira-Abgleich", description: "Story-Ticket-Mapping und erkannte Beziehungen", itemCount: 15 },
  all: { label: "Vollständiger Export", description: "Alle Daten inkl. Stories, Compliance und Jira-Mapping", itemCount: 34 },
};

export function ExportDialog() {
  const { showExportDialog, setShowExportDialog, exportScope, addExportRecord } = useAppContext();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("PDF");
  const [phase, setPhase] = useState<ExportPhase>("config");
  const [progress, setProgress] = useState(0);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);

  const scopeInfo = scopeConfig[exportScope] || scopeConfig.all;

  const handleClose = () => {
    setShowExportDialog(false);
    setTimeout(() => {
      setPhase("config");
      setProgress(0);
    }, 300);
  };

  const startExport = () => {
    setPhase("exporting");
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 7;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setPhase("done");
          const now = new Date();
          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          addExportRecord({
            format: selectedFormat,
            filename: `ReqWise_${scopeInfo.label.replace(/\s+/g, "_")}_${timestamp.replace(/[\s:]/g, "_")}.${selectedFormat.toLowerCase()}`,
            timestamp,
            itemCount: scopeInfo.itemCount,
            status: "completed",
          });
        }, 400);
      }
      setProgress(Math.min(Math.round(p), 100));
    }, 500);
  };

  return (
    <Dialog open={showExportDialog} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-[#4f46e5]" />
            </div>
            Daten exportieren
          </DialogTitle>
          <DialogDescription>
            Exportieren Sie Ihre Daten als PDF-Bericht, CSV-Tabelle oder Excel-Datei.
          </DialogDescription>
        </DialogHeader>

        {phase === "config" && (
          <div className="my-4 space-y-5">
            {/* Scope Info */}
            <div className="p-3 rounded-lg bg-[#f1f0ff]/50 border border-[#4f46e5]/10">
              <div className="flex items-center gap-2 mb-1">
                <FileDown className="w-4 h-4 text-[#4f46e5]" />
                <span className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>{scopeInfo.label}</span>
                <Badge variant="secondary" className="text-[10px] bg-[#4f46e5]/10 text-[#4f46e5]">
                  {scopeInfo.itemCount} Einträge
                </Badge>
              </div>
              <p className="text-[12px] text-muted-foreground">{scopeInfo.description}</p>
            </div>

            {/* Format Selection */}
            <div>
              <p className="text-[12px] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>Export-Format wählen</p>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(formatConfig) as [ExportFormat, typeof formatConfig.PDF][]).map(([format, config]) => {
                  const isSelected = selectedFormat === format;
                  return (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-[#4f46e5] bg-[#f1f0ff]/50 shadow-sm"
                          : "border-border bg-white hover:border-[#4f46e5]/30 hover:bg-[#f8fafc]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: config.bg }}>
                        <config.icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>{format}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{config.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div>
              <p className="text-[12px] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>Optionen</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-[#f8fafc] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="w-4 h-4 accent-[#4f46e5]"
                  />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Metadaten einschließen</p>
                    <p className="text-[11px] text-muted-foreground">Projekt, Autor, Erstellungsdatum</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-[#f8fafc] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                    className="w-4 h-4 accent-[#4f46e5]"
                  />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Zeitstempel und Änderungshistorie</p>
                    <p className="text-[11px] text-muted-foreground">Audit-Trail der letzten Änderungen</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {phase === "exporting" && (
          <div className="my-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f1f0ff] flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 text-[#4f46e5] animate-spin" />
            </div>
            <p className="text-[14px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>
              {selectedFormat}-Export wird erstellt...
            </p>
            <p className="text-[12px] text-muted-foreground mb-5">
              {scopeInfo.itemCount} Einträge werden verarbeitet
            </p>
            <Progress value={progress} className="h-2 mb-3" />
            <p className="text-[11px] text-muted-foreground">{progress}% abgeschlossen</p>
          </div>
        )}

        {phase === "done" && (
          <div className="my-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#d1fae5] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
              </div>
              <p className="text-[16px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Export erfolgreich!</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Ihre Datei steht zum Download bereit.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: formatConfig[selectedFormat].bg }}>
                  <FileDown className="w-5 h-5" style={{ color: formatConfig[selectedFormat].color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#1e1e2e] truncate" style={{ fontWeight: 500 }}>
                    ReqWise_{scopeInfo.label.replace(/\s+/g, "_")}.{selectedFormat.toLowerCase()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {scopeInfo.itemCount} Einträge · {selectedFormat} · {includeMetadata ? "mit Metadaten" : "ohne Metadaten"}
                  </p>
                </div>
                <Button size="sm" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 text-[12px]">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {phase === "config" && (
            <>
              <Button variant="outline" onClick={handleClose}>Abbrechen</Button>
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2" onClick={startExport}>
                <FileDown className="w-4 h-4" />
                {selectedFormat}-Export starten
              </Button>
            </>
          )}
          {phase === "done" && (
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={handleClose}>
              Schließen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
