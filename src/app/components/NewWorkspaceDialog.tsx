import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  TICKET_SYSTEM_DEFINITIONS,
  type TicketSystemId,
} from "../data/ticketSystems";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export function NewWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addWorkspace } = useAppContext();
  const [name, setName] = useState("");
  const [ticketSystemId, setTicketSystemId] =
    useState<TicketSystemId>("jira");

  const handleSubmit = () => {
    addWorkspace({ name: name.trim() || "Neuer Workspace", ticketSystemId });
    setName("");
    setTicketSystemId("jira");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Neuer Workspace</DialogTitle>
          <DialogDescription>
            Name und Ticket-Tool wählen. Im Prototyp werden keine echten
            Verbindungen hergestellt — die Auswahl steuert nur Texte und
            spätere Integrations-UI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nw-name">Workspace-Name</Label>
            <Input
              id="nw-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. ACME Automotive"
              autoComplete="organization"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nw-ticket">Ticket- / Backlog-System</Label>
            <Select
              value={ticketSystemId}
              onValueChange={(v) => setTicketSystemId(v as TicketSystemId)}
            >
              <SelectTrigger id="nw-ticket" className="w-full">
                <SelectValue placeholder="System wählen" />
              </SelectTrigger>
              <SelectContent>
                {TICKET_SYSTEM_DEFINITIONS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            type="button"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
            onClick={handleSubmit}
          >
            Workspace anlegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
