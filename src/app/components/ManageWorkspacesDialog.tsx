import { Trash2, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  getTicketSystem,
  TICKET_SYSTEM_DEFINITIONS,
  type TicketSystemId,
} from "../data/ticketSystems";
import {
  isBuiltinWorkspaceId,
  resolveWorkspaceTicketSystemId,
  WORKSPACES,
} from "../data/workspaces";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Workspace } from "../data/workspaces";

function BuiltinWorkspaceRow({ ws }: { ws: Workspace }) {
  const ts = getTicketSystem(resolveWorkspaceTicketSystemId(ws));
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>
            {ws.name}
          </span>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            Demo
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Ticket-Tool: {ts.name}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Standard-Workspace des Prototyps — nicht löschbar.
        </p>
      </div>
    </div>
  );
}

function CustomWorkspaceRow({
  ws,
  isActive,
  onRequestDelete,
}: {
  ws: Workspace;
  isActive: boolean;
  onRequestDelete: () => void;
}) {
  const { updateWorkspace } = useAppContext();
  const [name, setName] = useState(ws.name);

  useEffect(() => {
    setName(ws.name);
  }, [ws.id, ws.name]);

  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== ws.name) {
      updateWorkspace(ws.id, { name: trimmed });
    } else if (!trimmed) {
      setName(ws.name);
    }
  };

  const ticketId = resolveWorkspaceTicketSystemId(ws);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={`ws-name-${ws.id}`} className="text-[11px] text-muted-foreground">
            Name
          </Label>
          {isActive ? (
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 text-[#4f46e5] border-[#4f46e5]/30">
              Aktiv
            </Badge>
          ) : null}
        </div>
        <Input
          id={`ws-name-${ws.id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="h-9 text-[13px]"
        />
      </div>
      <div className="w-full sm:w-[200px] shrink-0 space-y-2">
        <Label className="text-[11px] text-muted-foreground">Ticket-Tool</Label>
        <Select
          value={ticketId}
          onValueChange={(v) =>
            updateWorkspace(ws.id, { ticketSystemId: v as TicketSystemId })
          }
        >
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_SYSTEM_DEFINITIONS.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-[13px]">
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex sm:pb-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          aria-label={`Workspace ${ws.name} löschen`}
          onClick={onRequestDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function ManageWorkspacesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspaces, selectedWorkspaceId, removeWorkspace } = useAppContext();
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);

  const customList = workspaces.filter((w) => !isBuiltinWorkspaceId(w.id));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px] max-h-[min(90vh,640px)] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-[#1e1e2e]">
              <Settings2 className="w-5 h-5 text-[#4f46e5]" />
              Manage Workspaces
            </DialogTitle>
            <DialogDescription>
              Demo-Workspaces sind fest eingebunden. Eigene Workspaces können Sie
              umbenennen, das Ticket-Tool wechseln oder entfernen.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 flex-1 min-h-0 overflow-y-auto">
            <p
              className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 mt-2"
              style={{ fontWeight: 600 }}
            >
              Demo-Workspaces
            </p>
            <div className="rounded-lg border border-border bg-[#fafbfc] px-3">
              {WORKSPACES.map((ws) => (
                <BuiltinWorkspaceRow key={ws.id} ws={ws} />
              ))}
            </div>

            <p
              className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 mt-6"
              style={{ fontWeight: 600 }}
            >
              Eigene Workspaces
            </p>
            {customList.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-4 text-center rounded-lg border border-dashed border-border bg-[#fafbfc]">
                Noch keine eigenen Workspaces. Legen Sie einen über{" "}
                <span style={{ fontWeight: 500 }}>Neuer Workspace</span> an.
              </p>
            ) : (
              <div className="rounded-lg border border-border px-3">
                {customList.map((ws) => (
                  <CustomWorkspaceRow
                    key={ws.id}
                    ws={ws}
                    isActive={ws.id === selectedWorkspaceId}
                    onRequestDelete={() => setDeleteTarget(ws)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workspace löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleteTarget?.name}“ wird dauerhaft entfernt. Diese Aktion kann
              im Prototyp nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) removeWorkspace(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
