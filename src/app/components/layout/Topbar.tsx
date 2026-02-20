import { useState } from "react";
import {
  Upload,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useAppContext } from "../../context/AppContext";

const workspaces = [
  "Automobil-Projekt Alpha",
  "Banking Platform v3",
  "Healthcare Portal",
];

export function Topbar() {
  const {
    selectedWorkspace,
    setSelectedWorkspace,
    notifications,
    markNotificationRead,
    unreadCount,
    setShowExportDialog,
    setExportScope,
  } = useAppContext();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifTypeIcon = (type: string) => {
    if (type === "success") return <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />;
    if (type === "warning") return <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />;
    if (type === "error") return <X className="w-3.5 h-3.5 text-[#ef4444]" />;
    return <Info className="w-3.5 h-3.5 text-[#4f46e5]" />;
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between gap-2 px-4 sm:px-6 flex-shrink-0 min-w-0">
      {/* Left side: can shrink */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Workspace selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors text-[14px] min-w-0 flex-shrink-0">
              <div className="w-6 h-6 rounded bg-[#4f46e5]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>
                  {selectedWorkspace.charAt(0)}
                </span>
              </div>
              <span className="hidden sm:inline truncate max-w-[140px] lg:max-w-[200px]" style={{ fontWeight: 500 }}>{selectedWorkspace}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[260px]">
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws} onClick={() => setSelectedWorkspace(ws)}>
                <div className="w-6 h-6 rounded bg-[#4f46e5]/10 flex items-center justify-center mr-2">
                  <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>
                    {ws.charAt(0)}
                  </span>
                </div>
                {ws}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search: flexible width */}
        <div
          className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border transition-all duration-200 min-w-[120px] max-w-[280px] sm:max-w-[320px] flex-1 ${
            searchFocused ? "border-[#4f46e5] bg-white shadow-sm" : "border-border bg-[#f8fafc]"
          }`}
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Suchen... (Ctrl+K)"
            className="bg-transparent outline-none w-full min-w-0 text-[13px] placeholder:text-muted-foreground"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right side: don't shrink below content size */}
      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          className="text-[13px] gap-1.5 sm:gap-2 h-9 px-2 sm:px-3 border-border"
          onClick={() => {
            setExportScope("all");
            setShowExportDialog(true);
          }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[13px] gap-1.5 sm:gap-2 h-9 px-2 sm:px-4"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Hochladen</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors">
              <Bell className="w-[18px] h-[18px] text-[#64748b]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#ef4444] rounded-full flex items-center justify-center text-[9px] text-white" style={{ fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Benachrichtigungen</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-[#ef4444]/10 text-[#ef4444]">{unreadCount} neu</Badge>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-border last:border-0 hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                    !notif.read ? "bg-[#f1f0ff]/30" : ""
                  }`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{notifTypeIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: notif.read ? 400 : 500 }}>{notif.text}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{notif.project}</span>
                        <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                      </div>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-[#4f46e5] mt-1.5 flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 pr-1 py-1 rounded-lg hover:bg-[#f1f5f9] transition-colors min-w-0">
              <div className="text-right mr-0 sm:mr-1 min-w-0 hidden md:block">
                <p className="text-[13px] truncate" style={{ fontWeight: 500 }}>Dr. Sarah Mueller</p>
                <p className="text-[11px] text-muted-foreground -mt-0.5 truncate">Requirements Lead</p>
              </div>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-[#4f46e5] text-white text-[12px]">SM</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Team verwalten</DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                Plan
                <Badge variant="secondary" className="text-[10px] ml-2">Enterprise</Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[#ef4444]">Abmelden</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}