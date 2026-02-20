import { ArrowRight, Check, X, Layers } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import type { BulkOperationPreview as BulkPreviewData } from "../../services/chat/types";

const FIELD_LABELS: Record<string, string> = {
  priority: "Priorität",
  status: "Status",
  effort: "Aufwand",
};

interface Props {
  data: BulkPreviewData;
}

export function BulkOperationPreview({ data }: Props) {
  const { applyBulkOperation, dismissBulkOperation, pendingOperation } =
    useChatContext();

  const isApplied = data.applied === true;
  const isActive = !isApplied && pendingOperation !== null;

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#4f46e5]" />
          <span
            className="text-[12px] text-[#475569]"
            style={{ fontWeight: 600 }}
          >
            {FIELD_LABELS[data.field] ?? data.field} ändern
          </span>
        </div>
        <span className="text-[11px] text-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
          {data.changes.length} Einträge
        </span>
      </div>

      {/* Table */}
      <div className="max-h-[180px] overflow-y-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#f1f5f9]">
              <th
                className="text-left px-3 py-1.5 text-[#94a3b8]"
                style={{ fontWeight: 500 }}
              >
                ID
              </th>
              <th
                className="text-left px-3 py-1.5 text-[#94a3b8]"
                style={{ fontWeight: 500 }}
              >
                Name
              </th>
              <th
                className="text-center px-3 py-1.5 text-[#94a3b8]"
                style={{ fontWeight: 500 }}
              >
                Änderung
              </th>
            </tr>
          </thead>
          <tbody>
            {data.changes.map((change) => (
              <tr
                key={change.id}
                className="border-b border-[#f1f5f9] last:border-0"
              >
                <td className="px-3 py-1.5 text-[#4f46e5]" style={{ fontWeight: 500 }}>
                  {change.id}
                </td>
                <td className="px-3 py-1.5 text-[#475569] max-w-[120px] truncate">
                  {change.title}
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[#94a3b8] line-through">
                      {change.oldValue}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                    <span className="text-[#059669]" style={{ fontWeight: 600 }}>
                      {change.newValue}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      {isActive && (
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button
            onClick={applyBulkOperation}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white text-[12px] hover:bg-[#4338ca] transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Check className="w-3.5 h-3.5" />
            Anwenden
          </button>
          <button
            onClick={dismissBulkOperation}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] text-[12px] hover:bg-[#f1f5f9] transition-colors"
            style={{ fontWeight: 500 }}
          >
            <X className="w-3.5 h-3.5" />
            Abbrechen
          </button>
        </div>
      )}

      {isApplied && (
        <div className="px-3 py-2 border-t border-[#e2e8f0] bg-[#f0fdf4]">
          <div className="flex items-center gap-1.5 text-[12px] text-[#059669]" style={{ fontWeight: 500 }}>
            <Check className="w-3.5 h-3.5" />
            Änderungen angewendet
          </div>
        </div>
      )}
    </div>
  );
}
