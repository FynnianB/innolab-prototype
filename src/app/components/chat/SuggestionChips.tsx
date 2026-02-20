import { useChatContext } from "../../context/ChatContext";
import type { SuggestionChipsData } from "../../services/chat/types";

interface Props {
  data: SuggestionChipsData;
}

export function SuggestionChips({ data }: Props) {
  const { sendMessage } = useChatContext();

  return (
    <div className="flex flex-wrap gap-1.5">
      {data.chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => sendMessage(chip.message)}
          className="px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-[12px] text-[#4f46e5] hover:bg-[#f1f5f9] hover:border-[#4f46e5]/30 transition-colors"
          style={{ fontWeight: 500 }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
