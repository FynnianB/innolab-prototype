import { useNavigate } from "react-router";
import { FileText, Ticket, ExternalLink } from "lucide-react";
import type { QueryResultData, QueryResultItem } from "../../services/chat/types";
import { useChatContext } from "../../context/ChatContext";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-[#f1f5f9] text-[#64748b]",
  "In Review": "bg-[#fef3c7] text-[#92400e]",
  Approved: "bg-[#d1fae5] text-[#065f46]",
  "In Progress": "bg-[#dbeafe] text-[#1e40af]",
  Done: "bg-[#d1fae5] text-[#065f46]",
  "To Do": "bg-[#f1f5f9] text-[#64748b]",
};

const PRIORITY_COLORS: Record<string, string> = {
  Hoch: "text-[#dc2626]",
  Mittel: "text-[#f59e0b]",
  Niedrig: "text-[#22c55e]",
};

function ResultItem({ item }: { item: QueryResultItem }) {
  const navigate = useNavigate();
  const { setOpen } = useChatContext();
  const isStory = item.type === "story";

  const handleClick = () => {
    setOpen(false);
    navigate(`/story/${item.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors text-left group"
    >
      <div className="w-7 h-7 rounded-md bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 mt-0.5">
        {isStory ? (
          <FileText className="w-3.5 h-3.5 text-[#4f46e5]" />
        ) : (
          <Ticket className="w-3.5 h-3.5 text-[#f59e0b]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[11px] text-[#4f46e5]"
            style={{ fontWeight: 600 }}
          >
            {item.id}
          </span>
          <ExternalLink className="w-3 h-3 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[12px] text-[#1e1e2e] truncate leading-snug mt-0.5">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status] ?? "bg-[#f1f5f9] text-[#64748b]"}`}
            style={{ fontWeight: 500 }}
          >
            {item.status}
          </span>
          {item.priority && (
            <span
              className={`text-[10px] ${PRIORITY_COLORS[item.priority] ?? ""}`}
              style={{ fontWeight: 500 }}
            >
              {item.priority}
            </span>
          )}
          <span className="text-[10px] text-[#94a3b8]">{item.project}</span>
        </div>
      </div>
    </button>
  );
}

interface Props {
  data: QueryResultData;
}

export function QueryResultCard({ data }: Props) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
      <div className="max-h-[220px] overflow-y-auto divide-y divide-[#f1f5f9]">
        {data.items.map((item) => (
          <ResultItem key={item.id} item={item} />
        ))}
      </div>
      {data.summary && (
        <div className="px-3 py-1.5 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-[11px] text-[#94a3b8]">{data.summary}</p>
        </div>
      )}
    </div>
  );
}
