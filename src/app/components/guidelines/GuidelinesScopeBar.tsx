import { useMemo, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "../ui/utils";
import {
  getProjectIdsForWorkspace,
  PROJECT_LOGO_BY_ID,
  PROJECT_SEARCH_META,
} from "../../data/workspaces";

const filterFieldTriggerClass =
  "rounded-xl border border-slate-200 bg-white text-[12px] text-slate-700 shadow-sm transition-[border-color,box-shadow,background-color] duration-150 hover:border-slate-300 hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/20 data-[state=open]:border-[#4f46e5]/40 data-[state=open]:ring-2 data-[state=open]:ring-[#4f46e5]/12";

export const GUIDELINES_SCOPE_WORKSPACE = "__workspace__";

export type GuidelinesScopeMode = "workspace" | "project";

interface GuidelinesScopeBarProps {
  workspaceId: string;
  /** `GUIDELINES_SCOPE_WORKSPACE` oder Projekt-ID */
  value: string;
  onValueChange: (value: string) => void;
}

function ScopeGlyph({ projectId }: { projectId: string | null }) {
  if (projectId == null) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f0ff]">
        <Building2 className="h-4 w-4 text-[#4f46e5]" />
      </span>
    );
  }
  const src = PROJECT_LOGO_BY_ID[projectId];
  if (!src) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Building2 className="h-4 w-4 text-slate-500" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
      <img src={src} alt="" className="max-h-6 max-w-6 object-contain" />
    </span>
  );
}

export function GuidelinesScopeBar({
  workspaceId,
  value,
  onValueChange,
}: GuidelinesScopeBarProps) {
  const [open, setOpen] = useState(false);

  const projectOptions = useMemo(
    () =>
      getProjectIdsForWorkspace(workspaceId)
        .map((id) => ({
          id,
          name: PROJECT_SEARCH_META[id]?.name ?? id,
        }))
        .filter((p) => p.name),
    [workspaceId],
  );

  const isWorkspace = value === GUIDELINES_SCOPE_WORKSPACE;
  const triggerProjectId = isWorkspace ? null : value;
  const triggerLabel = isWorkspace
    ? "Gesamter Workspace"
    : PROJECT_SEARCH_META[value]?.name ?? value;

  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <span
        className="shrink-0 text-[12px] text-muted-foreground"
        style={{ fontWeight: 500 }}
      >
        Auswertungsbereich
      </span>
      <Popover modal={false} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              filterFieldTriggerClass,
              "h-10 min-h-10 w-full max-w-full justify-between gap-2 px-3.5 font-medium sm:w-fit sm:min-w-[240px] sm:max-w-[min(100vw-2rem,22rem)] border-slate-200 bg-white shadow-sm hover:bg-slate-50/80",
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5 text-left">
              <ScopeGlyph projectId={triggerProjectId} />
              <span className="min-w-0 truncate text-[13px] text-slate-800">
                {triggerLabel}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(100vw-2rem,320px)] rounded-xl border border-slate-200 p-0 shadow-lg z-[200]"
          align="start"
        >
          <div
            className="border-b border-slate-100 px-3 py-2 text-[11px] text-slate-500"
            style={{ fontWeight: 600 }}
          >
            Bereich wählen
          </div>
          <RadioGroup
            value={value}
            onValueChange={(v) => {
              onValueChange(v);
              setOpen(false);
            }}
            className="gap-0"
          >
            <label
              htmlFor="guidelines-scope-ws"
              className="flex cursor-pointer items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 text-[12px] text-slate-800 hover:bg-slate-50/90"
            >
              <RadioGroupItem
                value={GUIDELINES_SCOPE_WORKSPACE}
                id="guidelines-scope-ws"
              />
              <ScopeGlyph projectId={null} />
              <span className="min-w-0 flex-1 font-medium text-[#4f46e5]">
                Gesamter Workspace
              </span>
            </label>
            <div className="max-h-[min(52vh,280px)] overflow-y-auto p-2">
              {projectOptions.length === 0 ? (
                <p className="px-2 py-3 text-center text-[12px] text-muted-foreground">
                  Keine Projekte in diesem Workspace.
                </p>
              ) : (
                projectOptions.map(({ id, name }) => (
                  <label
                    key={id}
                    htmlFor={`guidelines-scope-${id}`}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] text-slate-800 hover:bg-slate-50"
                  >
                    <RadioGroupItem value={id} id={`guidelines-scope-${id}`} />
                    <ScopeGlyph projectId={id} />
                    <span className="min-w-0 flex-1 truncate" title={name}>
                      {name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </RadioGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
}
