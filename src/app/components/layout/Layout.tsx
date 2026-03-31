import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Breadcrumb } from "./Breadcrumb";
import { motion, AnimatePresence } from "motion/react";
import { ExportDialog } from "../ExportDialog";
import { ChatBubble } from "../chat/ChatBubble";
import { MobileNavContext } from "../../context/MobileNavContext";
import { OnboardingHost } from "../../onboarding/OnboardingHost";
import { OnboardingResetProvider } from "../../onboarding/OnboardingResetContext";

export function Layout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const mobileNavValue = useMemo(
    () => ({ openSidebar: () => setMobileNavOpen(true) }),
    [],
  );

  return (
    <OnboardingResetProvider>
    <MobileNavContext.Provider value={mobileNavValue}>
      <div className="h-screen w-screen flex overflow-hidden">
        <button
          type="button"
          aria-label="Navigation schließen"
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${
            mobileNavOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileNavOpen(false)}
        />
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <Breadcrumb />
          <main className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full min-h-0 overflow-y-auto"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <ExportDialog />
        <ChatBubble />
        <OnboardingHost />
      </div>
    </MobileNavContext.Provider>
    </OnboardingResetProvider>
  );
}